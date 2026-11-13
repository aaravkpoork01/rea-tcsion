 
jQuery(document).ready(function(){
	/*$('.playyAllReview').on('click', function () {
        $(this).hide()
        $('.reviewStatus label').eq(1).css({ 'display': 'block', });
        reviewCardsStart();
    });*/
	$('#currentQues').perfectScrollbar();
	$("#instruContentDiv").perfectScrollbar();
	const cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame;
	$(".confrmPopup,.overlay").detach().insertAfter("#Questn_Area");
	$(document).mouseup(function (e) {
	        var container = $(".volumeFlyOutMain");
	        var container1 = $(".fontResizeContainer");
	        if (!container.is(e.target) && container.has(e.target).length === 0) {
	            container.find('.volumeFlyOut').hide();
	        }
	        if (!container1.is(e.target) && container1.has(e.target).length === 0) {
	            container1.find('.fontResizeFlyOut').hide();
	        }
	 });
	 $('.fontResizeToAdjust').on('click', function () {
	       $('.fontResizeFlyOut').fadeIn();
	 });
	 $('.volumeActionToAdjust').on('click', function () {
	        $('.volumeFlyOut').fadeIn();
	 });
	 $('.actionfontresize button em').on('click', function () {
	        var precVal = $(this).closest('button').attr('data-index-number');
	        var selectContext = $(this).closest('button').attr('data-value');
	        $('.resizeProgress').css({ "width": precVal });
	        $('.selectedResize').css({ 'left': precVal });
	        //$('.fontResizeValue').text(selectContext);
			var getFont = "";
	        switch (selectContext) {
	            case 'Small':
				getFont = "14px";
				 
	                break;
	            case 'Default':
				getFont = "16px";
	                
	                break;
	            case 'Medium':
				getFont = "18px";
	                
	                break;
	            case 'Large':
				getFont = "20px";
	             
	
	            default:
	                break;
	        }
			 $('#currentQues').css('font-size', getFont);
		       
		        $('.que').css('font-size', getFont); 
		        $('.textHighlighter').css('font-size', getFont);
		        $(".listyle").next().css('font-size', getFont);
		        $('.select-style select').css('font-size', getFont);
		        $('.select-style option').css('font-size', getFont);
	          $('.leftDiv').css('font-size', getFont);
	          $('.greenBgConatiner h1').css('font-size','calc('+getFont.replace("px","")+' * 0.15em)');
	          $(".GrpInst1").css('font-size', getFont);
	 });
	 const rangeSets = {
	            fill: '#23b7e6',
	            background: '#d7dcdf'
	        };const rangeSliders = document.querySelectorAll('.rangeSliderCustom');
	     Array.prototype.forEach.call(rangeSliders, (slider) => {
	         slider.querySelector('input').addEventListener('input', (event) => {
	             slider.querySelector('span.rangeSliderCustom_Value').innerHTML = event.target.value;
	             volumeIndex = event.target.value;
	             console.log("1 " +volumeIndex);
	            	 volumeIndex = volumeIndex/10;
	                 
	             console.log("2 " +volumeIndex);
	             
	                
	                 
	                 try{
	                	 $('audio, video').prop('volume', (volumeIndex ) / 10);
	                 }
	                 catch(e){console.log(e);}
	             rangeApplyFill(event.target);
	         });
	         rangeApplyFill(slider.querySelector('input'));
	     });
	     function rangeApplyFill(slider) {
	         const percentage = 100 * (slider.value - slider.min) / (slider.max - slider.min);
	         const bg = `linear-gradient(90deg, ${rangeSets.fill} ${percentage}%, ${rangeSets.background} ${percentage + 0.1}%)`;
	         slider.style.background = bg;
	     }
	 if(sessionStorage.isGreyScale == 1)
		 $('body').css("filter", "grayscale(1)");
	 $(".greenBgConatiner h1").html(mockVar.mockName);
	 $(".cnfPopHdr").append('<span class="startExamPopupHead popupHeaderIndiaction"><em></em></span>');
	 $("#questionContent").append('<div class="commanPopupModal" id="doneCommanPopup" tabindex="-1" role="dialog" aria-labelledby="doneCommanPopupId" aria-hidden="true"><div class="commanmodal-dialog" role="document">    <div class="commanmodal-content">        <div class="commanmodal-header borderGreenTop">            <span class="donePopupHead popupHeaderIndiaction"><em></em></span>        </div>        <div class="commanmodal-body">            <div class="doneCommanPopupContent"><h1 id="doneCommanPopupId" class="doneClass">Done!</h1><h2 class="doneCommanTxt">'+$(globalXmlvar).find('InfoCompleteExam').text()+'</h2>            </div>        </div>        <div class="commanmodal-footer">            <button type="button" class="btn primaryBorderBtn reviewTheExamType" onclick="showModule(\'sectionSummaryDiv\');closePaperPopup();">OK</button></div></div></div></div>');
	 $("#questionContent").append('<div class="commanPopupModal" id="submitAnswerId" tabindex="-1" role="dialog" aria-labelledby="submitAnswerHeadId" aria-hidden="true" >            <div class="commanmodal-dialog" role="document"><div class="commanmodal-content">    <div class="commanmodal-header borderBlueTop">        <span class="submitAnswerPopupHead popupHeaderIndiaction"><em></em></span>    </div>    <div class="commanmodal-body">        <h2 id="submitAnswerHeadId" class="submitAnswer">'+$(globalXmlvar).find('InfoSubmitPaper').text()+'</h2>    </div>    <div class="commanmodal-footer">        <button type="button" class="btn noBorderBtn closeComman" onclick="closePaperPopup();">Cancel</button>        <button type="button" class="btn primaryBorderBtn goToScaleMainpage" onclick="checkGroupBreakTime();">Submit</button></div></div></div></div>');
	 $("#instruContentDiv").prepend('<div class="deakinTimerSection paperTimer"><span class="timerLabel">Instruction Time</span><div class="quiz-timer"><div class="TimerCountdownDinstru" id="TimerCountdown">00:00</div><div class="timer-circle"><svg viewBox="0 0 63.66 63.66" id="timerCircle"><circle id="circle-base" cx="50%" cy="50%" r="25%"></circle><circle class="circle-fillDinstru" id="circle-fill" cx="50%" cy="50%" r="25%" stroke-dasharray="100 100" style="transition: stroke-dasharray 0.1s ease 0s; stroke: rgb(10, 232, 134);"></circle> Sorry, your browser does not support inline SVG.</svg></div></div><div class="clearfix"></div></div>')
});
function closePaperPopup(){
	$(".commanPopupModal").hide();
}
function getSummaryDiv(){
	$("#doneCommanPopup").show();
	$(".doneCommanTxt").html($(globalXmlvar).find('InfoCompleteExam').text());
}
function showSubmitConfirmationDiv(){
	$("#submitAnswerId").show();
	$(".submitAnswer").html($(globalXmlvar).find('InfoSubmitPaper').text());
	$(".goToScaleMainpage").html($(globalXmlvar).find('SubmitPaper').text());
}
function getSummaryDivAudio(){
	$(".commanPopupModal").hide();
	var str = "";
	str += '<div class="instructionUserGuidePadd">';
    str += '<div class="reviewedHeader">';
    str += ' <h2 class="reviewedQuestionh2">'+$(globalXmlvar).find('InfoReviewPaper').text();
    str += '</h2>';
    str += '  <div class="reviewStatus">';
    str += ' <label class="playyAllReview">'+$(globalXmlvar).find('PlayAllPaper').text()+'</label>';
    str += ' <label class="">'+$(globalXmlvar).find('Reviewing').text()+'</label>'
    str += '  <label class="">'+$(globalXmlvar).find('Reviewed').text()+'</label>';
    str += ' </div>';
    str += '  </div><div class="reviewedBody perfectScrollUpdate insReviewOverscroll"><div class="reviewCardsElement">';
    var counter = 1;
    for(var i=0;i<mockVar.groups.length;i++){
    	for(var j=0;j<mockVar.groups[i].secDetails.length;j++){
    		for(var k=0;k<mockVar.groups[i].secDetails[j].questions.length;k++){
    		  // var quesId = 
    		   var uniqueId = i+"@@"+j+"@@"+k;
               str += '<div class="reviewCardsElementOuter" id="'+ uniqueId+'" >';
               str += '<div class="reviewCardsElementInside">'
               str += '<span class="reviewedTickMark"><em></em></span>'
               str += '<h2 class="ansHeading">Answer '+counter+'</h2>'
               str += '<div class="datesCols">'
               str += '<div class="startDateFlt1 datesColumn">'
               str += '<label>'+$(globalXmlvar).find('StartDateTime').text()+'</label>'
               str += '<label>'+mockVar.groups[i].secDetails[j].questions[k].recordedStartDate+'</label>'
               str += '</div>'
               str += '<div class="startDateFlt2 datesColumn">'
               str += '<label>'+$(globalXmlvar).find('EndDateTime').text()+'</label>'
               str += '<label>'+mockVar.groups[i].secDetails[j].questions[k].recordedEndDate+'</label>'
               str += '</div>'
               str += '<div class="clear"></div>'
               str += '</div>'
               str += '<canvas height="50px" class="headphoneImgHolder reviewAudioFile" id="audioDictaphoneVisualizer'+uniqueId+'">';
               /*str += '<img src="images/recording-01.jpg" alt="recording-01">'
               str += '<span class="recordingTimer">0:08</span>'*/
               str += '</canvas></div></div>';
               counter++;
			}
		}
	}
    str += ' </div></div>'
    str += '  </div></div>'
    str += '</div></div>'
    return str;
}

