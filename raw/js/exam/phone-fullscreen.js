/*
 * exam/phone-fullscreen.js - fullscreen toggle for every candidate page and
 * the admin console.
 *
 * The exam console already has a header fullscreen button; the login,
 * instructions, result, feedback, photo-verification, calculator and admin
 * pages did not. This script adds one floating button on touch phones only.
 *
 * Fullscreen hides the browser chrome and the phone status bar. On a touch
 * phone the shared phone-orientation helper locks the page to landscape while
 * fullscreen is active; desktop keeps its normal fullscreen behaviour.
 *
 * Classic script; exposes window.ExamPhoneFullscreen.
 */
(function (global) {
	"use strict";

	var doc = global.document;
	if (!doc) return;

	var BTN_ID = "ionPhoneFullscreenBtn";
	var STYLE_ID = "ionPhoneFullscreenStyle";

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

	function exitFullscreen() {
		var fn = doc.exitFullscreen || doc.webkitExitFullscreen ||
			doc.msExitFullscreen || doc.mozCancelFullScreen;
		if (!fn) return Promise.resolve();
		try {
			var pending = fn.call(doc);
			return pending && typeof pending.then === "function" ? pending : Promise.resolve();
		} catch (error) {
			return Promise.resolve();
		}
	}

	function toggle() {
		return inFullscreen() ? exitFullscreen() : requestFullscreen().catch(function () {
			// Some browsers refuse fullscreen without a user gesture or when
			// the site is embedded. Leave the page as it is.
		});
	}

	function injectStyle() {
		if (doc.getElementById(STYLE_ID)) return;
		var style = doc.createElement("style");
		style.id = STYLE_ID;
		style.textContent = [
			"#ionPhoneFullscreenBtn{position:fixed;right:10px;bottom:10px;z-index:2147482000;",
			"width:42px;height:40px;margin:0;padding:0;border:1px solid rgba(255,255,255,.85);",
			"border-radius:6px;background:#0f6a97;color:#fff;display:flex;align-items:center;",
			"justify-content:center;cursor:pointer;-webkit-tap-highlight-color:transparent;",
			"box-shadow:0 2px 8px rgba(0,0,0,.35);font:0/0 a}",
			"#ionPhoneFullscreenBtn:active{background:#0b5478}",
			"#ionPhoneFullscreenBtn svg{display:block;pointer-events:none}",
			"#ionPhoneFullscreenBtn .ion-pfs-exit{display:none}",
			"#ionPhoneFullscreenBtn[aria-pressed=true] .ion-pfs-enter{display:none}",
			"#ionPhoneFullscreenBtn[aria-pressed=true] .ion-pfs-exit{display:block}"
		].join("");
		(doc.head || doc.documentElement).appendChild(style);
	}

	function build() {
		if (doc.getElementById(BTN_ID)) return;
		// The quiz header already has a fullscreen control.
		if (doc.getElementById("btnHeaderFullscreen")) return;
		injectStyle();

		var btn = doc.createElement("button");
		btn.id = BTN_ID;
		btn.type = "button";
		btn.setAttribute("aria-label", "Enter full screen");
		btn.setAttribute("title", "Full Screen");
		btn.innerHTML =
			'<svg class="ion-pfs-enter" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">' +
			'<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>' +
			'<svg class="ion-pfs-exit" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">' +
			'<path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>';
		btn.addEventListener("click", function (event) {
			if (event) {
				event.preventDefault();
				event.stopPropagation();
			}
			toggle();
		});
		doc.body.appendChild(btn);
		update();
	}

	function update() {
		var btn = doc.getElementById(BTN_ID);
		if (!btn) return;
		var active = inFullscreen();
		btn.setAttribute("aria-pressed", active ? "true" : "false");
		btn.setAttribute("aria-label", active ? "Exit full screen" : "Enter full screen");
		btn.setAttribute("title", active ? "Exit Full Screen" : "Full Screen");
	}

	function boot() {
		if (!isTouchPhone()) return;
		build();
	}

	if (doc.readyState === "loading") {
		doc.addEventListener("DOMContentLoaded", boot);
	} else {
		boot();
	}
	doc.addEventListener("fullscreenchange", update);
	doc.addEventListener("webkitfullscreenchange", update);
	doc.addEventListener("mozfullscreenchange", update);
	doc.addEventListener("MSFullscreenChange", update);

	global.ExamPhoneFullscreen = {
		toggle: toggle,
		request: requestFullscreen,
		exit: exitFullscreen,
		isActive: inFullscreen,
		refresh: update
	};
})(window);
