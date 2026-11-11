/*Video call related methods*/
var canvasDataForMock={};
var alphanumericData = {};
$(document).ready(function() {
    	$(".drag_component").draggable({ 
		handle: '.toolhdr',   
		containment: "body"
	});  
    	if(isExaminer){
    	    $(".dragminimizesmall").show();
    	}
    	if(typeof(sessionStorage.operatingSystem) == "undefined")
    		sessionStorage.operatingSystem = "";
    	if(sessionStorage.operatingSystem.toUpperCase() == "ANDROID"){
    	$(document).on('click','.SAAnswer',function(){
    		try{
    			var id = this.id;
    			if($(".leftDiv").height() < $('.leftDiv').get(0).scrollHeight){
    				if(id == 'answer'){
    					$('.leftDiv').scrollTop(this.offsetTop + this.offsetHeight + 30);
    					setTimeout(function(){$('.leftDiv').scrollTop(this.offsetTop + this.offsetHeight + 30);},100);
    				} else {
    					$('.leftDiv').scrollTop($("#compreText").height() + $('#'+id).position().top + $('#'+id).height() + 30);
    					setTimeout(function(){
    						$('.leftDiv').scrollTop($("#compreText").height() + $('#'+id).position().top + $('#'+id).height() + 30);
    						setTimeout(function(){
    							$('.leftDiv').scrollTop($("#compreText").height() + $('#'+id).position().top + $('#'+id).height() + 30);
    						},100);
    					},100);
    				}
    			}
    		}catch(e){}
    	});
    	}
	$(document).on("click",".calc_close", function(){
		$(this).parents(".drag_component").hide();
		$("#videoCallFrame").attr("src","");//unload the meeting URL
		//Update status as call closed by candidate depending upon call value $("#isExaminerCall").val();
		//hide the video call div
		$("#dragcomp").hide();
		if(!isExaminer){
		$(".overlay").hide();
		getNoOfActiveExaminers();
		}
		if(isExaminer)
		closeWindowOrRedirect();
		var AuditJsonObject = new Object();
        AuditJsonObject.ActionName = "Calculator Closed";
        AuditJsonObject.ActionValue = (mockVar.showCalculatorQuesLevel==undefined)? "Config: QP Level" : "Config: Question Level";    
        AuditJsonObject.ActionDesc = (mockVar.showCalculatorQuesLevel==undefined)? mockVar.showCalculator : mockVar.showCalculatorQuesLevel;
        AuditJsonObject.ActionDesc += " Calculator Closed";
        AuditJsonObject.GroupId = mockVar.groups[mockVar.currentGrp].groupId;
        AuditJsonObject.SectionId = mockVar.groups[mockVar.currentGrp].secDetails[iOAP.curSection].secId;
        AuditJsonObject.QuestionId = mockVar.curQuesBean.quesId;
        AuditJsonObject.candidateName = sessionStorage.getItem("username");
        AuditJsonObject.loginId = sessionStorage.isOfflinePaper=='1' ? sessionStorage.getItem("username") : sessionStorage.getItem("loginId");
        AuditJsonObject.OptionSequence = "NA";
        var currDate = new Date();
        AuditJsonObject.Time = currDate.yyyymmddHHmmss();
        AuditJsonObject.SelectedOptionId = "NA";
        AuditJsonObject.timespentInSeconds = "NA";
        AuditJsonObject.mockVarLoginId = mockVar.loginId;
        if(!isExaminer){
        AuditJson.push(AuditJsonObject);
        }
	})
	
	
	$(document).on("click", ".dragmaximize", function(){
		$(this).parents(".drag_component").removeClass("minDragDiv").addClass("maxDragDiv");
		//$(this).hide();
		$(this).parents(".drag_component").find(".dragminimize").show();
		$(".drag_component").draggable( 'disable' );
		$(".toolhdr>div").removeClass("optionselected");
		$(this).addClass("optionselected");
		
	})
	
	$(document).on("click", ".dragminimize", function(){
		$(this).parents(".drag_component").removeClass("maxDragDiv").removeClass("minDragDiv");
		//$(this).hide();
		$(this).parents(".drag_component").find(".dragmaximize").show();
		$(".drag_component").draggable( 'enable' );
		$(".toolhdr>div").removeClass("optionselected");
		$(this).addClass("optionselected");
	})
	$(document).on("click", ".dragminimizesmall", function(){
		if(!$(this).parents(".drag_component").hasClass("minDragDiv")){
			$(this).parents(".drag_component").removeClass("maxDragDiv").addClass("minDragDiv");
			//$(this).hide();
			$(this).parents(".drag_component").find(".dragmaximize").show();
			$(".drag_component").draggable( 'enable' );
			$(".toolhdr>div").removeClass("optionselected");
			$(this).addClass("optionselected");
			$("#dragcomp").removeAttr("style").css("left","0px").css("bottom","85px");	
		}	
	})
	//Create Meeting click method bind
	$(document).on("click", "#createMeetingButton", function(){
		//Create in case of error method
		createVideoMeeting();
	});
	//Join Meeting click method bind
	$(document).on("click", "#startMeetingButton", function(){
		
		if(!isExaminer){
			var AuditJsonObject = new Object();
			AuditJsonObject.ActionName = "Examiner Group";
			AuditJsonObject.ActionValue="NA";
			AuditJsonObject.ActionDesc = "Join Meeting button clicked";
			AuditJsonObject.GroupId = mockVar.groups[mockVar.currentGrp].groupId;
			AuditJsonObject.SectionId = "NA";
			AuditJsonObject.QuestionId = "NA";
			AuditJsonObject.candidateName = sessionStorage.getItem("username");
	        AuditJsonObject.loginId = sessionStorage.isOfflinePaper=='1' ? sessionStorage.getItem("username") : sessionStorage.getItem("loginId");
			AuditJsonObject.OptionSequence = "NA";
			var currentDate = new Date();
			AuditJsonObject.Time = currentDate.yyyymmddHHmmss();
		    AuditJsonObject.SelectedOptionId = "NA";
		    AuditJsonObject.timespentInSeconds = "NA";
			AuditJson.push(AuditJsonObject);
			saveBackUp(false);
		}
		//Start Video call 
		startVideoCall();
		setTimeout(function(){
			if(!isExaminer && $("#startMeetingButton").is(":visible")){
				saveBackUp(true);
			}
		},30000);
	});

});

