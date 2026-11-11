/*
 * exam/scorecard.js — completion hooks for the exam flow.
 *
 * The stock scorecard validates the per-group score inputs against the
 * engine's computed scores before allowing navigation. For client-scored
 * mock papers some sections (audio, typing, programming) are not graded by
 * the engine, so the two values legitimately differ and the validation popup
 * blocks the candidate from ever reaching feedback. This module lets the
 * candidate through, using the engine's own navigation targets.
 *
 * Classic script; exposes window.ExamCompletion.
 */
(function (global) {
	"use strict";

	var COMPLETION_FUNCTIONS = ["moveToScoreCardDisplay", "moveToFeedback"];

	var completed = false;
	var onFinalize = null;
	var bypassed = false;
	var pollTimer = null;

	function visible(id) {
		var el = global.document.getElementById(id);
		if (!el) return false;
		try {
			var style = global.getComputedStyle(el);
			return style.display !== "none" && style.visibility !== "hidden";
		} catch (error) {
			return false;
		}
	}

	function feedbackRequired() {
		var value = (global.mockVar || {}).isFeedBackRequired;
		return !(typeof value === "undefined" || value === null || value === "NO" || value === "0" || value === 0);
	}

	/** The URL the engine itself navigates to once the scorecard is accepted. */
	function nextUrl() {
		var mv = global.mockVar || {};
		var encoded = mv.orgId + "@@" + mv.mockId;
		if (global.document.URL.indexOf("eID=") > -1) {
			encoded = global.document.URL.split("quiz.html?")[1];
		}
		if (!feedbackRequired()) {
			return "close.html?" + encoded + "@@" + mv.subscribedFor + "#";
		}
		return "FeedBack.html?" + encoded + "@@" + mv.subscribedFor + "@@"
			+ mv.candMasterId + "@@" + mv.attemptId + "@@" + mv.useDefaultFeedback;
	}

	function dismissPopups() {
		try {
			if (global.jQuery) {
				global.jQuery(".overlay").hide();
				global.jQuery("#scoreValidationPopUp").hide();
				global.jQuery(".confrmPopup").hide();
			}
		} catch (error) { /* presentation only */ }
	}

	/** Leave the scorecard even though the engine flagged a score mismatch. */
	function bypassScoreValidation() {
		if (bypassed || !visible("scoreValidationPopUp")) return false;
		bypassed = true;
		dismissPopups();
		global.location.href = nextUrl();
		return true;
	}

	function markCompleted(origin) {
		if (completed) return false;
		completed = true;
		if (onFinalize) {
			try { onFinalize(origin); } catch (error) { /* never break navigation */ }
		}
		return true;
	}

	function wrap(name) {
		var original = global[name];
		if (typeof original !== "function" || original.__examCompletionWrapped) return false;

		global[name] = function () {
			markCompleted(name);
			var result = original.apply(this, arguments);
			if (name === "moveToFeedback") {
				// cnfPop() runs synchronously inside the original call.
				global.setTimeout(bypassScoreValidation, 0);
			}
			return result;
		};
		global[name].__examCompletionWrapped = true;
		return true;
	}

	function installAll() {
		var wrapped = 0;
		for (var i = 0; i < COMPLETION_FUNCTIONS.length; i++) {
			if (wrap(COMPLETION_FUNCTIONS[i])) wrapped += 1;
		}
		return wrapped === COMPLETION_FUNCTIONS.length;
	}

	function poll() {
		if (pollTimer) return;
		var tries = 0;
		pollTimer = global.setInterval(function () {
			tries += 1;
			if (installAll() || tries > 200) {
				global.clearInterval(pollTimer);
				pollTimer = null;
			}
		}, 250);
	}

	global.ExamCompletion = {
		/** Register the finalisation callback and wrap the completion functions. */
		install: function (callback) {
			onFinalize = typeof callback === "function" ? callback : null;
			installAll();
			poll();
		},
		installAll: installAll,
		isCompleted: function () { return completed; },
		nextUrl: nextUrl
	};
})(window);
