/*
 * feedback-bridge.js — persist the candidate feedback form.
 *
 * The stock page only POSTs feedback when mockVar.storeCandResponse == 1,
 * which is false for client-scored mock papers. The visible form is the
 * static TCS feedback table, so this bridge collects the same radios the
 * engine would have collected and posts them to savecandfeedback.
 *
 * submitFeedback() itself is wrapped, not replaced: when the paper does
 * store responses server-side the original path still runs untouched.
 */
(function () {
	"use strict";

	var posted = false;

	function selectedValue(name) {
		var nodes = document.getElementsByName(name);
		for (var i = 0; i < nodes.length; i++) {
			if (nodes[i].checked) return nodes[i].value;
		}
		return "";
	}

	function collectQuestions() {
		var list = [];
		var seen = {};
		var radios = document.querySelectorAll("input[type=radio][name^=ques]");
		for (var i = 0; i < radios.length; i++) {
			var name = radios[i].name;
			if (seen[name]) continue;
			seen[name] = true;
			var quesId = name.replace(/^ques/, "");
			var value = selectedValue(name);
			var answer = value.indexOf("-") > -1 ? value.split("-").slice(1).join("-") : value;
			list.push({
				QuesId: quesId,
				QuesType: "MCQ",
				SelectedOptId: value,
				GivenAnswer: answer
			});
		}
		var freeText = document.getElementById("feedbackTextArea");
		if (freeText) {
			list.push({
				QuesId: "4",
				QuesType: "SA",
				SelectedOptId: "",
				GivenAnswer: freeText.value || ""
			});
		}
		return list;
	}

	function postFeedback() {
		if (posted) return;
		posted = true;
		var mv = window.mockVar || {};
		var id = (window.ExamStore && window.ExamStore.state && window.ExamStore.state.identity) || {};
		var list = collectQuestions();
		if (!list.length) { posted = false; return; }
		var payload = JSON.stringify({ QuestionsList: list });
		var lang = document.getElementById("getsheetLang");
		var langName = "English";
		var langId = "1";
		if (lang && lang.options.length) {
			var opt = lang.options[lang.selectedIndex];
			if (opt && opt.value && opt.value !== "0") {
				langName = opt.text;
				langId = opt.value;
			}
		}
		var params = new URLSearchParams();
		params.set("candMasterId", mv.candMasterId || id.candidateId || sessionStorage.cand_master_id || "");
		params.set("attemptNo", mv.attemptId || id.attemptId || sessionStorage.attemptId || "");
		params.set("orgId", mv.orgId || id.orgId || sessionStorage.orgId || "");
		params.set("mockId", mv.mockId || id.assessmentId || sessionStorage.assessmentId || "");
		params.set("candFeedback", payload);
		params.set("langName", langName);
		params.set("langId", langId);

		var url = (window.ExamApi && window.ExamApi.ENDPOINTS.feedback)
			? window.ExamApi.ENDPOINTS.feedback
			: "/IBACC/MockAssessmentAction.do?action=savecandfeedback";
		url += "&timeSpentOnPage=" + encodeURIComponent(window.timeSpentOnPage || 0)
			+ "&timeZone=" + encodeURIComponent(sessionStorage.timeZone || "");

		var fields = {};
		params.forEach(function (value, key) { fields[key] = value; });

		if (window.ExamApi && window.ExamApi.postForm) {
			window.ExamApi.postForm(url, fields, { keepalive: true });
			return;
		}
		try {
			fetch(url, {
				method: "POST",
				headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
				body: params.toString(),
				keepalive: true,
				credentials: "same-origin"
			}).catch(function () {});
		} catch (e) {
			try {
				var xhr = new XMLHttpRequest();
				xhr.open("POST", url, false);
				xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
				xhr.send(params.toString());
			} catch (e2) { /* never break the page */ }
		}
	}

	function install() {
		var original = window.submitFeedback;
		if (typeof original !== "function" || original.__feedbackBridgeWrapped) return false;
		window.submitFeedback = function () {
			try {
				var mv = window.mockVar || {};
				if (Number(mv.storeCandResponse) !== 1) postFeedback();
			} catch (e) { /* ignore */ }
			return original.apply(this, arguments);
		};
		window.submitFeedback.__feedbackBridgeWrapped = true;
		return true;
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", install);
	} else {
		install();
	}
	window.addEventListener("load", install);
	var tries = 0;
	var timer = setInterval(function () {
		install();
		if (++tries > 100) clearInterval(timer);
	}, 200);
})();