function createVideoMeeting(){
	var URL="/IBACC/MockAssessmentAction.do?action=";
	var paramsvalue = {};
	paramsvalue["assessmentId"]=mockVar.mockId;
	paramsvalue["orgId"]=mockVar.orgId;
	paramsvalue["candMasterId"]=mockVar.candMasterId;
	paramsvalue["groupId"]=mockVar.groups[mockVar.currentGrp].groupId;
	paramsvalue["groupName"]=mockVar.groups[mockVar.currentGrp].groupName;
	paramsvalue["waterMarkId"]=sessionStorage.waterMarkId;
	paramsvalue["attemptId"]=mockVar.attemptId;
	paramsvalue["vConBizCustId"]=sessionStorage.getItem("vConBizCustId");
	paramsvalue["assessmentCreatedBy"]=sessionStorage.getItem("assessmentCreatedBy");
	paramsvalue["emailId"]=sessionStorage.getItem("emailId");
	paramsvalue["username"]=sessionStorage.getItem("username");
	if(mockVar.groups[mockVar.currentGrp].meetingId==''){
	if(examinerPresenceRemote)
	URL=URL+"scheduleOnlineMeeting";
	else 
	URL =URL+"scheduleOfflineMeeting";
	jQuery.ajax({
				url: URL,
				async: false,
				type: 'POST',
				data: paramsvalue,
				dataType: 'json',
				success: function(data) {
				// UPdate in DB to make admin aware that candidate has entered such group
				if(examinerPresenceRemote){
					if(data !=null && data.meetingId!=null && data.meetingURLOfCandidate!='' && data.meetingURLOfExaminer!=''){
						mockVar.groups[mockVar.currentGrp].meetingId=data.meetingId;
						mockVar.groups[mockVar.currentGrp].meetingURLOfCandidate=data.meetingURLOfCandidate;
						mockVar.groups[mockVar.currentGrp].meetingURLOfExaminer=data.meetingURLOfExaminer;
						saveBackUp(false,true);//To update backup json with meeting details
						//Hide refresh button or make it empty.
						//Hide create video meeting button and show Join call button in the screen.
						$('#joinMeetingPanel').show();
						$('#createMeetingPanel').hide();
						$('#creatingMeetingPanel').hide();
						$('#findingExaminerPanel').hide();
						$('#meetYourExaminerPanel').hide();
					}else{
						//Create in case of failure
						$('#joinMeetingPanel').hide();
						$('#createMeetingPanel').show();
						$('#creatingMeetingPanel').hide();
						$('#findingExaminerPanel').hide();
						$('#meetYourExaminerPanel').hide();
					
					}	
				}else {
					if(data !=null && data.meetingId!=null){
							mockVar.groups[mockVar.currentGrp].meetingId=data.meetingId;
							saveBackUp(false,true);//To update backup json with meeting details
							//Hide refresh button or make it empty.
							//Hide create video meeting button and show Join call button in the screen.
							$('#joinMeetingPanel').hide();
							$('#createMeetingPanel').hide();
							$('#creatingMeetingPanel').hide();
							$('#findingExaminerPanel').hide();
							$('#meetYourExaminerPanel').show();
						}else{
							//Create in case of failure
							$('#joinMeetingPanel').hide();
							$('#createMeetingPanel').show();
							$('#creatingMeetingPanel').hide();
							$('#findingExaminerPanel').hide();
							$('#meetYourExaminerPanel').hide();
						
						}	
				}	 
				}
				,error : function(){
					//Refresh scenario
					//Create in case of failure
					$('#joinMeetingPanel').hide();
					$('#createMeetingPanel').show();
					$('#creatingMeetingPanel').hide();
					$('#findingExaminerPanel').hide();
					$('#meetYourExaminerPanel').hide();
				}
			});
		
	}
	
}
//Not used
function markCandidatePresenceBeforeMeeting(){
	var URL="/IBACC/MockAssessmentAction.do?action=markCandidatePresenceBeforeMeeting";
	var paramsvalue = {};
	paramsvalue["assessmentId"]=mockVar.mockId;
	paramsvalue["orgId"]=mockVar.orgId;
	paramsvalue["candMasterId"]=mockVar.candMasterId;
	paramsvalue["groupId"]=mockVar.groups[mockVar.currentGrp].groupId;
	paramsvalue["groupName"]=mockVar.groups[mockVar.currentGrp].groupName;
	paramsvalue["attemptId"]=mockVar.attemptId;
	
	if(typeof(mockVar.groups[mockVar.currentGrp].candidateOnExaminerGroup)=='undefined'){
	jQuery.ajax({
				url: URL,
				async: false,
				type: 'POST',
				data: paramsvalue,
				dataType: 'json',
				success: function(data) {
				if(examinerPresenceRemote){
					if(data !=null && typeof(data.candidateOnExaminerGroup)!='undefined' && data.candidateOnExaminerGroup=='true'){
						mockVar.groups[mockVar.currentGrp].candidateOnExaminerGroup=data.candidateOnExaminerGroup;
						mockVar.groups[mockVar.currentGrp].meetingId=data.meetingId;
						saveBackUp(false,true);
						$('#joinMeetingPanel').hide();
						$('#createMeetingPanel').hide();
						$('#creatingMeetingPanel').hide();
						$('#findingExaminerPanel').hide();
						$('#meetYourExaminerPanel').show();
					}else{
						//Create in case of failure
					}	
				}	 
				}
				,error : function(){
					//Create in case of failure
				}
			});
		
	}
	
}
// Not used 
function createRemoteMeetingByExaminer(){
	var URL="/IBACC/MockAssessmentAction.do?action=scheduleOnlineMeeting";
	var paramsvalue = {};
	paramsvalue["assessmentId"]=mockVar.mockId;
	paramsvalue["orgId"]=mockVar.orgId;
	paramsvalue["candMasterId"]=mockVar.candMasterId;
	paramsvalue["groupId"]=mockVar.groups[mockVar.currentGrp].groupId;
	paramsvalue["groupName"]=mockVar.groups[mockVar.currentGrp].groupName;
	paramsvalue["waterMarkId"]=sessionStorage.waterMarkId;
	paramsvalue["attemptId"]=mockVar.attemptId;
	paramsvalue["vConBizCustId"]=sessionStorage.getItem("vConBizCustId");
	paramsvalue["assessmentCreatedBy"]=sessionStorage.getItem("assessmentCreatedBy");
	paramsvalue["emailId"]=sessionStorage.getItem("emailId");
	paramsvalue["username"]=sessionStorage.getItem("username");
	paramsvalue["interviewerEmailEg"]=sessionStorage.interviewerEmailEg;
	paramsvalue["interviewerNameEg"]=sessionStorage.interviewerNameEg;
	paramsvalue["interviewerIdEg"]=sessionStorage.interviewerIdEg;
	if(mockVar.groups[mockVar.currentGrp].candidateOnExaminerGroup){
	jQuery.ajax({
				url: URL,
				async: false,
				type: 'POST',
				data: paramsvalue,
				dataType: 'json',
				success: function(data) {
					if(data !=null && data.meetingId!=null && data.meetingURLOfCandidate!='' && data.meetingURLOfExaminer!=''){
						mockVar.groups[mockVar.currentGrp].meetingId=data.meetingId;
						mockVar.groups[mockVar.currentGrp].meetingURLOfCandidate=data.meetingURLOfCandidate;
						mockVar.groups[mockVar.currentGrp].meetingURLOfExaminer=data.meetingURLOfExaminer;
						saveBackUp(false,true);
					}else if(data!=null && data.errorCode!=null && data.errorCode=='E119'){
						window.open("/OnlineAssessment/error.html?E119","_self");
					}
				}
				,error : function(){
					//Create in case of failure
				}
			});
		
	}
	
}
function cancelOrEndVideoMeeting(examinerGroupIdToCancelMeeting){
	
	//This post message implementation will end the meeting in session side
	try{
		let data = {};
		data.message = "end-conference";
		data.type = "end-conference";
		const videoCallFrameWindow = document.getElementById("videoCallFrame").contentWindow;
		videoCallFrameWindow.postMessage(data, '*');
	}catch(e){}
	
	var URL="/IBACC/MockAssessmentAction.do?action=endMeeting";
	var paramsvalue = {};
	var meetingId=(examinerGroupIdToCancelMeeting!=undefined) ? (mockVar.groups[examinerGroupIdToCancelMeeting].meetingId) : mockVar.groups[mockVar.currentGrp].meetingId;
	paramsvalue["assessmentId"]=mockVar.mockId;
	paramsvalue["orgId"]=mockVar.orgId;
	paramsvalue["candMasterId"]=mockVar.candMasterId;
	paramsvalue["attemptId"]=mockVar.attemptId;
	paramsvalue["meetingId"]=meetingId;
	paramsvalue["examinerPresence"]=examinerPresenceRemote?"true":"false";
	paramsvalue["vConBizCustId"]=sessionStorage.getItem("vConBizCustId");
	paramsvalue["assessmentCreatedBy"]=sessionStorage.getItem("assessmentCreatedBy");
	var groupIdofMeeting = (examinerGroupIdToCancelMeeting!=undefined) ? (examinerGroupIdToCancelMeeting) : mockVar.currentGrp;
	if(meetingId!=''){
	jQuery.ajax({
				url: URL,
				async: false,
				type: 'POST',
				data: paramsvalue,
				dataType: 'text',
				success: function(data) {
					mockVar.groups[groupIdofMeeting].meetingEnded=true;
				}
				,error : function(){
					mockVar.groups[groupIdofMeeting].meetingEnded=false;
				}
			});
		
	}
}
function startVideoCall(isExaminer){
$("#pWait").show();
$("#dragcomp").show();
if(!isExaminer){
$(".overlay").show();
$("#videoRecordingOfCandidate").hide();
$("#videoCallFrame").attr("src",mockVar.groups[mockVar.currentGrp].meetingURLOfCandidate);//Load Video call url of candidate
$("#isExaminerCall").val('no');
}
else{
getSecuredMeetingURL();
$("#videoRecordingOfCandidate").hide();
$("#videoCallFrame").attr("src",mockVar.groups[mockVar.currentGrp].meetingURLOfExaminer);//Load Video call url of examiner
$("#isExaminerCall").val('yes');
	$("#pWait").hide();
//Update the details of examiner asynchronously.
}
}
function loadPopUpForExaminerToJoinVideoCall(type){
	if(type=='call'){
			if(firstVisitToExaminerGroup){
			clearTimeout(mockVar.timeCounter);//Stop Time Counter
			firstVisitToExaminerGroup=false;
			cnfPop('joinVideoCallPopup');
			$('#joinVideoCallPopupMsg').html($(globalXmlvar).find('joinVideoCallPopupMsg').text());
			$('.info').html($(globalXmlvar).find('info').text());
			$('.popClose').html($(globalXmlvar).find('close').text());
			$('.Yes').html($(globalXmlvar).find('Yes').text());
			$('.No').html($(globalXmlvar).find('No').text());
			}
		}	
	else if(type=='recording'){
			if(firstVisitToExaminerGroup){
			$("#dragcomp").show();
			$("#videoCallFrame").hide();
			$("#videoRecordingOfCandidate").show();
			$("#videoRecordingOfCandidate").empty();
			firstVisitToExaminerGroup=false;
			examinerRecordingLive=true;
			$("#videoRecordingOfCandidate").html('<span id="videoRecordingStartClickMessage" style="padding-left:10px;">'+$(globalXmlvar).find('videoRecordingStartClickMessageExaminer').text()+'</span><span id="videoRecordingFailureMessage" style="padding:10px;display:none;color:red;">'+$(globalXmlvar).find('videoRecordingFailureMessageExaminer').text()+'</span><br><section class="videoRecordingButtonsPanel" style="padding: 5px;"><button id="start-recording" onclick="startVideoRecording();" class="recordingButtons"><i class="fa fa-video-camera" aria-hidden="true"></i>'+' '+'<span class="start-recording">'+$(globalXmlvar).find('startRecording').text()+'</span></button><button id="stop-recording" disabled onclick="stopVideoRecording(true);" class="recordingButtons"><i class="fa fa-stop" aria-hidden="true"></i>'+' '+$(globalXmlvar).find('stopRecording').text()+'</button></section><div id="videos-container" style="padding:10px;margin-left: auto; margin-right: auto;"></div>');
			launchExaminerGroup(type);
			}	
		}	
}
function launchExaminerGroup(type){
	moveToExam();//Load Questions
	if(type!=undefined && type=='call')
	startVideoCall(true);
}
function getNoOfActiveExaminers(){
	var URL="/IBACC/MockAssessmentAction.do?action=activeInterviewerCount";
	var paramsvalue = {};
	paramsvalue["mockId"]=mockVar.mockId;
	paramsvalue["orgId"]=mockVar.orgId;
	if(mockVar.groups[mockVar.currentGrp].meetingId!=''){
	jQuery.ajax({
				url: URL,
				async: true,
				type: 'POST',
				data: paramsvalue,
				dataType: 'text',
				success: function(count) {
					if(count !=null){
						$('.mwe_examinerNumber').text(parseInt(count));
						if(parseInt(count) <= 0){
							$('#joinMeetingPanel').hide();
							$('#createMeetingPanel').hide();
							$('#creatingMeetingPanel').hide();
							$('#findingExaminerPanel').show();
							$('#meetYourExaminerPanel').hide();
						}else{
							$('#joinMeetingPanel').show();
							$('#createMeetingPanel').hide();
							$('#creatingMeetingPanel').hide();
							$('#findingExaminerPanel').hide();
							$('#meetYourExaminerPanel').hide();
						}
						setTimeout(function(){
						if($('#videoCallFrame').is(":hidden"))
						getNoOfActiveExaminers();
						},30000);
					}	
				}	
				,error : function(){
					getNoOfActiveExaminers();
				}
			});
		}
}
//Method given by UI team for adjusting width of examiner screens according to width
function examinerPanelHeaderWidth() {
	var panelRightSideWidth = $('.mwe_middlePanelHeaderRightSide').width();
	if ( panelRightSideWidth <= 56 ) {
		$('.mwe_middlePanelHeaderLeftSide').removeClass('medium');
		$('.mwe_middlePanelHeaderLeftSide').removeClass('small');
		$('.mwe_middlePanelHeaderLeftSide').addClass('large');
	} else if (panelRightSideWidth <= 72 ) {
		$('.mwe_middlePanelHeaderLeftSide').removeClass('large');
		$('.mwe_middlePanelHeaderLeftSide').removeClass('small');
		$('.mwe_middlePanelHeaderLeftSide').addClass('medium');	
	} else if (panelRightSideWidth <= 90) {
		$('.mwe_middlePanelHeaderLeftSide').removeClass('large');
		$('.mwe_middlePanelHeaderLeftSide').removeClass('medium');
		$('.mwe_middlePanelHeaderLeftSide').addClass('small');		
	}
}
function enableOrDisableSubmitForExaminer(){
	if(isExaminer && (examinerLastGroup == mockVar.currentGrp)){
		$("#finalSubmit").removeAttr("disabled");
		$("#finalSubmitMbl").removeAttr("disabled");
		$("#finalSubmit").attr("title",$(globalXmlvar).find('Submit').text());
	}else{
		$("#finalSubmit").attr("disabled","true");
		$("#finalSubmitMbl").attr("disabled","true");
		if(!allowExaminerToMoveForward)
		$("#finalSubmit").attr("title",((mockVar.groups[mockVar.currentGrp].isEditable == "true") ? $(globalXmlvar).find('AlreadySubmitGroupEditable').text(): $(globalXmlvar).find('AlreadySubmitGroupNonEditable').text()));// depending upon editable config
		else
		$("#finalSubmit").attr("title",$(globalXmlvar).find('UseGroupNavigationToMoveForward').text());// depending upon editable config
	}
}


