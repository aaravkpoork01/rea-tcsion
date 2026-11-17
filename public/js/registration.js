/* Candidate self-registration for the sign-in page. Vanilla JS, no build step. */
(function () {
  "use strict";

  var overlay = document.getElementById("registrationOverlay");
  if (!overlay) return;

  var formWrap = document.getElementById("registrationFormWrap");
  var form = document.getElementById("registrationForm");
  var foot = document.getElementById("registrationFoot");
  var successPanel = document.getElementById("registrationSuccess");
  var successLogin = document.getElementById("regSuccessLogin");
  var successDeadline = document.getElementById("regSuccessDeadline");
  var errorBox = document.getElementById("registrationError");
  var nameInput = document.getElementById("regName");
  var emailInput = document.getElementById("regEmail");
  var phoneInput = document.getElementById("regPhone");
  var passwordInput = document.getElementById("regPassword");
  var confirmInput = document.getElementById("regConfirm");
  var loginInput = document.getElementById("regLogin");
  var loginNote = document.getElementById("regLoginNote");
  var loginRefresh = document.getElementById("regLoginRefresh");
  var contactNote = document.getElementById("regContactNote");
  var consentInput = document.getElementById("regConsent");
  var submitButton = document.getElementById("regSubmit");
  var photoBox = document.getElementById("regPhotoBox");
  var photoInput = document.getElementById("regPhotoFile");
  var photoPreview = document.getElementById("regPhotoPreview");
  var photoEmpty = document.getElementById("regPhotoEmpty");
  var photoRemove = document.getElementById("regPhotoRemove");
  var photoNote = document.getElementById("regPhotoNote");

  var photo = "";
  var submitting = false;
  var successShown = false;
  var lastLogin = "";
  var lastDeadline = "";
  var loginSeq = 0;
  var loginTimer = null;

  function orgId() {
    try {
      var raw = location.search.replace(/^\?/, "").split("#")[0];
      var first = raw.split("@@")[0] || "";
      return first.replace(/[^A-Za-z0-9_-]/g, "").slice(0, 20) || "726";
    } catch (error) {
      return "726";
    }
  }

  function setNote(node, text, kind) {
    if (!node) return;
    node.textContent = text;
    node.classList.toggle("reg-ok-text", kind === "ok");
    node.classList.toggle("reg-error-text", kind === "error");
  }

  function showError(message) {
    if (!errorBox) return;
    errorBox.textContent = message;
    errorBox.classList.add("reg-show");
    try { errorBox.scrollIntoView({ block: "nearest", behavior: "smooth" }); } catch (error) { /* ignore */ }
  }

  function clearError() {
    if (!errorBox) return;
    errorBox.textContent = "";
    errorBox.classList.remove("reg-show");
  }

  function setPhoto(value) {
    photo = String(value || "");
    if (photo) {
      photoPreview.src = photo;
      photoPreview.classList.remove("reg-hidden");
      photoEmpty.classList.add("reg-hidden");
      photoBox.classList.add("has-photo");
      setNote(photoNote, "Photo ready. Click the photo to change it.", "ok");
    } else {
      photoPreview.removeAttribute("src");
      photoPreview.classList.add("reg-hidden");
      photoEmpty.classList.remove("reg-hidden");
      photoBox.classList.remove("has-photo", "reg-active");
      setNote(photoNote, "Passport-style, clear face", "");
    }
  }

  function compressPhoto(file) {
    return new Promise(function (resolve, reject) {
      if (!file || !/^image\//i.test(file.type)) {
        reject(new Error("Choose a JPG, PNG or WebP image."));
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        reject(new Error("Photo must be under 10 MB."));
        return;
      }
      var reader = new FileReader();
      reader.onerror = function () { reject(new Error("Could not read that image.")); };
      reader.onload = function () {
        var image = new Image();
        image.onerror = function () { reject(new Error("That file is not a valid image.")); };
        image.onload = function () {
          try {
            var max = 640;
            var width = image.naturalWidth || image.width;
            var height = image.naturalHeight || image.height;
            if (!width || !height) throw new Error("That file is not a valid image.");
            var scale = Math.min(1, max / Math.max(width, height));
            width = Math.max(1, Math.round(width * scale));
            height = Math.max(1, Math.round(height * scale));
            var canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            var context = canvas.getContext("2d");
            context.fillStyle = "#ffffff";
            context.fillRect(0, 0, width, height);
            context.drawImage(image, 0, 0, width, height);
            var quality = 0.86;
            var data = canvas.toDataURL("image/jpeg", quality);
            while (data.length > 500000 && quality > 0.4) {
              quality -= 0.08;
              data = canvas.toDataURL("image/jpeg", quality);
            }
            if (data.length > 1900000) {
              reject(new Error("Photo is too large after processing. Choose a smaller image."));
              return;
            }
            resolve(data);
          } catch (error) {
            reject(error instanceof Error ? error : new Error("Could not process that image."));
          }
        };
        image.src = String(reader.result || "");
      };
      reader.readAsDataURL(file);
    });
  }

  function normalisePhone(value) {
    var digits = String(value || "").replace(/\D/g, "");
    if (digits.length === 12 && digits.slice(0, 2) === "91") digits = digits.slice(2);
    if (digits.length === 11 && digits.slice(0, 1) === "0") digits = digits.slice(1);
    return digits;
  }

  function setLoginState(state, message) {
    loginInput.classList.toggle("reg-invalid", state === "invalid");
    loginInput.classList.toggle("reg-valid", state === "valid");
    loginInput.setAttribute("aria-invalid", state === "invalid" ? "true" : "false");
    setNote(loginNote, message, state === "invalid" ? "error" : state === "valid" ? "ok" : "");
  }

  function checkLoginAvailability(strict) {
    var value = loginInput.value.trim();
    var seq = ++loginSeq;
    if (!/^[0-9]{10}$/.test(value)) {
      setLoginState(strict ? "invalid" : "", strict
        ? "Login ID must be exactly 10 digits (numbers only)."
        : "Type your own 10-digit Login ID or refresh to generate one.");
      return Promise.resolve(false);
    }
    setLoginState("", "Checking availability\u2026");
    return fetch("/IBA/api/register/check-login?login=" + encodeURIComponent(value), {
      headers: { Accept: "application/json" },
      credentials: "same-origin",
    }).then(function (response) {
      return response.json().catch(function () { return null; }).then(function (data) {
        if (seq !== loginSeq) return false;
        if (!response.ok || !data || !data.ok || !data.valid) {
          setLoginState("invalid", "Login ID must be exactly 10 digits (numbers only).");
          return false;
        }
        if (!data.available) {
          setLoginState("invalid", "This Login ID is already taken. Refresh to generate another.");
          return false;
        }
        setLoginState("valid", "Login ID is available.");
        return true;
      });
    }).catch(function () {
      if (seq !== loginSeq) return false;
      setLoginState("", "Could not check this Login ID right now.");
      return false;
    });
  }

  function refreshLogin() {
    var seq = ++loginSeq;
    loginRefresh.disabled = true;
    setLoginState("", "Generating a new Login ID\u2026");
    return fetch("/IBA/api/register/login-id", {
      headers: { Accept: "application/json" },
      credentials: "same-origin",
    }).then(function (response) {
      return response.json().catch(function () { return null; }).then(function (data) {
        if (seq !== loginSeq) return false;
        if (!response.ok || !data || !data.ok || !data.login) throw new Error("Could not generate a Login ID.");
        loginInput.value = data.login;
        setLoginState("valid", "New Login ID generated and available.");
        return true;
      });
    }).catch(function () {
      if (seq !== loginSeq) return false;
      setLoginState("invalid", "Could not generate a Login ID. Type your own or try again.");
      return false;
    }).finally(function () {
      loginRefresh.disabled = false;
    });
  }

  function validateContact() {
    var email = emailInput.value.trim();
    var phone = normalisePhone(phoneInput.value);
    if (!email && !phone) {
      setNote(contactNote, "Enter an email address or a 10-digit phone number.", "error");
      emailInput.focus();
      return false;
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(email)) {
      setNote(contactNote, "Enter a valid email address.", "error");
      emailInput.focus();
      return false;
    }
    if (phoneInput.value.trim() && !/^[0-9]{10}$/.test(phone)) {
      setNote(contactNote, "Enter a 10-digit phone number.", "error");
      phoneInput.focus();
      return false;
    }
    setNote(contactNote, "Enter at least one: a valid email address or a 10-digit phone number.", "");
    return true;
  }

  function setSubmitting(value) {
    submitting = value;
    submitButton.disabled = value;
    submitButton.innerHTML = value
      ? '<span class="reg-spinner"></span>Submitting\u2026'
      : "Submit for approval";
  }

  function resetForm() {
    form.reset();
    setPhoto("");
    setLoginState("", "Type your own 10-digit Login ID or refresh to generate one.");
    setNote(contactNote, "Enter at least one: a valid email address or a 10-digit phone number.", "");
    clearError();
    successShown = false;
    lastLogin = "";
    lastDeadline = "";
    successPanel.classList.add("reg-hidden");
    formWrap.classList.remove("reg-hidden");
    foot.classList.remove("reg-hidden");
  }

  function showSuccess(candidate) {
    successShown = true;
    lastLogin = String(candidate.login || "");
    lastDeadline = String(candidate.approvalDeadline || "");
    formWrap.classList.add("reg-hidden");
    foot.classList.add("reg-hidden");
    successPanel.classList.remove("reg-hidden");
    successLogin.textContent = lastLogin || "\u2014";
    var when = "";
    if (lastDeadline) {
      var date = new Date(lastDeadline);
      if (!Number.isNaN(date.getTime())) {
        try {
          when = date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
        } catch (error) {
          when = date.toLocaleString();
        }
      }
    }
    successDeadline.textContent = when ? "Expected decision by " + when + "." : "Approval can take up to 24 hours.";
    overlay.scrollTop = 0;
    var panel = overlay.querySelector(".reg-panel");
    if (panel && panel.scrollIntoView) {
      try { panel.scrollIntoView({ block: "start", behavior: "smooth" }); } catch (error) { /* ignore */ }
    }
  }

  function openRegistration() {
    clearError();
    if (successShown) resetForm();
    overlay.classList.remove("reg-hidden");
    document.documentElement.classList.add("reg-open");
    document.body.classList.add("reg-open");
    if (!loginInput.value.trim()) refreshLogin();
    setTimeout(function () { if (nameInput) nameInput.focus(); }, 60);
  }

  function closeRegistration() {
    overlay.classList.add("reg-hidden");
    document.documentElement.classList.remove("reg-open");
    document.body.classList.remove("reg-open");
    if (successShown && lastLogin) {
      var loginField = document.querySelector("input[name=text15]");
      var passwordField = document.querySelector("input[name=text14]");
      if (loginField) {
        loginField.value = lastLogin;
        if (window.jQuery) window.jQuery(loginField).trigger("input");
      }
      if (passwordField) passwordField.focus();
    }
  }

  window.openRegistration = openRegistration;
  window.closeRegistration = closeRegistration;

  document.getElementById("regClose").addEventListener("click", closeRegistration);
  document.getElementById("regCancel").addEventListener("click", closeRegistration);
  document.getElementById("regSuccessClose").addEventListener("click", closeRegistration);
  overlay.addEventListener("mousedown", function (event) {
    if (event.target === overlay) closeRegistration();
  });
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && !overlay.classList.contains("reg-hidden")) closeRegistration();
  });

  photoBox.addEventListener("click", function (event) {
    if (event.target.closest("#regPhotoRemove")) return;
    photoBox.classList.add("reg-active");
    photoInput.click();
  });
  photoBox.addEventListener("keydown", function (event) {
    if (event.target !== photoBox) return;
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    photoBox.click();
  });
  photoRemove.addEventListener("click", function (event) {
    event.preventDefault();
    event.stopPropagation();
    photoInput.value = "";
    setPhoto("");
  });
  photoInput.addEventListener("change", function () {
    var file = photoInput.files && photoInput.files[0];
    if (!file) return;
    setNote(photoNote, "Processing photo\u2026", "");
    compressPhoto(file).then(function (data) {
      setPhoto(data);
      photoBox.classList.add("reg-active");
    }).catch(function (error) {
      photoInput.value = "";
      setPhoto("");
      setNote(photoNote, error && error.message ? error.message : "Could not process that image.", "error");
    });
  });

  loginInput.addEventListener("input", function () {
    var clean = loginInput.value.replace(/\D+/g, "").slice(0, 10);
    if (clean !== loginInput.value) loginInput.value = clean;
    loginSeq += 1;
    loginInput.classList.remove("reg-invalid", "reg-valid");
    setNote(loginNote, "Type your own 10-digit Login ID or refresh to generate one.", "");
    clearTimeout(loginTimer);
    if (clean.length === 10) {
      loginTimer = setTimeout(function () { checkLoginAvailability(false); }, 350);
    }
  });
  loginInput.addEventListener("blur", function () { checkLoginAvailability(true); });
  loginRefresh.addEventListener("click", function () {
    refreshLogin().then(function () { loginInput.focus(); });
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (submitting) return;
    clearError();

    var name = nameInput.value.trim();
    if (name.length < 2) {
      showError("Enter the candidate's full name.");
      nameInput.focus();
      return;
    }
    if (!photo) {
      showError("Please upload a candidate photo.");
      photoBox.scrollIntoView({ block: "center", behavior: "smooth" });
      return;
    }
    if (!validateContact()) {
      showError("Check your email or phone number.");
      return;
    }
    if (passwordInput.value.length < 6) {
      showError("Password must be at least 6 characters.");
      passwordInput.focus();
      return;
    }
    if (passwordInput.value !== confirmInput.value) {
      showError("Passwords do not match.");
      confirmInput.focus();
      return;
    }
    if (!/^[0-9]{10}$/.test(loginInput.value.trim())) {
      showError("Login ID must be exactly 10 digits (numbers only).");
      loginInput.focus();
      return;
    }
    if (!consentInput.checked) {
      showError("Please confirm that your details and photograph are correct.");
      consentInput.focus();
      return;
    }

    setSubmitting(true);
    checkLoginAvailability(true).then(function (available) {
      if (!available) {
        if (loginInput.classList.contains("reg-invalid")) {
          showError(loginNote.textContent || "This Login ID is not available.");
        } else {
          showError("Could not check this Login ID. Try again.");
        }
        loginInput.focus();
        return null;
      }
      return fetch("/IBA/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          name: name,
          email: emailInput.value.trim(),
          phone: normalisePhone(phoneInput.value),
          password: passwordInput.value,
          login: loginInput.value.trim(),
          photo: photo,
          orgId: orgId(),
        }),
      }).then(function (response) {
        return response.json().catch(function () { return null; }).then(function (data) {
          if (!response.ok || !data || !data.ok) {
            var message = data && data.error ? data.error : "Registration failed. Please try again.";
            if (data && data.code === "conflict" && /login id/i.test(message)) {
              setLoginState("invalid", message);
            }
            throw new Error(message);
          }
          return data;
        });
      });
    }).then(function (data) {
      if (data) showSuccess(data.candidate || {});
    }).catch(function (error) {
      showError(error && error.message ? error.message : "Unable to reach the registration server.");
    }).finally(function () {
      setSubmitting(false);
    });
  });

  if (location.hash.toLowerCase() === "#register" || /(?:^|[?&])register=1(?:&|$)/.test(location.search)) {
    setTimeout(openRegistration, 120);
  }
  window.addEventListener("hashchange", function () {
    if (location.hash.toLowerCase() === "#register") openRegistration();
  });
})();
