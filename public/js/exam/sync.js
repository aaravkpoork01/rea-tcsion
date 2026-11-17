/*
 * exam/sync.js — autosave controller.
 *
 * Reads the snapshot from ExamStore, decides whether it is worth posting and
 * sends it through ExamApi. Kept free of engine internals: it only knows about
 * the store, the api and a timer.
 *
 * Classic script; exposes window.ExamSync.
 */
(function (global) {
	"use strict";

	var DEFAULT_INTERVAL_MS = 8000;

	var runtime = {
		started: false,
		inFlight: false,
		timerId: null,
		intervalMs: DEFAULT_INTERVAL_MS,
		postCount: 0,
		errorCount: 0,
		lastPostedAt: null,
		answerTimerId: null,
		progressTimerId: null
	};

	function deps() {
		var store = global.ExamStore;
		var api = global.ExamApi;
		if (!store || !api) return null;
		return { store: store, api: api };
	}

	function ready(store) {
		if (!store || store.isFinalised()) return false;
		var mv = store.snapshot();
		return Boolean(mv) && mv.attemptId != null;
	}

	function save(force) {
		var d = deps();
		if (!d || !ready(d.store)) return Promise.resolve(false);
		if (runtime.inFlight) return Promise.resolve(false);
		// Pull the ticked option from the DOM before deciding whether the
		// state is dirty: the engine only copies it on navigation.
		if (d.store.captureAnswers) d.store.captureAnswers();
		if (!force && !d.store.evaluateDirty()) return Promise.resolve(false);

		runtime.inFlight = true;
		runtime.postCount += 1;

		return d.api.saveState(d.store.snapshot(), false).then(function (result) {
			runtime.inFlight = false;
			if (result && String(result.BackUpStatus || "").toLowerCase() === "success") {
				runtime.lastPostedAt = new Date();
				d.store.markPosted();
				d.store.update({ error: null });
				return true;
			}
			runtime.errorCount += 1;
			d.store.update({ error: "save-failed" });
			return false;
		});
	}

	/** Force a save and wait for it — used right before navigation. */
	function flush(reason) {
		if (reason) {
			try { global.sessionStorage.setItem("exam:lastFlush", reason); } catch (e) { /* ignore */ }
		}
		return save(true);
	}

	/** Minimal checkpoint: identity, remaining time and the displayed question. */
	function progressPayload() {
		var store = global.ExamStore;
		if (!store) return null;
		if (store.captureAnswers) store.captureAnswers();
		var mv = store.snapshot();
		if (!mv || mv.attemptId == null) return null;
		var question = mv.curQuesBean || null;
		var payload = { attemptId: String(mv.attemptId), time: Number(mv.time) };
		if (question && question.quesId != null) {
			var params = question.quesParam || {};
			payload.question = {
				quesId: question.quesId,
				status: params.status || "notanswered",
				selected: params.selectedOptId || "",
				answer: params.answer || ""
			};
		}
		return payload;
	}

	/**
	 * Send the checkpoint. `immediate` uses sendBeacon/keepalive so it works
	 * while the page is being torn down; the full snapshot is far too large
	 * for that budget.
	 */
	function saveProgress(immediate) {
		var d = deps();
		if (!d || !ready(d.store)) return false;
		var payload = progressPayload();
		if (!payload) return false;
		if (immediate && d.api.saveProgressBeacon) {
			return d.api.saveProgressBeacon(payload);
		}
		if (d.api.saveProgress) {
			d.api.saveProgress(payload, { keepalive: true });
			return true;
		}
		return false;
	}

	function scheduleProgressSave() {
		if (runtime.progressTimerId) global.clearTimeout(runtime.progressTimerId);
		runtime.progressTimerId = global.setTimeout(function () {
			runtime.progressTimerId = null;
			saveProgress(false);
		}, 150);
	}

	/**
	 * Restore answers that the engine did not pick up.
	 * The iON engine already restores from getCandidateData, so this only
	 * applies when the live paper came back blank but the DB has answers.
	 */
	function hydrate() {
		var d = deps();
		if (!d || !ready(d.store)) return Promise.resolve(false);
		if (d.store.countAnswered(d.store.snapshot()) > 0) return Promise.resolve(false);

		return d.api.fetchState().then(function (state) {
			if (!state || !state.resumed || !state.snapshot) return false;
			if (d.store.countAnswered(state.snapshot) === 0) return false;
			return d.store.applyResume(state.snapshot);
		});
	}

	function attachLifecycle() {
		if (runtime.lifecycleAttached) return;
		runtime.lifecycleAttached = true;

		global.addEventListener("pagehide", function () {
			saveProgress(true);
			flush("pagehide");
		});

		global.document.addEventListener("visibilitychange", function () {
			if (global.document.visibilityState === "hidden") {
				saveProgress(true);
				flush("hidden");
			}
		});
	}

	/** True when the event came from an answer control or its option label. */
	function isAnswerEvent(event) {
		var target = event && event.target;
		if (!target) return false;
		var tag = String(target.tagName || "").toLowerCase();
		if (tag === "input") {
			var type = String(target.type || "").toLowerCase();
			return type === "radio" || type === "checkbox";
		}
		// Labels wrap the radio/checkbox in this engine; the click lands on
		// the label first, so treat it as an answer interaction too.
		try {
			return Boolean(target.closest && target.closest(".optionLabel, label"));
		} catch (e) {
			return false;
		}
	}

	/**
	 * Persist a ticked option soon after it happens instead of waiting for
	 * the 8s interval: a candidate who leaves right after answering would
	 * otherwise lose that tick.
	 */
	function scheduleAnswerSave() {
		if (runtime.answerTimerId) global.clearTimeout(runtime.answerTimerId);
		runtime.answerTimerId = global.setTimeout(function () {
			runtime.answerTimerId = null;
			if (runtime.inFlight) {
				scheduleAnswerSave();
				return;
			}
			save(true);
		}, 700);
	}

	function attachAnswerHooks() {
		if (runtime.answerHooksAttached) return;
		runtime.answerHooksAttached = true;

		global.document.addEventListener("click", function (event) {
			if (isAnswerEvent(event)) {
				var store = global.ExamStore;
				if (store && store.captureAnswers) store.captureAnswers();
				scheduleProgressSave();
				scheduleAnswerSave();
			}
		}, true);
		global.document.addEventListener("change", function (event) {
			if (isAnswerEvent(event)) {
				var store = global.ExamStore;
				if (store && store.captureAnswers) store.captureAnswers();
				scheduleProgressSave();
				scheduleAnswerSave();
			}
		}, true);
	}

	function start(options) {
		var opts = options || {};
		if (runtime.started) return runtime;
		runtime.started = true;
		runtime.intervalMs = Number(opts.intervalMs) || DEFAULT_INTERVAL_MS;

		if (opts.intervalMs !== 0) {
			runtime.timerId = global.setInterval(function () {
				save(false);
			}, runtime.intervalMs);
		}

		attachLifecycle();
		attachAnswerHooks();
		hydrate();
		return runtime;
	}

	function stop() {
		if (runtime.timerId) {
			global.clearInterval(runtime.timerId);
			runtime.timerId = null;
		}
		runtime.started = false;
	}

	global.ExamSync = {
		start: start,
		stop: stop,
		save: save,
		flush: flush,
		saveProgress: saveProgress,
		hydrate: hydrate,
		get runtime() { return runtime; }
	};
})(window);
