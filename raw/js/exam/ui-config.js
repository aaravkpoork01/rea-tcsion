/*
 * exam/ui-config.js — applies the admin presentation settings to the exam UI.
 *
 * The stock engine decides which top-bar entries, tools and languages to show
 * from the paper XML. Admins can override those decisions from the back-office
 * without touching top.js:
 *
 *   top bar  Useful Data · View Instructions · Group/Section/Question
 *            Instructions · Question Paper · Fullscreen · custom buttons
 *   tools    calculator, ruler, protractor, zoom in/out, notepad,
 *            scratchpad, text highlighter
 *   language display list (Tamil → Gujarati by default)
 *   brand icon / favicon
 *
 * Modes are `auto` (engine decides), `show` (force visible) and `hide`.
 * Classic script; exposes window.ExamUiConfig.
 */
(function (global) {
	"use strict";

	// top.js injects Calculator.html into the quiz document and that fragment
	// carries this same script tag, so run the module once per document.
	if (global.__ION_UI_CONFIG_LOADED__) return;
	global.__ION_UI_CONFIG_LOADED__ = true;

	// Candidate URLs carry `org@@assessment` at the front (`?726@@M62...`).
	// Include it so each assessment can have its own top bar and tool set.
	function assessmentContext() {
		try {
			var parts = String((global.location && global.location.search) || "").replace(/^\?/, "").split("@@");
			return { orgId: parts[0] || "", assessmentId: parts[1] || "" };
		} catch (error) {
			return { orgId: "", assessmentId: "" };
		}
	}

	var CONTEXT = assessmentContext();
	var API = "/IBA/api/config";
	if (CONTEXT.assessmentId) {
		API += "?orgId=" + encodeURIComponent(CONTEXT.orgId) +
			"&assessmentId=" + encodeURIComponent(CONTEXT.assessmentId);
	}

	// key → wrapper selectors. Hiding the wrapper keeps the icon, the label and
	// the mobile twin consistent, and matches what top.js itself toggles.
	var TOPBAR_TARGETS = {
		useful_data: [".help_div.usefulDataDiv", "#usefulDataMbl"],
		instructions: [".instruction_div", "#VIMbl"],
		group_instructions: [".viewGrpInstruDiv", "#viewGrpInstruDiv"],
		section_instructions: [".viewSecInstruDiv", "#viewSecInstruDiv"],
		question_instructions: [".viewQuesInstruDiv", "#viewQuesInstruDiv"],
		question_paper: ["#viewQPTD", "#viewQPButtonMbl"],
		fullscreen: []
	};

	// Only the caption spans are rewritten; the surrounding buttons keep their
	// markup, handlers and accessibility attributes.
	var TOPBAR_LABELS = {
		useful_data: ["span#usefulData", "#usefulDataMbl span", "#usefulDataMbl"],
		instructions: ["#VI", "#VIMbl"],
		group_instructions: ["#QuesInsQuizBtn", "#viewGrpInstruDiv span", "#viewGrpInstruDiv"],
		section_instructions: ["#SecInsQuizBtn", "#viewSecInstruDiv span", "#viewSecInstruDiv"],
		question_instructions: ["#GrpInsQuizBtn", "#viewQuesInstruDiv span", "#viewQuesInstruDiv"],
		question_paper: ["#viewQPButton", "#viewQPButtonMbl span", "#viewQPButtonMbl"],
		fullscreen: []
	};

	// Stock captions. When the admin keeps the default the text is left alone, so
	// the engine stays free to localise or shorten it exactly as before.
	var TOPBAR_LABEL_DEFAULTS = {
		useful_data: "Useful Data",
		instructions: "View Instructions",
		group_instructions: "Group Instructions",
		section_instructions: "Section Instructions",
		question_instructions: "Question Instructions",
		question_paper: "Question Paper",
		fullscreen: "Fullscreen"
	};

	// Stock left-to-right order of the desktop toolbar. Restored after every
	// pass so buttons never drift when a setting is toggled.
	var TOPBAR_ORDER = [
		".accessibilityContent",
		".magnifier_class",
		".viewQuesInstruDiv",
		".viewSecInstruDiv",
		".viewShortCutsDiv",
		".viewGrpInstruDiv",
		".help_div.usefulDataDiv",
		".refdocDiv",
		".instruction_div",
		"#viewQPTD"
	];

	var TOOL_TARGETS = {
		calculator: [".calculator-icon-container"],
		ruler: [".ruler-icon-container"],
		protractor: [".protactor-icon-container"],
		zoom_in: [".zoomin-icon-container"],
		zoom_out: [".zoomout-icon-container"],
		notepad: [".textarea-icon-container"],
		scratchpad: [".scratchpad-icon-container"],
		highlighter: [".selectmark_tool", ".selectmark_tool-new", ".highlightTool"]
	};

	var TOOL_TITLES = {
		calculator: "Calculator",
		ruler: "Ruler",
		protractor: "Protractor",
		zoom_in: "Zoom In",
		zoom_out: "Zoom Out",
		notepad: "Notepad",
		scratchpad: "Scratchpad",
		highlighter: "Text Highlighter"
	};

	var STYLE_ID = "ionUiConfigStyle";
	var config = null;
	var fullscreenHost = null;
	var observer = null;
	var customSignature = "";

	function bySelector(selector) {
		try {
			return Array.prototype.slice.call(document.querySelectorAll(selector));
		} catch (error) {
			return [];
		}
	}

	function injectStyle() {
		if (document.getElementById(STYLE_ID)) return;
		var style = document.createElement("style");
		style.id = STYLE_ID;
		// Hidden tools/buttons are pinned from the root element so nodes the
		// engine re-creates mid-exam (inline display rules included) stay hidden.
		var hide = [];
		Object.keys(TOOL_TARGETS).forEach(function (key) {
			TOOL_TARGETS[key].forEach(function (selector) {
				hide.push('[data-ion-hide-' + key + '="1"] ' + selector + '{display:none !important}');
			});
		});
		Object.keys(TOPBAR_TARGETS).forEach(function (key) {
			TOPBAR_TARGETS[key].forEach(function (selector) {
				hide.push('[data-ion-hide-' + key + '="1"] ' + selector + '{display:none !important}');
			});
		});
		style.textContent = [
			".ion-ui-hidden{display:none !important}",
			".ion-ui-block{display:block !important}",
			".ion-ui-inline{display:inline-block !important}",
			".ion-fullscreen-host{float:right;margin-right:12px}",
			".ion-fullscreen-host .ion-fs-button{background:none;border:0;padding:0;margin:5px 0 0;cursor:pointer;line-height:0}",
			".ion-fullscreen-host .ion-fs-button svg{width:22px;height:22px;fill:none;stroke:#fff;stroke-width:1.8}",
			".ion-fullscreen-host .ion-fs-button:hover svg{stroke:#4fc3f7}",
			".ion-fs-mbl{display:block !important}",
			".ion-fs-mbl::before{content:'\\26F6';margin-right:8px}",
			".ion-custom-mbl{display:block !important}"
		].concat(hide).join("\n");
		(document.head || document.documentElement).appendChild(style);
	}

	function setHideFlag(key, mode) {
		var root = document.documentElement;
		var name = "data-ion-hide-" + key;
		if (mode === "hide") root.setAttribute(name, "1");
		else root.removeAttribute(name);
	}

	function forceDisplay(el, mode, preferInline) {
		if (!el || !el.style) return;
		el.classList.remove("ion-ui-hidden");
		el.classList.remove("ion-ui-block");
		el.classList.remove("ion-ui-inline");
		if (mode === "hide") {
			el.classList.add("ion-ui-hidden");
			return;
		}
		if (mode !== "show") return;
		var tag = (el.tagName || "").toUpperCase();
		el.classList.add(tag === "SPAN" || preferInline ? "ion-ui-inline" : "ion-ui-block");
	}

	function label(el, value) {
		if (!el || !value) return;
		if ((el.textContent || "").trim() !== value) el.textContent = value;
	}

	function applyTopbar(topbar) {
		var items = (topbar && topbar.items) || {};
		Object.keys(TOPBAR_TARGETS).forEach(function (key) {
			if (key === "fullscreen") return;
			var entry = items[key] || { mode: "auto", label: "" };
			setHideFlag(key, entry.mode);
			TOPBAR_TARGETS[key].forEach(function (selector) {
				bySelector(selector).forEach(function (el) {
					forceDisplay(el, entry.mode);
					if (entry.mode === "hide") el.setAttribute("aria-hidden", "true");
					else el.removeAttribute("aria-hidden");
				});
			});
			(TOPBAR_LABELS[key] || []).forEach(function (selector) {
				if (entry.label === TOPBAR_LABEL_DEFAULTS[key]) return;
				bySelector(selector).forEach(function (el) { label(el, entry.label); });
			});
		});
		applyCustomButtons(topbar && topbar.custom);
		restoreTopbarOrder();
	}

	/**
	 * Stock order is preserved exactly. Added buttons (fullscreen, custom links)
	 * sit at the far left so the right-aligned stock cluster never shifts.
	 */
	function restoreTopbarOrder() {
		var toolbar = document.querySelector(".helpinstruction_div");
		if (!toolbar) return;

		var desired = [];
		bySelector(".helpinstruction_div .ion-custom-button, .helpinstruction_div .ion-fullscreen-host").forEach(function (node) {
			if (desired.indexOf(node) === -1) desired.push(node);
		});
		TOPBAR_ORDER.forEach(function (selector) {
			var node = toolbar.querySelector(selector);
			if (node && desired.indexOf(node) === -1) desired.push(node);
		});

		var current = Array.prototype.slice.call(toolbar.children);
		var same = current.length === desired.length && current.every(function (node, index) {
			return node === desired[index];
		});
		if (same) return;

		desired.forEach(function (node) { toolbar.appendChild(node); });
	}

	/**
	 * The engine's global `.auditlogButton` handler does `jQuery("#" + id)`,
	 * which throws on buttons that ship without an id (the runtime typing-test
	 * Submit is the known case) and stalls the group-submit/break transition.
	 * Backfill a stable id before the engine's handler runs.
	 */
	var auditIdCounter = 0;

	function ensureAuditId(el) {
		if (!el || !el.classList || !el.classList.contains("auditlogButton") || el.id) return;
		var tag = (el.tagName || "").toUpperCase();
		var caption = ((el.value || el.textContent || "") + "").trim();
		var typingSubmit = tag === "INPUT" && !/typingTestButtonDisabled/.test(el.className) &&
			/\btyping\b/.test(el.className) && /^submit$/i.test(caption);
		if (typingSubmit && !document.getElementById("finalTypingSub")) {
			el.id = "finalTypingSub";
			return;
		}
		auditIdCounter += 1;
		while (document.getElementById("ionAuditBtn" + auditIdCounter)) auditIdCounter += 1;
		el.id = "ionAuditBtn" + auditIdCounter;
	}

	function ensureAuditIds() {
		bySelector(".auditlogButton").forEach(ensureAuditId);
	}

	function applyTools(tools) {
		Object.keys(TOOL_TARGETS).forEach(function (key) {
			var mode = (tools && tools[key]) || "auto";
			setHideFlag(key, mode);
			TOOL_TARGETS[key].forEach(function (selector) {
				bySelector(selector).forEach(function (el) {
					if (key === "highlighter" && el.id === "selectmark_tool-id") return;
					forceDisplay(el, mode, true);
					if (mode === "hide") el.setAttribute("aria-hidden", "true");
					else el.removeAttribute("aria-hidden");
				});
			});
		});
	}

	function supportsFullscreen() {
		var el = document.documentElement;
		return Boolean(el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen);
	}

	function isFullscreen() {
		return Boolean(document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement);
	}

	function toggleFullscreen() {
		try {
			if (isFullscreen()) {
				var exit = document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen;
				if (exit) exit.call(document);
				return;
			}
			var el = document.documentElement;
			var request = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen;
			if (request) {
				var pending = request.call(el);
				if (pending && pending.catch) pending.catch(function () { /* denied */ });
			}
		} catch (error) { /* user gesture / policy */ }
	}

	function fullscreenGlyph() {
		return '<svg viewBox="0 0 24 24" aria-hidden="true">' +
			'<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>' +
			"</svg>";
	}

	function syncFullscreenGlyph() {
		if (!fullscreenHost) return;
		var button = fullscreenHost.querySelector(".ion-fs-button");
		if (!button) return;
		var on = isFullscreen();
		button.setAttribute("aria-pressed", on ? "true" : "false");
		button.setAttribute("title", on ? "Exit full screen" : "Full screen");
	}

	function installFullscreen(entry) {
		if (!supportsFullscreen()) return;
		var mode = entry.mode || "show";
		if (mode === "hide") {
			bySelector(".helpinstruction_div .ion-fullscreen-host").forEach(function (el) {
				if (el.parentNode) el.parentNode.removeChild(el);
			});
			if (fullscreenHost && fullscreenHost.parentNode) fullscreenHost.parentNode.removeChild(fullscreenHost);
			fullscreenHost = null;
			bySelector(".ion-fs-mbl").forEach(function (el) {
				if (el.parentNode) el.parentNode.removeChild(el);
			});
			return;
		}

		if (!fullscreenHost || !fullscreenHost.parentNode) {
			// Adopt a control injected by another copy of this bridge instead of
			// appending a second one.
			var existingHost = document.querySelector(".helpinstruction_div .ion-fullscreen-host");
			if (existingHost) {
				fullscreenHost = existingHost;
			} else {
				var toolbar = document.querySelector(".helpinstruction_div");
				if (toolbar) {
					var host = document.createElement("div");
					host.className = "help_div ion-fullscreen-host";
					host.innerHTML = '<button type="button" class="ion-fs-button" aria-label="Toggle full screen" ' +
						'aria-pressed="false" title="Full screen">' + fullscreenGlyph() + "</button>";
					host.querySelector(".ion-fs-button").addEventListener("click", toggleFullscreen);
					toolbar.appendChild(host);
					fullscreenHost = host;
				}
			}
		}

		// Responsive menu (below 1000px the desktop toolbar is hidden).
		var sections = document.querySelector(".sections.section2");
		if (sections && !sections.querySelector(".ion-fs-mbl")) {
			var mobile = document.createElement("button");
			mobile.type = "button";
			mobile.id = "ionFsMbl";
			mobile.className = "moresections auditlogButton ion-fs-mbl";
			mobile.setAttribute("aria-label", "Toggle full screen");
			mobile.innerHTML = "<span>" + (entry.label || "Fullscreen") + "</span>";
			mobile.addEventListener("click", toggleFullscreen);
			sections.appendChild(mobile);
		}
		syncFullscreenGlyph();
	}

	function applyCustomButtons(custom) {
		if (!Array.isArray(custom)) return;
		var visible = custom.filter(function (item) { return item && item.href && item.mode !== "hide"; });
		var signature = JSON.stringify(visible);
		if (signature === customSignature && document.querySelector(".ion-custom-button")) return;

		// Remove previous renders so edits/removals take effect immediately.
		bySelector(".ion-custom-button").forEach(function (el) {
			if (el.parentNode) el.parentNode.removeChild(el);
		});
		customSignature = signature;

		var toolbar = document.querySelector(".helpinstruction_div");
		var sections = document.querySelector(".sections.section2");

		visible.forEach(function (item) {
			if (toolbar) {
				var host = document.createElement("div");
				host.className = "help_div ion-fullscreen-host ion-custom-button";
				var button = document.createElement("button");
				button.type = "button";
				button.className = "ion-fs-button";
				button.title = item.label;
				button.setAttribute("aria-label", item.label);
				button.innerHTML = '<span style="color:#fff;font:12px/22px sans-serif;white-space:nowrap">' +
					String(item.label).replace(/[<>&"]/g, "") + "</span>";
				button.addEventListener("click", function () { global.open(item.href, "_blank", "noopener"); });
				host.appendChild(button);
				toolbar.appendChild(host);
			}
			if (sections) {
				var mobile = document.createElement("button");
				mobile.type = "button";
				mobile.id = "ionCustomMbl" + (item.id || visible.indexOf(item) + 1).toString().replace(/[^A-Za-z0-9_-]/g, "");
				mobile.className = "moresections auditlogButton ion-custom-button ion-custom-mbl";
				mobile.textContent = item.label;
				mobile.addEventListener("click", function () { global.open(item.href, "_blank", "noopener"); });
				sections.appendChild(mobile);
			}
		});
	}

	function applyBrand(brand) {
		if (!brand) return;
		if (brand.icon) {
			var links = bySelector('link[rel~="icon"]');
			if (!links.length) {
				var link = document.createElement("link");
				link.rel = "icon";
				(document.head || document.documentElement).appendChild(link);
				links = [link];
			}
			links.forEach(function (node) { node.href = brand.icon; });
			global.__ION_BRAND_ICON__ = brand.icon;
		}
		// Login page: only the optional admin brand icon is shown. The brand
		// name is deliberately not repeated as header text. Exam pages keep
		// the paper banner that top.js paints via #bannerImg.
		if (document.getElementById("login")) {
			var headerImage = document.getElementById("bannerImg");
			if (headerImage && brand.icon && !headerImage.querySelector("img")) {
				var logo = document.createElement("img");
				logo.alt = brand.name || "";
				logo.style.maxHeight = "44px";
				logo.src = brand.icon;
				headerImage.innerHTML = "";
				headerImage.appendChild(logo);
			}
		}
		global.__ION_BRAND__ = brand;
	}

	// ---- languages ---------------------------------------------------------

	function relabelSelect(select, languages) {
		if (!select || select.tagName !== "SELECT") return;
		var known = {};
		languages.forEach(function (name) { known[name.toLowerCase()] = true; });
		var present = {};
		Array.prototype.forEach.call(select.options, function (option) {
			present[(option.textContent || "").trim().toLowerCase()] = true;
		});
		var unused = languages.filter(function (name) { return !present[name.toLowerCase()]; });
		if (!unused.length) return;

		Array.prototype.forEach.call(select.options, function (option) {
			var current = (option.textContent || "").trim();
			if (!current || known[current.toLowerCase()]) return;
			if (!unused.length) return;
			var replacement = unused.shift();
			var keepValue = /^\d+$/.test(option.value); // QP language index
			option.textContent = replacement;
			if (!keepValue) option.value = replacement;
		});
	}

	function relabelSpans(languages) {
		var spans = bySelector(".langselect .mlanguageSelected");
		if (!spans.length) return;
		var known = {};
		languages.forEach(function (name) { known[name.toLowerCase()] = true; });

		var present = {};
		spans.forEach(function (span) {
			present[(span.textContent || "").trim().toLowerCase()] = true;
		});
		var unused = languages.filter(function (name) { return !present[name.toLowerCase()]; });
		if (!unused.length) return;

		spans.forEach(function (span) {
			var current = (span.textContent || "").trim();
			if (!current || known[current.toLowerCase()]) return;
			if (!unused.length) return;
			var replacement = unused.shift();
			span.textContent = replacement;
			span.setAttribute("value", replacement);
		});
	}

	function applyLanguages(languages) {
		if (!Array.isArray(languages) || !languages.length) return;
		bySelector("#languageSelect, #defaultLanguage, #defaultSelectedLanguage").forEach(function (select) {
			relabelSelect(select, languages);
		});
		relabelSpans(languages);
	}

	function watchLanguages(languages) {
		if (observer || typeof global.MutationObserver !== "function") return;
		observer = new global.MutationObserver(function () {
			applyLanguages(languages);
			applyTopbar(config.topbar);
		});
		bySelector("#languageSelect, #defaultSelectedLanguage, .langselect").forEach(function (node) {
			observer.observe(node, { childList: true, subtree: true });
		});
	}

	function apply() {
		if (!config) return;
		injectStyle();
		applyBrand(config.brand);
		if (document.querySelector(".helpinstruction_div") || document.querySelector(".sections.section2")) {
			ensureAuditIds();
			applyTopbar(config.topbar);
			applyTools(config.tools);
			restoreTopbarOrder();
			applyLanguages(config.languages);
			watchLanguages(config.languages);
		}
		global.__ION_UI_CONFIG__ = config;
	}

	function load() {
		try {
			fetch(API, { credentials: "same-origin" })
				.then(function (response) { return response.ok ? response.json() : null; })
				.then(function (data) {
					if (!data || data.ok === false) return;
					config = data;
					apply();
					// The engine builds the toolbar and language lists asynchronously.
					[400, 1200, 2600, 5000].forEach(function (delay) {
						global.setTimeout(apply, delay);
					});
				})
				.catch(function () { /* config is optional */ });
		} catch (error) { /* fetch unavailable */ }
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", load);
	} else {
		load();
	}

	document.addEventListener("fullscreenchange", syncFullscreenGlyph);
	document.addEventListener("webkitfullscreenchange", syncFullscreenGlyph);

	// Catch buttons the engine creates after the last apply() pass: a capture
	// listener runs before the engine's own click handler reads `event.target.id`.
	document.addEventListener("click", function (event) { ensureAuditId(event.target); }, true);
	document.addEventListener("keydown", function (event) {
		if (event.key === "Enter" || event.key === " ") ensureAuditId(event.target);
	}, true);

	global.ExamUiConfig = {
		apply: apply,
		reload: load,
		current: function () { return config; }
	};
})(window);
