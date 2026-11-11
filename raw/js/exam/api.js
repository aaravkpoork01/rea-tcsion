/*
 * exam/api.js — every server call the exam bridge makes, in one place.
 * Classic script; exposes window.ExamApi.
 */
(function (global) {
	"use strict";

	var ENDPOINTS = {
		backup: "/IBACC/MockCandResponseHandler",
		finalize: "/IBA/api/finalize",
		state: "/IBA/api/state",
		feedback: "/IBACC/act?action=savecandfeedback",
		ping: "/IBA/api/ping"
	};

	function postJson(url, payload, options) {
		var opts = options || {};
		try {
			var response = fetch(url, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
				credentials: "same-origin",
				keepalive: Boolean(opts.keepalive)
			});
			return response.then(function (r) { return r.ok ? r.json().catch(function () { return null; }) : null; })
				.catch(function () { return null; });
		} catch (e) {
			return Promise.resolve(null);
		}
	}

	function getJson(url) {
		try {
			return fetch(url, { credentials: "same-origin" })
				.then(function (r) { return r.ok ? r.json().catch(function () { return null; }) : null; })
				.catch(function () { return null; });
		} catch (e) {
			return Promise.resolve(null);
		}
	}

	/** Fire-and-forget post that survives page teardown. */
	function beacon(url, payload) {
		var body = JSON.stringify(payload);
		try {
			if (global.navigator && global.navigator.sendBeacon) {
				var blob = new Blob([body], { type: "application/json" });
				if (global.navigator.sendBeacon(url, blob)) return true;
			}
		} catch (e) { /* fall through */ }
		postJson(url, payload, { keepalive: true });
		return true;
	}

	function saveState(snapshot, isFinal) {
		return postJson(ENDPOINTS.backup, {
			AuditJSON: "",
			BackUp: snapshot,
			BackUpParameters: isFinal ? "storeBackup@@BackUpParamSeparator@@true" : "storeBackup@@BackUpParamSeparator@@false"
		});
	}

	function finalize(payload) {
		beacon(ENDPOINTS.finalize, payload);
	}

	function fetchState() {
		return getJson(ENDPOINTS.state);
	}

	function saveFeedback(payload) {
		return postForm(ENDPOINTS.feedback, payload, { keepalive: true });
	}

	/** urlencoded POST, used by the engine-compatible feedback endpoint. */
	function postForm(url, fields, options) {
		var opts = options || {};
		var params = new URLSearchParams();
		Object.keys(fields).forEach(function (key) { params.set(key, fields[key]); });

		try {
			return fetch(url, {
				method: "POST",
				headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
				body: params.toString(),
				keepalive: Boolean(opts.keepalive),
				credentials: "same-origin"
			}).then(function (r) {
				return r.ok ? r.text().then(function (t) { return { ok: true, status: r.status, text: t }; })
					: { ok: false, status: r.status, text: "" };
			}).catch(function () { return { ok: false, status: 0, text: "" }; });
		} catch (e) {
			return Promise.resolve({ ok: false, status: 0, text: "", error: e });
		}
	}

	/** Synchronous last-resort form post (page teardown). */
	function postFormSync(url, fields) {
		try {
			var xhr = new XMLHttpRequest();
			xhr.open("POST", url, false);
			xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
			xhr.send(new URLSearchParams(fields).toString());
			return true;
		} catch (e) {
			return false;
		}
	}

	global.ExamApi = {
		ENDPOINTS: ENDPOINTS,
		postJson: postJson,
		getJson: getJson,
		saveState: saveState,
		finalize: finalize,
		fetchState: fetchState,
		postForm: postForm,
		postFormSync: postFormSync,
		saveFeedback: saveFeedback
	};
})(window);
