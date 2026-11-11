/*
 * exam/session-guard.js — bounce a missing/expired candidate session back to
 * the launcher before the exam UI renders.
 *
 * Only pages that require a live attempt are guarded:
 *   instructions.html, quiz.html
 *
 * FeedBack.html and close.html run after finaliseAttempt, which expires the
 * candidate session on purpose — guarding them would sign the candidate out
 * of their own result page.
 *
 * Classic script; no global is exposed.
 */
(function (global) {
	"use strict";

	var page = (global.location.pathname || "").split("/").pop() || "";
	if (!/^(instructions|quiz)\.html$/i.test(page)) return;

	var redirected = false;

	function readSession(key) {
		try { return global.sessionStorage.getItem(key) || ""; } catch (e) { return ""; }
	}

	function readCookie(name) {
		var pattern = new RegExp("(?:^|;\\s*)" + name + "=([^;]*)");
		var match = (global.document.cookie || "").match(pattern);
		if (!match) return "";
		try { return decodeURIComponent(match[1]); } catch (e) { return match[1]; }
	}

	function first() {
		for (var i = 0; i < arguments.length; i++) {
			if (arguments[i]) return String(arguments[i]);
		}
		return "";
	}

	/** Launcher URL for a fresh sign-in, or the stock error page. */
	function launcher() {
		var orgId = first(readSession("orgId"), readCookie("orgId"));
		var assessmentId = first(readSession("assessmentId"), readCookie("assessmentId"), readSession("mockId"));
		if (orgId && assessmentId) {
			return "index.html?" + encodeURIComponent(orgId) + "@@" + encodeURIComponent(assessmentId);
		}
		return "error.html?E103";
	}

	function redirect() {
		if (redirected) return;
		redirected = true;
		global.location.replace(launcher());
	}

	try {
		global.fetch("/IBA/api/session", { credentials: "same-origin", cache: "no-store" })
			.then(function (response) { return response.ok ? response.json() : null; })
			.then(function (data) {
				// A null response means the server could not be reached; let the
				// engine keep working with its own local state.
				if (data && data.authenticated === false) redirect();
			})
			.catch(function () { /* keep the engine running offline */ });
	} catch (e) { /* fetch unavailable */ }
})(window);