//Default Values for ScribblePad
var strokeColor = "#333333";
var strokeWidth = 2;
var lastX;
var lastY;
var mousePressed = false;
var canvas = document.getElementById("drawingArea");
var drawing = false;
var mousePos = { x:0, y:0 };
var lastPos = mousePos;


var nVer = navigator.appVersion;
var nAgt = navigator.userAgent;
var browserName = navigator.appName;
var fullVersion = '' + parseFloat(navigator.appVersion);
var canvasClear=true;


if ((verOffset = nAgt.indexOf("MSIE")) != -1) {
    browserName = "Microsoft Internet Explorer";
    fullVersion = nAgt.substring(verOffset + 5);
}

function onLoadScribblePad(){
	
	//Redefining values to original for every question
	strokeColor = "#333333";
	strokeWidth = 2;
	canvasClear=true;
	mousePressed = false;
	var canvas = document.getElementById("drawingArea");
	var mousePos = { x:0, y:0 };
	
        $('.scribble-pad-container .tools').append("<a class='thumbTool thumb-Erase' title='Eraser' href='javascript:void(0); '  data-color='#fff' style='background: " + this + ";'></a> ");
        $('.scribble-pad-container .tools').append("<a class='thumbTool thumb-color' title='Color' href='javascript:void(0); ' style='background: " + this + ";'><span class='color-container colorbox'></span></a> ");
        $('.scribble-pad-container .tools').append("<a class='thumbTool thumb-size' title='Size' href='javascript:void(0); ' style='background: " + this + ";'><span class='size-container'></span></a></a> ");
       
        $.each(['#000', '#0f9d4b', '#f00', '#1d8ccd', '#ff0', '#0f0', '#0ff', '#fff'], function () {
            $('.scribble-pad-container .tools .color-container.colorbox').append("<div class='color-parent'><a href='javascript:void(0) '  data-color='" + this + "' style='width: 20px; background: " + this + ";'></a></div> ");
        });
        $.each([5, 10, 15, 20], function () {
            $('.scribble-pad-container .tools .size-container').append("<a href='javascript:void(0) '  data-size='" + this + "'><p class='dynamicDots' style='width:" + parseInt(this) + "px;height:" + parseInt(this) + "px;'></p></a> ");
        });
        
        $('.thumbTool').on('click', function () {
            $(this).find('span').toggle();
            $(this).siblings('a').find('span').hide();
            $(this).siblings('a').removeClass('selectedTool');
            $(this).addClass('selectedTool');
            if ($(this).hasClass('thumb-Erase')) {
                
            	if (browserName == "Microsoft Internet Explorer") {
                    $('#drawingArea').css('cursor', 'cell');
                }
                else {
                    $('#drawingArea').css('cursor', 'url(images/eraser.png) , auto');
                }
            }
            if ($(this).hasClass('thumb-marker')) {
                if (browserName == "Microsoft Internet Explorer") {
                    $('#drawingArea').css('cursor', 'crosshair');
                }
                else {
                    $('#drawingArea').css('cursor', 'url(images/marker.png) , auto');
                }

            }
            if ($(this).hasClass('thumb-color')) {
                if (browserName == "Microsoft Internet Explorer") {
                    $('#drawingArea').css('cursor', 'crosshair');
                }
                else {
                    $('#drawingArea').css('cursor', 'url(images/marker.png) , auto');
                }
            }
        });
        $('.color-parent').on('click', function (e) {
            $('.color-parent').removeClass('selectedColor');
            $(this).addClass('selectedColor');
            e.preventDefault();
            var all_values,
                data = $(this).children('a').data();
            for (var key in data) {
                all_values = key;
            }
            switch (all_values) {
                case 'color':
                    strokeColor = $(this).children('a').data('color');
                    break;
            }
        });
        $('.size-container a').on('click', function () {
            $('.size-container a').removeClass('selectedColor');
            $(this).addClass('selectedColor');
        });
        $('.thumb-color span a, .thumb-size span a').on('click', function () {
            //$(this).parent('span').fadeOut();
        });
        
        
        $(document).on('click', '.tools a', function (e) {
            e.preventDefault();
            var all_values,
                data = $(this).data();
            for (var key in data) {
                all_values = key;
            }
            switch (all_values) {
                case 'tool':
                	 strokeColor = $('.selectedColor').children('a').data('color');
                	 if(strokeColor==undefined)
 						  strokeColor='#000';
                    break;
                case 'color':
                    strokeColor = $(this).data('color');
                    break;
                case 'size':
                    strokeWidth = $(this).data('size');
                    break;
            }

        });
        
        
        
		
		

		

		$("#drawingArea").mousedown(function (e) {
	        mousePressed = true;
	        DrawToCanvas(e.pageX - $(this).offset().left, e.pageY - $(this).offset().top, false);
	        canvasClear=false;
		});

	    $("#drawingArea").mousemove(function (e) {
	        if (mousePressed) {
	        	DrawToCanvas(e.pageX - $(this).offset().left, e.pageY - $(this).offset().top, true);
	        	canvasClear=false;
			}
	    });

	    $("#drawingArea").mouseup(function (e) {
	        mousePressed = false;
	    });
		    $("#drawingArea").mouseleave(function (e) {
	        mousePressed = false;
	    });
		    

		    canvas.addEventListener("touchstart", function (e) {
		    	mousePos = getTouchPosistion(canvas, e);
		    	var touchPoint = e.touches[0];
		    	var mouseEvent = new MouseEvent("mousedown", {
		    		clientX: touchPoint.clientX,
		    		clientY: touchPoint.clientY
		    	});
		    	canvas.dispatchEvent(mouseEvent);
		    }, false);

		    canvas.addEventListener("touchend", function (e) {
		    	var mouseEvent = new MouseEvent("mouseup", {});
		    	canvas.dispatchEvent(mouseEvent);
		    }, false);

		    canvas.addEventListener("touchmove", function (e) {
		    	var touchPoint = e.touches[0];
		    	var mouseEvent = new MouseEvent("mousemove", {
		    		clientX: touchPoint.clientX,
		    		clientY: touchPoint.clientY
		    	});
		    	canvas.dispatchEvent(mouseEvent);
		    }, false);

		    // Prevent scrolling when touching the canvas
		    $('#drawingArea').bind('touchstart', function(e){e.preventDefault()});
		    $('#drawingArea').bind('touchmove', function(e){e.preventDefault()});
		//    $('#drawingArea').bind('touchend', function(e){e.preventDefault()});
		    
		  //Adjustment Of Canvas For Mobile Device
		    if($(window).width()<768){
		    	$('.scribble-pad-container').css('width','97%');
		    	$('.scribble-pad-container').css('margin','0px 0px 7px 7px');
		    	//$('.scribble-pad-container').css('height',$(window).height());
		        $('#drawingArea').removeAttr('height');
		        $('#drawingArea').css('height',$('.scribble-pad-container').height());
		        $('#drawingArea').removeAttr('width');
		        $('#drawingArea').css('width',$('.scribble-pad-container').width()-40);
		    }
}

