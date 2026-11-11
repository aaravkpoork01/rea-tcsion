
$(document).ready(function () {
	/*document.getElementById("VI").addEventListener("click", function () {
		 let checkIframe = setInterval(() => {
		   const iframe = document.getElementById("iframeId"); 
		   if (iframe) {
		     clearInterval(checkIframe);
		     iframe.addEventListener("load", function () {
		       setTimeout(() => {
		         const frameDoc = iframe.contentDocument || iframe.contentWindow.document;
              const body = document.body;
              let fontSize = "16px";
              if (body.classList.contains("fontSize1")) fontSize = "16px";
              if (body.classList.contains("fontSize2")) fontSize = "18px";
              if (body.classList.contains("fontSize3")) fontSize = "20px";
              const style = frameDoc.createElement("style");
               style.id = "injectedFontStyle";
              style.innerHTML = `body { font-size: ${fontSize}; }`;
              frameDoc.head.appendChild(style);

		         if ((body.classList.contains("darkThemeParent")) ){
		           const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
		           const firstPage = iframeDoc.getElementById("firstPage");
		           const secondPage1 = iframeDoc.getElementById("secondPagep1");
		           if (firstPage) {
		             firstPage.style.color = "#fff";
		             firstPage.style.background = "#323a4f";
		           }
		           if (secondPage1) {
		             secondPage1.style.color = "#fff";
		             secondPage1.style.background = "#323a4f";
		           }
		         } else {
		           console.log("Body doesn't have class darkThemeparent");
		         }
		       }, 700);
		     });
		   }
		 }, 300);
		});*/
	
	

	$(document).on('click', '.ctt-button', function () {
    if (!$(".canvas-fullscreen").is(":visible")) {
        $('#magnify').css('z-index', '333');
      
    } else {
          $('#magnify').css('z-index', 'unset');
    }
});

	if(sessionStorage.screenMagnifierControlRequired=="true"){
		$(".magnifier_class").show();
	}
	else{
		$(".magnifier_class").hide();
	}
	if(sessionStorage.accessibilityControlRequired=="true"){
		$(".accessibilityContent").show();
	}
	else{
		$(".accessibilityContent").hide();
	}
	try{
	if(sessionStorage.screenMagnifierControlRequired=="true"){
	const magnifier = new HTMLMagnifier({ width: 300 });
	window.magnifier=magnifier;
	}
	}
	catch(e){
		}
	
	
	$('#magnify').click(function() {
		if( $(this).hasClass('active')){
			auditlogCreation("Screen Magnifier Disabled","Screen Magnifier Disabled","Screen Magnifier");
			$(this).removeClass('active');
			magnifier.hide();
			window.magnifier?.hide();
		}else{
			auditlogCreation("Screen Magnifier Enabled","Screen Magnifier Enabled","Screen Magnifier");
			$(this).addClass('active');
			$(".accessibilityContDiv").hide();
			magnifier.show();
			window.magnifier?.show();
			$('.accessibility ').removeClass('active');}
	});
	  
	  $('body').click(function(e) {
	    if($('#magnify').hasClass('active') && $(event.target).closest('#magnify').length === 0 && $(event.target).closest('.magnifier').length === 0) {
	    	auditlogCreation("Screen Magnifier Disabled","Screen Magnifier Disabled","Screen Magnifier");
	    	$('#magnify').removeClass('active');
	      magnifier.hide();
	      
	      window.magnifier?.hide();
	    }
	  })
		$(document).on('keydown', function (e) {
		  if (e.key === 'Escape') {
		    $('.accessibilityContDiv').hide();
		  }
		});	  
	
	  
	  
	   // ============  global accessibilty j start =============== //
      	$('.accessabilityActions').click(function() {
      	  $('.scratch-pad-close').click();
      		if ($(this).hasClass('showDropDownCst')) {
                  $(this).next().hide()
                  $(this).attr('aria-expanded', 'false');
                  $(this).removeClass('showDropDownCst');
              } else {
            	  if(($('#bannerImg').is(':visible')) && document.querySelector('#bannerImg').innerHTML!=''){
            		  $('.accessibilityContDiv').css({"top":"101px"});
            	  }
                  $(this).next().show()
                  $(this).attr('aria-expanded', 'true');
                  $(this).addClass('showDropDownCst');
              }
             // $('[data-bs-toggle="tooltip"]').tooltip('hide');
      	});
          // js for change the font size
      	$('body').addClass('multi-fontszie');
          $(document).on('click', '.multi_font_icon', function () {
			
              var id = $(this).attr('data-value');
              $(".multi_font_icon").removeClass('activiteClass');
              $('html, body').removeClass('fontSize1 fontSize2 fontSize3');
              $('body').addClass('restFontActive');
              switch (id) {
                  case 'fontsize_opt1':
                	  auditlogCreation("Font Size 1 Enabled","Font Size 1 Enabled","Font Size");
                      $('html, body').removeClass('fontSize1').css({ "font-size": "12px" });
                      $(this).addClass("activiteClass");
                      $('body').removeClass('restFontActive');
                      break;

                  case 'fontsize_opt2':
                	  auditlogCreation("Font Size 2 Enabled","Font Size 2 Enabled","Font Size");
                      $('html, body').addClass('fontSize2').css({ "font-size": "14px" });
                      $(this).addClass("activiteClass");
                      $('body').addClass('restFontActive');
  
                      break;

                  case 'fontsize_opt3':
                	  auditlogCreation("Font Size 3 Enabled","Font Size 3 Enabled","Font Size");
                      $('html, body').addClass('fontSize3').css({ "font-size": "16px" });
                      $(this).addClass("activiteClass");
    
              }
              groupWidthCalculate();
          });
          // js for dark theme
          $(".highContrastToggle .switchToDivBlk  button").on('click', function () {
              $(".highContrastToggle").find('.selectedMode').removeClass('selectedMode');
              if ($(this).closest('.highContrastToggle').find('.switchToDivBlk').hasClass('lightModeOn')) {
            	  auditlogCreation("Dark Mode Enabled","Dark Mode Enabled","Dark Mode");
                  $('body').addClass('darkThemeParent');
                  $('.changeThemeMode').html('Light Mode');
                  $(this).closest('.highContrastToggle').find('.switchToDivBlk').removeClass('lightModeOn');
                  $(this).closest('.highContrastToggle').find('.switchToDivBlk .drakIconSwitch').addClass('selectedMode');
                  $('body').addClass('restColorModeActive');
                  if(mockVar.WaterMark){
              		if(mockVar.storeCandResponse == 0 || mockVar.storeCandResponse == "0"){
              			$(".mockCandId").html(mockWaterMark);
              			const quesOuterDiv1 = $('#quesOuterDiv').first();
            			const leftDivclass1 = $('.leftDiv').first();
						 quesOuterDiv1.removeClass('watermark').removeClass('quesOuterDiv2');
						 leftDivclass1.removeClass('watermark').removeClass('leftDiv2');
						 const program_container = $('.program_container').first();
	            			const programingAnsContent = $('.programingAnsContent').first();
	            			program_container.removeClass('watermark').removeClass('program_container1');
	            			program_container.removeClass('watermark').removeClass('programingAnsContent1');
	            			 const viewQPDiv = $('.viewQPDiv').first();
	            			 viewQPDiv.removeClass('watermark').removeClass('viewQPDiv1');
              			waterMark(mockWaterMark);
              		}else{
              			const quesOuterDiv1 = $('#quesOuterDiv').first();
            			const leftDivclass1 = $('.leftDiv').first();
						 quesOuterDiv1.removeClass('watermark').removeClass('quesOuterDiv2');
						 leftDivclass1.removeClass('watermark').removeClass('leftDiv2');
						 const program_container = $('.program_container').first();
	            			const programingAnsContent = $('.programingAnsContent').first();
	            			program_container.removeClass('watermark').removeClass('program_container1');
	            			program_container.removeClass('watermark').removeClass('programingAnsContent1');
	            			const viewQPDiv = $('.viewQPDiv').first();
	            			 viewQPDiv.removeClass('watermark').removeClass('viewQPDiv1');
              			waterMark(sessionStorage.waterMarkId);
                    }
              	}
              } else {
            	  auditlogCreation("Light Mode Enabled","Light Mode Enabled","Light Mode");
                  $('body').removeClass('darkThemeParent');
                  $('.changeThemeMode').html('Dark Mode');
                  $(this).closest('.highContrastToggle').find('.switchToDivBlk').addClass('lightModeOn');
                  $(this).closest('.highContrastToggle').find('.switchToDivBlk .lightIconSwitch').addClass('selectedMode');
                  $('body').removeClass('restColorModeActive');
                  if(mockVar.WaterMark){
              		if(mockVar.storeCandResponse == 0 || mockVar.storeCandResponse == "0"){
              			$(".mockCandId").html(mockWaterMark);
              			const quesOuterDiv1 = $('#quesOuterDiv').first();
            			const leftDivclass1 = $('.leftDiv').first();
						 quesOuterDiv1.removeClass('watermark').removeClass('quesOuterDiv2');
						 leftDivclass1.removeClass('watermark').removeClass('leftDiv2');
						 const program_container = $('.program_container').first();
	            			const programingAnsContent = $('.programingAnsContent').first();
	            			program_container.removeClass('watermark').removeClass('program_container1');
	            			program_container.removeClass('watermark').removeClass('programingAnsContent1');
	            			const viewQPDiv = $('.viewQPDiv').first();
	            			 viewQPDiv.removeClass('watermark').removeClass('viewQPDiv1');
              			waterMark(mockWaterMark);
              		}else{
              			const quesOuterDiv1 = $('#quesOuterDiv').first();
            			const leftDivclass1 = $('.leftDiv').first();
						 quesOuterDiv1.removeClass('watermark').removeClass('quesOuterDiv2');
						 leftDivclass1.removeClass('watermark').removeClass('leftDiv2');
						 const program_container = $('.program_container').first();
	            			const programingAnsContent = $('.programingAnsContent').first();
	            			program_container.removeClass('watermark').removeClass('program_container1');
	            			program_container.removeClass('watermark').removeClass('programingAnsContent1');
	            			const viewQPDiv = $('.viewQPDiv').first();
	            			 viewQPDiv.removeClass('watermark').removeClass('viewQPDiv1');
              			waterMark(sessionStorage.waterMarkId);
                    }
              	}
              }
          });
          // image trail
          $('.trailBlockElement').on('click', function () {
              if ($(this).closest('.cursorTrailResizeLft').hasClass('cursorTrailDisable')) {
            	  auditlogCreation("Cursor Trail Enabled","Cursor Trail Enabled","Cursor Trail");
                  // document.onmousemove = window.processEvent;
                  $('.accessabilityTrailCls').css('display', 'block');
                  $('.cursorTrailResizeLft').find('.changeNameDisable').html('Disable');
                  $(this).addClass('selectedTrail');
                  $(this).closest('.cursorTrailResizeLft').removeClass('cursorTrailDisable');
                  $('body').addClass('restTrailActive');
              } else {
            	  auditlogCreation("Cursor Trail Disabled","Cursor Trail Disabled","Cursor Trail");
                  //document.onmousemove = emptyFunction;
                  $('.accessabilityTrailCls').css('display', 'none');
                  $('.cursorTrailResizeLft').find('.changeNameDisable').html('Enable');
                  $(this).removeClass('selectedTrail');
                  $(this).closest('.cursorTrailResizeLft').addClass('cursorTrailDisable');
                  $('body').removeClass('restTrailActive');
              }
          });
          $('.cursorTrailResizeLft').on('focus', '.trailBlockElement', function (e) {
          }).on('keydown', '.trailBlockElement', function (e) {
              if ((e.keyCode == 13)) {
                  $(this).click();
              }
          });
          // cursor change js
          $('.cursorTrailDiv .mouseResizeEm').on('click', function () {
              var CursorSeleted = $(this).attr('data-value');
              var elementToChange = document.getElementsByTagName("html")[0];
              $('.cursorTrailDiv .mouseResizeEm').removeClass('activiteClass');
              $(this).addClass('activiteClass');
              $('body').addClass('restCursorChgActive');
              switch (CursorSeleted) {
                  case "Cursor1":
                	  auditlogCreation("Cursor Size 1 Enabled","Cursor Size 1 Enabled","Cursor Size");
                      elementToChange.style.cursor = "url('/OnlineAssessment/images/cursor1.png'), auto";
      				$('body').removeClass('cursor2');
      				$('body').removeClass('cursor1');
                      $('body').removeClass('restCursorChgActive');
                      break
                  case "Cursor2":
                	  auditlogCreation("Cursor Size 2 Enabled","Cursor Size 2 Enabled","Cursor Size");
                      elementToChange.style.cursor = "url('/OnlineAssessment/images/cursor3.png'), auto";
      				$('body').removeClass('cursor2');
      				$('body').addClass('cursor1');
                      break
                  case "Cursor3":
                	  auditlogCreation("Cursor Size 3 Enabled","Cursor Size 3 Enabled","Cursor Size");
                      elementToChange.style.cursor = "url('/OnlineAssessment/images/cursor2.png'), auto";
      				$('body').removeClass('cursor1');
      				$('body').addClass('cursor2');
                      break
              }
          });
          // reset accessibility adjustment
          $('.resetButton').on('click', function () {
        	  auditlogCreation("Reset Button Clicked","Reset Button Clicked","Reset");
              /** font resize */
              $(".multi_font_icon").removeClass('activiteClass');
              $('.multi-fontszie').removeClass('fontSize1 fontSize2 fontSize3');
              $('.multi-fontszie').css({ "font-size": "12px" });
			  document.documentElement.classList.remove("fontSize3");
			  			  document.documentElement.classList.remove("fontSize3");
			  			  $('body').removeClass('fontSize2');
			  			  $('body').removeClass('fontSize3');
			  $('html,body').removeClass('fontSize1 fontSize2 fontSize3');
			  $('html, body').addClass('fontSize1').css({ "font-size": "12px" });//For overidding the html tag to default font-size. Made this fix! 
              $('.multi-fontszie').addClass('fontSize1');
              $('.defaultFontSize').addClass("activiteClass");
              $('body').removeClass('restPaletteActive restFontActive restCursorChgActive restTrailActive restColorModeActive')
              /*** theme Mode */
              $('body').removeClass('darkThemeParent');
			  
              $('.changeThemeMode').html('Dark Mode');
              $('.highContrastToggle').find('.switchToDivBlk').addClass('lightModeOn');
              $('.highContrastToggle').find('.switchToDivBlk button').removeClass('selectedMode')
              $('.highContrastToggle').find('.switchToDivBlk .lightIconSwitch').addClass('selectedMode');
              /*********** Mouse trail ******/
              $('.cursorTrailResizeLft').find('.changeNameDisable').html('Enable');
              $('.selectedTrail').removeClass('selectedTrail');
              $('.cursorTrailResizeLft').addClass('cursorTrailDisable');
              $('.accessabilityTrailCls').css('display', 'none');
              /******** palette *********/
              $('.activePaletteTickMark').removeClass('activePaletteTickMark');
              $('.colorPaletteUl li').eq(0).click();
              /******* mouse resize  **********/
              $('.cursorTrailDiv .mouseResizeEm').removeClass('activiteClass');
//              $('.cursorTrailDiv .mouseResizeEm').eq(0).click();
              $('.cursorTrailDiv .mouseResizeEm').eq(0).addClass('activiteClass');
              var elementToChange = document.getElementsByTagName("html")[0];
              elementToChange.style.cursor = "url('/OnlineAssessment/images/cursor1.png'), auto";
              $('body').removeClass('cursor2');
			  $('body').removeClass('cursor1');
	          $('body').removeClass('restCursorChgActive');
	          
              if(mockVar.WaterMark){
            		if(mockVar.storeCandResponse == 0 || mockVar.storeCandResponse == "0"){
            			$(".mockCandId").html(mockWaterMark);
            			const quesOuterDiv1 = $('#quesOuterDiv').first();
            			const leftDivclass1 = $('.leftDiv').first();
						 quesOuterDiv1.removeClass('watermark').removeClass('quesOuterDiv2');
						 leftDivclass1.removeClass('watermark').removeClass('leftDiv2');
						 const program_container = $('.program_container').first();
	            			const programingAnsContent = $('.programingAnsContent').first();
	            			program_container.removeClass('watermark').removeClass('program_container1');
	            			program_container.removeClass('watermark').removeClass('programingAnsContent1');
	            			const viewQPDiv = $('.viewQPDiv').first();
	            			 viewQPDiv.removeClass('watermark').removeClass('viewQPDiv1');
            			waterMark(mockWaterMark);
            		}else{
            			const quesOuterDiv1 = $('#quesOuterDiv').first();
            			const leftDivclass1 = $('.leftDiv').first();
						 quesOuterDiv1.removeClass('watermark').removeClass('quesOuterDiv2');
						 leftDivclass1.removeClass('watermark').removeClass('leftDiv2');
						 const program_container = $('.program_container').first();
	            			const programingAnsContent = $('.programingAnsContent').first();
	            			program_container.removeClass('watermark').removeClass('program_container1');
	            			program_container.removeClass('watermark').removeClass('programingAnsContent1');
	            			const viewQPDiv = $('.viewQPDiv').first();
	            			 viewQPDiv.removeClass('watermark').removeClass('viewQPDiv1');
            			waterMark(sessionStorage.waterMarkId);
            		}
            	}
              groupWidthCalculate();
          });
      	$(document).bind("click touchstart", function (e) {
          if (!$(e.target).parents().children().hasClass('accessibilityContDiv')) {
            $(".accessibilityContDiv").hide();
      	  $('.accessabilityActions').attr('aria-expanded', 'false');
      	 $('.accessabilityActions').removeClass('showDropDownCst');
            $('.accessibility ').removeClass('active');
          }
        })
        
 });