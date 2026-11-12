/*
 * exam/candidate-identity.js — one identity source for every candidate page.
 *
 * The stock engine paints identity from cookies (username, app_seq_no, ...)
 * and from the paper's confDetails.xml. A few slots stay hard-coded in the
 * markup ("11111", "Your Name") and the header id is fed from
 * sessionStorage.roll_number, which nothing sets. This module reads the live
 * candidate session from /IBA/api/session and fills only those slots.
 *
 * Watermark rule: .mockCandId and the question watermark should show the
 * candidate's real login id (for example "11111"), not the engine's random
 * mock watermark. top.js repaints both on every question render, so the
 * global waterMark() helper is wrapped below instead of editing the engine.
 *
 * Classic script; exposes window.ExamIdentity.
 */
(function (global) {
	"use strict";

	var DEFAULT_AVATAR = "images/NewCandidateImage.jpg";
	var RETRY_MS = [300, 1000, 2500, 5000];
	var PROFILE_POPUP_CSS =
		"#candidateDetailstbl.exam-single-login-welcome .LoginIdSpan{display:none !important;}\n" +
		".user_dtls .mockLoginIdSpan ~ .LoginIdSpan{display:none !important;}\n" +
		".mockLoginIdSpan + .LoginIdSpan{display:none !important;}\n" +
		".user_dtls .hideCandNameFOrOffline{display:block !important;}\n" +
		".candOriginalName:empty:before{content:'Candidate';}";
	var snapshot = null;
	var watermarkLogin = "";
	var nativeWaterMark = null;

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
			var value = arguments[i];
			if (value) return String(value);
		}
		return "";
	}

	/** Identity already present in the page, without a network round trip. */
	function localIdentity() {
		var mv = global.mockVar || {};
		return {
			candidateId: first(
				mv.candMasterId,
				readSession("cand_master_id"),
				readSession("mockCandId"),
				readCookie("cand_master_id"),
				readCookie("candidate_Id"),
				readCookie("app_seq_no")
			),
			name: first(readSession("username"), readCookie("username"), mv.mockCandidateName, mv.candName),
			login: first(
				readCookie("loginId"),
				readSession("loginId"),
				(mv.loginId && mv.loginId !== "NA") ? mv.loginId : ""
			),
			assessmentId: first(readSession("assessmentId"), readCookie("assessmentId"), mv.mockId),
			assessmentName: first(mv.mockName)
		};
	}

	function merge(base, extra) {
		var out = {};
		Object.keys(base).forEach(function (key) { out[key] = base[key]; });
		Object.keys(extra || {}).forEach(function (key) {
			if (extra[key]) out[key] = String(extra[key]);
		});
		return out;
	}

	function text(selector, value, withTitle) {
		if (!value) return;
		var nodes;
		try { nodes = global.document.querySelectorAll(selector); } catch (e) { return; }
		Array.prototype.forEach.call(nodes, function (node) {
			if (node.textContent !== value) node.textContent = value;
			if (withTitle && node.getAttribute("title") !== value) node.setAttribute("title", value);
		});
	}

	/**
	 * The stock engine paints a random id into .mockCandId and passes the same
	 * value to waterMark(), which becomes the question background. Show the
	 * candidate's login id in both places instead. top.js calls waterMark()
	 * after every question render, so the wrapper keeps later repaints correct.
	 */
	function applyLoginWatermark(login) {
		var value = String(login || "").trim();
		if (!value) return;
		watermarkLogin = value;

		try { global.sessionStorage.setItem("loginId", value); } catch (e) { /* storage unavailable */ }
		try { global.sessionStorage.setItem("waterMarkId", value); } catch (e) { /* storage unavailable */ }
		try { global.mockWaterMark = value; } catch (e) { /* read-only in old browsers */ }

		if (!nativeWaterMark && typeof global.waterMark === "function") {
			nativeWaterMark = global.waterMark;
			global.waterMark = function () {
				text(".mockCandId", watermarkLogin);
				try {
					return nativeWaterMark.call(global, watermarkLogin);
				} catch (e) {
					return undefined;
				}
			};
		}

		text(".mockCandId", value);
		if (nativeWaterMark && global.mockVar && global.mockVar.WaterMark) {
			try { nativeWaterMark.call(global, value); } catch (e) { /* engine retries */ }
		}
	}

	/**
	 * The profile popup carries two login rows: .mockLoginIdSpan and the
	 * legacy .LoginIdSpan. top.js paints both with the same
	 * "Welcome : <login>" label, so the popup printed the line twice.
	 * Mark the popup only while the first row is in use; offline papers
	 * show just .LoginIdSpan and keep it.
	 */
	function syncProfileWelcome() {
		var doc = global.document;
		var table = doc.getElementById("candidateDetailstbl");
		if (!table) return;
		var mockRow = table.querySelector("tr.mockLoginIdSpan");
		var visible = false;
		if (mockRow && global.getComputedStyle) {
			try { visible = global.getComputedStyle(mockRow).display !== "none"; } catch (e) { /* old browser */ }
		}
		try {
			table.classList.toggle("exam-single-login-welcome", visible);
		} catch (e) { /* old browser */ }
	}

	function hideDuplicateProfileWelcome() {
		var doc = global.document;
		if (!doc || !doc.head) return;
		if (!doc.getElementById("exam-identity-profile-css")) {
			var style = doc.createElement("style");
			style.id = "exam-identity-profile-css";
			style.type = "text/css";
			style.appendChild(doc.createTextNode(PROFILE_POPUP_CSS));
			doc.head.appendChild(style);
		}
		var trigger = doc.getElementById("User_Hldr");
		if (trigger && trigger.addEventListener) {
			trigger.addEventListener("click", syncProfileWelcome);
		}
	}

	/**
	 * Default blue silhouette when the paper has no photograph
	 * (USEDEFAULTCANDIDATEIMG=YES). Never replaces a real photo.
	 */
	function applyAvatar(photoUrl) {
		var images;
		try { images = global.document.querySelectorAll(".candidateImg"); } catch (e) { return; }
		Array.prototype.forEach.call(images, function (image) {
			if (photoUrl) {
				image.setAttribute("src", photoUrl);
				if (image.style && image.style.display === "none") image.style.display = "";
				return;
			}
			var src = image.getAttribute("src") || "";
			var isDefault = !src || src === "null" || src === "undefined" || /NewCandidateImage\.jpg$/i.test(src);
			if (!isDefault) return;
			if (src !== DEFAULT_AVATAR) image.setAttribute("src", DEFAULT_AVATAR);
			try { image.classList.add("mockCandidateImg"); } catch (e) { /* old browser */ }
			// FeedBack.html hides the image first and only then assigns the
			// default source; bring the silhouette back.
			if (image.style && image.style.display === "none") image.style.display = "";
		});
	}

	function apply() {
		var identity = snapshot || localIdentity();
		var id = identity.candidateId;
		var name = identity.name;

		if (id) {
			// iba-skinning.js paints .candId1 and #profileRollId from this key.
			try {
				if (!readSession("roll_number")) global.sessionStorage.setItem("roll_number", id);
			} catch (e) { /* storage unavailable */ }
			text(".candId", id);
			text(".candId1", id);
			text(".userId", id);
			text("#profileRollId", id);
		}

		if (name) {
			text(".candOriginalName", name, true);
			text(".candOrigName", name);
			text(".candName", "Candidate Name: ");
			text(".userName", name);
			text(".userName1", name);
			text("#Username", name, true);
			text("#profileNameId", name);
		} else {
			text(".candOriginalName", "Candidate", true);
			text("#Username", "Candidate", true);
		}

		var candNameBlocks = global.document.querySelectorAll(".hideCandNameFOrOffline");
		Array.prototype.forEach.call(candNameBlocks, function (el) {
			el.style.display = "block";
		});

		if (identity.login) applyLoginWatermark(identity.login);

		var mv = global.mockVar || {};
		// Login page: replace the stock placeholders with the assessment the
		// candidate was launched with (C001 / "Mock Exam" in the stock paper).
		text("#mockSubName", identity.assessmentName || mv.mockName);
		text("#mockSysNum", identity.assessmentId || mv.mockId);

		applyAvatar(identity.photo);
		syncProfileWelcome();
	}

	function refresh() {
		var fallback = localIdentity();
		try {
			return global.fetch("/IBA/api/session", { credentials: "same-origin", cache: "no-store" })
				.then(function (response) { return response.ok ? response.json() : null; })
				.then(function (data) {
					if (data && data.authenticated && data.mockCandId) {
						snapshot = merge(fallback, {
							candidateId: data.mockCandId,
							attemptId: data.attemptId,
							assessmentId: data.assessmentId,
							name: data.name || fallback.name,
							login: data.login || fallback.login,
							photo: data.photo || fallback.photo
						});
					} else {
						snapshot = fallback;
					}
					return snapshot;
				})
				.catch(function () {
					snapshot = fallback;
					return snapshot;
				});
		} catch (e) {
			snapshot = fallback;
			return Promise.resolve(snapshot);
		}
	}

	function start() {
		refresh().then(function () {
			apply();
			// The engine renders the profile popups and header asynchronously.
			RETRY_MS.forEach(function (delay) {
				global.setTimeout(apply, delay);
			});
		});
	}

	function boot() {
		// index.html fills the identity panel from the verified login response.
		// Running the generic filler there would overwrite the admin-provided
		// system name with the assessment id.
		if (document.querySelector('form[name="form-login"]')) return;
		hideDuplicateProfileWelcome();
		start();
		setInterval(function() {
			var identity = snapshot || localIdentity();
			var name = identity.name || "Candidate";
			var orig = document.querySelectorAll(".candOriginalName, #Username");
			Array.prototype.forEach.call(orig, function(el) {
				if (!el.textContent || el.textContent.trim() === "") {
					el.textContent = name;
				}
			});
		}, 1500);
	}

	// Install the watermark override before the engine paints its first
	// question, then refresh it from the live session when the fetch resolves.
	var initialLogin = first(readCookie("loginId"), readSession("loginId"));
	if (initialLogin) applyLoginWatermark(initialLogin);

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", boot);
	} else {
		boot();
	}

	global.ExamIdentity = {
		refresh: refresh,
		apply: apply,
		current: function () { return snapshot || localIdentity(); }
	};
})(window);