function getTouchPosistion(canvasDom, touchEvent) {
	  var rect = canvasDom.getBoundingClientRect();
	  return {
	    x: touchEvent.touches[0].clientX - rect.left,
	    y: touchEvent.touches[0].clientY - rect.top
	  };
	}
function DrawToCanvas(x, y,isDown) {
	var canvas = document.getElementById("drawingArea");
	var ctx = canvas.getContext("2d");
    if (isDown) {
        ctx.beginPath();
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = strokeWidth;
        ctx.lineJoin = "round";
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        ctx.closePath();
        ctx.stroke();
    }
    lastX = x; lastY = y;
}
var clearCanvas = function () {
	var canvas = document.getElementById("drawingArea");
	var ctx = canvas.getContext("2d");
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	//strokeColor = "#333333";
	//strokeWidth = 2;
	$('.thumbTool').removeClass('selectedTool');
	$('.thumb-marker').addClass('selectedTool');
	$('.color-parent').removeClass('selectedColor');
	$('.color-parent').eq(0).addClass('selectedColor');
	$('.size-container a').removeClass('selectedColor');
	$('.size-container a').eq(0).addClass('selectedColor');
	$('.size-container, .color-container').hide();
	canvasClear=true;
};

function saveCanvasContent(){
	var drawing = document.getElementsByClassName('drawingArea'+mockVar.curQuesBean.quesId)[0];
	var returnString="";
	if(mockVar.storeCandResponse==0 && drawing != undefined){
		canvasDataForMock[mockVar.curQuesBean.quesId]=drawing.toDataURL();
		returnString="Drawing Saved";
	}
	else if(drawing != undefined &&  mockVar.storeCandResponse==1){
		var URL="/IBACC/MockAssessmentAction.do?action=saveDrawing";
		var paramsvalue = {};
		paramsvalue["assessmentId"]=mockVar.mockId;
		paramsvalue["orgId"]=mockVar.orgId;
		paramsvalue["candMasterId"]=mockVar.candMasterId;
		paramsvalue["attemptId"]=mockVar.attemptId;
		paramsvalue["imageData"]=drawing.toDataURL();
		paramsvalue["quesId"]=mockVar.curQuesBean.quesId;
		if(paramsvalue["imageData"]!="" && !canvasClear){
		jQuery.ajax({
					url: URL,
					async: false,
					type: 'POST',
					data: paramsvalue,
					//dataType: 'json',
					success: function(data) {
						returnString="Drawing Saved";
					}
					,error : function(){
						returnString="";
					}
				});
		}else{
			returnString="";
		}
	}
	return returnString;
}
function retrieveDrawing(){
	
	if(mockVar.storeCandResponse==1){
		var URL="/IBACC/MockAssessmentAction.do?action=retrieveDrawing";
		var paramsvalue = {};
		paramsvalue["assessmentId"]=mockVar.mockId;
		paramsvalue["orgId"]=mockVar.orgId;
		paramsvalue["candMasterId"]=mockVar.candMasterId;
		paramsvalue["attemptId"]=mockVar.attemptId;
		paramsvalue["quesId"]=mockVar.curQuesBean.quesId;
		jQuery.ajax({
					url: URL,
					async: false,
					type: 'POST',
					data: paramsvalue,
					dataType: 'json',
					success: function(data) {
						if(data!=null && data.imageData!=null && data.imageData!=''){
							canvasClear=false;
							var drawing = document.getElementsByClassName('drawingArea'+mockVar.curQuesBean.quesId)[0];
							var context = drawing.getContext('2d');
							var img = new Image();
					        img.src = data.imageData;
					        img.onload = function (e)
					        {
					            context.drawImage(img, 0, 0);
					        };
							
						}
					}
					,error : function(){
						
					}
				});
		
	}else{
		canvasClear=false;
		var drawing = document.getElementsByClassName('drawingArea'+mockVar.curQuesBean.quesId)[0];
		var context = drawing.getContext('2d');
		var img = new Image();
        img.src = canvasDataForMock[mockVar.curQuesBean.quesId];
        img.onload = function (e)
        {
            context.drawImage(img, 0, 0);
        };
	}
	
	
}
function downloadCandidateUploadedFile(questionId){
	if(isExaminer && mockVar.groups[mockVar.currentGrp].isExaminerGroup!=undefined && !mockVar.groups[mockVar.currentGrp].isExaminerGroup){
			var xmlURL = "/IBACC/MockAssessmentAction.do?action=downloadFileUploadAns&orgId="+mockVar.orgId+"&mockId="+mockVar.mockId+"&candMasterId="+mockVar.candMasterId+"&attemptNo="+mockVar.attemptId+"&keyType=Assessment&questionId="+questionId+"&fileType=candidateUploadedFile&authenticationKeyForFileDownload="+sessionStorage.getItem("authenticationKey");	
			jQuery.ajax({
		    url: xmlURL,
		    async: false,
		    type: 'POST',
		    dataType: 'text',
		    success: function(data) {
				if(data=="successAuth"){		
					window.location="/IBACC/MockAssessmentAction.do?action=downloadFileUploadAns&orgId="+mockVar.orgId+"&mockId="+mockVar.mockId+"&candMasterId="+mockVar.candMasterId+"&attemptNo="+mockVar.attemptId+"&keyType=Assessment&questionId="+questionId+"&fileType=candidateUploadedFile&authenticationKeyForFileDownload="+sessionStorage.getItem("authenticationKey")+"&successFileDownload=true";	
				}else{
					alert("You are not authorised to download this file");
				}
		
				$.ajaxSetup({
				async: true
			});
		    }
			});
	
	}
}
/*function checkMandatoryQues(){
	var str= "";
	str = '<div id="warningMsgDiv" style="background-color:#F5F6CE; border:1px solid #FE9A2E; padding: 0.25%; margin: 1%; font-size: 12px">';
	str += '<table><tr><td style="vertical-align:middle"><img src="images/warning-icon.png" /></td>';
	if(iOAP.secDetails[iOAP.curSection].groupAllQuestions == 'true')
		str += '<td style="text-align: justify;"><div style="margin-left:10px">'+$(globalXmlvar).find('MandatoryQuesMsg7').text();
	else
		str += '<td style="text-align: justify;"><div style="margin-left:10px">'+$(globalXmlvar).find('MandatoryQuesMsg').text();
	str += '</div></td></tr></table></div>';
	if(iOAP.secDetails[iOAP.curSection].groupAllQuestions == 'true'){
		$("#quesAnsContent"+iOAP.secDetails[iOAP.curSection].questions[iOAP.curQues].quesId).prepend(str);
	}else if( mockVar.curQuesBean.comprehensionId != 0 ||mockVar.curQuesBean.laqId != 0){
		for(var j=0;j<mockVar.compreLaqQues.length;j++){
			if(mockVar.compreLaqQues[j].additionalQuesType!="" && mockVar.compreLaqQues[j].quesId == mockVar.curQuesBean.comprehensionId){
				$(".Ans_Area").prepend(str);
				break;
			}
		}
		$("#warning").prepend(str);	
	}else if(mockVar.curQuesBean.quesType=="SA" && (mockVar.curQuesBean.keyboardType =="AudioFile" || mockVar.curQuesBean.keyboardType=="VideoFile")){
		$("#laq_text").prepend(str);
	}
	else
		$("#quesAnsContent").prepend(str);

}*/
function checkQuesMsg(revisit, reEdit, quesMand) {
	var str = "";
	let warningMsg="";
	str = '<div id="warningMsgDiv" style="display: flex; align-items: center;  background-color:#F5F6CE; border:1px solid #FE9A2E; padding: 0.25%; margin: 1%; font-size: 12px">';
	str += '<span style="margin: 10px;"><img src="images/warning-icon.png" /></span>';
	str += '<span >';
	if (quesMand == "true" && revisit == 'false'){
		str += $(globalXmlvar).find('MandatoryQuesMsg9').text();
		warningMsg+=$(globalXmlvar).find('MandatoryQuesMsg9').text();
	}
		
	else if (quesMand == "true" && reEdit == 'false'){
		str += $(globalXmlvar).find('MandatoryQuesMsg10').text();
		warningMsg += $(globalXmlvar).find('MandatoryQuesMsg10').text();
	}
		
	else if (quesMand == "true") {
		if (iOAP.secDetails[iOAP.curSection].groupAllQuestions == 'true'){
			str += $(globalXmlvar).find('MandatoryQuesMsg7').text();
			warningMsg += $(globalXmlvar).find('MandatoryQuesMsg7').text();
		}
			
		else{
			str += $(globalXmlvar).find('MandatoryQuesMsg8').text();
			warningMsg += $(globalXmlvar).find('MandatoryQuesMsg8').text();
		}
			
	} else if (revisit == 'false'){
		str += $(globalXmlvar).find('reVisitMsg').text();
		warningMsg += $(globalXmlvar).find('reVisitMsg').text();
	}
		
	else if (reEdit == 'false'){
		str += $(globalXmlvar).find('reEditMsg').text();
		warningMsg += $(globalXmlvar).find('reEditMsg').text();
	}
		
	str += '</span></div>';
	if (iOAP.secDetails[iOAP.curSection].groupAllQuestions == 'true') {
		$(
				"#quesAnsContent"
						+ iOAP.secDetails[iOAP.curSection].questions[iOAP.curQues].quesId)
				.prepend(str);
	} else if (mockVar.curQuesBean.comprehensionId != 0
			|| mockVar.curQuesBean.laqId != 0) {
		for (var j = 0; j < mockVar.compreLaqQues.length; j++) {
			if (mockVar.compreLaqQues[j].additionalQuesType != ""
					&& mockVar.compreLaqQues[j].quesId == mockVar.curQuesBean.comprehensionId) {
				$(".Ans_Area").prepend(str);
				break;
			}
		}
		$("#warning").prepend(str);
	} else if (mockVar.curQuesBean.quesType == "SA"
			&& (mockVar.curQuesBean.keyboardType == "AudioFile" || mockVar.curQuesBean.keyboardType == "VideoFile")) {
		$("#laq_text").prepend(str);
	} else
		$("#quesAnsContent").prepend(str);
	//announceWarning(warningstrigtoHTML(warningMsg)); commenting for time bein
}

