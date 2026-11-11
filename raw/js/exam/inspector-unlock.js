/*
 * Keep the browser inspector usable on candidate pages.
 *
 * The assessment engine (top.js) binds a document-level `contextmenu`
 * handler that calls preventDefault, so right-click -> Inspect is dead on
 * every page it loads. top.js is a shipped artifact and stays untouched;
 * this module simply stops the event before it reaches that handler and
 * clears the legacy `document.oncontextmenu` hook. The native menu is not
 * cancelled by us, so it opens normally.
 */
(function () {
	"use strict";

	// Calculator.html is injected into the quiz document and carries this
	// script tag too; keep a single set of listeners per document.
	if (window.__ION_INSPECTOR_UNLOCK__) return;
	window.__ION_INSPECTOR_UNLOCK__ = true;

	var doc = document;

	function allowContextMenu() {
		try { doc.oncontextmenu = null; } catch (e) {}
		try { doc.onmouseup = null; } catch (e) {}
		try { doc.onmousedown = null; } catch (e) {}
	}

	// Capture phase: stop the event at the window so the engine's document
	// handler never sees it. Nothing calls preventDefault here.
	window.addEventListener("contextmenu", function (event) {
		event.stopImmediatePropagation();
	}, true);

	// On Windows the native menu is raised on right-button release, so the
	// engine's `document.onmouseup = clickNS` (returns false for button 3)
	// suppresses it before contextmenu is ever dispatched. Keep right-button
	// mouse events from reaching that hook.
	window.addEventListener("mouseup", function (event) {
		if (event.button === 2) event.stopImmediatePropagation();
	}, true);
	window.addEventListener("mousedown", function (event) {
		if (event.button === 2) event.stopImmediatePropagation();
	}, true);

	allowContextMenu();
	doc.addEventListener("DOMContentLoaded", allowContextMenu);
	window.addEventListener("load", allowContextMenu);
	setTimeout(allowContextMenu, 0);
	setTimeout(allowContextMenu, 1500);
})();
