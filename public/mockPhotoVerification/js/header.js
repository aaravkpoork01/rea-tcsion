$(document).ready(function () {
  const pageTitle = document
    .getElementById("header-mashup")
    .getAttribute("data-page-title");

  setTimeout(() => {
    document.getElementById("page-title").textContent = pageTitle;
  }, 100);

  var headerMashup = `<header class="headerWrapper">
            <h1 class="primary-title" id="page-title" role="heading" aria-level="1"></h1>
            <div class="header-links">
                <button class="header-buttons accessibility" tabindex="0" role="button"
                    data-target="accessibilityContDiv" aria-label="Accessibility" data-bs-toggle="tooltip"
                    data-bs-placement="bottom" data-bs-title="Accessibility"></button>
                <!-- <button class="header-buttons lang-div" tabindex="0" data-target="headerLangDrp1" role="combobox" data-bs-toggle="tooltip" data-bs-placement="bottom" data-bs-title="Language" aria-controls='headerLangDrp1' aria-label='Language Selection'>
                    <i class="language-icon"></i>
                    <span id="idsel" class="selectLang" title="Application Language English">English</span>
                </button> -->
                <button class="header-buttons hdr_lan" data-target="appLangDropdwn2" data-bs-toggle="tooltip"
                    data-bs-placement="bottom" data-bs-original-title="Language" aria-label="Click to choose language"
                    role="combobox" aria-expanded="false" aria-controls="appLangDropdwn2">
                    <i class="language-icon"></i>
                    <span class="lang_name Desk">English</span>
                </button>
                <div class="profile-section" style="display :none;">
                    <button class="header-buttons user-info-icon" data-target="profileDetailDropdown" role="button" tabindex="0"
                        aria-label="User Information"></button>
                    <div class="profile-image matched" tabindex="0" role="button" data-bs-toggle="tooltip"
                        data-bs-original-title="Matched in photo / biometrics" data-bs-placement="bottom">
                        <span class="image-diff" aria-hidden="true"><i aria-hidden="true"></i></span>
                        <div class="application-image registration-image">
                            <img src="./images/photoCapture/user-mob-img.png" alt="application profile picture">
                        </div>
                        <div class="application-image qrCode-image">
                            <img src="./images/photoCapture/qr_code.png" alt="application profile picture">
                        </div>
                    </div>
                    <div class="profile-details" title="Steve Harvey Hayden">Steve Harvey Hayden</div>
                </div>
            </div>
        </header>
        <div class="mobile-backdrop" id="mobile-backdrop"></div>
        <div class="accessibilityContDiv floating" id="accessibilityContDiv">
            <button type="button" class="closeModal" aria-label="close" data-bs-toggle="tooltip"
                data-bs-original-title="Close"></button>
            <h2 class="font21" role="heading" tabindex="0" aria-level="1">Accessibility Adjustments</h2>
            <div class="accessibilityDarkColorPalette">
                <div class="darkColorPaletteLft highContrastToggle">
                    <span class="accessHeading1">Switch to</span>
                    <span class="accessHeading2 changeThemeMode">Dark Mode</span>

                    <div class="switchToDivBlk lightModeOn">
                        <span class="lightIconSwitch selectedMode" tabindex="0" role="button"
                            aria-label="click to view light theme mode"><em></em></span>
                        <span class="drakIconSwitch" tabindex="0" role="button"
                            aria-label="click to view dark theme mode"><em></em></span>
                    </div>
                </div>
                <div class="accessibilityFontResize">
                    <div class="accessibilityFontSizeLft">
                        <span class="accessHeading1">Select</span>
                        <span class="accessHeading2">Font Size</span>
                    </div>
                    <div class="accessibilityFontSizeRft">
                        <em data-value="fontsize_opt1"
                            class="font16Px emNormal fontResizeEm activiteClass multi_font_icon defaultFontSize"
                            tabindex="0" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Small"
                            role="button" aria-label="default font size" data-bs-toggle="tooltip"
                            data-bs-placement="top" title="Small"><b>A</b></em>
                        <em data-value="fontsize_opt2" class="font18Px emNormal fontResizeEm multi_font_icon"
                            tabindex="0" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Medium"
                            role="button" aria-label="Medium" data-bs-toggle="tooltip" data-bs-placement="top"
                            title="Medium"><b>A</b></em>
                        <em data-value="fontsize_opt3" class="font24Px emNormal fontResizeEm multi_font_icon"
                            tabindex="0" role="button" aria-label="Large" data-bs-toggle="tooltip"
                            data-bs-placement="top" data-bs-title="Large" data-bs-toggle="tooltip"
                            data-bs-placement="top" title="Large"><b>A</b></em>
                        </span>
                        <span class="clear"></span>
                    </div>
                    <div class="clear"></div>
                </div>
                <div class="clear"></div>
            </div>
            <div class="accessibilityCursorTrailResize">
                <div class="cursorTrailResizeLft cursorTrailDisable">
                    <span class="accessHeading1 changeNameDisable">Enable</span>
                    <span class="accessHeading2">Cursor Trail</span>
                    <div class="trailBlockElement " tabindex="0" role="button"
                        aria-label="click to change cursor trail">
                        <em></em>
                    </div>
                </div>
                <div class="cursorTrailResizeRft">
                    <span class="accessHeading1">Choose</span>
                    <span class="accessHeading2">Cursor Size</span>
                    <div class="cursorTrailDiv">
                        <span class="mouseResizeEm activiteClass" data-value="Cursor1" tabindex="0" role="button"
                            aria-label="click to select default cursor mode"><em class="resizeCursor1"></em></span>
                        <span class="mouseResizeEm" data-value="Cursor2" tabindex="0" role="button"
                            aria-label="click to select large white cursor mode"><em class="resizeCursor2"></em></span>
                        <span class="mouseResizeEm" data-value="Cursor3" tabindex="0" role="button"
                            aria-label="click to select large black cursor mode"><em class="resizeCursor3"></em></span>
                    </div>
                </div>
                <div class="clear"></div>
            </div>
            <div class="clear"></div>
            <button class="resetButton" tabindex="0" role="button" data-bs-toggle="tooltip" data-bs-placement="top"
                data-bs-title="Reset">Reset to
                Default</button>
        </div>
        <div class="langdropdown floating" id="appLangDropdwn2">
            <div class="floating-header mobile-only">
                <p class="floating-heading">Choose preferred language</p>
                <button class="close-floating close-langdropdown" aria-label="Close" tabindex="0" role="button"
                    data-bs-toggle="tooltip" data-bs-original-title="Close"></button>
            </div>
            <div class="listmenu">
                <!-- <input type="text" id="searchinput" class="formInput" aria-label="Search language" placeholder="Search"> -->
                <ul class="dropdown" aria-label="System language" role="listbox">
                    <li tabindex="0" role="option" class="langselected active" aria-selected="true"><span class="eng_lang"
                            href="javascript:void(0)">English</span>
                        <span class="org_lang"> English </span>
                    </li>
                    <li tabindex="0" role="option" aria-selected="false">
                        <span class="eng_lang" href="javascript:void(0)">Spanish</span>
                        <span class="org_lang"> Español </span>
                    </li>
                    <li tabindex="0" role="option" aria-selected="false">
                        <span class="eng_lang" href="javascript:void(0)">German</span>
                        <span class="org_lang"> Deutsche </span>
                    </li>
                    <li tabindex="0" role="option" aria-selected="false">
                        <span class="eng_lang" href="javascript:void(0)">Hindi</span>
                        <span class="org_lang"> हिन्दी </span>
                    </li>
                    <li tabindex="0" role="option" aria-selected="false">
                        <span class="eng_lang" href="javascript:void(0)">Punjabi</span>
                        <span class="org_lang">ਪੰਜਾਬੀ </span>
                    </li>
                    <li tabindex="0" role="option" aria-selected="false">
                        <span class="eng_lang" href="javascript:void(0)">Marathi</span>
                        <span class="org_lang"> मराठी </span>
                    </li>
                </ul>
            </div>
        </div>
        <!-- profile dropdown -->
        <div class="profile-detail-dropdown-wrapper floating modalPopup" id="profileDetailDropdown">
            <div class="profile-detail-dropdown">
                <div class="profile-detail-dropdown-head">
                    <h4 class="profile-detail-dropdown-title">Profile Details</h4>
                    <button type="button" class="close-profile-detail-dropdown" aria-label="close"></button>
                </div>
                <div class="profile-detail-dropdown-body">
                    <div class="profile-detail-dropdown-img-wrap greenBorder">
                        <span class="image-diff" aria-hidden="true"><i aria-hidden="true"></i></span>
                        <div class="user-profile-img">
                            <img src="./images/photoCapture/user-mob-img.png" alt="" />
                        </div>
                        <div class="user-profile-qr">
                            <img src="./images/photoCapture/big-qr.png" alt="" />
                        </div>
                    </div>
                    <div class="user-profile-description">
                        <div class="user-profile-description-row">
                            <h5 class="user-profile-description-title">Candidate Name:</h5>
                            <p class="user-profile-text">Steve Harvey Hayden</p>
                        </div>
                        <div class="user-profile-description-row">
                            <h5 class="user-profile-description-title">Applicant ID:</h5>
                            <p class="user-profile-text">Applicant507043</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- profile dropdown -->`;

  var includeHeader = true;
  if (includeHeader) {
    $("#header-mashup").html(headerMashup);
  }

  const header = document.getElementById("header-mashup");
  var headerHT = header.offsetHeight;
  const headerButtons = document.querySelectorAll(".header-buttons");
  const mobileBackdrop = document.getElementById("mobile-backdrop");

  headerButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.dataset.target;
      const floatingDiv = document.getElementById(target);
      const isMobile = window.innerWidth < 768;

      if (floatingDiv.classList.contains("show")) {
        button.classList.remove("active");
        floatingDiv.style.display = "none";
        floatingDiv.classList.remove("show");
      } else {
        document.querySelectorAll(".floating").forEach((fl) => {
          fl.style.display = "none";
          fl.classList.remove("show");
        });

        document.querySelectorAll(".header-buttons").forEach((hb) => {
          hb.classList.remove("active");
        });
        button.classList.add("active");
        floatingDiv.style.display = "block";
        floatingDiv.classList.add("show");
      }

      if (isMobile) {
        floatingDiv.style.left = 0;
        // Slide up with bottom with backdrop
        if (floatingDiv.classList.contains("show")) {
          mobileBackdrop.style.display = "block";
          mobileBackdrop.style.top = `${headerHT}px`;
        } else {
          mobileBackdrop.style.display = "none";
        }
        if (button.classList.contains("user-info-icon")) {
          mobileBackdrop.style.display = "none";
          floatingDiv.style.top = `${headerHT}px`;
        }
      } else {
        // position below button
        const rect = button.getBoundingClientRect();
        floatingDiv.style.left = `${
          rect.left + rect.width/4 + window.scrollX
        }px`;
        // floatingDiv.style.display =
        //   floatingDiv.style.display === "block" ? "none" : "block";
      }
    });
  });

  // Hide mobile panel when click on backdrop
  mobileBackdrop.addEventListener("click", () => {
    document.querySelectorAll(".floating").forEach((fl) => {
      fl.classList.remove("show");
      fl.style.display = "none";
    });
    document.querySelectorAll(".header-buttons").forEach((hb) => {
      hb.classList.remove("active");
    });
    mobileBackdrop.style.display = "none";
  });

  // adjust desktop floating div on resize
  window.addEventListener("resize", () => {
    const isMobile = window.innerWidth < 768;
    document.querySelectorAll(".floating").forEach((fl) => {
      if (!isMobile && fl.style.display === "block") {
        const button = document.querySelector(
          `.header-buttons[data-target="${fl.id}"]`
        );
        const rect = button.getBoundingClientRect();
        fl.style.left = `${rect.left + rect.width / 2 + window.scrollX}px`;
        mobileBackdrop.style.display = "none";
      } else if (isMobile && fl.style.display === "block") {
        mobileBackdrop.style.display = "block";
        mobileBackdrop.style.top = `${headerHT}px`;
        fl.style.left = 0;
        const button = document.querySelector(
          `.header-buttons[data-target="${fl.id}"]`
        );
        if (button.classList.contains("user-info-icon")) {
          mobileBackdrop.style.display = "none";
        }
      }
    });
  });

  document.addEventListener("click", function (eve) {
    if (
      !eve.target.closest(".header-buttons") &&
      !eve.target.closest(".floating") &&
      !eve.target.closest(".profile-section")
    ) {
      document.querySelectorAll(".floating").forEach((fl) => {
        fl.style.display = "none";
        fl.classList.remove("show");
      });
      document.querySelectorAll(".header-buttons").forEach((hb) => {
        hb.classList.remove("active");
      });
      mobileBackdrop.style.display = "none";
    }
  });

  /* Accesibility */
  // $(".accessibilityContDiv").hide();
  $(".accessibility").removeClass("active");
  var btn11 = document.getElementsByClassName(
    "header-buttons accessibility"
  )[0];
  btn11.onclick = function () {};

  $(document).bind("click touchstart", function (e) {
    if (!$(e.target).parents().children().hasClass("accessibilityContDiv")) {
      $(".accessibilityContDiv").hide();
      $(".accessibility").removeClass("active");
    }
  });
  $(document).on(
    "click keydown",
    ".accessibilityContDiv .closeModal",
    function (e) {
      if (e.type === "click" || e.key === "Enter") {
        $(".header-buttons.accessibility").removeClass("active");
        $(".accessibilityContDiv").removeClass("show").hide();
        $("#mobile-backdrop").hide();
      }
    }
  );

  /* Accessibility tab function */

  $(document).on("keydown", ".multi_font_icon", function (e) {
    if (e.key === "Enter") {
      var id = $(this).attr("data-value");
      $(".multi_font_icon").removeClass("activiteClass");
      $(".multi-fontszie").removeClass("fontSize1 fontSize2 fontSize3");
      $("body").addClass("restFontActive");
      $(".resetButton").css("display", "block");
      switch (id) {
        case "fontsize_opt1":
          $("html, body").css("font-size", "16px");
          $(this).addClass("activiteClass");
          $("body").removeClass("restFontActive");
          $(".resetButton").css("display", "none");
          break;

        case "fontsize_opt2":
          $("html, body").css("font-size", "17px");
          $(this).addClass("activiteClass");
          break;

        case "fontsize_opt3":
          $("html, body").css("font-size", "18px");
          $(this).addClass("activiteClass");
      }
      setTimeout(() => {
        $(".innerTabsDeatilsUl li button.tabsInlineActive").each(function () {
          var position = $(this).position();
          var width = $(this).outerWidth();
          var height = $(this).outerHeight();
          $(this).closest(".innerTabsDeatilsUl").find(".TabsMoveSmooth").css({
            left: +position.left,
            width: width,
            top: +position.top,
            height: height,
          });
        });
      }, 500);
    }
  });

  /* Darkmode */
  $(".lightIconSwitch").on("click", function () {
    $(".lightIconSwitch").addClass("selectedMode");
    $(".lightIconSwitch").attr("aria-pressed", "true");
    $(".drakIconSwitch").removeClass("selectedMode");
    $(".drakIconSwitch").attr("aria-pressed", "false");
    $(".changeThemeMode").html("Dark Mode");
    $("body").removeClass("darkThemeParent");
    $("body").removeClass("dark-theme");
    $(".resetButton").css("display", "none");
    // change code editor theme
    if ($("body").hasClass("home-page")) {
      editorOne.setTheme("ace/theme/github");
      const splitEditors = CodeEdit.map((editor) => editor.split(","));
      for (let i = 0; i < splitEditors.length; i++) {
        if (CodeEdit[i]) {
          ace.edit(CodeEdit[i]).setTheme("ace/theme/github");
        }
      }
    }
  });
  $(".drakIconSwitch").on("click", function () {
    $(".lightIconSwitch").removeClass("selectedMode");
    $(".lightIconSwitch").attr("aria-pressed", "false");
    $(".drakIconSwitch").attr("aria-pressed", "true");
    $(".drakIconSwitch").addClass("selectedMode");
    $(".changeThemeMode").html("Light Mode");
    $("body").addClass("darkThemeParent");
    $("body").addClass("dark-theme");
    $(".resetButton").css("display", "block");
    // change code editor theme
    if ($("body").hasClass("home-page")) {
      editorOne.setTheme("ace/theme/monokai");
      const splitEditors = CodeEdit.map((editor) => editor.split(","));
      for (let i = 0; i < splitEditors.length; i++) {
        if (CodeEdit[i]) {
          ace.edit(CodeEdit[i]).setTheme("ace/theme/monokai");
        }
      }
    }
  });
  $(".lightIconSwitch").on("keydown", function (e) {
    if (e.key === "Enter") {
      $(".lightIconSwitch").addClass("selectedMode");
      $(".lightIconSwitch").attr("aria-pressed", "true");
      $(".drakIconSwitch").removeClass("selectedMode");
      $(".drakIconSwitch").attr("aria-pressed", "false");
      $(".resetButton").css("display", "none");
      $("body").removeClass("darkThemeParent");
    }
  });
  $(".drakIconSwitch").on("keydown", function (e) {
    if (e.key === "Enter") {
      $(".lightIconSwitch").removeClass("selectedMode");
      $(".lightIconSwitch").attr("aria-pressed", "false");
      $(".drakIconSwitch").addClass("selectedMode");
      $(".drakIconSwitch").attr("aria-pressed", "true");
      $(".resetButton").css("display", "block");
      $("body").addClass("darkThemeParent");
    }
  });
  /* Cursor */
  $(".cursorTrailDiv .mouseResizeEm").on("click", function () {
	    var CursorSeleted = $(this).attr("data-value");
	    var elementToChange = document.getElementsByTagName("html")[0];
	    $(".cursorTrailDiv .mouseResizeEm").removeClass("activiteClass");
	    $(this).addClass("activiteClass");
	    $("body").addClass("restCursorChgActive");
	    
	    $(".resetButton").css("display", "block");
	    switch (CursorSeleted) {
	      case "Cursor1":
	        elementToChange.style.cursor = "url('images/cursor1.png'), auto";
	        $("body").removeClass("restCursorChgActive");
	        $(".resetButton").css("display", "none");
	        $("body").removeClass("CursorHand2 CursorHand3");
	        $("body").addClass("CursorHand1");
	        break;
	      case "Cursor2":
	        elementToChange.style.cursor = "url('images/cursor3.png'), auto";
	        $("body").removeClass("CursorHand1 CursorHand3");
	        $("body").addClass("CursorHand2");
	        break;
	      case "Cursor3":
	        elementToChange.style.cursor = "url('images/cursor2.png'), auto";
	        	$("body").removeClass("CursorHand1 CursorHand2");
	            $("body").addClass("CursorHand3");  
	        break;
	    }
	  });
  $(".cursorTrailDiv .mouseResizeEm").on("keydown", function (e) {
    if (e.key === "Enter") {
      var CursorSeleted = $(this).attr("data-value");
      var elementToChange = document.getElementsByTagName("html")[0];
      $(".cursorTrailDiv .mouseResizeEm").removeClass("activiteClass");
      $(this).addClass("activiteClass");
      $(".resetButton").css("display", "block");
      $("body").addClass("restCursorChgActive");
      switch (CursorSeleted) {
        case "Cursor1":
          elementToChange.style.cursor = "url('images/cursor1.png'), auto";
          $("body").removeClass("restCursorChgActive");
          $(".resetButton").css("display", "none");
          break;
        case "Cursor2":
          elementToChange.style.cursor = "url('images/cursor3.png'), auto";
          break;
        case "Cursor3":
          elementToChange.style.cursor = "url('images/cursor2.png'), auto";
          break;
      }
    }
  });

  $(".trailBlockElement").on("keydown", function (e) {
    if (e.key === "Enter") {
      var elementToChange = document.getElementsByTagName("html")[0];
      if (
        $(this).closest(".cursorTrailResizeLft").hasClass("cursorTrailDisable")
      ) {
        $(".accessabilityTrailCls").css("display", "block");
        $(".cursorTrailResizeLft").find(".changeNameDisable").html("Disable");
        $(this).addClass("selectedTrail");
        $(this)
          .closest(".cursorTrailResizeLft")
          .removeClass("cursorTrailDisable");
        $("body").addClass("restTrailActive");
        elementToChange.style.cursor = "url('images/cursorTrail.png'), auto";
        $(".accessabilityTrailCls").css("display", "block");
      } else {
        elementToChange.style.cursor = "url('images/cursor1.png'), auto";
        $(".accessabilityTrailCls").css("display", "none");
        $(".cursorTrailResizeLft").find(".changeNameDisable").html("Enable");
        $(this).removeClass("selectedTrail");
        $(this).closest(".cursorTrailResizeLft").addClass("cursorTrailDisable");
        $("body").removeClass("restTrailActive");
        $(".cursorTrailResizeLft").addClass("cursorTrailDisable");
        $(".accessabilityTrailCls").css("display", "none");
        $(".accessabilityTrailCls").css("display", "none");
      }
    }
  });

  $(".trailBlockElement").on("click", function () {
    var elementToChange = document.getElementsByTagName("html")[0];
    if (
      $(this).closest(".cursorTrailResizeLft").hasClass("cursorTrailDisable")
    ) {
      $(".accessabilityTrailCls").css("display", "block");
      $(".cursorTrailResizeLft").find(".changeNameDisable").html("Disable");
      $(this).addClass("selectedTrail");
      $(this)
        .closest(".cursorTrailResizeLft")
        .removeClass("cursorTrailDisable");
      $("body").addClass("restTrailActive");
      elementToChange.style.cursor = "url('images/cursorTrail.png'), auto";
      $(".resetButton").css("display", "block");
    } else {
      elementToChange.style.cursor = "url('images/cursor1.png'), auto";
      $(".accessabilityTrailCls").css("display", "none");
      $(".cursorTrailResizeLft").find(".changeNameDisable").html("Enable");
      $(this).removeClass("selectedTrail");
      $(this).closest(".cursorTrailResizeLft").addClass("cursorTrailDisable");
      $("body").removeClass("restTrailActive");
      $(".cursorTrailResizeLft").addClass("cursorTrailDisable");
      $(".accessabilityTrailCls").css("display", "none");
      $(".resetButton").css("display", "none");
    }
  });

  $(document).on("click", ".multi_font_icon", function () {
    var id = $(this).attr("data-value");
    $(".multi_font_icon").removeClass("activiteClass");
    $(".multi-fontszie").removeClass("fontSize1 fontSize2 fontSize3");
    $(".resetButton").css("display", "block");
    $("body").addClass("restFontActive");
    switch (id) {
      case "fontsize_opt1":
        $("html, body").css("font-size", "16px");
        $(this).addClass("activiteClass");
        $("body").removeClass("restFontActive");
        $(".resetButton").css("display", "none");
        break;

      case "fontsize_opt2":
        $("html, body").css("font-size", "17px");
        $(this).addClass("activiteClass");
        break;

      case "fontsize_opt3":
        $("html, body").css("font-size", "18px");
        $(this).addClass("activiteClass");
    }
    setTimeout(() => {
      $(".innerTabsDeatilsUl li button.tabsInlineActive").each(function () {
        var position = $(this).position();
        var width = $(this).outerWidth();
        var height = $(this).outerHeight();
        $(this).closest(".innerTabsDeatilsUl").find(".TabsMoveSmooth").css({
          left: +position.left,
          width: width,
          top: +position.top,
          height: height,
        });
      });
    }, 500);
  });

  $(document).on("keydown", ".multi_font_icon", function (e) {
    if (e.key === "Enter") {
      var id = $(this).attr("data-value");
      $(".multi_font_icon").removeClass("activiteClass");
      $(".multi-fontszie").removeClass("fontSize1 fontSize2 fontSize3");
      $("body").addClass("restFontActive");
      $(".resetButton").css("display", "block");
      switch (id) {
        case "fontsize_opt1":
          $("html, body").css("font-size", "16px");
          $(this).addClass("activiteClass");
          $("body").removeClass("restFontActive");
          $(".resetButton").css("display", "none");
          break;

        case "fontsize_opt2":
          $("html, body").css("font-size", "17px");
          $(this).addClass("activiteClass");
          break;

        case "fontsize_opt3":
          $("html, body").css("font-size", "18px");
          $(this).addClass("activiteClass");
      }
      setTimeout(() => {
        $(".innerTabsDeatilsUl li button.tabsInlineActive").each(function () {
          var position = $(this).position();
          var width = $(this).outerWidth();
          var height = $(this).outerHeight();
          $(this).closest(".innerTabsDeatilsUl").find(".TabsMoveSmooth").css({
            left: +position.left,
            width: width,
            top: +position.top,
            height: height,
          });
        });
      }, 500);
    }
  });

  //   Reset Button JS start
  $(".resetButton").on("click", function () {
    /** font resize */
    $(".multi_font_icon").removeClass("activiteClass");
    $(".multi-fontszie").removeClass("fontSize1 fontSize2 fontSize3");
    $(".multi-fontszie, html").css({ "font-size": "16px" });
    $(".multi-fontszie").addClass("fontSize1");
    $(".defaultFontSize").addClass("activiteClass");
    $("body").removeClass(
      "restPaletteActive restFontActive restCursorChgActive restTrailActive restColorModeActive"
    );
    /*** theme Mode */
    $("body").removeClass("darkThemeParent");
    $(".changeThemeMode").html("Dark Mode");
    $(".highContrastToggle").find(".switchToDivBlk").addClass("lightModeOn");
    $(".highContrastToggle")
      .find(".switchToDivBlk span")
      .removeClass("selectedMode");
    $(".highContrastToggle")
      .find(".switchToDivBlk .lightIconSwitch")
      .addClass("selectedMode");
    $(".highContrastToggle")
      .find(".switchToDivBlk .lightIconSwitch")
      .attr("aria-pressed", "true");
    $(".highContrastToggle")
      .find(".switchToDivBlk .drakIconSwitch")
      .attr("aria-pressed", "false");
    /*********** Mouse trail ******/
    $(".cursorTrailResizeLft").find(".changeNameDisable").html("Enable");
    $(".selectedTrail").removeClass("selectedTrail");
    $(".cursorTrailResizeLft").addClass("cursorTrailDisable");
    $(".accessabilityTrailCls").css("display", "none");
    /******** palette *********/
    $(".activePaletteTickMark").removeClass("activePaletteTickMark");
    $(".colorPaletteUl li").eq(0).click();
    /******* mouse resize  **********/
    $(".cursorTrailDiv .mouseResizeEm").removeClass("activiteClass");
    $(".cursorTrailDiv .mouseResizeEm").eq(0).click();
    $(".resetButton").css("display", "none");
  });

  $(".resetButton").on("keydown", function (e) {
    if (e.key === "Enter") {
      /** font resize */
      $(".multi_font_icon").removeClass("activiteClass");
      /*      $('.multi-fontszie').removeClass('fontSize1 fontSize2 fontSize3'); */
      $("html, body").css("font-size", "18px");
      $(".multi-fontszie").addClass("fontSize1");
      $(".defaultFontSize").addClass("activiteClass");
      $("body").removeClass(
        "restPaletteActive restFontActive restCursorChgActive restTrailActive restColorModeActive"
      );
      /*** theme Mode */
      $("body").removeClass("darkThemeParent");
      $(".changeThemeMode").html("Dark Mode");
      $(".highContrastToggle").find(".switchToDivBlk").addClass("lightModeOn");
      $(".highContrastToggle")
        .find(".switchToDivBlk span")
        .removeClass("selectedMode");
      $(".highContrastToggle")
        .find(".switchToDivBlk .lightIconSwitch")
        .addClass("selectedMode");
      $(".highContrastToggle")
        .find(".switchToDivBlk .lightIconSwitch")
        .attr("aria-pressed", "true");
      $(".highContrastToggle")
        .find(".switchToDivBlk .drakIconSwitch")
        .attr("aria-pressed", "false");
      /*********** Mouse trail ******/
      $(".cursorTrailResizeLft").find(".changeNameDisable").html("Enable");
      $(".selectedTrail").removeClass("selectedTrail");
      $(".cursorTrailResizeLft").addClass("cursorTrailDisable");
      $(".accessabilityTrailCls").css("display", "none");
      /******** palette *********/
      $(".activePaletteTickMark").removeClass("activePaletteTickMark");
      $(".colorPaletteUl li").eq(0).click();
      /******* mouse resize  **********/
      $(".cursorTrailDiv .mouseResizeEm").removeClass("activiteClass");
      $(".cursorTrailDiv .mouseResizeEm").eq(0).click();
    }
  });
  // Reset Button JS end

  $(document).on("click keydown", ".close-langdropdown", function (e) {
    if (e.type === "click" || e.key === "Enter") {
      $("#mobile-backdrop").hide();
      $(this).parents(".langdropdown").removeClass("show").hide();
      $(".header-buttons.hdr_lan").removeClass("active");
    }
  });

  $(document).on("click keydown", ".langdropdown ul li", function (e) {
    if (e.type === "click" || e.key === "Enter") {
      $(".langdropdown ul li").attr("aria-selected", "false");
      $(".langdropdown ul li").removeClass("active");
      $(this).attr("aria-selected", "true");
      $(this).addClass("active");
      var langText = $(this).find(".eng_lang").text();
      $(".header-buttons.hdr_lan")
        .find(".lang_name")
        .attr("title", langText)
        .text(langText);
      if ($(window).width() < 768) {
        $("#mobile-backdrop").hide();
      }
      $(this).parents(".langdropdown").removeClass("show").hide();
      $(".header-buttons.hdr_lan").removeClass("active");
    }
  });

  // ----- open / close profile-section  dropdown js  ----- //
  $(".profile-image, .profile-details").on("click keydown", function (e) {
    if (e.type === "click" || e.key === "Enter") {
      $(".profile-detail-dropdown-wrapper").addClass("show").show();
      var headHt = $("#header-mashup").height();
      $(".profile-detail-dropdown-wrapper").css("top", headHt);
      $(".accessibilityContDiv, .langdropdown").hide();
      $(".header-buttons").removeClass("active");
      $(this).parents(".profile-section").addClass("open");
      $(this)
        .parents(".profile-section")
        .find(".header-buttons")
        .addClass("active");
    }
  });
  $(".close-profile-detail-dropdown").on("click keydown", function (e) {
    if (e.key === "click" || e.key === "Enter" ) {
      $("#mobile-backdrop").hide();
      $(".profile-detail-dropdown-wrapper").removeClass("show").hide();
      $(".header-buttons").removeClass("active");
      $(".profile-section").removeClass("open");
    }
  });
  $(document).on('keyup', function(e) {
    if (e.key == "Escape") {
        $("#mobile-backdrop").hide();
        $(".profile-detail-dropdown-wrapper").removeClass("show").hide();
        $(".header-buttons").removeClass("active");
        $(".profile-section").removeClass("open");
    }
  });
  $(".profile-detail-dropdown-wrapper").on("click", function () {
    $(this).removeClass("show").hide();
    $("#mobile-backdrop").hide();
    $(".header-buttons").removeClass("active");
    $(".profile-section").removeClass("open");
  });
  // ----- open / close profile-section  dropdown js end  ----- //

  // close tooltip on click
  document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach((element) => {
    element.addEventListener("click", function () {
      const tooltipInstance = bootstrap.Tooltip.getInstance(this);
      if (tooltipInstance) {
        tooltipInstance.hide();
      }
    });
  });
   //stop cursor move out the popup
  $(document).on("keydown", ".modalPopup, .modal  ", function (e) {
    var elemId = $(this).attr("id");
    var elem = "#" + elemId;
    var query = `${elem} a[href]:visible:not([disabled]), ${elem} button:visible:not([disabled]), ${elem} button[type='button']:visible:not([disabled]), ${elem} textarea:visible:not([disabled]), ${elem} input[type='email']:visible:not([disabled]), ${elem} input[type='text']:visible:not([disabled]), ${elem} input[type='radio']:visible:not([disabled]), ${elem} input[type='checkbox']:visible:not([disabled]),  ${elem} select:visible:not([disabled]), ${elem} [tabindex='0']:visible`;
    var focusableEls = $(query);
    var firstFocusableEl = focusableEls[0];
    var lastFocusableEl = focusableEls[focusableEls.length - 1];
    var isTabPressedFocus = e.key === "Tab" || e.keyCode === 9;
    if (isTabPressedFocus) {
      if (e.shiftKey) {
        if (document.activeElement === firstFocusableEl) {
          lastFocusableEl.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastFocusableEl) {
          firstFocusableEl.focus();
          e.preventDefault();
        }
      }
    }
  });
  //
  $('[data-bs-toggle="tooltip"]').on("click", function () {
    $(this).tooltip("hide");
  });

  // ----- open / close profile-section  dropdown js  ----- //

  
});
