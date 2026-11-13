/*
 * exam/fullscreen-guard.js — assessment-level fullscreen timer and answer lock.
 *
 * When an assessment has "Require fullscreen to answer" enabled, the candidate
 * can move around the paper but cannot change an answer until the document is in
 * fullscreen. Every blocked attempt opens a dialog with an Enable Fullscreen
 * button. The time spent in fullscreen is accumulated on mockVar.fullscreenSeconds
 * so the existing autosave/finalise bridge persists it to the attempt.
 *
 * Fullscreen API support is checked per browser. If the API is unavailable the
 * paper stays locked (the assessment explicitly asked for it) and the dialog
 * explains that the browser cannot enter fullscreen.
 *
 * Classic script; exposes window.ExamFullscreen.
 */
(function (global) {
	"use strict";

	var doc = global.document;
	if (!doc) return;

	var STYLE_ID = "ionFullscreenGuardStyle";
	var OVERLAY_ID = "ionFullscreenGuard";
	var CHECK_MS = 1000;

	// Clicking any of these is an answer action: selecting an option, typing,
	// clearing a response, marking for review, or saving the current question.
	var ANSWER_ACTION_SELECTOR = [
		".optionLabel",
		".matrixOptions",
		".answer",
		"#answerArea",
		".Ans_Area",
		".savenext",
		".savenextGroup",
		".clearResponse",
		".clearResponseGroup",
		".clearResponseGrp",
		".underreview",
		".underreviewGrp",
		"#finalSubmit",
		".submitCodeBtn",
		".saveProgram",
		".compileCodeBtn"
	].join(",");

	// The question panel is where answer controls live. Text fields anywhere in
	// this panel are treated as answer fields too (subjective / coding questions).
	var ANSWER_PANEL_SELECTOR = "#answerArea, .Ans_Area, .questiontype-markpanel, #currentQues";

	var runtime = {
		required: false,
		totalSeconds: 0,
		toggleCount: 0,
		tickId: null,
		overlay: null,
		lastFocus: null,
		requestPending: false,
		stateLoaded: false
	};

	function readSession(key) {
		try { return global.sessionStorage.getItem(key) || ""; } catch (error) { return ""; }
	}

	function storedFlag() {
		return readSession("requireFullscreen") === "1";
	}

	function fullscreenElement() {
		return doc.fullscreenElement
			|| doc.webkitFullscreenElement
			|| doc.msFullscreenElement
			|| doc.mozFullScreenElement
			|| null;
	}

	function inFullscreen() {
		return Boolean(fullscreenElement());
	}

	function supportsFullscreen() {
		var el = doc.documentElement;
		return Boolean(el && (el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen || el.mozRequestFullScreen));
	}

	function requestFullscreen() {
		var el = doc.documentElement;
		if (!el) return Promise.reject(new Error("Fullscreen is not available."));
		var request = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen || el.mozRequestFullScreen;
		if (!request) return Promise.reject(new Error("Fullscreen is not available."));
		try {
			var p = request.call(el);
			if (p && typeof p.then === "function") {
				return p;
			}
			return Promise.resolve();
		} catch (error) {
			try {
				var legacy = request.call(el);
				return legacy && typeof legacy.then === "function" ? legacy : Promise.resolve();
			} catch (legacyError) {
				return Promise.reject(legacyError);
			}
		}
	}

	function snapshotNumber() {
		var mv = global.mockVar;
		if (!mv) return 0;
		var value = Number(mv.fullscreenSeconds);
		return Number.isFinite(value) && value > 0 ? value : 0;
	}

	function snapshotToggleNumber() {
		var mv = global.mockVar;
		if (!mv) return 0;
		var value = Number(mv.fullscreenToggleCount);
		return Number.isFinite(value) && value > 0 ? value : 0;
	}

	/** Keep the counter in mockVar so autosave posts it with the normal snapshot. */
	function persist() {
		var mv = global.mockVar;
		if (!mv) return;
		if (runtime.totalSeconds > 0 || inFullscreen()) {
			mv.fullscreenSeconds = runtime.totalSeconds;
		}
		if (runtime.toggleCount > 0 || inFullscreen()) {
			mv.fullscreenToggleCount = runtime.toggleCount;
		}
	}

	function syncFromSnapshot() {
		var stored = snapshotNumber();
		if (stored > runtime.totalSeconds) runtime.totalSeconds = stored;
		var toggles = snapshotToggleNumber();
		if (toggles > runtime.toggleCount) runtime.toggleCount = toggles;
	}

	/** Ask the server once, so direct quiz links know the assessment policy too. */
	function loadPolicy() {
		if (!global.ExamApi || typeof global.ExamApi.fetchState !== "function") {
			runtime.stateLoaded = true;
			return;
		}
		global.ExamApi.fetchState().then(function (state) {
			runtime.stateLoaded = true;
			if (!state) return;
			if (state.requireFullscreen !== undefined) runtime.required = Boolean(state.requireFullscreen);
			if (state.enableFullscreen !== undefined) runtime.enabled = Boolean(state.enableFullscreen);
			if (state.trackFullscreen !== undefined) runtime.track = Boolean(state.trackFullscreen);
			var stored = Number(state.fullscreenSeconds);
			if (Number.isFinite(stored) && stored > runtime.totalSeconds) {
				runtime.totalSeconds = stored;
				persist();
			}
			var toggles = Number(state.fullscreenToggleCount);
			if (Number.isFinite(toggles) && toggles > runtime.toggleCount) {
				runtime.toggleCount = toggles;
				persist();
			}
			ensureLandscapePrompt();
			updateHeaderFullscreenBtn();
		}).catch(function () {
			runtime.stateLoaded = true;
		});
	}

	function tick() {
		syncFromSnapshot();
		if (inFullscreen() && doc.visibilityState !== "hidden") runtime.totalSeconds += 1;
		if (runtime.totalSeconds > 0) persist();
	}

	function injectStyle() {
		if (doc.getElementById(STYLE_ID)) return;
		var style = doc.createElement("style");
		style.id = STYLE_ID;
		style.textContent = [
			"#ionFullscreenGuard{position:fixed;inset:0;z-index:2147483000;display:grid;place-items:center;padding:24px;",
			"background:rgba(0,0,0,.55);font-family:Arial,Helvetica,sans-serif}",
			"#ionFullscreenGuard .ion-fs-card{width:min(420px,100%);background:#fff;color:#333;border-radius:4px;",
			"box-shadow:0 2px 10px #000;overflow:hidden;text-align:left}",
			"#ionFullscreenGuard .ion-fs-head{background:#2d70b6;color:#fff;height:28px;line-height:28px;",
			"padding:0 8px 0 10px;display:flex;align-items:center;justify-content:space-between;",
			"font-size:13px;font-weight:bold;border-radius:4px 4px 0 0}",
			"#ionFullscreenGuard .ion-fs-head-close{background:transparent;border:0;color:#fff;cursor:pointer;",
			"font-size:18px;line-height:1;padding:0 2px}",
			"#ionFullscreenGuard .ion-fs-head-close:hover{opacity:.8}",
			"#ionFullscreenGuard .ion-fs-body{display:flex;align-items:flex-start;gap:12px;padding:14px 16px 10px}",
			"#ionFullscreenGuard .ion-fs-icon{width:36px;height:36px;flex:0 0 36px;border-radius:50%;",
			"background:#eef4ff;color:#2d70b6;display:grid;place-items:center;font-size:19px;line-height:1}",
			"#ionFullscreenGuard .ion-fs-copy{min-width:0}",
			"#ionFullscreenGuard h2{margin:0 0 6px;font-size:15px;line-height:1.3;color:#111}",
			"#ionFullscreenGuard p{margin:0 0 5px;font-size:13px;line-height:1.45;color:#555}",
			"#ionFullscreenGuard .ion-fs-note{margin:0;font-size:12px;color:#888}",
			"#ionFullscreenGuard .ion-fs-actions{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;",
			"padding:12px;background:#F8F3F0;border-radius:0 0 4px 4px}",
			"#ionFullscreenGuard button{font:bold 13px/1 Arial,Helvetica,sans-serif;border-radius:3px;padding:7px 15px;",
			"cursor:pointer;border:1px solid transparent}",
			"#ionFullscreenGuard .ion-fs-primary{background:#00a951;border-color:#40a26f;color:#fff}",
			"#ionFullscreenGuard .ion-fs-primary:hover{background:#248653}",
			"#ionFullscreenGuard .ion-fs-primary:disabled{opacity:.6;cursor:wait}",
			"#ionFullscreenGuard .ion-fs-secondary{background:#fff;color:#555;border-color:#b3b3b3}",
			"#ionFullscreenGuard .ion-fs-secondary:hover{background:#f2f2f2;color:#111}",
			"#ionFullscreenGuard .ion-fs-error{display:none;margin:8px 0 0;color:#b91c1c;font-size:12px}",
			"#ionFullscreenGuard .ion-fs-error.visible{display:block}"
		].join("");
		(doc.head || doc.documentElement).appendChild(style);
	}

	function ensureOverlay() {
		if (runtime.overlay && runtime.overlay.parentNode) return runtime.overlay;
		injectStyle();

		var overlay = doc.createElement("div");
		overlay.id = OVERLAY_ID;
		overlay.setAttribute("role", "dialog");
		overlay.setAttribute("aria-modal", "true");
		overlay.setAttribute("aria-labelledby", "ionFsTitle");
		overlay.setAttribute("aria-describedby", "ionFsBody");
		overlay.style.display = "none";
		overlay.innerHTML = ''
			+ '<div class="ion-fs-card">'
			+ '  <div class="ion-fs-head">'
			+ '    <span class="ion-fs-head-label">Fullscreen Required</span>'
			+ '    <button type="button" class="ion-fs-head-close" data-fs-close aria-label="Close">&times;</button>'
			+ '  </div>'
			+ '  <div class="ion-fs-body">'
			+ '    <div class="ion-fs-icon" aria-hidden="true">&#9974;</div>'
			+ '    <div class="ion-fs-copy">'
			+ '      <h2 id="ionFsTitle">Fullscreen is required</h2>'
			+ '      <p id="ionFsBody">Answers are locked until fullscreen is enabled. Turn on fullscreen to answer this question.</p>'
			+ '      <p class="ion-fs-note">Your fullscreen time is recorded for this attempt.</p>'
			+ '      <p class="ion-fs-error" data-fs-error></p>'
			+ '    </div>'
			+ '  </div>'
			+ '  <div class="ion-fs-actions">'
			+ '    <button type="button" class="ion-fs-primary" data-fs-enter>Enable Fullscreen</button>'
			+ '    <button type="button" class="ion-fs-secondary" data-fs-close>Close</button>'
			+ '  </div>'
			+ '</div>';

		doc.body.appendChild(overlay);

		overlay.querySelector("[data-fs-enter]").addEventListener("click", function () {
			var button = overlay.querySelector("[data-fs-enter]");
			var error = overlay.querySelector("[data-fs-error]");
			error.textContent = "";
			error.classList.remove("visible");
			button.disabled = true;
			button.textContent = "Enabling…";
			runtime.requestPending = true;

			requestFullscreen().then(function () {
				runtime.requestPending = false;
				button.disabled = false;
				button.textContent = "Enable Fullscreen";
				// fullscreenchange closes the dialog; this fallback covers a missed event.
				if (inFullscreen()) hideOverlay();
			}).catch(function () {
				runtime.requestPending = false;
				button.disabled = false;
				button.textContent = "Enable Fullscreen";
				error.textContent = supportsFullscreen()
					? "Fullscreen was blocked. Allow fullscreen for this site, then try again."
					: "This browser does not support fullscreen. Open the assessment in Chrome, Edge or Firefox.";
				error.classList.add("visible");
			});
		});
		Array.prototype.forEach.call(overlay.querySelectorAll("[data-fs-close]"), function (button) {
			button.addEventListener("click", hideOverlay);
		});
		overlay.addEventListener("mousedown", function (event) {
			if (event.target === overlay) hideOverlay();
		});

		runtime.overlay = overlay;
		return overlay;
	}

	function showOverlay() {
		if (!runtime.required || inFullscreen()) return;
		var overlay = ensureOverlay();
		if (overlay.style.display !== "none") return;
		runtime.lastFocus = doc.activeElement;
		overlay.style.display = "grid";
		var button = overlay.querySelector("[data-fs-enter]");
		if (button) {
			try { button.focus(); } catch (error) { /* presentation only */ }
		}
	}

	function hideOverlay() {
		if (!runtime.overlay) return;
		runtime.overlay.style.display = "none";
		var error = runtime.overlay.querySelector("[data-fs-error]");
		if (error) {
			error.textContent = "";
			error.classList.remove("visible");
		}
		if (runtime.lastFocus && typeof runtime.lastFocus.focus === "function") {
			try { runtime.lastFocus.focus(); } catch (error) { /* presentation only */ }
		}
	}

	function elementOf(target) {
		if (!target) return null;
		return target.nodeType === 3 ? target.parentNode : target;
	}

	function closest(target, selector) {
		var el = elementOf(target);
		if (!el || !el.closest) return null;
		try { return el.closest(selector); } catch (error) { return null; }
	}

	function insideOverlay(target) {
		return Boolean(closest(target, "#" + OVERLAY_ID));
	}

	function isAnswerAction(target) {
		return Boolean(closest(target, ANSWER_ACTION_SELECTOR));
	}

	function isTypingInAnswerPanel(target) {
		var el = elementOf(target);
		if (!el) return false;
		var tag = String(el.tagName || "").toUpperCase();
		var typing = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable === true;
		if (!typing) return false;
		return Boolean(closest(el, ANSWER_PANEL_SELECTOR)) || Boolean(closest(el, ANSWER_ACTION_SELECTOR));
	}

	function block(event) {
		event.preventDefault();
		event.stopPropagation();
		if (typeof event.stopImmediatePropagation === "function") event.stopImmediatePropagation();
		showOverlay();
	}

	function onDocumentClick(event) {
		if (!runtime.required || inFullscreen() || insideOverlay(event.target)) return;
		if (isAnswerAction(event.target)) block(event);
	}

	function onDocumentKeydown(event) {
		if (!runtime.required || inFullscreen() || insideOverlay(event.target)) return;
		if (event.ctrlKey || event.metaKey || event.altKey) return;

		var key = event.key || "";
		var passthrough = ["Tab", "Shift", "Escape", "PageUp", "PageDown", "Home", "End", "F1", "F5", "F11", "F12"];
		if (passthrough.indexOf(key) !== -1) return;

		var el = elementOf(event.target);
		var tag = el ? String(el.tagName || "").toUpperCase() : "";

		// Radio/checkbox option selection can happen with Space, Enter or arrows.
		if (tag === "INPUT" && /^(radio|checkbox)$/i.test(el.type || "")) {
			if (key === " " || key === "Enter" || key.indexOf("Arrow") === 0) block(event);
			return;
		}

		// Typed answer fields: lock the text until fullscreen is on.
		if (isTypingInAnswerPanel(el)) {
			if (key.length === 1 || key === "Enter" || key === "Backspace" || key === "Delete" || key === "Tab") {
				if (key === "Tab") return;
				block(event);
			}
		}
	}

	function onPasteOrDrop(event) {
		if (!runtime.required || inFullscreen()) return;
		if (isTypingInAnswerPanel(event.target)) block(event);
	}

	function onBeforeInput(event) {
		if (!runtime.required || inFullscreen()) return;
		if (isTypingInAnswerPanel(event.target)) block(event);
	}

	function lockLandscape() {
		try {
			if (global.screen && global.screen.orientation && typeof global.screen.orientation.lock === "function") {
				global.screen.orientation.lock("landscape").catch(function () {});
			} else if (global.screen && typeof global.screen.lockOrientation === "function") {
				global.screen.lockOrientation("landscape");
			} else if (global.screen && typeof global.screen.mozLockOrientation === "function") {
				global.screen.mozLockOrientation("landscape");
			} else if (global.screen && typeof global.screen.msLockOrientation === "function") {
				global.screen.msLockOrientation("landscape");
			}
		} catch (e) {}
	}
	function exitFullscreen() {
		var exit = doc.exitFullscreen || doc.webkitExitFullscreen || doc.msExitFullscreen || doc.mozCancelFullScreen;
		if (!exit) return Promise.resolve();
		try {
			var pending = exit.call(doc);
			return pending && typeof pending.then === "function" ? pending : Promise.resolve();
		} catch (e) {
			return Promise.resolve();
		}
	}

	function toggleFullscreen() {
		if (inFullscreen()) {
			return exitFullscreen();
		}
		return requestFullscreen().then(function () {
			// Orientation is handled by exam/phone-orientation.js, which is
			// phone-only; desktop fullscreen stays exactly as it was.
		}).catch(function (err) {
			console.warn("Fullscreen request error:", err);
		});
	}

	function updateHeaderFullscreenBtn() {
		var active = inFullscreen();
		var btn = doc.getElementById("btnHeaderFullscreen");
		if (btn) {
			btn.setAttribute("aria-pressed", active ? "true" : "false");
			btn.setAttribute("aria-label", active ? "Exit full screen" : "Enter full screen");
			btn.setAttribute("title", active ? "Exit Full Screen" : "Full Screen");
		}
		var btnSpan = doc.getElementById("btnHeaderFullscreenSpan");
		if (btnSpan) {
			btnSpan.textContent = active ? "Exit Full Screen" : "Full Screen";
		}
		var prompt = doc.getElementById("ionLandscapePrompt");
		if (prompt) {
			var isTouch = ("ontouchstart" in global) || (global.navigator && global.navigator.maxTouchPoints > 0);
			var isPortrait = global.innerHeight > global.innerWidth;
			if (isTouch && isPortrait && !inFullscreen()) {
				prompt.style.display = "flex";
			} else {
				prompt.style.display = "none";
			}
		}
	}

	function ensureLandscapePrompt() {
		var existing = doc.getElementById("ionLandscapePrompt");
		if (existing) return;
		var prompt = doc.createElement("div");
		prompt.id = "ionLandscapePrompt";
		prompt.innerHTML = '<div class="ion-fs-prompt-head">Fullscreen Required</div>' +
			'<div class="ion-fs-prompt-body">Enter fullscreen, then rotate to landscape for the PC view</div>' +
			'<div class="ion-fs-prompt-foot"><button type="button">Enter Fullscreen</button></div>';
		var btn = prompt.querySelector("button");
		if (btn) {
			btn.addEventListener("click", function () {
				toggleFullscreen();
			});
		}
		doc.body.appendChild(prompt);
		updateHeaderFullscreenBtn();
	}

	function onFullscreenChange() {
		syncFromSnapshot();
		runtime.toggleCount += 1;
		if (inFullscreen()) {
			hideOverlay();
		}
		updateHeaderFullscreenBtn();
		persist();
	}

	function attach() {
		doc.addEventListener("click", onDocumentClick, true);
		doc.addEventListener("keydown", onDocumentKeydown, true);
		doc.addEventListener("paste", onPasteOrDrop, true);
		doc.addEventListener("drop", onPasteOrDrop, true);
		doc.addEventListener("beforeinput", onBeforeInput, true);
		doc.addEventListener("fullscreenchange", onFullscreenChange, true);
		doc.addEventListener("webkitfullscreenchange", onFullscreenChange, true);
		doc.addEventListener("mozfullscreenchange", onFullscreenChange, true);
		doc.addEventListener("MSFullscreenChange", onFullscreenChange, true);

		global.addEventListener("resize", updateHeaderFullscreenBtn);
		global.addEventListener("orientationchange", updateHeaderFullscreenBtn);

		global.addEventListener("pagehide", persist);
		global.addEventListener("beforeunload", persist);

		if (!runtime.tickId) runtime.tickId = global.setInterval(tick, CHECK_MS);
	}

	function boot() {
		runtime.required = storedFlag();
		runtime.enabled = readSession("enableFullscreen") === "1" || runtime.required;
		runtime.track = readSession("trackFullscreen") !== "0";
		syncFromSnapshot();
		loadPolicy();
		attach();
		ensureLandscapePrompt();
		updateHeaderFullscreenBtn();
		var btn = doc.getElementById("btnHeaderFullscreen");
		if (btn) {
			btn.addEventListener("click", function (e) {
				e.preventDefault();
				toggleFullscreen();
			});
		}
		// A resumed attempt may already be counting; seed the field once mockVar exists.
		persist();
	}

	if (doc.readyState === "loading") {
		doc.addEventListener("DOMContentLoaded", boot);
	} else {
		boot();
	}

	global.ExamFullscreen = {
		isRequired: function () { return runtime.required; },
		isActive: function () { return inFullscreen(); },
		seconds: function () { return runtime.totalSeconds; },
		toggleCount: function () { return runtime.toggleCount; },
		request: requestFullscreen,
		exit: exitFullscreen,
		toggle: toggleFullscreen,
		lockLandscape: lockLandscape,
		refresh: function () {
			syncFromSnapshot();
			runtime.required = storedFlag();
			ensureLandscapePrompt();
			updateHeaderFullscreenBtn();
		}
	};
})(window);
