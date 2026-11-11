$(document).ready(function () {
  // initalized boostrap tooltip
  const tooltipTriggerList = document.querySelectorAll(
    '[data-bs-toggle="tooltip"]'
  );
  const tooltipList = [...tooltipTriggerList].map(
    (tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl)
  );
  $('[data-bs-toggle="tooltip"]').tooltip({ trigger: "hover" });
  // ------------ ---------------------------------
  $(".audio-video-check-wrap .radio-option input").click(function () {
    var inputParent = $(this).parents(".radio-option-btn-group");
    if (
      inputParent.find(".audio-select input:checked").val() === "yes" &&
      inputParent.find(".video-select input:checked").val() === "yes"
    ) {
      $(this)
        .parents(".audio-video-checked-content")
        .find(".next-btn")
        .removeClass("disabled-btn")
        .attr("disabled", false);
    } else {
      $(this)
        .parents(".audio-video-checked-content")
        .find(".next-btn")
        .addClass("disabled-btn")
        .attr("disabled", true);
    }
  });
  $(document).on("click", ".mobnext-btn", function () {
    let parent = $(this).parents(".prerequisite-main-content-wrapper");
    parent.find(".secondary-title").html(`Audio/Video Check`);
    $(".prerequisite-main-content-wrapper .cc-col-5").hide();
    $(".audio-video-checked-content").show();
  });
  //video ended js start
  // $('#ccTestVideo').on('ended', function() {
  //   $('.videoBtn').removeClass('pause');
  //   $(this).parents('.audio-video-checked-content').find('.next-btn').removeClass('disabled-btn').attr('disabled', false);
  // });

  // ==== photo varification js start ==== //
  $(".delete-retake-btn").on("click", function () {
    var parent = $(this).parents(".cc-row");
    $(".camera-frame .camera-icons").removeClass("ccDisabledBtn");
    // replace the proto preview container
    var emptyContainer = `
          <div class="pic-list-item" >
            <div class="pic-placeholder">
              <span class="plus-icon">
                <span class="h-line"></span>
                <span class="v-line"></span>
              </span>
            </div>
          </div>`;
    $(this)
      .parents(".cc-row")
      .find(".pic-lists .pic-list-item.cc-error")
      .remove();
    $(this).parents(".cc-row").find(".pic-lists").append(emptyContainer);

    $('[data-bs-toggle="tooltip"]').tooltip();
    parent.find(".form-check-input").prop("checked", false);
    parent
      .find(".validate-btn")
      .addClass("disabled-btn")
      .attr("disabled", false)
      .show();
    // hide error message
    parent.find(".delete-retake-btn").hide();
    parent.find(".cc-alert-box").removeClass("show");
    // add class to validate btn
    $(".validate-btn").addClass("success");
    accessCamera(2);
    $("#camera").show();
  });
  //end
  // validate js start
  $(".validate-btn").click(function () {
    if ($(this).hasClass("success")) {
      $("#PhotographPopup").modal("show");
    } else {
      var parent = $(this).parents(".cc-row");
      $(this).hide();
      parent
        .find(
          ".pic-lists .pic-list-item:nth-child(2), .pic-lists .pic-list-item:nth-child(3)"
        )
        .addClass("cc-error");
      parent.find(".delete-retake-btn").show();
      parent.find(".cc-alert-box").addClass("show");
    }
  });
  // validate js end
  // show no camera popup js
  $(".varification-rh-col .radio-button-container").click(function () {
    var txt = $(this).find("span").text();
    if (txt === "External Camera 02") {
      $("#cameraNotAvail").modal("show");
    }
  });
  // ==== photo varification js end ==== //
  $(".droparrowicon").click(function () {
    $(this).closest(".varification-lh-col").find(".toggeldiv").toggle();
    $(this).toggleClass("active");
    if($(this).hasClass('active')) {
      $(this).text('Show Less');
    } else {
      $(this).text('Show More');
    }
  });
  $('.proceed-btn').on('click', function(){
	  
	  var url = document.URL;
	  if (url.split("photoVerification.html?")[1].lastIndexOf('SUBMIT')> -1){
		  if(typeof(sessionStorage.scanTime) != "undefined" && sessionStorage.scanTime > 0)
				moveToScanAndUpload();
			else
				moveToFeedback();
	  }
	  else{
		  window.location.href="instructions.html?"+url.split("photoVerification.html?")[1]+"@@"+sessionStorage.userdefinedcandconsole;  
	  }
	    });

  $(".photograph-verification #PhotographPopup .ca-primary-button").click(
    function () {
      window.location.href = "./id-card-verification.html";
    }
  );
  $(document).on("click", ".redirectPage", function () {
    window.location.href = "./photograph-verification.html";
  });
  // Request access to the user's camera
  const myButton = document.getElementById("myButton");

  // Access the DOM elements
  const video = document.getElementById("camera");
  const canvas = document.getElementById("canvas0");
  const captureBtn = document.getElementById("capture-photo");
  const captureBtn1 = document.getElementById("recapture");
  //  captureBtn.addEventListener('click', () => {
  //  $('.camera-frame-box').classList.add('flash');
  //   });
  $("#capture-photo").on("click", function () {
    //   var $this =  $('.add-flash');
    //   $this.addClass('flash');
    //   $this.on('animationend', function(){
    //     $this.removeClass('flash');
    //   })
  });
  // Remove the class after the animation ends to allow re-triggering
  // myButton.addEventListener('animationend', () => {
  //   myButton.classList.remove('flash');
  // });
  function accessCamera(photoCount) {
    var cam;
    //  var userAgent = navigator.userAgent;
    // if(/Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
    //     cam = {
    //       audio: false,
    //       video: {
    //         facingMode: 'environment'
    //       }
    //     }
    //   } else if  (/iPad/i.test(userAgent)) {
    //     cam = {
    //       audio: false,
    //       video: {
    //         facingMode: 'environment'
    //       }
    //     }
    //   }
    //   else {
    //     cam = { video: true }
    //   }
    navigator.mediaDevices
      .getUserMedia({ video: true })

      // navigator.mediaDevices.getUserMedia({
      //   audio: false,
      //   video: {
      //     facingMode: 'environment'
      //   }
      // })
      .then((stream) => {
        $("#capture-photo").attr("disabled", false).removeClass("disabled-btn");
        $("#capture-photo .camera-icon")
          .attr("disabled", false)
          .removeClass("disabled-btn");
        video.srcObject = stream;

        //  captureBtn.addEventListener('animationend', () => {
        //      $('.camera-frame-box').classList.remove('flash');
        //   });
        captureBtn.addEventListener("click", () => {
          //  $('#capture-photo').attr('disabled', true).addClass('disabled-btn');

          $("#capture-photo").hide();
          // < ========= capture 3 photots photo every 3 sec start ========= >
          startTimer(3);

          picPlaceholderCountSequence();

          let count = 0; // Initialize a counter
          const maxExecutions = 3; // Define the maximum number of executions
          const intervalTime = 3000; // 3 seconds
          const myInterval = setInterval(function () {
            // Code to be executed
            var canvas = document.getElementById(`canvas${count}`);
            //canvas.style.display = 'none';
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            var ctx = canvas.getContext("2d");
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            // Get the captured image data

            imageData = canvas.toDataURL();
            $('[data-bs-toggle="tooltip"]').tooltip();
            var $this = $(".add-flash");
            $this.addClass("flash");
            $this.on("animationend", function () {
              $this.removeClass("flash");
            });
            var t = eval(canvas);
            var elm = $(`.pic-list-item[data-thumb=${count}]`);
            //console.log(elm)
            //elm.hide();
            var thumb = `<div class="user-pic user-pic${count}" tabindex="0" role="figure" aria-label="captured Photo.">
                            <img   src="${imageData}" class="user-img"  aria-label="Photo captured."  alt="" />
                            <span class="exclaimatory-icon"></span>
                            <button class="delete-btn" data-bs-toggle="tooltip" data-bs-placement="top" title="Delete"  aria-label="Delete Image">
                                <span class="delete-icon"></span>
                            </button>
                        </div> `;
            elm.html(thumb);

            var elm1 = document.querySelector(
              ".captured-photograph-list .captured-photograph-list-wrap"
            );
            $(`<button type="button" data-big-thumb=${count} class="captured-img-btn popoverWrap">
                        <img   src="${imageData}" class="user-img"  aria-label="Photo captured."  alt="" />
                        <span class="info_popOut">Click to select and proceed or recapture</span>
                      </button>      
                        `).appendTo(elm1);

            // elm.remove();

            setTimeout(() => {
              canvas.width = 0;
              canvas.height = 0;

              if (
                $(".photograph-verification .pic-lists").find(".user-pic")
                  .length < 3
              ) {
                // $('.photograph-verification .pic-lists').append(`<div class="pic-list-item" ><div class="pic-placeholder"><span class="plus-icon">
                //                                         <span class="h-line"></span>
                //                                         <span class="v-line"></span>
                //                                     </span>
                //                                         </div> </div>`);
              } else {
                setTimeout(function () {
                  video.style.display = "none";
                  // $(captureBtn).attr('disabled', true).addClass('disabled-btn');
                  var capturedPhotoHt = $('.validate-text').height() +   $('.captured-photograph-list').height() - 30;
                  $('.captured-photograph-list').css('height', capturedPhotoHt);
                  $(".validate-text").addClass("slide-up");
                  $(".captured-photograph-list").fadeIn("1200");
                  $(
                    ".select-camera, .camera-container .pic-lists, .camera-container .camera-frame"
                  ).hide();
                  $(".proceed-btn, .recapture").fadeIn("100");
                  $(".proceed-btn, .recapture")
                    .attr("disabled", true)
                    .addClass("disabled-btn");
                  // $('.proceed-btn, .recapture').fadeIn()
                  $('[data-toggle="tooltip"]').tooltip("hide");
                  if ($(".form-check-input").prop("checked") == true) {
                    $(".validate-btn")
                      .attr("disabled", false)
                      .removeClass("disabled-btn");
                  } else {
                    $(".validate-btn")
                      .attr("disabled", true)
                      .addClass("disabled-btn");
                  }
                }, 1000);
              }
            }, 100);
            // Increment the counter
            count++;

            // Check if the maximum number of executions has been reached
            if (count >= maxExecutions) {
              clearInterval(myInterval); // Stop the interval
              console.log(
                "Interval stopped after " + maxExecutions + " executions."
              );
            }
          }, intervalTime);
        });
      })
      .catch((error) => {
        console.error("Error accessing the camera: ", error);
      });
  }
  // active captured photo
  $(document).on(
    "click",
    ".captured-photograph-list .captured-img-btn",
    function () {
      var recaptureAttemptCount = Number(
        $("#recapture").find(".attemptsCount").text()
      );
      $(this).siblings().removeClass("active");
      $(this).addClass("active");
      if ($(this).hasClass("active")) {
        $(".proceed-btn").attr("disabled", false).removeClass("disabled-btn");
        if (recaptureAttemptCount > 0) {
          $(".recapture").attr("disabled", false).removeClass("disabled-btn");
          $(".popoverWrap.disabled-btn").css("pointer-events", "unset");
        } else {
          $(".recapture").attr("disabled", true).addClass("disabled-btn");
          $(".popoverWrap.disabled-btn").css("pointer-events", "none");
        }
        if (recaptureAttemptCount <= 0) {
          $(".recapture").css("pointer-events", "unset");
          $(".recapture .info_popOut").text(
            "Maximum number of attempts reached."
          );
        }
      } else {
        $(".proceed-btn, .recapture").attr("disabled", true).addClass("disabled-btn");
        if (recaptureAttemptCount <= 0) {
          $(".recapture").css("pointer-events", "unset");
          $(".recapture .info_popOut").text(
            "Maximum number of attempts reached."
          );
        }
        
      }
      if($(document).width() < 767) {
        var imgSrc = $(this).find('.user-img').attr('src');
        var previewImg = $(this).parents('.camera-container').find('.large-captured-pic-preview');
        // previewImg.hide();
        previewImg.find('img').attr('src', imgSrc);
        previewImg.slideDown('slow');
      }
    }
  );
  // <========== photo recapture  ========== >
  const cap = $(".recapture");
  $(".recapture").click(function () {
    var remainingAttempt = Number($(this).find(".attemptsCount").text()) - 1;
    video.style.display = "block";
    $(this).attr("disabled", true).addClass("disabled-btn");
    $(".proceed-btn").attr("disabled", true).addClass("disabled-btn");
    $(captureBtn).attr("disabled", false).removeClass("disabled-btn");
    $(".validate-text").removeClass("slide-up");
    $(".captured-photograph-list").hide();
    $(
      ".select-camera, .camera-container .pic-lists, .camera-container .camera-frame"
    ).fadeIn("1200");
    var bigThumb = $(".captured-photograph-list .captured-img-btn.active").attr(
      "data-big-thumb"
    );

    $(".pic-lists").find(`.pic-list-item[data-thumb=${bigThumb}]`).html(`
        <div class="pic-placeholder">
                                                <canvas id="canvas${bigThumb}" class="add-flash"></canvas>
                                                <div class="pic-placeholder-count">
                                                  <div class="number">3</div>
                                                </div>
                                            </div> 
        
        `);

    // $('.captured-photograph-list .captured-photograph-list-wrap').

    // replace the proto preview container
    // var emptyContainer = `
    //       <div class="pic-list-item" >
    //         <div class="pic-placeholder">
    //           <span class="plus-icon">
    //             <span class="h-line"></span>
    //             <span class="v-line"></span>
    //           </span>
    //         </div>
    //       </div>`
    // $(this).parents('.cc-row').find('.pic-lists .pic-list-item:last-child').remove();
    // if($('.captured-photograph-list .captured-img-btn').length > 3) {
    //   $(this).parents('.cc-row').find('.captured-photograph-list .captured-img-btn:last-child').remove();
    // }
    // $(this).parents('.cc-row').find('.pic-lists').append(emptyContainer);
    $('[data-bs-toggle="tooltip"]').tooltip();
    $(".timer-wrapper").css("opacity", 1);
    picPlaceholderCountSequence();
    $(".pic-placeholder-count").addClass("show");
    startTimer(1);
    let count = 0; // Initialize a counter
    const maxExecutions = 1; // Define the maximum number of executions
    const intervalTime = 3000; // 3 seconds
    const myInterval = setInterval(function () {
      // Code to be executed
      var canvas = document.getElementById(`canvas${bigThumb}`);
      //canvas.style.display = 'none';
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      var ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      // Get the captured image data

      imageData = canvas.toDataURL();
      $('[data-bs-toggle="tooltip"]').tooltip();
      var $this = $(".add-flash");
      $this.addClass("flash");
      $this.on("animationend", function () {
        $this.removeClass("flash");
      });
      var t = eval(canvas);
      var elm = $(`.pic-list-item[data-thumb=${bigThumb}]`);
      //console.log(elm)
      //elm.hide();

      var thumb = `<div class="user-pic user-pic${bigThumb}" tabindex="0" role="figure" aria-label="captured Photo.">
                            <img   src="${imageData}" class="user-img"  aria-label="Photo captured."  alt="" />
                            <span class="exclaimatory-icon"></span>
                            <button class="delete-btn" data-bs-toggle="tooltip" data-bs-placement="top" title="Delete"  aria-label="Delete Image">
                                <span class="delete-icon"></span>
                            </button>
                        </div> `;
      elm.html(thumb);

      var elm1 = $(
        `.captured-photograph-list .captured-photograph-list-wrap .captured-img-btn[data-big-thumb=${bigThumb}]`
      );
      elm1.html(
        `<img   src="${imageData}" class="user-img"  aria-label="Photo captured."  alt="" />`
      );

      setTimeout(function () {
        video.style.display = "none";
        // $(captureBtn).attr('disabled', true).addClass('disabled-btn');
        // var capturedPhotoHt = $('.validate-text').height() +   $('.captured-photograph-list').height() - 30;
        // $('.captured-photograph-list').css('height', capturedPhotoHt);
        $(".validate-text").addClass("slide-up");
        $(".captured-photograph-list").fadeIn("1200");
        $(
          ".select-camera, .camera-container .pic-lists, .camera-container .camera-frame"
        ).hide();
        // $('.proceed-btn, .recapture').fadeIn()
        $('[data-toggle="tooltip"]').tooltip("hide");
        if (remainingAttempt > 0) {
          $(".recapture").attr("disabled", false).removeClass("disabled-btn");
        } else {
          $(".recapture").attr("disabled", true).addClass("disabled-btn");
        }
        $(".proceed-btn").attr("disabled", false).removeClass("disabled-btn");
      }, 1000);

      count++;
      $(".timer-wrapper").css("opacity", 0);

      // Check if the maximum number of executions has been reached
      if (count >= maxExecutions) {
        clearInterval(myInterval); // Stop the interval
        console.log("Interval stopped after " + maxExecutions + " executions.");
      }
    }, intervalTime);
    // recapture attempt

    if (remainingAttempt >= 0) {
      $(this).find(".attemptsCount").text(remainingAttempt);
    } else {
      $(".recapture").attr("disabled", true).addClass("disabled-btn");
    }

    if (remainingAttempt <= 0) {
      $(".recapture").css("pointer-events", "unset");
      $(".recapture .info_popOut").text("Maximum number of attempts reached.");
    }
    // hide mobile large preview image 
    $('.large-captured-pic-preview').hide(); 
  });
  // <========== photo recapture end ========== >
  // if camera is visible
  if ($(".camera-wrapper").is(":visible")) {
    accessCamera(3);
  }

  // delete the capture image
  $(document).on("click", ".delete-btn", function () {
    $(this).tooltip("hide");
    $(this).parents(".pic-list-item").remove();
    // append the placeholder
    if ($(".pic-lists").find(".pic-list-item").length <= 0) {
      $(".photograph-verification .pic-lists")
        .append(`<div class="pic-list-item" ><div class="pic-placeholder"><span class="plus-icon">
          <span class="h-line"></span>
          <span class="v-line"></span>
          </span></div> </div>`);
      $("#camera").show();
      accessCamera();
    }
    // append placeholde when all the 5 images captured
    if ($(".pic-lists").find(".pic-list-item .pic-placeholder").length <= 0) {
      video.style.display = "block";
      $(captureBtn).attr("disabled", false).removeClass("disabled-btn");
      $(".validate-btn").attr("disabled", true).addClass("disabled-btn");
      $('[data-toggle="tooltip"]').tooltip("hide");
      $(".photograph-verification .pic-lists")
        .append(`<div class="pic-list-item" >
          <div class="pic-placeholder"><span class="plus-icon">
              <span class="h-line"></span>
              <span class="v-line"></span>
          </span></div> </div>`);
    }
  });
  // enable the valid btn

  $(".form-check-input").click(function () {
    if (
      $(this).prop("checked") == true &&
      $(".photograph-verification .pic-lists .pic-list-item").length > 2
    ) {
      $(".validate-btn").attr("disabled", false).removeClass("disabled-btn");
    } else {
      $(".validate-btn").attr("disabled", true).addClass("disabled-btn");
    }
  });

  //video recording js start

  function captureCamera(callback) {
    navigator.mediaDevices
      .getUserMedia({ audio: true, video: true })
      .then(function (camera) {
        callback(camera);
      })
      .catch(function (error) {
        alert("Unable to capture your camera. Please check console logs.");
        console.error(error);
      });
  }

  $(document).on("keyup", function (e) {
    if (e.key === "Escape") {
      $('[data-bs-toggle="tooltip"]').tooltip("hide");
      if ($("body").find(".tooltipstered").length >= 1) {
        $(".tooltipstered").tooltipster("hide");
      }
    }
  });

  //
  const startBtn = document.getElementById("start");
  const parents = document.querySelectorAll(".parent");
  const picPlaceholderCount = document.querySelectorAll(
    ".pic-placeholder-count"
  );
  function startTimer(totalRounds = 3) {
    parents.forEach((parent) => {
      const isPie = parent.dataset.pie === "true";
      const numberDiv = parent.querySelector(".number");
      const pieBG = parent.querySelector(".pie-bg");
      parent.classList.add("show"); // show timer

      if (isPie) {
        // pie timer
        let round = 0;
        // let totalRounds = 3;
        const duration = 3000;
        const delay = 0;

        function runRound() {
          numberDiv.textContent = 3;
          pieBG.style.background = `conic-gradient(from 0deg,rgba(0, 0, 0, 0.6)0deg, #FB8500 0deg)`;

          let startTime = null;

          function animate(timestamp) {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            // Smooth pie fill
            const progress = Math.min(elapsed / duration, 1);
            const deg = progress * 360;
            // update number each second
            const remaining = Math.max(3 - Math.floor(elapsed / 1000), 0);

            numberDiv.textContent = remaining > 0 ? remaining : "3";
            pieBG.style.background = `conic-gradient(from 0deg, rgba(0, 0, 0, 0.6) ${deg}deg, #FB8500 ${deg}deg)`;

            if (elapsed < duration) {
              requestAnimationFrame(animate);
            } else {
              round++;
              if (round < totalRounds) {
                runRound();
                // setTimeout(runRound, delay);
              } else {
                parent.classList.remove("show");
                // parent.style.opacity = 0;
                // setTimeout(() => {parent.classList.remove('show')}, 500);
              }
            }
          }
          requestAnimationFrame(animate);
        }
        runRound();
      } else {
        // normal countdown for non-pie div
        numberDiv.textContent = 3;
        let count = 3;
        const interval = setInterval(() => {
          count--;
          if (count > 0) {
            numberDiv.textContent = count;
          } else {
            numberDiv.textContent = "3";
            clearInterval(interval);
            setTimeout(() => {
              parent.classList.remove("show");
              // parent.style.opacity = 0;
              // setTimeout(() => parent.classList.remove("show"), 500);
            }, 1000);
          }
        }, 1000);
      }
    });
  }
  

  function picPlaceholderCountDown(block) {
    return new Promise((resolve) => {
      block.classList.add("show");
      const nDiv = block.querySelector(".number");
      let picPlaceholderCounter = 3;
      nDiv.textContent = picPlaceholderCounter;

      const pInterval = setInterval(() => {
        picPlaceholderCounter--;
        if (picPlaceholderCounter > 0) {
          nDiv.textContent = picPlaceholderCounter;
        } else {
          nDiv.textContent = "3";
          clearInterval(pInterval);
          block.classList.remove("show");
          resolve();
        }
      }, 1000);
    });
  }

  async function picPlaceholderCountSequence() {
    const picPlaceholderCount = document.querySelectorAll(
      ".pic-placeholder-count"
    );
    for (const block of picPlaceholderCount) {
      await picPlaceholderCountDown(block);
    }
  }

  // exam time left counter
  /* Countdown */
  //instruction timer
  const count_down_instru = Date.now() / 1000 + 16 * 60;
  const instr_pgroup = document.getElementById("countowntimer");
  const instr_countgroup = window.setInterval(function () {
    const nowg = Date.now() / 1000;
    const diffg = count_down_instru - nowg;
    const hoursg = String(
      Math.floor((diffg % (60 * 60 * 24)) / (60 * 60))
    ).padStart(2, "0");
    const minutesg = String(Math.floor((diffg % 3600) / 60)).padStart(2, "0");
    const secondsg = String(Math.floor(diffg % 60)).padStart(2, "0");
    if (instr_pgroup) {
      instr_pgroup.innerHTML = `${minutesg}:${secondsg}`;
    }
    if (diffg < 0) {
      window.clearInterval(instr_countgroup);
      instr_pgroup.innerHTML = "00:00";
    }
  }, 1000);
  // mobile countdown counter
  const mob_count_down_instru = Date.now() / 1000 + 16 * 60;
  const mob_instr_pgroup = document.getElementById("mobCountowntimer");
  const mob_instr_countgroup = window.setInterval(function () {
    const nowg = Date.now() / 1000;
    const diffg = mob_count_down_instru - nowg;
    const hoursg = String(
      Math.floor((diffg % (60 * 60 * 24)) / (60 * 60))
    ).padStart(2, "0");
    const minutesg = String(Math.floor((diffg % 3600) / 60)).padStart(2, "0");
    const secondsg = String(Math.floor(diffg % 60)).padStart(2, "0");
    if (mob_instr_pgroup) {
      mob_instr_pgroup.innerHTML = `${minutesg}:${secondsg}`;
    }
    if (diffg < 0) {
      window.clearInterval(mob_instr_countgroup);
      mob_instr_pgroup.innerHTML = "00:00";
    }
  }, 1000);
  
});
function validatePhotoUrl(){
	var cdnPath = (typeof(sessionStorage.cdnPath)!="undefined" && sessionStorage.cdnPath != "") ? sessionStorage.cdnPath+"/" : "";
	if(sessionStorage.accessibilityControlRequired===undefined || sessionStorage.accessibilityControlRequired==='')
	var nXml = readAndReturnXML(cdnPath+sessionStorage.xmlProcQuizPath+'?v='+jsVersion, true);
	sessionStorage.accessibilityControlRequired=$(nXml).find("AccessibilityControlRequired").length>0?$(nXml).find("AccessibilityControlRequired").text()=="YES":false;
	 if (sessionStorage.accessibilityControlRequired=='false') {
		  $(".accessibility").hide();
	 }

}

