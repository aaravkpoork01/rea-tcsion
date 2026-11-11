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
		lastPostedAt: null
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
			flush("pagehide");
		});

		global.document.addEventListener("visibilitychange", function () {
			if (global.document.visibilityState === "hidden") flush("hidden");
		});
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
		hydrate: hydrate,
		get runtime() { return runtime; }
	};
})(window);
