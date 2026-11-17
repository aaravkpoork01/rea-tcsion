// Public landing page: applies admin-managed copy, logo and sign-in links.
(function () {
  var header = document.getElementById("siteHeader");
  var onScroll = function () { if (header) header.classList.toggle("scrolled", window.scrollY > 8); };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  function setLinks(landing) {
    var orgId = landing.orgId || "726";
    var assessmentId = landing.assessmentId || "";
    var base = "index.html?" + orgId + (assessmentId ? "@@" + assessmentId : "");
    document.querySelectorAll("[data-login-link]").forEach(function (node) {
      node.setAttribute("href", base);
    });
    document.querySelectorAll("[data-register-link]").forEach(function (node) {
      node.setAttribute("href", base + "#register");
    });
  }

  function apply(landing) {
    if (!landing || typeof landing !== "object") return;
    document.querySelectorAll("[data-landing]").forEach(function (node) {
      var value = landing[node.getAttribute("data-landing")];
      if (value !== undefined && value !== null && String(value) !== "") {
        node.textContent = String(value);
      }
    });

    var title = landing.pageTitle || landing.brandName;
    if (title) document.title = title;
    var description = document.querySelector('meta[name="description"]');
    if (description && landing.metaDescription) description.setAttribute("content", landing.metaDescription);

    var logo = landing.logo || "images/collegelogo.png";
    var custom = /^data:image\//i.test(logo);
    document.querySelectorAll("[data-landing-logo]").forEach(function (img) {
      img.setAttribute("src", logo);
      img.setAttribute("alt", landing.brandName ? landing.brandName + " logo" : "");
      img.classList.toggle("is-custom", custom);
    });

    setLinks(landing);
  }

  function goToRegister() {
    if (location.hash !== "#register") return;
    var link = document.querySelector("[data-register-link]");
    if (link) location.replace(link.href);
  }

  fetch("/IBA/api/landing")
    .then(function (res) { return res.ok ? res.json() : null; })
    .then(function (data) { if (data && data.landing) apply(data.landing); })
    .catch(function () { /* keep the built-in copy */ })
    .then(goToRegister);

  if (!("IntersectionObserver" in window)) {
    document.querySelectorAll(".reveal").forEach(function (node) { node.classList.add("shown"); });
    return;
  }
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("shown");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.14 });
  document.querySelectorAll(".reveal").forEach(function (node) { observer.observe(node); });
})();
