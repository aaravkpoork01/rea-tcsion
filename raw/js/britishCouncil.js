//below code is related to fitb mcq option view change -- starts
function bindClickEventForFitbOptionViewChange(){
	  $('.drpdwnToggle').unbind('click');
	  $('.sortDropdown-menu li').unbind('click');
	  $('.drpdwnToggle').on('click', function () {
			$('.drpdwnToggle').not(this).removeClass('dropdownActive')
			$('#'+this.id).toggleClass('dropdownActive');
			$('.sortDropdown-menu').hide();
			if($('#'+this.id).hasClass('dropdownActive')){
				$('#ul'+this.id).show();
				//isDeakin?$('#ul'+this.id).css({"top":$("#ul"+this.id).parent().height()+$("#ul"+this.id).parent().offset().top,"left":$("#"+this.id).parent().offset().left}):'';
			}
			else{
				$('.sortDropdown-menu').hide();
			}
	  });
	  if(isDeakin){
		  $(".drpdwnToggle").click(function () {
			  var topD = $('.leftDiv').scrollTop();
			          console.log(topD);
			          $(".leftDiv").animate({ scrollTop: topD + 200 }, 600);
			      });
	  }
	 $('.sortDropdown-menu li').on('click', function () {
		$(this).parent().hide();console.log(this.id);
		var selectId = this.id.split("@@")[0];
		var optValue = this.id.split("@@")[1];
		$("#"+selectId).val(optValue);
		console.log(selectId);
		$('#userDef'+selectId).find('.selected').html($(this).text());
		$('.drpdwnToggle').removeClass('dropdownActive');
		
	});
}
//below code is related to fitb mcq option view change -- ends
$(document).ready(function() {

   $('[data-tooltip="tooltip"]').tooltip();
    
    var count, timer, transfrmRt, transfrmLt, prevFontSize = '14px';
    var width,height;
    function queTimer(overallQuesTime,remainingQuesTime){
        count = remainingQuesTime;
        transfrmRt = 180 + ((360 / overallQuesTime) * (overallQuesTime - count));
        transfrmLt = 180 + ((360 / overallQuesTime) * (overallQuesTime - count));
        timer = setInterval(function(){
            count = count - 1;
            transfrmRt = transfrmRt + (360/overallQuesTime);
            transfrmLt = transfrmLt + (360/overallQuesTime);
            if(count > (overallQuesTime / 2)) {
                $('.ccrPatch2').css('transform','rotate('+(transfrmRt)+'deg)');
            }
            if(count < (overallQuesTime / 2)) {
                $('.ccrPatch2').css({'background-color': '#f6f6f6','z-index': '2','transform':'rotate(180deg)'});
                $('.ccrPatch1').css('transform','rotate('+(transfrmLt)+'deg)');
            }

            //
           /* if(count < 27) {
                $('.nextButton').removeClass('disabled');
            }*/
            if(count < 5) {
                $('#timer').css('color','#f00');
            }
            if (count < 0)
            /*{
                $('.nextButton').trigger('click');
                $('.ccrPatch1').css({'z-index': '1','transform':'rotate(0deg)'});
                $('.ccrPatch2').css({'z-index': '1','transform':'rotate(180deg)'});
                return false;
                $('#timer').css('color','#333');
            }*/
            $('#timer').html(count);
        }, 1000);
    }

    function resetTimer() {
        clearInterval(timer);
        count = 0;
        $('#timer').html(count).css('color','#333');
        $('.ccrPatch1').css({'background-color': '#ffdd09','z-index': '1','transform':'rotate(0deg)'});
        $('.ccrPatch2').css({'background-color': '#ffdd09','z-index': '1','transform':'rotate(180deg)'});
        setTimeout(function(){
            queTimer();
            $('.nextButton').removeClass('freezed');
        }, 11000);
    }

   /* function startQuestions(){
        setTimeout(function() {
            $('.introImage').hide();
            $('.VideoQuestion, .nextButton').fadeIn();
            $('.timerClock').css('display','grid');
            $('#audioQ1').get(0).play();
            queTimer();
            resetTimer();
        }, 14000);
    }*/
    /*$('.startBtn').on('click', function(){
        $('#startScreen').removeClass('active');
        $('#que1').addClass('active'); 
        $('#audioNarrator').get(0).play();
        startQuestions();
        $('.module1').addClass('current');
    });*/

  

/*    $('.radioBox').on('click', function(){
        $('.radioBox button').removeClass('checked');
        $(this).find('button').addClass('checked');
        $('.nextButton').removeClass('disabled');
    })

    $('.checkBoxAnswer').on('click', function(){
        $(this).toggleClass('selected');
        $('.nextButton').removeClass('disabled');
    })

    $('.writingTxtarea').on('keyup', function(){
        if($(this).val() == '') {
            $('.nextButton').addClass('disabled');
        }else {
            $('.nextButton').removeClass('disabled');
        }   
    });

*/
    //Theme js
        var appendcount=0;
    $('.contrastBtn').on('click', function(){
    	themeModified = true;
        $('.contrastBtn').removeClass('applied');
        $('.overlayBtn').removeClass('applied');
        $(this).addClass('applied');
        var getBGContrast = $(this).css('background-color');
        var getFontContrast = $(this).css('color');
        overLayColorValue = getBGContrast;
        canvasBGColor = getBGContrast;
        fontColorValue = getFontContrast;
        bgColorValue = "";
        if($(this).index() == 1){
        	overLayColorValue = "";
            fontColorValue = "";
            canvasBGColor = "";
        }
       //Questn_Area
        $('#currentQues').css('background-color', getBGContrast);
        if(sessionStorage.userDefinedNum!=="schoolUI"){
        $('.que table *').css('background-color', getBGContrast);
        $('.que table *').css('color', getFontContrast);
        $('#currentQues *').not('.overlayBtn, .circleTimer *, .overlayBtn, .other_buttoncontainer *,.buttons-div *,.jwplayer *,.video-js, .video-js *,.backgroundColorChangeNotRequired *,.displayMic *,canvas,.canvas-wrapper,.canvas-main-area,.canvas-container,.nocnHeadingBtns *').css('background-color', getBGContrast);
        $('#currentQues *').not('.contrastBtn, .circleTimer *, .overlayBtn, .other_buttoncontainer *,.buttons-div *,.jwplayer *,.video-js, .video-js *,.displayMic *,canvas,.canvas-wrapper,.canvas-main-area,.canvas-container,.nocnHeadingBtns *').css('color', getFontContrast);
        $('.st0').css('fill', getBGContrast);
        }
        document.styleSheets[document.styleSheets.length-1].insertRule(".SEQQuestionDiv li {background-color: "+getBGContrast +" !important}",document.styleSheets[document.styleSheets.length-1].cssRules.length);
        sequenceoptionscolorForBC = ".SEQQuestionDiv li {background-color: "+getBGContrast +" !important}"; 
        try{
        	fabricCanvas.setBackgroundColor(canvasBGColor);
        	fabricCanvas.renderAll();
        }catch(e){
        	
        }
    });

    $('.overlayBtn').on('click', function(){
    	themeModified = true;
        $('.overlayBtn').removeClass('applied');
        $('.contrastBtn').removeClass('applied')
        $(this).addClass('applied');
        var getBG = $(this).css('background-color');
        $('#currentQues').css('background-color', getBG);
        $('.que table *').css('background-color', getBG);
        $('.que table *').css('color', '#333')
        bgColorValue = getBG;
        canvasBGColor = getBG;
        if($(this).index() == 1){
        	bgColorValue = "";
        	canvasBGColor = "";
        }
        overLayColorValue = "";
       // tabletContainer
        
        $('#currentQues *').not('.overlayBtn, .circleTimer *, .overlayBtn, .other_buttoncontainer *,.buttons-div *,.jwplayer *,.video-js,.video-js *,.backgroundColorChangeNotRequired *,.displayMic *,canvas,.canvas-wrapper,.canvas-main-area,.canvas-container,.nocnHeadingBtns *').css('background-color', getBG);
        $('#currentQues *').not('.contrastBtn, .circleTimer *, .overlayBtn, .other_buttoncontainer *,.buttons-div *,.jwplayer *,.video-js,.video-js *,.displayMic *,canvas,.canvas-wrapper,.canvas-main-area,.canvas-container,.nocnHeadingBtns *').css('color', '#333')
        $('.st0').css('fill', getBG);
        document.styleSheets[document.styleSheets.length-1].insertRule(".SEQQuestionDiv li {background-color: "+getBG +" !important}",document.styleSheets[document.styleSheets.length-1].cssRules.length);
        sequenceoptionscolorForBC = ".SEQQuestionDiv li {background-color: "+getBG +" !important}";
        if(sessionStorage.isOxford == 'true' && $('.overlay1').hasClass('applied')){
        	getFontContrast='';
        	getBGContrast = '';
        	overLayColorValue = "";
            fontColorValue = "";
        	document.documentElement.style.setProperty('--answerBG','#F3F1EC');
         $('#currentQues *').not('.overlayBtn, .circleTimer *, .overlayBtn, .other_buttoncontainer *,.buttons-div *,.jwplayer *,.video-js *,.backgroundColorChangeNotRequired *,.displayMic *,canvas,.canvas-wrapper,.canvas-main-area,.canvas-container,.nocnHeadingBtns *').css('background-color', '#F3F1EC');
        	 $('.oxfordUniv_main, .oxfordUniv_modal_content, textarea, input[type="text"], .info_msg, .testOptionScreen, .reviewSubmitScreen, .oxford_answerSection, .testBlock, #accent-keyboard ul, .queReviewGrid').css("background-color",'');
        }else if(sessionStorage.isOxford == 'true'){
        	 var getBGDark = $(this).attr('data-color');
        	document.documentElement.style.setProperty('--answerBG',getBG);
        	$('.oxfordUniv_main, .oxfordUniv_modal_content, textarea, input[type="text"], .info_msg, .testOptionScreen, .reviewSubmitScreen').css('background-color', getBG); 
            $('.oxford_answerSection, .testBlock, #accent-keyboard ul, .queReviewGrid, .highlightext div, .marksForQuestion').css('background-color', getBGDark);
        }
        try{
        	fabricCanvas.setBackgroundColor(canvasBGColor);
        	fabricCanvas.renderAll();
        }catch(e){
        	
        }
    });

    $(document).on('click','.fontBtn', function(){
    	themeModified = true;  	
        $('.fontBtn').removeClass('applied');
        $(this).addClass('applied');
        var getFont = $(this).css('font-size');
        try{
        if(typeof(mockVar.curSectionQuestions[iOAP.curQues].fontBtnCount) != 'undefined' && mockVar.curSectionQuestions[iOAP.curQues].fontBtnCount == 1){
            width = $('.answer,.saanswer').width();
            height = $('.answer,.saanswer').height();
            mockVar.curSectionQuestions[iOAP.curQues].fontBtnCount++;
        }else if(typeof(mockVar.curSectionQuestions[iOAP.curQues].fontBtnCount) == 'undefined'){
            width = $('.answer,.saanswer').width();
            height = $('.answer,.saanswer').height();
            mockVar.curSectionQuestions[iOAP.curQues].fontBtnCount=2;
        }}
        catch(e){}
        if(prevFontSize != getFont){
        	if(!$(".oxfordTestScreen").is(":visible")){
        	if(prevFontSize > getFont)
        		auditlogCreation("Font changed","Font has been decreased","Font decreased");
        	else
        		auditlogCreation("Font changed","Font has been increased","Font increased");
        	}
        	/*else{
        		if(prevFontSize > getFont)
            		auditlogCreation("Font changed","Font has been decreased at groupSelection","Font decreased");
            	else
            		auditlogCreation("Font changed","Font has been increased at groupSelection","Font increased");
        	}*/
        	prevFontSize = getFont;
	        textSizeValue = getFont;
	        //$('.Questn_Area').css('font-size', getFont);
	        //$('.que table *').css('font-size', getFont);
	        if(sessionStorage.userDefinedNum==='schoolUI' || sessionStorage.userDefinedNum==='corporateUI'){
	        	try {
	                document.documentElement.style.cssText="font-size:"+getFont;
	                $('textarea').not('#texteditor').css({'font-size': getFont,'width':width,'height':height});
	            } catch (e) {}
	        }
	        else{
	        $('#currentQues,.optionLabel *').not('.timerClock, .timerClock *,.timer,.jwAudioVideo *').css('font-size', getFont);
	        $('.que').css('font-size', getFont); 
	        $('.textHighlighter').css('font-size', getFont);
	        $('#numericKeyBoardDiv *').css('font-size', getFont);
	        $(".listyle").next().css('font-size', getFont);
	        $('.select-style select').css('font-size', getFont);
	        $('.select-style option').css('font-size', getFont);
	        $('.oxfordTestScreen').css('font-size',getFont);
	        //$('#answerArea').css('font-size', getFont);
	        //$('.answer,.saanswer').css('font-size', getFont);'rows': $('.answer,.saanswer').attr('rows'),'cols': $('.answer,.saanswer').attr('cols'),
	        $('.fontBtn').attr('disabled','disabled');
	        isDeakin?document.documentElement.style.setProperty("--deakinFontSize", getFont):'';
	        try{
		            document.documentElement.style.setProperty("--fontSize", getFont);
	        	    document.getElementById('deakinVideoCheckIframe').contentWindow.window.changeFont(getFont);
	        	    document.documentElement.style.setProperty("--fontSize", getFont);
	        		$('textarea').not('#texteditor').css({'font-size': getFont,'width':width,'height':height});
	        		$('.cke_wysiwyg_frame').contents().find('body *').css('font-size',getFont);
	  
	        }catch(e){}
	        
        }
	        setTimeout(function(){
	        	$('.fontBtn').removeAttr('disabled');
	        },1000);
        }
       // $('.SEQQuestionDiv').css('font-size', getFont);
        //$('#currentQues *').not('.timerClock, .timerClock *,.timer').css('font-size', getFont);
    });
    
    //tools button click
//    $('.footerButton').each(function(){
//       $(this).on('click', function(){
//            $('.popMain').hide();
//           $(this).next('.popMain').show();
//       }); 
//   });
    
   $('.footerButton').each(function(){
    	$(this).on('click', function(){
    	var flag = false;
    	if($(this).next('.popMain').is(':visible')) flag = true;
    	$('.popMain').hide();
    	$(this).attr("aria-expanded","false");
    	$(".accessToolIcon").css("border","1px solid transparent");
        $(".volumeIcon").css("border","1px solid transparent");
    	var divToShow = $(this).next('.popMain');
    	var borderToShow = $(this);
    	if(!flag){
    		setTimeout(function(){
    			divToShow.show();borderToShow.css("border","1px solid #000");borderToShow.attr("aria-expanded","true");
    		},10);
    	}
    	});
    	});
    $('.closePop, .cancelPopup').on('click', function(){
        $(this).parents('.popMain').hide();
        $(".accessToolIcon").css("border","1px solid transparent");
        $(".volumeIcon").css("border","1px solid transparent");
        $('.overlay').hide();
    }); 

    
    $(document).on("mouseup", function (e) {
    	 var drpContainer = $(".sortDropdown, .sortDropdown-menu");
         if (!drpContainer.is(e.target) && drpContainer.has(e.target).length === 0) {
            // $('.sortDropdown-menu').hide();
             //$('.drpdwnToggle').removeClass('dropdownActive');
         }
    	setTimeout(function(){
         var container = $(".popMain");
        if (!container.is(e.target) && container.has(e.target).length === 0) {
        	container.hide();
        	 $(".accessToolIcon").css("border","1px solid transparent");
             $(".volumeIcon").css("border","1px solid transparent");
        	//$("."+$(e.srcElement).attr("class").split(" ")[1]).css("border","1px solid transparent");
        }
    	},10);
    });


    //Help popup js
  /*  $('.somethingWrong a').on('click', function(){
        $(this).parents('.popMain').hide();
        $('.overlay, .helpPopup').fadeIn();
    });*/


    //Volume control js
    var barCount = $('.volumeBar').length;
    //var index = 10;
   /* $('.volumeIcon').on('click', function(){
       var id = "";
    	try{
    	   $(".jwplayer").each(function(e){
       		
       		console.log($(this).attr("id"));
       		index = parseInt(jwplayer($(this).attr("id")).getVolume() / 10);
     	   for(i=1;i<=10;i++){
     		   if(i <= index){
     			   $('.volumeBar'+i).addClass('addedVol');
     		   } else {
     			   $('.volumeBar'+i).removeClass('addedVol');
     		   }
     		   
     	   }
       		//jwplayer($(this).attr("id")).setVolume(index*10);
       		
       	});
    	   
    	   if(index == 10){
    		   $('.rightVolume').addClass('disabled');
    	   }
    	   if(index == 0){
    		   $('.leftVolume').addClass('disabled');
    	   }
       }catch(e){
    	   console.log(e);
       }
    })*/
    $('.rightVolume').on('click', function(){

    	
        if(volumeIndex == 10) {
        	volumeIndex = 9;
            return 0;
        }
        $('.volumeBar').eq(volumeIndex).addClass('addedVol');
        $('.volumeBar').eq(volumeIndex+10).addClass('addedVol');
        volumeIndex = volumeIndex + 1;
        /*$('.volumeBar').eq(volumeIndex).addClass('addedVol');
        $('.volumeBar').eq(volumeIndex+10).addClass('addedVol');*/
        try{
        	/*for(i=1;i<=10;i++){
      		   if(i <= index){
      			   $('.volumeBar'+i).addClass('addedVol');
      		   } else {
      			   $('.volumeBar'+i).removeClass('addedVol');
      		   }
      		   
      	   }*/
        	if(audioVideoWithHTMLTags){
        		$('audio, video').prop('volume', (volumeIndex + 1) / 10);
        	} else {
        		//console.log($(".jwplayer").length);
        	$(".video-js").each(function(e){
        		
        		console.log($(this).attr("id"));
        		videojs($(this).attr("id")).volume(((volumeIndex + 1)*10)/100);
        		
        	});
        }
        }catch(e){console.log("Rak"+e);}
        $('.leftVolume').removeClass('disabled');
    })

    $('.leftVolume').on('click', function(){
    	
        if(volumeIndex == 0) {
            $(this).addClass('disabled');
            return 0;
        }
        volumeIndex = volumeIndex == 10 ? 9 : volumeIndex;
        $('.volumeBar').eq(volumeIndex).removeClass('addedVol');
        $('.volumeBar').eq(volumeIndex+10).removeClass('addedVol');
        volumeIndex = volumeIndex - 1;
       /* $('.volumeBar').eq(volumeIndex).removeClass('addedVol');
        $('.volumeBar').eq(volumeIndex+10).removeClass('addedVol');*/
        try{
        	if(audioVideoWithHTMLTags){
        		$('audio, video').prop('volume', (volumeIndex) / 10);
        	} else {
        	//console.log($(".jwplayer").length);
        	$(".video-js").each(function(e){
        		
        		console.log($(this).attr("id"));
        		videojs($(this).attr("id")).volume((volumeIndex*10)/100);
        		
        	});
        	}
        	/*for(i=1;i<=10;i++){
      		   if(i <= index){
      			   $('.volumeBar'+i).addClass('addedVol');
      		   } else {
      			   $('.volumeBar'+i).removeClass('addedVol');
      		   }
      		   
      	   }*/
        	
            
           }catch(e){console.log("Rake "+e);}
    })


    // Mic set interval
    function micChange() {
        setTimeout(function () {
            $('.micIcon').hide();
            $('.micState, .arrowIndication').fadeIn();
        }, 12000);

        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(function (stream) {
                audioContext = new AudioContext();
                analyser = audioContext.createAnalyser();
                microphone = audioContext.createMediaStreamSource(stream);
                javascriptNode = audioContext.createScriptProcessor(2048, 1, 1);

                analyser.smoothingTimeConstant = 0.8;
                analyser.fftSize = 1024;

                microphone.connect(analyser);
                analyser.connect(javascriptNode);
                javascriptNode.connect(audioContext.destination);
                javascriptNode.onaudioprocess = function () {
                    var array = new Uint8Array(analyser.frequencyBinCount);
                    analyser.getByteFrequencyData(array);
                    var values = 0;

                    var length = array.length;
                    for (var i = 0; i < length; i++) {
                        values += (array[i]);
                    }

                    var average = values / length;

                    //console.log(Math.round(average));
                    colorPids(average);
                }
            })
            .catch(function (err) {
                /* handle the error */
            });

        function colorPids(vol) {
            var all_pids = $('.pid');
            var amout_of_pids = Math.round(vol / 10);
            var elem_range = all_pids.slice(0, amout_of_pids);
            // 
            for (var i = 0; i < all_pids.length; i++) {
                all_pids[i].style.backgroundColor = "transparent";
            }
            for (var i = 0; i < elem_range.length; i++) {
                if (amout_of_pids >= 7) {
                    elem_range[i].style.backgroundColor = "#f00";
                    $('.micActive').addClass('loud');
                } else if (amout_of_pids <= 2) {
                    elem_range[i].style.backgroundColor = "#ffdd09";
                    $('.micActive').addClass('low');
                } else {
                    elem_range[i].style.backgroundColor = "#69ce2b";
                    $('.micActive').removeClass('loud');
                    $('.micActive').removeClass('low');
                }

            }
        }
    }
    if(((isMacat || isDeakin) && sessionStorage.userdefinedcandconsole == 1) || (sessionStorage.userdefinedcandconsole != 1 && sessionStorage.userDefinedNum!="defaultUI")){
    	$(function(){
    		$("<img>").attr("src",$(".candidateImg").attr("src")).on("error",function(){$(".candidateImg").hide();}).on("load",function(){})
           });
    }

    // Highlighter js
    //
    //var selectedTextArray = [];
    var count = 1;
    /*
    x = document.getElementById("readingContent");
    function eventDispatch() {
        x.removeEventListener("mousemove", eventDispatch);
    }
    function eventCopy(){
        if (window.getSelection().toString() != "" && window.getSelection().toString() != undefined) {
            var selectedText = window.getSelection().toString();
            //var selectedObj = new Object();
            //selectedObj.Id = count;
            //selectedObj.Text = selectedText;
            //selectedTextArray.push(selectedObj);
            var inputText = document.getElementById("readingContent");
            var innerHTML = inputText.innerHTML;
            var newHtml = innerHTML.replace(selectedText, "<span class='highlight'><button class='closeH'></button>" + selectedText + "</span>");
            inputText.innerHTML = newHtml;
            //count++;
        }
        x.addEventListener("mousemove", eventDispatch);
    }
    $(document).on('click', '.highlightIcon', function (e) {
        $(this).toggleClass('selected');
        $('.readingContent').toggleClass('highlighterText');
        if($(this).hasClass('selected')){
            x.addEventListener("mouseup", eventCopy);
        }
        else {
            $('.highlight').css('background-color','transparent');
            $('.closeH').remove();
            x.removeEventListener("mouseup", eventCopy);
        }
    });

    $(document).on('click','.closeH', function(){
        $(this).parent().css('background-color','transparent');
        $(this).remove();
    });
    
    
*/
    //
    /*$('.exitBtn, .continueBtn').on('click', function(){
        document.exitFullscreen()
		window.location.href = 'UserTest_1.html';
	});*/
    	if(typeof(sessionStorage.userdefinedcandconsole) == "undefined" || sessionStorage.userdefinedcandconsole == 0){
    	     $('.volumeBar9,.volumeBar10').addClass('addedVol');
    	}
     
});