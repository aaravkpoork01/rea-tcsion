// Result pages: follow the admin-managed brand used by the public landing page.
// The static markup already shows the built-in Exam Intelligence brand; this
// script refreshes the name, logo and footer once the landing config arrives.
(function () {
  "use strict";

  var fallbackName = "Exam Intelligence";
  var fallbackSubtitle = "Assessment Platform";

  function setText(selector, value) {
    if (!value) return;
    document.querySelectorAll(selector).forEach(function (node) {
      node.textContent = String(value);
    });
  }

  function apply(landing) {
    if (!landing || typeof landing !== "object") return;
    var name = landing.brandName || fallbackName;
    var subtitle = landing.brandSubtitle || fallbackSubtitle;

    setText("[data-brand-name]", name);
    setText("[data-brand-subtitle]", subtitle);
    setText("[data-brand-footer]", name + " " + subtitle);

    if (document.title) {
      document.title = document.title.replace(/TCS iON/g, name);
    }

    var logo = landing.logo;
    if (logo) {
      document.querySelectorAll("[data-brand-logo]").forEach(function (img) {
        img.setAttribute("src", logo);
        img.setAttribute("alt", name + " logo");
      });
    }
  }

  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  fetch("/IBA/api/landing")
    .then(function (res) { return res.ok ? res.json() : null; })
    .then(function (data) { if (data && data.landing) apply(data.landing); })
    .catch(function () { /* keep the built-in brand */ });
})();