function warningstrigtoHTML(html) {
	  const div = document.createElement("div");
	  div.innerHTML = html;
	  return div.textContent || div.innerText || "";
	}

function fnResizeCanvas(){
	//Adjustment Of Canvas For Mobile Device on rotation
    if($(window).width()<768){
    	$('.scribble-pad-container').css('width','97%');
    	$('.scribble-pad-container').css('margin','0px 0px 7px 7px');
    	//$('.scribble-pad-container').css('height',$(window).height());
        //$('#drawingArea').removeAttr('height');
        $('#drawingArea').css('height',$('.scribble-pad-container').height());
      //  $('#drawingArea').removeAttr('width');
        $('#drawingArea').css('width',$('.scribble-pad-container').width()-40);
    }
}

function getSecuredMeetingURL(){
	var URL="/IBACC/MockAssessmentAction.do?action=getSecuredMeetingURL";
	var paramsvalue = {};
	var meetingId=mockVar.groups[mockVar.currentGrp].meetingId;
	paramsvalue["assessmentOrgId"]=mockVar.orgId;
	paramsvalue["meetingId"]=meetingId;
	paramsvalue["userName"]="IBA_Examiner";
	paramsvalue["userEmail"]="iba_examiner@tcs.com";
	paramsvalue["assessmentCreatedBy"]=sessionStorage.getItem("assessmentCreatedBy");
	paramsvalue["vConBizCustId"]=sessionStorage.getItem("vConBizCustId");
	paramsvalue["assessmentId"]=mockVar.mockId;
	paramsvalue["candMasterId"]=mockVar.candMasterId;
	paramsvalue["groupId"]=mockVar.groups[mockVar.currentGrp].groupId;
	paramsvalue["attemptId"]=mockVar.attemptId;
	paramsvalue["interviewerNameEg"]=sessionStorage.interviewerNameEg;
	paramsvalue["interviewerIdEg"]=sessionStorage.interviewerIdEg;
	if(examinerPresenceRemote && meetingId!='' && meetingId!='0'){
	jQuery.ajax({
				url: URL,
				async: false,
				type: 'POST',
				data: paramsvalue,
				dataType: 'json',
				success: function(data) {
					if(data !=null && data.meetingId!=null && data.videoCallURL!=''){
						mockVar.groups[mockVar.currentGrp].meetingId=data.meetingId;
						if(!isExaminer)
						mockVar.groups[mockVar.currentGrp].meetingURLOfCandidate=data.videoCallURL;
						else
						mockVar.groups[mockVar.currentGrp].meetingURLOfExaminer=data.videoCallURL;
						$("#pWait").hide();
					}else if(data!=null && data.errorCode!=null && data.errorCode=='E119'){
						window.open("/OnlineAssessment/error.html?E119","_self");
					}
				}
				,error : function(){
					$("#pWait").hide();
				}
			});
		
	}
}

