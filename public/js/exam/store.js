/*
 * exam/store.js — single source of truth for exam state on the client.
 *
 * Elements never read `mockVar` directly for persistence concerns: they read
 * the store, and the store decides what "changed" means.
 * Classic script; exposes window.ExamStore.
 */
(function (global) {
	"use strict";

	var state = {
		identity: { attemptId: "", candidateId: "", orgId: "", assessmentId: "" },
		resumed: false,
		finalised: false,
		dirty: false,
		lastSerialised: "",
		error: null
	};

	var subscribers = [];

	function readSession(key) {
		try { return global.sessionStorage.getItem(key) || ""; } catch (e) { return ""; }
	}

	function refreshIdentity() {
		var mv = global.mockVar || {};
		state.identity = {
			attemptId: String(mv.attemptId || readSession("attemptId") || ""),
			candidateId: String(mv.candMasterId || readSession("cand_master_id") || ""),
			orgId: String(mv.orgId || readSession("orgId") || ""),
			assessmentId: String(mv.mockId || readSession("assessmentId") || "")
		};
		return state.identity;
	}

	function snapshot() {
		return global.mockVar || null;
	}

	/**
	 * Inputs rendering the live question. The engine uses three shapes:
	 * name="answers<quesId>", class="MCQanswer<quesId>", and, for linked /
	 * placeholder questions, the generic name="answers" scoped to the
	 * question container. Only the displayed question may be read from the
	 * generic bucket, otherwise answers would land on the wrong question.
	 */
	function liveInputs(quesId) {
		var doc = global.document;
		if (!doc) return [];
		try {
			var named = doc.getElementsByName("answers" + quesId);
			if (named && named.length) return Array.prototype.slice.call(named);
		} catch (e) { /* ignore */ }
		try {
			var classified = doc.querySelectorAll(".MCQanswer" + quesId);
			if (classified && classified.length) return Array.prototype.slice.call(classified);
		} catch (e) { /* ignore */ }
		var mv = snapshot();
		var current = mv && mv.curQuesBean;
		if (!current || String(current.quesId) !== String(quesId)) return [];
		var container = doc.getElementById("quesAnsContent") || doc.getElementById("currentQues");
		if (container) {
			var scoped = container.querySelectorAll("input[name='answers']");
			if (scoped && scoped.length) return Array.prototype.slice.call(scoped);
		}
		return [];
	}

	/**
	 * Copy the ticked options from the DOM into `mockVar.curQuesBean`.
	 * The engine only collects MCQ/MSQ selections when the candidate leaves
	 * the question, so a backup taken between the tick and the navigation
	 * would otherwise persist an unanswered question.
	 */
	function captureAnswers() {
		var mv = snapshot();
		var question = mv && mv.curQuesBean;
		if (!question || question.quesId == null) return false;

		var inputs = liveInputs(question.quesId);
		if (!inputs.length) return false;

		var picked = [];
		for (var i = 0; i < inputs.length; i++) {
			if (inputs[i] && inputs[i].checked && inputs[i].value) picked.push(String(inputs[i].value));
		}
		var joined = picked.join(",");
		var params = question.quesParam || (question.quesParam = {});
		var previous = String(params.selectedOptId || "");

		if (joined) {
			if (joined === previous) return false;
			params.selectedOptId = joined;
			if (params.status === "marked") params.status = "markedAndAnswered";
			else if (params.status !== "markedAndAnswered") params.status = "answered";
			return true;
		}

		// No ticked option: only clear when this question previously had one,
		// so an unrendered option list can never wipe an answer.
		if (previous || params.status === "answered" || params.status === "markedAndAnswered") {
			params.selectedOptId = "";
			params.answer = "";
			params.status = Number(params.isMarked) ? "marked" : "notanswered";
			return true;
		}
		return false;
	}

	function serialise() {
		var mv = snapshot();
		if (!mv) return "";
		try {
			captureAnswers();
			return JSON.stringify(mv);
		} catch (e) {
			return "";
		}
	}

	/** Recompute the dirty flag against the last successfully posted snapshot. */
	function evaluateDirty() {
		var current = serialise();
		state.dirty = current.length > 0 && current !== state.lastSerialised;
		return state.dirty;
	}

	function markPosted() {
		state.lastSerialised = serialise();
		state.dirty = false;
		emit("posted");
	}

	function update(patch) {
		Object.assign(state, patch);
		emit("patch");
	}

	function subscribe(fn) {
		subscribers.push(fn);
		return function unsubscribe() {
			subscribers = subscribers.filter(function (item) { return item !== fn; });
		};
	}

	function emit(event) {
		for (var i = 0; i < subscribers.length; i++) {
			try {
				subscribers[i](event, state);
			} catch (e) { /* subscriber faults must not break the exam */ }
		}
	}

	/** Payload sent to the finalize endpoint. */
	function finalizePayload() {
		var mv = snapshot() || {};
		var id = refreshIdentity();
		function num(value) {
			var parsed = Number(value);
			return isFinite(parsed) ? parsed : null;
		}
		return {
			attemptId: id.attemptId,
			candMasterId: id.candidateId,
			orgId: id.orgId,
			mockId: id.assessmentId,
			score: num(mv.score != null ? mv.score : mv.totalScore),
			totalScore: num(mv.totalScore),
			mockScore: num(mv.mockScore),
			percentage: num(mv.percentage),
			fullscreenSeconds: num(mv.fullscreenSeconds)
		};
	}

	/* ---- resume ---------------------------------------------------------- */

	/** Count answered questions in a `mockVar`-shaped snapshot. */
	function countAnswered(raw) {
		var answered = 0;
		var mv = raw || null;
		if (!mv) return 0;
		(mv.groups || []).forEach(function (group) {
			(group.secDetails || []).forEach(function (section) {
				(section.questions || []).forEach(function (question) {
					var params = question && question.quesParam;
					if (!params) return;
					if (params.status === "answered" || params.status === "markedAndAnswered") answered += 1;
				});
			});
		});
		return answered;
	}

	function questionIndex(mv) {
		var index = {};
		(mv.groups || []).forEach(function (group) {
			(group.secDetails || []).forEach(function (section) {
				(section.questions || []).forEach(function (question) {
					if (question && question.quesId != null) index[String(question.quesId)] = question;
				});
			});
		});
		return index;
	}

	/** Overlay a stored snapshot's answers onto the live paper. */
	function applyResume(savedJson) {
		var mv = snapshot();
		if (!mv || !savedJson) return false;

		var saved;
		try {
			saved = typeof savedJson === "string" ? JSON.parse(savedJson) : savedJson;
		} catch (e) {
			return false;
		}

		var live = questionIndex(mv);
		var restored = 0;

		(saved.groups || []).forEach(function (group) {
			(group.secDetails || []).forEach(function (section) {
				(section.questions || []).forEach(function (savedQuestion) {
					var params = savedQuestion && savedQuestion.quesParam;
					if (!params) return;
					var target = live[String(savedQuestion.quesId)];
					if (!target) return;
					if (!target.quesParam) target.quesParam = {};
					target.quesParam.status = params.status || target.quesParam.status;
					target.quesParam.selectedOptId = params.selectedOptId != null ? params.selectedOptId : target.quesParam.selectedOptId;
					target.quesParam.answer = params.answer != null ? params.answer : target.quesParam.answer;
					target.quesParam.isMarked = params.isMarked || 0;
					restored += 1;
				});
			});
		});

		if (saved.score != null && mv.score == null) mv.score = saved.score;
		state.resumed = restored > 0;
		emit("resumed");
		return state.resumed;
	}

	refreshIdentity();

	global.ExamStore = {
		get state() { return state; },
		refreshIdentity: refreshIdentity,
		snapshot: snapshot,
		serialise: serialise,
		captureAnswers: captureAnswers,
		evaluateDirty: evaluateDirty,
		markPosted: markPosted,
		update: update,
		subscribe: subscribe,
		finalizePayload: finalizePayload,
		countAnswered: countAnswered,
		applyResume: applyResume,
		isFinalised: function () { return state.finalised; },
		markFinalised: function () { state.finalised = true; emit("finalised"); }
	};
})(window);