function getSummaryBtns(){
	var str = '<div class="buttonTwoButtonBtm reattemptButton"><button class="noBorderTwo  popupActionBtns disabled" data-value="#reattemptId">';
    str += 'RE-ATTEMPT EXAM</button>';
    str += '<button onclick="showSubmitConfirmationDiv();" class="bgColorTwo  popupActionBtns" data-value="#submitAnswerId">'+$(globalXmlvar).find('Submit').text()+' </button></div>';
    return str;
}
function bindPlayAllButton(){
	$('.perfectScrollUpdate').perfectScrollbar();
    setTimeout(function () {
        $('.perfectScrollUpdate').perfectScrollbar('update');
    }, 200);
	$('.playyAllReview').unbind('click');
	$('.playyAllReview').on('click', function () {
        $(this).hide()
        $('.reviewStatus label').eq(1).css({ 'display': 'block', });
        reviewCardsStart();
    });
}
function playAudio(i,j,k){
	if(mockVar.groups[i].secDetails[j].questions[k].quesParam.status == "answered"){
		if(mockVar.storeCandResponse == 0){
			try{
				return URL.createObjectURL(mockVar.groups[i].secDetails[j].questions[k].blobData);
        	}catch(e){
        		return "";
        	}
		}else{
			
		}
	}else{
		return "";
	}
}
function getUrlWithEncryptedCode(i,j,k){
	var _0x9ea3d=_0x4d9e;function _0x4d9e(_0x5e2d1e,_0x298154){var _0x1a595d=_0x1a59();return _0x4d9e=function(_0x4d9e67,_0xdc41e9){_0x4d9e67=_0x4d9e67-0x1c6;var _0xd55671=_0x1a595d[_0x4d9e67];return _0xd55671;},_0x4d9e(_0x5e2d1e,_0x298154);}function _0x1a59(){var _0x5ddcdd=['&keyType=Report&questionId=','512381EBMCqw','5766644VRGQFe','2547prXkVz','orgId','39365JnIdrM','/IBACC/MockAssessmentAction.do?action=downloadFileUploadAns&orgId=','&candMasterId=','&fileType=candidateRecordedFile&authenticationKeyForFileDownload=dummykey&successFileDownload=true','questions','2390366IeofVH','40JNrEMl','mockId','96fuiztt','1021153ZzufGy','10SuzZNO','683160ZNcRTg','11930mJtBUH','1182RKkWvm','attemptId','secDetails','groups','&mockId='];_0x1a59=function(){return _0x5ddcdd;};return _0x1a59();}(function(_0x4a95d2,_0x2da62f){var _0x29a217=_0x4d9e,_0xde3098=_0x4a95d2();while(!![]){try{var _0x147758=parseInt(_0x29a217(0x1cb))/0x1+-parseInt(_0x29a217(0x1d9))/0x2*(-parseInt(_0x29a217(0x1da))/0x3)+-parseInt(_0x29a217(0x1cc))/0x4+-parseInt(_0x29a217(0x1cf))/0x5*(parseInt(_0x29a217(0x1dc))/0x6)+-parseInt(_0x29a217(0x1d8))/0x7*(-parseInt(_0x29a217(0x1d5))/0x8)+-parseInt(_0x29a217(0x1cd))/0x9*(parseInt(_0x29a217(0x1db))/0xa)+parseInt(_0x29a217(0x1d4))/0xb*(parseInt(_0x29a217(0x1d7))/0xc);if(_0x147758===_0x2da62f)break;else _0xde3098['push'](_0xde3098['shift']());}catch(_0x2bea68){_0xde3098['push'](_0xde3098['shift']());}}}(_0x1a59,0xc0853));var key='af172t3adjgug';return _0x9ea3d(0x1d0)+mockVar[_0x9ea3d(0x1ce)]+_0x9ea3d(0x1c9)+mockVar[_0x9ea3d(0x1d6)]+_0x9ea3d(0x1d1)+mockVar['candMasterId']+'&attemptNo='+mockVar[_0x9ea3d(0x1c6)]+_0x9ea3d(0x1ca)+mockVar[_0x9ea3d(0x1c8)][i][_0x9ea3d(0x1c7)][j][_0x9ea3d(0x1d3)][k]['quesId']+_0x9ea3d(0x1d2);
}
function getFileFromServer(i,j,k){}
function reviewCardsStart() {
    var $reviewCards = $('.reviewCardsElement .reviewCardsElementOuter');
    var index = 0;
    var index1 = 0
    setTimeout(sliderBG, 1000);
    function sliderBG() {
    	cancelAnimationFrame(myReqId);
        var $activeIndex = $reviewCards.eq(index);
        console.log($activeIndex);
        $activeIndex.addClass('reviewedState');
        index1 = index;
        index = ++index % $reviewCards.length;
        var target = $activeIndex.offset().top;
        var parentpos = $('#sectionSummaryDiv').offset();
        /*if(index == 1 )
            parentpos  = -220;
        else
            parentpos += 220*/
        console.log(target,parentpos);
       // document.getElementById("audioDictaphoneVisualizer"+$($activeIndex).attr('id')).parentElement.parentElement.scrollIntoView({behaviour:'smooth'})
        $('.insReviewOverscroll').animate({
        	 scrollTop: (document.getElementsByClassName('insReviewOverscroll')[0].scrollHeight/$reviewCards.length) * (index1)
        }, 500);
        if (index >= 1) {
        	if(mockVar.groups[$($activeIndex).attr('id').split("@@")[0]].secDetails[$($activeIndex).attr('id').split("@@")[1]].questions[$($activeIndex).attr('id').split("@@")[2]].quesParam.status == "answered"){
	        	if(mockVar.storeCandResponse == 0){
		        	try{
		        	var audio  = document.createElement('audio');
		        	audio.src= URL.createObjectURL(mockVar.groups[$($activeIndex).attr('id').split("@@")[0]].secDetails[$($activeIndex).attr('id').split("@@")[1]].questions[$($activeIndex).attr('id').split("@@")[2]].blobData);
					audio.load();
					audio.play();
					$("body").append(audio);
					audioSummaryVisulization(audio,$($activeIndex).attr('id'));
		        	audio.addEventListener('ended', sliderBG);
		        	}catch(e){
		        		sliderBG();
		        	}
	        	}else{
	        		url =getUrlWithEncryptedCode($($activeIndex).attr('id').split("@@")[0],$($activeIndex).attr('id').split("@@")[1],$($activeIndex).attr('id').split("@@")[2]);
		        	url+="&getFile=true";
	        		xhr = new XMLHttpRequest()
	        	 	xhr.open('GET',url)
	        	 	xhr.responseType = "blob";
	        	 	xhr.onload = function(){
	        	 		    console.log(this.response);console.log(URL.createObjectURL(this.response));
	
	        	 		   try{
	        		        	var audio  = document.createElement('audio');
	        		        	audio.src= URL.createObjectURL(this.response);
	        		        	audio.load();
	        					audio.play();
	        					audioSummaryVisulization(audio,$($activeIndex).attr('id'));
	        		        	audio.addEventListener('ended', sliderBG);
	        		        	}catch(e){
	        		        		sliderBG();
	        		        	}
	        	        	
	        	 	}
	
	        	 	xhr.send();
	        	}
	            //setTimeout(sliderBG, 2000);
	        }else{
	        	sliderBG();
	        }
        } else {
        	if(mockVar.groups[$($activeIndex).attr('id').split("@@")[0]].secDetails[$($activeIndex).attr('id').split("@@")[1]].questions[$($activeIndex).attr('id').split("@@")[2]].quesParam.status == "answered"){
            	
	        	if(mockVar.storeCandResponse == 0){
		        	try{
		        	var audio  = document.createElement('audio');
		        	audio.src= URL.createObjectURL(mockVar.groups[$($activeIndex).attr('id').split("@@")[0]].secDetails[$($activeIndex).attr('id').split("@@")[1]].questions[$($activeIndex).attr('id').split("@@")[2]].blobData);
					audio.load();
					audio.play();
					$("body").append(audio);
					audioSummaryVisulization(audio,$($activeIndex).attr('id'));
		        	audio.addEventListener('ended', sliderBGEnd);
		        	}catch(e){
		        		sliderBGEnd();
		        	}
	        	}else{
	        		url =getUrlWithEncryptedCode($($activeIndex).attr('id').split("@@")[0],$($activeIndex).attr('id').split("@@")[1],$($activeIndex).attr('id').split("@@")[2]);
	        		url+="&getFile=true";
	        		xhr = new XMLHttpRequest()
	        	 	xhr.open('GET',url)
	        	 	xhr.responseType = "blob";
	        	 	xhr.onload = function(){
	        	 		    console.log(this.response);console.log(URL.createObjectURL(this.response));
	
	        	 		   try{
	        		        	var audio  = document.createElement('audio');
	        		        	audio.src= URL.createObjectURL(this.response);
	        		        	audio.load();
	        					audio.play();
	        					audioSummaryVisulization(audio,$($activeIndex).attr('id'));
	        		        	audio.addEventListener('ended', sliderBGEnd);
	        		        	}catch(e){
	        		        		sliderBGEnd();
	        		        	}
	        	        	
	        	 	}
	
	        	 	xhr.send();
	        	}
        	}else{
        		sliderBGEnd();
        	}
            //setTimeout(sliderBG, 2000);
        
        	/*try{
        	var audio  = document.createElement('audio');
        	audio.src= URL.createObjectURL(mockVar.groups[$($activeIndex).attr('id').split("@@")[0]].secDetails[$($activeIndex).attr('id').split("@@")[1]].questions[$($activeIndex).attr('id').split("@@")[2]].blobData);
			audio.load();
			audio.play();
			audioSummaryVisulization(audio,$($activeIndex).attr('id'));
        	audio.addEventListener('ended', sliderBGEnd);
        	}catch(e){
        		sliderBGEnd();
        	}*/
            //setTimeout(sliderBG, 2000);
        
            /*$('.reattemptButton button').removeClass('disabled');
            $('.reviewStatus').addClass('completeReviwed');
            $('.reviewStatus label').eq(1).css({ 'display': 'none', });*/
        }
    }
    function sliderBGEnd(){
    	cancelAnimationFrame(myReqId)
    	$('.reattemptButton button').removeClass('disabled');
        $('.reviewStatus').addClass('completeReviwed');
        $('.reviewStatus label').eq(1).css({ 'display': 'none', });
    }
}
function addExtraPaperJs(){
	if(mockVar.curQuesBean.keyboardType == 'AudioFile'){
        $(".micIconElem").remove();
        $(".audioDictaphone").show();
		$(".audioDictaphone").before('<span class="micIconElem"><em></em></span>');
        $(".micIconElem").show();
        if(mockVar.curQuesBean.SAThinkTimeUpperLimit> 0 && $(".thinkTimerDiv").length == 0){
        	$("#LAQuesText").fadeOut();
        	var thinkTimerStr = '<div class="thinkTimerDiv"><h2>Think Time</h2><div class="deakinTimerSection paperTimer">';
        	thinkTimerStr += '<div class="quiz-timer thinktimer"><div class="TimerCountdownDthink" id="TimerCountdown">00:23</div><div class="timer-circle"><svg viewBox="0 0 63.66 63.66" id="timerCircle"><circle id="circle-base" cx="50%" cy="50%" r="25%"></circle>';
        	thinkTimerStr += '<circle class="circle-fillDthink" id="circle-fill" cx="50%" cy="50%" r="25%" stroke-dasharray="65.71428571428572 100" style="transition: stroke-dasharray 0.1s ease 0s;stroke: rgb(0 239 179);"></circle>';
        	thinkTimerStr += 'Sorry, your browser does not support inline SVG.</svg></div></div><div class="clearfix"></div></div>';
        	thinkTimerStr += '<div class="thinkTimeInstructionDiv"><span class="micIconElem"><em></em></span><span class="thinkTimeInstruction">'+$(globalXmlvar).find('RecordingThinkTimerText').text()+'</span> </div></div>';
        	$("#LAQuesText").before(thinkTimerStr);
        	
        }
        if(mockVar.curQuesBean.maxTime>0){	
        	$("#currentQues").removeClass("increaseHeight");
        	$("#currentQues").addClass("increaseHeight");
        	$(".buttons-div").hide();
        }else{
        	$("#currentQues").removeClass("increaseHeight");
        	$("#currentQues").css("height","calc(100% - 100px);");
        	$(".buttons-div").show();
        }
        if(mockVar.curQuesBean.SAThinkTimeUpperLimit<=0){
        	$('.audioRecordingButtonsPanel').show();
        }
        	
    }
}
function cnfPop(id){
	$('#loadCalc').hide();
	$('.overlay').show();
	var $popup = $('#'+id);
	$popup.css('display','flex');
	var popupW = $popup.outerWidth() || $popup.width() || 0;
	var popupH = $popup.outerHeight() || $popup.height() || 0;
	var viewportW = document.documentElement.clientWidth || window.innerWidth || $(window).width();
	var viewportH = window.innerHeight || document.documentElement.clientHeight || $(window).height();
	var popupMargin = 8;
	var pLft = Math.max(popupMargin, Math.round((viewportW - popupW) / 2));
	var pTop = Math.max(popupMargin, Math.round((viewportH - popupH) / 2));
	$popup.css({'left':pLft+'px','top':pTop+'px','right':'auto','bottom':'auto','position':'fixed'});
}
var myReqId;
function audioSummaryVisulization(audioElement,uniqueId){
	cancelAnimationFrame(myReqId);
	const audioContext = new AudioContext();
	const sourceNode = audioContext.createMediaElementSource(audioElement);
	const analyser = audioContext.createAnalyser();
	sourceNode.connect(analyser);
	analyser.connect(audioContext.destination);
	const canvas1 = document.getElementById('audioDictaphoneVisualizer'+uniqueId);
	const canvasCtx = canvas1.getContext('2d');
	canvasCtx.fillStyle = "#dddddd"
	canvasCtx.fillRect(0, 0, canvas1.width, canvas1.height);
	const bufferLength = analyser.frequencyBinCount;
	var x = 0;
	function draw() {
	    const WIDTH = 1;
	    const HEIGHT = canvas1.height;
	
	    myReqId = requestAnimationFrame(draw);  // meaning window.requestAnimationFrame(function(){draw()})-- sreejith 
	    const dataArray = new Uint8Array(analyser.frequencyBinCount);
	    analyser.getByteTimeDomainData(dataArray);
	
	    /*canvasCtx.fillStyle = '#0c7cd5';
	    canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);*/
	
	    canvasCtx.lineWidth = 2;
	    canvasCtx.strokeStyle = '#08d38a';
	
	    canvasCtx.beginPath();
	
	    let sliceWidth = WIDTH * 2.0 / bufferLength;
	    /*let x = 0;*/
	
	
	    for(let i = 0; i < bufferLength; i++) {
	
	      let v = dataArray[i] / 128.0;
	      let y = v * HEIGHT/2;
	
	      if(i === 0) {
	        canvasCtx.moveTo(x, y);
	      } else {
	        canvasCtx.lineTo(x, y);
	      }
	
	      x += sliceWidth;
	      if(x >= canvas1.width ){
	    		canvasCtx.clearRect(-1, 0, 1, canvas1.height);
	    		canvasCtx.putImageData(canvasCtx.getImageData(1, 0, canvas1.width-1, canvas1.height),0,0);
	   	    canvasCtx.clearRect( canvas1.width-1, 0,  canvas1.width, canvas1.height);
	   	    x = canvas1.width-1;
	      }
	    }
	
	    //canvasCtx.lineTo(canvas1.width, canvas1.height/2);
	    canvasCtx.stroke();
	  } 
	draw();
}