//moved to top.js
/*
function timeOutGroupCompre(){ 
	var	compreQuesIndex = '';
	var	laqQuesIndex = '';
	var compreQues="";
	var section = iOAP.secDetails[iOAP.curSection];
	if(mockVar.curQuesBean.comprehensionId !=0){
		compreQuesIndex = mockVar.compreLaqQues.inArray(section.questions[iOAP.curQues].comprehensionId, 'quesId');
		compreQues = mockVar.compreLaqQues[compreQuesIndex].quesId;
	}
	else if(mockVar.curQuesBean.laqId !=0){
		laqQuesIndex = mockVar.compreLaqQues.inArray(section.questions[iOAP.curQues].laqId, 'quesId');
		compreQues = mockVar.compreLaqQues[laqQuesIndex].quesId;
	}
	for(var i=0;i<section.questions.length;i++){
		if(section.questions[i].comprehensionId==compreQues || section.questions[i].laqId==compreQues ){
			
			section.questions[i].maxTimeReached = true;
			section.questions[i].isQuesMandUnanswered = false;
			currentQuestionIndex = i;
			auditlogCreation("","Question Level Timer Exhausted","QuestionTimedOut");
			if(section.questions[i].reVisitQues == "true" || (section.questions[i].reVisitQues == "false" && section.questions[i].flagforReVistQues==true)){
				section.questions[i].flagforReVistQues=false;
				section.secCount = section.secCount+1;
				if(section.secCount==iOAP.secDetails[iOAP.curSection].questions.length)
					mockVar.groups[mockVar.currentGrp].groupCount = mockVar.groups[mockVar.currentGrp].groupCount+1;
				section.questions[i].reVisitQues="false";
			}
		}
		}
}*/
function saveAlphanumericData(content,quesId){
	var returnString="";
	if(mockVar.storeCandResponse==0 && content != undefined){
		alphanumericData[quesId]=content;
		returnString="Content Saved";
	}
	else if(content != undefined &&  mockVar.storeCandResponse==1){
		var URL="/IBACC/MockAssessmentAction.do?action=saveAlphanumericData";
		var paramsvalue = {};
		paramsvalue["assessmentId"]=mockVar.mockId;
		paramsvalue["orgId"]=mockVar.orgId;
		paramsvalue["candMasterId"]=mockVar.candMasterId;
		paramsvalue["attemptId"]=mockVar.attemptId;
		paramsvalue["contentData"]=content;
		paramsvalue["quesId"]=quesId;
		if(paramsvalue["contentData"]!=""){
			jQuery.ajax({
				url: URL,
				async: false,
				type: 'POST',
				data: paramsvalue,
				//dataType: 'json',
				success: function(data) {
					if(data=="success"){
						returnString="Content Saved";
						alphanumericData[quesId]=content;
					}else{//showpopup
						returnString="",isSAFileTypeResponseFailed=true;
						//if(!isFinalSubmitStarted){
							auditlogCreation("saveSATextAsFileFalied","Failed while saving SA",quesId);
						//}
					}
				}
			,error : function(e){
				returnString="",isSAFileTypeResponseFailed=true;
				// auditlog creation
				auditlogCreation("saveSATextAsFileFalied","error while saving SA",quesId,undefined,e.status);
				/*if(!isFinalSubmitStarted){
					
				}*/
			}
			});
		}else{
			returnString="";
		}
	}
	
	return returnString;
}