//Triggers when user selects the language in photo verification page
$(document).on('click', '#appLangDropdwn2 ul.dropdown li[role="option"]', function (e) {
  const $li = $(this);
  const lang = $li.find('.eng_lang').text().trim();
  if(lang=="Hindi")
  {
    var xml = readAndReturnXML(sessionStorage.cdnPath + "OnlineAssessment/" + 'LangXML/'+lang+'.xml'+'?v='+jsVersion,false);

    $('#page-title').html($(xml).find('page-title').text());
    $('.title3').html($(xml).find('title3').text());
    $('.note-bedge').html($(xml).find('note-bedge').text());
    $('.title4').html($(xml).find('title4').text());
    $('.cc-specification-txt').html($(xml).find('cc-specification-txt').text());
    $('.cc-specification-txt1').html($(xml).find('cc-specification-txt1').text());
    $('.cc-specification-txt2').html($(xml).find('cc-specification-txt2').text());
    $('.cc-success-button').html($(xml).find('cc-success-button').text());
    $('.lang_name').html($(xml).find('lang_name').text());
    $('.form-check-label').html($(xml).find('form-check-label').text())
  }
  else
  {
	   var xml = readAndReturnXML(sessionStorage.cdnPath + "OnlineAssessment/" + 'LangXML/'+'English'+'.xml'+'?v='+jsVersion,false);

	    $('#page-title').html($(xml).find('page-title').text());
	    $('.title3').html($(xml).find('title3').text());
	    $('.note-bedge').html($(xml).find('note-bedge').text());
	    $('.title4').html($(xml).find('title4').text());
	    $('.cc-specification-txt').html($(xml).find('cc-specification-txt').text());
	    $('.cc-specification-txt1').html($(xml).find('cc-specification-txt1').text());
	    $('.cc-specification-txt2').html($(xml).find('cc-specification-txt2').text());
	    $('.cc-success-button').html($(xml).find('cc-success-button').text());
	    $('.lang_name').html($(xml).find('lang_name').text());
	    $('.form-check-label').html($(xml).find('form-check-label').text())
  }
});
