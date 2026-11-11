/*
 * ion-bridge.js — exam persistence entry point.
 *
 * Composition only. The behaviour lives next to it:
 *   exam/dom.js        DOM helpers
 *   exam/api.js        every endpoint the exam page talks to
 *   exam/store.js      mockVar access, dirty tracking, resume overlay
 *   exam/sync.js       autosave timer + lifecycle flushes
 *   exam/scorecard.js  completion hooks (score card / feedback transition)
 *
 * The mock paper is client-scored (StoreCandResponse=NO), so the engine never
 * autosaves and never posts a final state. This entry keeps the attempt alive
 * across reloads and closes it when the candidate leaves the score card.
 */
(function (global) {
	"use strict";

	var booted = false;

	/** Persist the final snapshot and close the attempt. Runs once. */
	function submitFinalState() {
		var store = global.ExamStore;
		var api = global.ExamApi;
		if (!store || !api || store.isFinalised()) return;

		store.refreshIdentity();
		store.markFinalised();

		var snapshot = store.snapshot();
		if (snapshot && snapshot.attemptId != null) {
			// Full payload, no keepalive: it can exceed the 64 KiB beacon quota.
			api.saveState(snapshot, true);
		}
		// Small identity payload, safe to send on unload.
		api.finalize(store.finalizePayload());
	}

	function boot() {
		if (booted) return;
		if (!global.ExamStore || !global.ExamApi || !global.ExamSync) return;
		booted = true;

		global.ExamStore.refreshIdentity();
		global.ExamSync.start({ intervalMs: 8000 });

		if (global.ExamCompletion) {
			global.ExamCompletion.install(submitFinalState);
		}
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", boot);
	} else {
		boot();
	}

	// The exam markup is built after this script runs, so retry on load.
	global.addEventListener("load", boot);
})(window);