function retrieveAlphanumericData(quesId){
	var answer = "";
	if(mockVar.storeCandResponse==1){
		if(alphanumericData[quesId]!=undefined)
			answer = alphanumericData[quesId];
		
		var URL="/IBACC/MockAssessmentAction.do?action=retrieveAlphanumericData";
		var paramsvalue = {};
		paramsvalue["assessmentId"]=mockVar.mockId;
		paramsvalue["orgId"]=mockVar.orgId;
		paramsvalue["candMasterId"]=mockVar.candMasterId;
		paramsvalue["attemptId"]=mockVar.attemptId;
		paramsvalue["quesId"]=quesId;
		jQuery.ajax({
					url: URL,
					async: false,
					type: 'POST',
					data: paramsvalue,
					dataType: 'json',
					success: function(data) {
						if(data!=null && data.contentData!=null){
							answer = data.contentData;
							
						}else{
							answer = '';
						}
					}
					,error : function(){
						
					}
				});
		
	}else{
		if(alphanumericData[quesId]!=undefined)
			answer = alphanumericData[quesId];
		else 
			answer = '';
	}
	return answer;
	
}

function attemptSubmittedByExaminer(){
	var URL="/IBACC/MockAssessmentAction.do?action=attemptSubmittedByExaminer";
	var paramsvalue = {}; 
	paramsvalue["assessmentId"]=mockVar.mockId;
	paramsvalue["orgId"]=mockVar.orgId;
	paramsvalue["candMasterId"]=mockVar.candMasterId;
	paramsvalue["attemptId"]=mockVar.attemptId;

	jQuery.ajax({
		url: URL,
		async: true,
		type: 'POST',
		data: paramsvalue,
		dataType: 'text',
		success: function(data) {
			if(data!=null){
				if(data === "success"){
					console.log("status :: "+data);
					cnfPop('backupAlerts');
					hideCloseAndOkayForSecuredAssessments();
					$("#backupAlertMsg").html($(globalXmlvar).find('examinerGroupSubmit').text());
					if($("#dragcomp").is(":visible")) { 
						$("#dragcomp").hide(); 
					}
				} else {
					console.log("status :: "+data);
					setTimeout(function(){
						attemptSubmittedByExaminer();
					},60000);
				}
			}	
		}	
		,error : function(){
			attemptSubmittedByExaminer();
		}
	});
}

