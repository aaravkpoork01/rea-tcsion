/*
 * exam/phone-orientation.js - keep phone fullscreen in landscape.
 *
 * The exam console and the admin panel are desktop compositions. On a touch
 * phone the fullscreen controls now also ask the browser to lock the page to
 * landscape, so the candidate does not have to rotate the device by hand.
 *
 * Desktop is untouched: outside a touch phone this script attaches no listener
 * and calls no orientation API.
 *
 * Classic script; exposes window.ExamPhoneOrientation.
 */
(function (global) {
	"use strict";

	var doc = global.document;
	if (!doc) return;

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

	function lockLandscape() {
		if (!isTouchPhone()) return;
		var orientation = global.screen && global.screen.orientation;
		if (orientation && typeof orientation.lock === "function") {
			try {
				var pending = orientation.lock("landscape");
				if (pending && typeof pending.catch === "function") {
					pending.catch(function () {
						// Some browsers only allow the lock after the fullscreen
						// transition settles. Retry once while still fullscreen.
						global.setTimeout(function () {
							if (!fullscreenElement()) return;
							try {
								var retry = orientation.lock("landscape");
								if (retry && typeof retry.catch === "function") retry.catch(function () {});
							} catch (error) {}
						}, 250);
					});
				}
				return;
			} catch (error) {}
		}
		var legacy = global.screen && (global.screen.lockOrientation ||
			global.screen.mozLockOrientation || global.screen.msLockOrientation);
		if (typeof legacy === "function") {
			try { legacy.call(global.screen, "landscape"); } catch (error) {}
		}
	}

	function unlockOrientation() {
		if (!isTouchPhone()) return;
		var orientation = global.screen && global.screen.orientation;
		if (orientation && typeof orientation.unlock === "function") {
			try { orientation.unlock(); return; } catch (error) {}
		}
		var legacy = global.screen && (global.screen.unlockOrientation ||
			global.screen.mozUnlockOrientation || global.screen.msUnlockOrientation);
		if (typeof legacy === "function") {
			try { legacy.call(global.screen); } catch (error) {}
		}
	}

	function sync() {
		if (!isTouchPhone()) return;
		if (fullscreenElement()) lockLandscape();
		else unlockOrientation();
	}

	if (isTouchPhone()) {
		doc.addEventListener("fullscreenchange", sync);
		doc.addEventListener("webkitfullscreenchange", sync);
		doc.addEventListener("mozfullscreenchange", sync);
		doc.addEventListener("MSFullscreenChange", sync);
		if (doc.readyState === "loading") {
			doc.addEventListener("DOMContentLoaded", sync);
		} else {
			sync();
		}
	}

	global.ExamPhoneOrientation = {
		isPhone: isTouchPhone,
		lock: lockLandscape,
		unlock: unlockOrientation,
		sync: sync
	};
})(window);
