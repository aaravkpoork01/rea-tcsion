/*
 * exam/dom.js — DOM helpers shared by the exam bridges.
 * Classic script; exposes window.ExamDom.
 */
(function (global) {
	"use strict";

	function visible(el) {
		if (!el) return false;
		try {
			var style = global.getComputedStyle(el);
			if (style.display === "none" || style.visibility === "hidden") return false;
			var rect = el.getBoundingClientRect();
			return rect.width > 0 && rect.height > 0;
		} catch (e) {
			return false;
		}
	}

	function click(el) {
		if (!el) return false;
		try {
			el.click();
			return true;
		} catch (e) {
			return false;
		}
	}

	function fire(el, type) {
		if (!el) return;
		try {
			el.dispatchEvent(new Event(type, { bubbles: true }));
		} catch (e) { /* ignore */ }
	}

	function byId(id) {
		return global.document.getElementById(id);
	}

	function firstVisible(ids) {
		for (var i = 0; i < ids.length; i++) {
			var el = byId(ids[i]);
			if (el && visible(el) && !el.disabled) return el;
		}
		return null;
	}

	function text(el) {
		return el ? String(el.innerText || el.textContent || "").replace(/\s+/g, " ").trim() : "";
	}

	global.ExamDom = {
		visible: visible,
		click: click,
		fire: fire,
		byId: byId,
		firstVisible: firstVisible,
		text: text
	};
})(window);