var prevAnsStatus = '';
function changeAnsStatus(element,ansStatus,id,grptype){
	if(ansStatus==="Incorrect" && prevAnsStatus!=="Incorrect"){
		incorrectChangeAnsStatus(element);
		countMarks(id,grptype);
	} else if(prevAnsStatus==="Incorrect" && ansStatus!=="Incorrect"){
		$($(element).closest(".schmadiv_que").find(".assignmarks_body input")).removeAttr("disabled");
		$($(element).closest(".schmadiv_que").find(".assignmarks_body select")).removeAttr("disabled");
		$($(element).closest(".schmadiv_que").find(".assignmarks_body textarea")).removeAttr("disabled");
		prevAnsStatus = '';
	} else if(ansStatus==="Incorrect"){
		incorrectChangeAnsStatus(element);
		countMarks(id,grptype);
	}
}

function incorrectChangeAnsStatus(element){
	$($(element).closest(".schmadiv_que").find(".assignmarks_body select")).val('');
	$($(element).closest(".schmadiv_que").find(".assignmarks_body input")).val('0');
	$($(element).closest(".schmadiv_que").find(".assignmarks_body textarea")).val('');
	$($(element).closest(".schmadiv_que").find(".assignmarks_body input")).attr("disabled","disabled");
	$($(element).closest(".schmadiv_que").find(".assignmarks_body select")).attr("disabled","disabled");
	$($(element).closest(".schmadiv_que").find(".assignmarks_body textarea")).attr("disabled","disabled");
	prevAnsStatus = "Incorrect";
}

function validateNumericKey(event,element){
	var status = false;
	if(['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(event.key)){
		status = true;
	} else if((event.key >= '0' && event.key <= '9') || event.key === '.'){
		$($(element).parent().find("select option")).each(function(){
			if( $(this).val().includes($(element).val()+event.key) ){
				status = true;
				return false;
			}
		});
	}
	return status;
}
var confList = [{id: 'accessibilityControlRequired', label: 'Enable Accessibility Settings'},
                {id: 'enableVoiceOver', label: 'Enable Voice Assistance'},{id: 'shortcutMenuRequired', label: 'Enable Shortcut Menu'}];

function fillProofReadingConfigurations(){
	var str='<div class="config-card">';
	str+='<h2 class="config-header">Preview Settings(Optional)</h2><p class="config-desc">Select which features to use when previewing questions. These settings apply only to this preview.</p>';
	str+='<div class="config-tablediv"><table class="config-table">';
	confList.forEach(function(conf) {
	    str += '<tr>';
	    str += '<td class="config-label">' + conf.label + '</td>';
	    str += '<td class="config-options">';
	    str += '<input type="checkbox" id="' + conf.id + '" class="config-checkbox">';
	    str += '</td></tr>';
	    if(conf.id === 'enableVoiceOver'){
	        str += '<tr id="accentRow" style="display:none;"><td style="padding-left:30px;">Choose Accent</td>';
	        str += '<div class="dropdown-checkbox" style="position:relative;display:inline-block;">';
	        str+="<td>"
	        str += '<button type="button" id="accentBtn">Select Accent'
	        str +=  '<span style="position:absolute;right:10px;top:50%;transform:translateY(-50%);">▼</span>'
	        str +=  '</button>';
	        str += '<div id="accentOptions">';
	        str += '<label><input type="checkbox" class="accent" value="en-US"> English (United States)</label><br>';
	        str += '<label><input type="checkbox" class="accent" value="en-GB"> English (United Kingdom)</label><br>';
	        str += '<label><input type="checkbox" class="accent" value="All"> All Browser/Local-Service supported voices</label>';

	        str += '</div></div></td>';
	        str += '</tr>';
	    }
	});str+='</table></div>';
	str+='<div class="proceed-section"> <button id="btnProceed" class="proceed-btn">Preview Questions</button> </div></div>';
	$('#proofReadingConfigs').html(str);
	$('#candidateConsoleId').hide();
	$("#pWait .normalLoader").css({"display":"none"});
	
	$('#btnProceed').on('click',function (){
		$('#proofReadingConfigs').hide();
		$('#candidateConsoleId').show();
		$("#pWait .normalLoader").css({"display":"flex"});
		confList.forEach(function(conf) {
			isEnabled=$('#' + conf.id).prop('checked');
			if(conf.id=='enableVoiceOver' && isEnabled){
				isEnabled="YES";
				mockVar.chooseAccent= $('.accent:checked').map(function () { return this.value;}).get().join(',');
			}
			mockVar[conf.id]=isEnabled;
			sessionStorage.setItem(conf.id,isEnabled);
		});
		setTimeout(function(){
			if(sessionStorage.screenMagnifierControlRequired=="true" || sessionStorage.accessibilityControlRequired=="true"){
				loadAccessibilityScripts();
			}
			if(sessionStorage.shortcutMenuRequired == "true" && !isMac){
				$(".viewShortCutsDiv").show();
			}
			validateQuizPageUrl(true);
			$('#pWait').hide();},500);
		//need to set the params As yes.
	});
	$(document).on('change', '#enableVoiceOver', function () {
	    $('#accentRow').toggle(this.checked);
	});
	$(document).on("click", "#accentBtn", function (e) {
	    e.stopPropagation();
	    $("#accentOptions").toggle();
	});

	$(document).on("click", function () {
	    $("#accentOptions").hide();
	});

	$(document).on("click", "#accentOptions", function (e) {
	    e.stopPropagation();
	});
	$(document).on("change", ".accent", function () {

	    var selectedTexts = $(".accent:checked")
	        .map(function () {
	            return $(this).parent().text().trim();
	        })
	        .get();

	    $("#accentBtn").html(
	        (selectedTexts.length ? selectedTexts.join(", ") : "Select Accent") +
	        '<span style="position:absolute;right:10px;top:50%;transform:translateY(-50%);">▼</span>'
	    );
	});
}
function loadAccessibilityScripts() {

        ["js/html-magnifier.js?v=" + jsVersion,
            "js/mouseTrail.js?v=" + jsVersion,
            "js/screenMagnifier-AccessibilityTools.js?v=" + jsVersion
        ].forEach(function(src) {
            var script = document.createElement("script");
            script.src = src;
            script.type = "text/javascript";
            document.body.appendChild(script);
        });
        var css = document.createElement("link");
        css.rel = "stylesheet";
        css.type = "text/css";
        css.href = "css/magnifier-accessibility.css?v=" + jsVersion;
        document.head.appendChild(css);
}