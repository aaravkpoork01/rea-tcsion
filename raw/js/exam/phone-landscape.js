/*
 * exam/phone-landscape.js - open phone candidates in the desktop landscape view.
 *
 * The exam console is a fixed 1200px desktop composition. A phone in portrait
 * renders it as a very tall page, which does not look like the PC exam. In
 * landscape the same canvas maps onto the full display, so this gate asks the
 * candidate to enter fullscreen and turn the phone before the paper starts.
 *
 * Fullscreen hides the browser chrome and the phone menu bar. On browsers that
 * support the Screen Orientation API, the shared phone-orientation helper also
 * locks the page to landscape. If fullscreen or the lock is unavailable (for
 * example iOS Safari), the gate asks the candidate to rotate the phone
 * manually. The explicit "Continue in portrait" action keeps the existing
 * portrait layout available.
 *
 * Classic script; phone-only, desktop is untouched.
 */
(function (global) {
	"use strict";

	var doc = global.document;
	if (!doc) return;

	var GATE_ID = "ionPhoneLandscapeGate";
	var STYLE_ID = "ionPhoneLandscapeStyle";
	var SKIP_KEY = "ionPhoneLandscapeSkip";
	var CANVAS_CLASS = "ion-fs-canvas";
	var DESKTOP_CANVAS_WIDTH = 1200;
	var resolved = false;
	var gate = null;

	function isTouchPhone() {
		var touch = global.navigator && global.navigator.maxTouchPoints > 0;
		try {
			touch = touch || global.matchMedia("(pointer: coarse)").matches ||
				global.matchMedia("(hover: none)").matches;
		} catch (error) {}
		var width = (global.screen && global.screen.width) || 0;
		var height = (global.screen && global.screen.height) || 0;
		var shortSide = Math.min(width, height);
		return Boolean(touch && shortSide > 0 && shortSide <= 600);
	}

	function isPortrait() {
		try {
			return global.matchMedia("(orientation: portrait)").matches;
		} catch (error) {
			return global.innerHeight > global.innerWidth;
		}
	}

	function fullscreenRequired() {
		try {
			return global.sessionStorage.getItem("requireFullscreen") === "1";
		} catch (error) {
			return false;
		}
	}

	function skipped() {
		try {
			return global.sessionStorage.getItem(SKIP_KEY) === "1";
		} catch (error) {
			return false;
		}
	}

	function setSkipped() {
		try {
			global.sessionStorage.setItem(SKIP_KEY, "1");
		} catch (error) {}
	}

	function fullscreenElement() {
		return doc.fullscreenElement || doc.webkitFullscreenElement ||
			doc.msFullscreenElement || doc.mozFullScreenElement || null;
	}

	function inFullscreen() {
		return Boolean(fullscreenElement());
	}

	function requestFullscreen() {
		var el = doc.documentElement;
		if (!el) return Promise.reject(new Error("No document element"));
		var fn = el.requestFullscreen || el.webkitRequestFullscreen ||
			el.msRequestFullscreen || el.mozRequestFullScreen;
		if (!fn) return Promise.reject(new Error("Fullscreen is not supported"));
		try {
			var pending = fn.call(el, { navigationUI: "hide" });
			return pending && typeof pending.then === "function" ? pending : Promise.resolve();
		} catch (error) {
			try {
				var legacy = fn.call(el);
				return legacy && typeof legacy.then === "function" ? legacy : Promise.resolve();
			} catch (legacyError) {
				return Promise.reject(legacyError);
			}
		}
	}

	function injectStyle() {
		if (doc.getElementById(STYLE_ID)) return;
		var style = doc.createElement("style");
		style.id = STYLE_ID;
		style.textContent = [
			"#ionPhoneLandscapeGate{position:fixed;top:0;right:0;bottom:0;left:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;background:#0b2b3c;background:rgba(8,35,52,.97);font-family:Arial,Helvetica,sans-serif;padding:40px;box-sizing:border-box}",
			"#ionPhoneLandscapeGate .ion-pl-card{width:900px;max-width:88vw;background:#fff;border-radius:18px;padding:52px 46px;text-align:center;box-shadow:0 24px 70px rgba(0,0,0,.45);box-sizing:border-box}",
			"#ionPhoneLandscapeGate .ion-pl-phone{position:relative;width:86px;height:154px;margin:0 auto 32px;border:8px solid #147eb3;border-radius:14px;box-sizing:border-box;transform:rotate(90deg)}",
			"#ionPhoneLandscapeGate .ion-pl-phone:after{content:'';position:absolute;left:50%;bottom:8px;width:30px;height:5px;margin-left:-15px;border-radius:3px;background:#147eb3}",
			"#ionPhoneLandscapeGate h2{margin:0 0 24px;font-size:52px;line-height:1.2;color:#12384d}",
			"#ionPhoneLandscapeGate p{margin:0 0 22px;font-size:34px;line-height:1.45;color:#333}",
			"#ionPhoneLandscapeGate .ion-pl-error{display:none;margin:0 0 24px;color:#b91c1c;font-size:30px;line-height:1.4}",
			"#ionPhoneLandscapeGate .ion-pl-error.visible{display:block}",
			"#ionPhoneLandscapeGate button{display:block;width:100%;box-sizing:border-box;font-family:inherit;cursor:pointer;-webkit-tap-highlight-color:transparent}",
			"#ionPhoneLandscapeGate .ion-pl-primary{min-height:96px;padding:20px 30px;border:0;border-radius:12px;background:#147eb3;color:#fff;font-size:38px;font-weight:bold}",
			"#ionPhoneLandscapeGate .ion-pl-primary:active{background:#0f6a97}",
			"#ionPhoneLandscapeGate .ion-pl-primary[disabled]{opacity:.7}",
			"#ionPhoneLandscapeGate .ion-pl-skip{margin-top:24px;padding:16px 10px;border:0;background:transparent;color:#5b6b73;font-size:28px;text-decoration:underline}"
		].join("");
		(doc.head || doc.documentElement).appendChild(style);
	}

	function showError(message) {
		if (!gate) return;
		var error = gate.querySelector(".ion-pl-error");
		if (!error) return;
		error.textContent = message;
		error.classList.add("visible");
	}

	function clearError() {
		if (!gate) return;
		var error = gate.querySelector(".ion-pl-error");
		if (!error) return;
		error.textContent = "";
		error.classList.remove("visible");
	}

	function setBusy(busy) {
		if (!gate) return;
		var button = gate.querySelector(".ion-pl-primary");
		if (!button) return;
		button.disabled = busy;
		button.textContent = busy ? "Opening fullscreen..." : "Enter Fullscreen";
	}

	function hideGate(permanent) {
		if (gate) gate.style.display = "none";
		if (permanent) resolved = true;
	}

	// Enter fullscreen; phone-orientation locks landscape when supported.
	function rotateNow() {
		if (!gate) return;
		clearError();
		if (inFullscreen()) {
			if (isPortrait()) {
				showError("Fullscreen is on. Turn your phone sideways to use the desktop view.");
			} else {
				hideGate(true);
				fireResize();
			}
			return;
		}
		setBusy(true);

		requestFullscreen().then(function () {
			// Fullscreen hides the browser chrome; phone-orientation locks
			// landscape when supported. Give the browser a moment to settle,
			// then ask the candidate to rotate if the viewport is still portrait.
			global.setTimeout(function () {
				setBusy(false);
				if (!inFullscreen()) {
					showError("Fullscreen could not start. Turn your phone sideways, or tap Continue in portrait.");
				} else if (isPortrait()) {
					showError("Fullscreen is on. Turn your phone sideways to use the desktop view.");
				} else {
					hideGate(true);
					fireResize();
				}
			}, 900);
		}).catch(function () {
			setBusy(false);
			showError("Fullscreen is not available here. Turn your phone sideways, or tap Continue in portrait.");
		});
	}

	function fireResize() {
		try {
			global.dispatchEvent(new Event("resize"));
		} catch (error) {
			try {
				var event = doc.createEvent("Event");
				event.initEvent("resize", true, true);
				global.dispatchEvent(event);
			} catch (legacyError) {}
		}
	}

	/*
	 * Chrome ignores the width=1200 viewport meta while the page is in
	 * fullscreen and lays the console out at the device width. At 768x360 that
	 * collapses the desktop palette and hides the footer. Keep the desktop
	 * canvas, scale it to the device width, and expose the virtual canvas
	 * height so the stylesheet can size the question pane and palette.
	 */
	function applyDesktopCanvas() {
		var root = doc.documentElement;
		if (!root) return;
		var layoutWidth = global.innerWidth || 0;
		var layoutHeight = global.innerHeight || 0;
		// Outside fullscreen Chrome keeps the 1200px layout viewport but the
		// phone can still only show visualViewport.width CSS pixels (for
		// example 768 of 1200). Scale against the visible width so the desktop
		// composition also fits before the candidate enters fullscreen.
		var viewport = global.visualViewport;
		var width = layoutWidth;
		var height = layoutHeight;
		if (viewport && viewport.width > 0 && viewport.height > 0) {
			width = Math.min(width, viewport.width);
			height = Math.min(height, viewport.height);
		}
		var useCanvas = isTouchPhone() && !isPortrait() && width > 0 && width < 1000;
		if (!useCanvas) {
			if (root.classList.contains(CANVAS_CLASS)) {
				root.classList.remove(CANVAS_CLASS);
			}
			root.style.removeProperty("--ion-fs-scale");
			root.style.removeProperty("--ion-fs-vh");
			return;
		}
		var scale = width / DESKTOP_CANVAS_WIDTH;
		if (!(scale > 0) || !isFinite(scale)) return;
		root.style.setProperty("--ion-fs-scale", String(scale));
		root.style.setProperty("--ion-fs-vh", (height / scale) + "px");
		root.classList.add(CANVAS_CLASS);
	}

	function buildGate() {
		if (gate || !doc.body) return;
		injectStyle();
		gate = doc.createElement("div");
		gate.id = GATE_ID;
		gate.setAttribute("role", "dialog");
		gate.setAttribute("aria-modal", "true");
		gate.setAttribute("aria-labelledby", "ionPlTitle");
		gate.innerHTML =
			'<div class="ion-pl-card">' +
			'  <div class="ion-pl-phone" aria-hidden="true"></div>' +
			'  <h2 id="ionPlTitle">Turn your phone sideways</h2>' +
			'  <p>This exam uses the desktop layout. Enter fullscreen, then turn your phone sideways for the full-screen PC view.</p>' +
			'  <p class="ion-pl-error" role="status" aria-live="polite"></p>' +
			'  <button type="button" class="ion-pl-primary">Enter Fullscreen</button>' +
			'  <button type="button" class="ion-pl-skip">Continue in portrait</button>' +
			'</div>';
		doc.body.appendChild(gate);

		var primary = gate.querySelector(".ion-pl-primary");
		var skip = gate.querySelector(".ion-pl-skip");
		if (primary) primary.addEventListener("click", rotateNow);
		if (skip) {
			skip.addEventListener("click", function () {
				setSkipped();
				hideGate(true);
			});
		}
	}

	function update() {
		applyDesktopCanvas();
		if (!isTouchPhone() || fullscreenRequired() || skipped()) {
			if (gate) gate.style.display = "none";
			return;
		}
		if (!isPortrait()) {
			hideGate(true);
			return;
		}
		if (resolved) return;
		buildGate();
		if (!gate) return;
		gate.style.display = "flex";
		var primary = gate.querySelector(".ion-pl-primary");
		if (primary) {
			try {
				primary.focus({ preventScroll: true });
			} catch (error) {
				try { primary.focus(); } catch (focusError) {}
			}
		}
	}

	function scheduleUpdate() {
		global.setTimeout(update, 180);
	}

	if (doc.readyState === "loading") {
		doc.addEventListener("DOMContentLoaded", update);
	} else {
		update();
	}
	global.addEventListener("resize", scheduleUpdate);
	global.addEventListener("orientationchange", scheduleUpdate);
	doc.addEventListener("fullscreenchange", update);
	doc.addEventListener("webkitfullscreenchange", update);
	doc.addEventListener("mozfullscreenchange", update);
	doc.addEventListener("MSFullscreenChange", update);

	global.ExamPhoneLandscape = {
		show: update,
		enterFullscreen: rotateNow,
		rotate: rotateNow,
		hide: function () { hideGate(true); }
	};
})(window);
