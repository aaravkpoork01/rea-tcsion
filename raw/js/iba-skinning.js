var examLabInstruContent = '<div class="examlabInstru">'+
'<p class="instructParaElement">'+
	'<span class="txtNum">1.</span> <span class="txtEle">Total'+
	' duration of examination is <span class="completeDuration"></span> minutes.</span>'+
'</p>'+
'<p class="instructParaElement">'+
	'<span class="txtNum">2.</span> <span class="txtEle">The clock'+
	 ' will be set at the server. The countdown timer in the top right'+
		' corner of screen will display the remaining time available for you'+
		' to complete the examination.</span>'+
'</p>'+

'<p class="instructParaElement">'+
	'<span class="txtNum">3.</span> <span class="txtEle">The'+
		' Question Palette displayed on the right side of screen will show the'+
		' status of each question using one of the following symbols:</span>'+
' </p>'+

' <ul class="definedTypeLabels">'+
	' <li>'+
		'<div class="answeredIcon">&nbsp;</div> <span>Answered</span>'+
	'</li>'+
	'<li>'+
		'<div class="notAnsweredIcon">&nbsp;</div> <span>Not Answered</span>'+
	'</li>'+
	'<li>'+
		'<div class="markedforReviewIcon">&nbsp;</div> <span>Marked'+
			' for Review</span>'+
	'</li>'+
	'<li>'+
		'<div class="notVisitedIcon">&nbsp;</div> <span>Not Visited</span>'+
	'</li>'+
'</ul>'+

'<p class="instructParaElement">'+
	'<span class="txtNum">4.</span> <span class="txtEle">The Marked'+
		' for Review status for a question simply indicates that you would'+
		' like to look at that question again. If a question is answered and'+
		' Marked for Review, your answer for that question will be considered'+
		' in the evaluation.</span>'+
' </p>'+

' <div class="instructionsStudentBlk">'+
	' <h1 class="instructionsStudentH1">Instructions for Student</h1>'+

	' <p class="instructParaElement">'+
		' <span class="txtNum">1.</span> <span class="txtEle">Total'+
			' duration of examination is @@Test Duration@@ minutes.</span>'+
	'</p>'+

	'<p class="instructParaElement">'+
		'<span class="txtNum">2.</span> <span class="txtEle">The clock'+
			' will be set at the server. The countdown timer in the top right'+
			' corner of screen will display the remaining time available for you'+
			' to complete the examination.</span>'+
	'</p>'+

	'<p class="instructParaElement">'+
		'<span class="txtNum">3.</span> <span class="txtEle">The'+
		' Question Palette displayed on the right side of screen will show'+
			' the status of each question using one of the following symbols:</span>'+
	'</p>'+

	'<p class="instructParaElement">'+
		'<span class="txtNum">4.</span> <span class="txtEle">The'+
			' Marked for Review status for a question simply indicates that you'+
			' would like to look at that question again. If a question is'+
			' answered and Marked for Review, your answer for that question will'+
			' be considered in the evaluation.</span>'+
	'</p>'+
'</div>'+
'</div>';

let styleforExamlab;
let iLearnStyleMarkforReview;
let ilearnStylePrevBtn;

$(function(){
	$(document).ready(function () {
		if(document.URL.indexOf("instructions.html")>-1){
			var deviceBodyHeight = $(window).height();
			var screenWidth = "100";
			var screenHeight = deviceBodyHeight;
			$('#container').css({ 'width': screenWidth + '%', 'height': screenHeight + 'px' });
            if($(window).width() < 767){
            	var commanHeaderHeight = $('.commanHeaderPatch').innerHeight() - 200;
            }
            else var commanHeaderHeight = $('.commanHeaderPatch').innerHeight() - 180;
			var deviceHeight = $('#container').innerHeight();
			var instructionAgree = $('.instructionToAccept').innerHeight();
			var instructionsHeading = $('#instruction').innerHeight();
			var addingAllComponents = (commanHeaderHeight + instructionAgree) + instructionsHeading;
			var oveflowHeight = (deviceHeight - addingAllComponents) - 30;
			$('#commonPageInstruction').css({ 'max-height': oveflowHeight + 'px' });
		}else if(document.URL.indexOf("quiz.html")>-1){
			var deviceBodyHeight = $(window).height();
			var screenWidth = "100";
			var screenHeight = deviceBodyHeight;
			$('#minwidth,#wrapper').css({ 'width': screenWidth + '%', 'height': screenHeight + 'px' });

			var groupActions = $('.buttons-div.btntab').innerHeight();
			var deviceHeight = $('#minwidth').innerHeight();
			var commanHeaderHeight = $('.commanHeaderPatch').innerHeight() - 180;
			// console.log(groupActions)
			var groupSection = $('#questionContent .groupSectionPlaceholder').innerHeight();
			// console.log(groupSection)
			var addingAllQuestionLevel = (commanHeaderHeight + groupActions) + groupSection;
			// console.log(addingAllQuestionLevel)
			var oveflowHeightQuestion = (deviceHeight - addingAllQuestionLevel) - 30;
			$('#currentQues').css({ 'height': (oveflowHeightQuestion -10) + 'px' });
			$("#groupInstructionContextOverflow").css("height",(deviceBodyHeight - 30)-($(".subjectdetailsAreaInside").innerHeight()+$(".instructionsH1").innerHeight())+"px");
			$("#candidateConsoleId").css("height",(deviceBodyHeight) - $(".subjectdetailsAreaInside").innerHeight());
			$('.userName1').text(sessionStorage.username);
	/*		$('.candId1').text(sessionStorage.candidate_Id); */
			$('.candId1').text(sessionStorage.roll_number);
			 try{
				 $('<div class="commanPopupModal profilePopup" id="profilePopupId" tabindex="-1" role="dialog" aria-labelledby="profileNameId" style="display: none;">'+
				  '<div class="commanmodal-dialog" role="document">'+
							'<div class="commanmodal-content">'+
								'<div class="profilePopupBody">'+
									'<div class="profileImgDiv">'+
										'<img class="profileImageCandExlab" alt="profile Image">'+
									'</div>'+
									'<h1 id="profileNameId">'+sessionStorage.username+'</h1>'+
									'<h1 id="profileRollId">'+sessionStorage.roll_number+'</h1>'+
									/*'<h2 id="profileCandId">'+sessionStorage.candidate_Id+'</h2>'+*/
								'</div>'+

							'</div>'+
						'</div>'+
					'</div>').insertAfter("#revisitPopup");
				 $(document).on('click', '.userProfileBtnAction', function () {
				        $('#profilePopupId').fadeIn();

				    });

				    $('.commanPopupModal.profilePopup').on('click',function(e){
				        var _ths = $('.commanPopupModal.profilePopup').find('.commanmodal-content');
				        if (!_ths.is(e.target) && _ths.has(e.target).length === 0) {
				            $('.commanPopupModal').fadeOut();
				        }
				    });
				    
				$(document).on('click', '#mobMoreOptionsBtnAction, #mobMoreOptionsBtnActionGrp',function(e){
					mobMoreOptionsBtnAction($(this).parent());	 
					//toggleMoreActionBtn();
				    });
				
				$(document).on('click', '.mobSnackCloseEle, .overlayPartMob',function(e){
					mobSnackCloseEle();	 
					//toggleMoreActionBtn();
				    });
				
				$(document).on('click', '.markforreviewIlearn',function(e){
					mobSnackCloseEle();	 
					

			    });
				
				$(document).on('click', '#prevBtnIlearn',function(e){
					$('#previousBtnMbl').click();
					

			    });
				$(document).on('click', '#prevBtnGrpIlearn',function(e){
					$('#previousBtnGroupMbl').click();
					

			    });
				
				$(document).on('click', '.groupHeadClickIlearn',function(e){
					groupHeadClickIlearn($('.groupHeadClickIlearn #groupbox2id'));
					

			    });
			
			   
			   $(document).on('click', '.grouplistItemsDropDown',function(e){
				   grouplistItemsDropDown($('#number-of-ques-answered'));    
				   //toggleQuesPallet();
					});
			 }catch(e){
				 console.log(e);
			 }
			  styleforExamlab = document.createElement('style'); //sreejith: this style was hardcoded in the css file, removed it from there and adding dynamically as previous button is present in ilearn(not present in examLab : tab) 
			 styleforExamlab.textContent=`
			 #previousBtnMbl,#previousBtnGroupMbl{
					display:none !important;
			 } 
			 `;
			 document.head.appendChild(styleforExamlab);
			 
			 if ($(window).width() < 767){
				 if(styleforExamlab){
					 styleforExamlab.remove();
					 styleforExamlab=null;
				 }
				 mockLabels.savenext='Next';
				 iLearnStyleMarkforReview=document.createElement('style');
				  iLearnStyleMarkforReview.textContent=`
				  #underreviewMbl, #underreviewGrpMb1{
							display:none !important;
					 } 
					 `;
					 document.head.appendChild(iLearnStyleMarkforReview);
				 
				//$('#underreviewMbl').hide();
				$('#underreviewMbl, #underreviewGrpMb1').addClass('markforreviewIlearn');
				$('.groupHeadExamLab').addClass('groupHeadClickIlearn');
				$('#number-of-ques-answered').hide();
				$('.buttons-div.btntab').css('height','80px');
				$('.buttons-div.btntab').css('align-content','center');
				$('.mob_save').css('position','relative');
				$('.mob_save').css('bottom','unset');
				$('.mob_save').css('background-color','initial');
				
				$("#groupInstructionContextOverflow").css("height",deviceBodyHeight-($(".subjectdetailsAreaInside").outerHeight()+$(".instructionsH1").outerHeight(true)+85)+"px");


				
			 }
		}
	});
	$(document).off('click',".swiper");
	if(document.URL.indexOf("instructions.html")>=0){
		$('#secondPagep2,.btnsection:has(#readylinkButton)').wrapAll('<div class="instructionToAccept"></div>');
		$('.instructionToAccept').detach().insertAfter("#mainright");
	}
	if(document.URL.indexOf("quiz.html")>=0){
		$('<div id="number-of-ques-answered" class="groupingListItems"> '+
				'<button class="groupItemSelected allItems" data-value="allItems">'+
					'<em class="listIcon allQuestionIcon"></em>'+
					'<em class="conTxt emNormal skinningAll">All</em>'+
					'<em class="countTxt emNormal">(20)</em>'+
				'</button>'+
				'<button class="answeredItems" data-value="answeredItems" >'+
					'<em class="listIcon answeredIcon"></em>'+
					'<em class="conTxt emNormal skinningAnswered">Answered</em>'+
					'<em class="countTxt emNormal"></em>'+
				'</button>'+
				'<button class="notAnsweredItems" data-value="notAnsweredItems" >'+
					'<em class="listIcon notAnsweredIcon"></em>'+
					'<em class="conTxt emNormal skinningNotAnswered">Not Answered</em>'+
					'<em class="countTxt emNormal"></em>'+
				'</button>'+
				'<button class="markedforReviewButton" data-value="markedforReviewItems" >'+
					'<em class="listIcon markedforReviewIcon"></em>'+
					'<em class="conTxt emNormal skinningForReview">For Review</em>'+
					'<em class="countTxt emNormal"></em>'+
				'</button>'+
				'<button class="notVisitedItems" data-value="notVisitedItems">'+
					'<em class="listIcon notVisitedIcon"></em>'+
					'<em class="conTxt emNormal skinningNotVisited">Not Visited</em>'+
					'<em class="countTxt emNormal">(19)</em>'+
				'</button> </div>').insertAfter('.save_buttoncontainer_2');
		$('#wrapper').prepend(' <div class="commanPopupModal  submitGroupPopup" id="submitGroupPopup1" tabindex="-1" role="dialog" aria-labelledby="submitGroupPopup" style="display: none;">'+
				'<div class="commanmodal-dialog" role="document">'+
                '<div class="commanmodal-content">'+
                    '<div class="commanmodal-body">'+
                        '<span class="bookImage animated zoomInDown"></span>'+
                        '<div class="confirmationText">'+
                            '<h2 class="groupNameLabel" id="groupNameLabelid"></h2>'+
                                '<div class="timerwrapper">'+
                                    '<span class="timerLabel">'+$(globalXmlvar).find('TimeLeft').text()+'</span>'+
                                    '<div class="timerContainer" role="timer" tabindex="0" id="timer_div1">'+
                                        '<em class="timeimg"></em>'+
                                        '<div class="hrs timeBlk">'+
                                            '<span class="timerUpdate">'+
                                                '<span id="m02_hrs" class="paperHrs">00</span>'+
                                                '<span>:</span>'+
                                            '</span>'+

                                            '<span class="sanssB skinningHrs">'+$(globalXmlvar).find('hrs').text()+'</span>'+
                                        '</div>'+
                                        '<div class="hrs timeBlk">'+
                                            '<span class="timerUpdate">'+
                                                '<span id="min1_val" class="paperMins">08</span>'+
                                                '<span>:</span></span>'+
                                            '<span class="timerStatic skinningMin">'+$(globalXmlvar).find('min').text()+'</span>'+
                                        '</div>'+
                                        '<div class="hrs timeBlk">'+
                                            '<span class="timerUpdate">'+
                                                '<span id="sec02_val" class="paperSecs">25</span>'+
                                            '</span>'+
                                            '<span class="timerStatic skinningSec">'+$(globalXmlvar).find('sec').text()+'</span>'+
                                        '</div>'+
                                    '</div>'+
                                '</div>'+

                                '<span class="TotalQuesDetails"><span class="TotalQuesText">Total Questions</span>'+
                                    ': <span class="quesCount" id="groupQuesCountid"></span>'+
                                '</span>'+
                                '<div class="cardContainer">'+
                                    '<div class="card greenCard groupAnsweQuesCountId">'+
                                        '<span class="quesCount" id="groupAnsweQuesCountId"></span>'+
                                        '<span class="cardLabel skinningAnswered">'+$(globalXmlvar).find('Answered').text()+'</span>'+
                                    '</div>'+
                                    '<div class="card redCard groupNotAnsweQuesCountId">'+
                                        '<span class="quesCount" id="groupNotAnsweQuesCountId"></span>'+
                                        '<span class="cardLabel skinningNotAnswered">'+$(globalXmlvar).find('NotAnswered').text()+'</span>'+
                                    '</div>'+
                                    '<div class="card yellowcard groupMarkQuesCountId">'+
                                        '<span class="quesCount" id="groupMarkQuesCountId"></span>'+
                                        '<span class="cardLabel skinningMarked">'+$(globalXmlvar).find('Marked').text()+'</span>'+
                                    '</div>'+
                                    '<div class="card yellowcard keyStrokeCountId">'+
                                    	'<span class="quesCount" id="keyStrokeCountId"></span>'+
                                    	'<span class="cardLabel">Gross KeyStrokes Count</span>'+
                                    '</div>'+
                                    '<div class="card greenCard elapsedTimeId">'+
                                    	'<span class="quesCount" id="elapsedTimeId"></span>'+
                                    	'<span class="cardLabel">Elapsed Time (In Mins)</span>'+
                                    '</div>'+
                                '</div>'+
                                '<div class="confirmationMessage confMsg" aria-label="confirmation message">'+$(globalXmlvar).find('confMessage').text()+
                                    '?'+
                                '</div>'+
                        '</div>'+
                    '</div>'+
                    '<div class="commanmodal-footer">'+
                        '<button type="button" class="primaryBorderBtnClr closeComman skinningNo" onclick = "submitGroupNo();">'+$(globalXmlvar).find('No').text()+'</button>'+
                        '<button type="button" class="primaryBtnClr submitGroupYesPopup skinningYes" id="group_2_attempt" onclick = "submitGroupYes();">'+$(globalXmlvar).find('Yes').text()+'</button>'+
                    '</div>'+
                '</div>'+
            '</div>'+
        '</div>');
		var summaryPopup = '<div class="commanPopupModal  viewExamSummaryPopup" id="viewExamSummaryPopup" tabindex="-1" role="dialog" aria-labelledby="confirmProceedPopup" style="display: none;">'+
								'<div class="commanmodal-dialog" role="document">'+
									'<div class="commanmodal-content">'+
										'<div class="commanmodal-body">'+
											'<span class="bookImage animated zoomInDown"></span>'+
											'<div class="confirmationText">'+
											/*	'<h4>You have successfully </h4>'+*/
												'<h3 class="completeMsg">'+$(globalXmlvar).find('completedExamMessage').text()+'</h3>'+
											'</div>'+
										'</div>'+
									'<div class="commanmodal-footer">'+
										'<button type="button" class="primaryBtnClr viewExamSummaryAction" onclick=showOverallGroupSummary();>'+$(globalXmlvar).find('viewExamSummary').text()+'</button>'+
									'</div>'+
								'</div>'+
							'</div>'+
						'</div>';
		$('#wrapper').prepend(summaryPopup);
		/*$('.savenext').remove();

		$('.savenext').detach().insertAfter("#other_buttoncontainer");
		$('.other_buttoncontainer')
				.append(
						'<input type="button" style="margin-left: 5px; line-height: 33px;" id="savenext" onclick="revisitCheck(\'NEXT\')" class="normalBtn tempBtnClass btn btn-primary-save btnEnabled auditlog savenext" value="Save &amp; Next" title="Save &amp; Next">');
		*/$('#previousBtn').hide();
		$(".mob_save .save_buttoncontainer").append('<div class="paperSkipContainter"> <input type="button" tabindex="0" class="btn btn-primary auditlog skipbtn" onclick="skipQuestion()" id="skipMbl" value="Skip"></div>');
		$('#savenextMbl,#savenextGroupMbl').wrapAll('<div class="paperSaveContainer"></div>');
		$('.paperSaveContainer').detach().appendTo(".mob_save .save_buttoncontainer");
		$('#finalSubmitMbl').wrapAll('<div class="paperSubmitContainer"></div>');
		$('.paperSubmitContainer').detach().appendTo(".mob_save .save_buttoncontainer");
		$(function(){
			if(typeof($(".candidateImg").attr("src")) == "undefined" || $(".candidateImg").attr("src") == undefined ){
				 $(".profileDetailsCricle button.userProfileBtn").addClass("defaultImage");
			     $(".profileDetailsCricle button.userProfileBtn").css("background","");
			}else{
				$("<img>").attr("src",$(".candidateImg").attr("src")).on("error",function(){
				    $(".profileDetailsCricle button.userProfileBtn").addClass("defaultImage");
				     $(".profileDetailsCricle button.userProfileBtn").css("background","");
				    
				}).on("load",function(){
				    $(".profileDetailsCricle button.userProfileBtn").removeClass("defaultImage");
				    $(".profileDetailsCricle button.userProfileBtn").css({"background-image":"url("+$(".candidateImg").attr("src")+")","background-size":"cover","background-position":"center","background-repeat":"no-repeat"});
				});
			}
           });
	}
});

window.addEventListener('startCounterFunctionEnded',function(){
	//console.log(timeToBeDisplayed);
	if(mockVar.timeFormat=='MM:SS'){
		$(".hrsDiv").hide();
		$(".paperMins").html(timeToBeDisplayed.split(":")[0]);
		$(".paperSecs").html(timeToBeDisplayed.split(":")[1]);
	}
	else if(mockVar.timeFormat=='HH:MM:SS'){
		$(".paperHrs").html(timeToBeDisplayed.split(":")[0]);
		$(".paperMins").html(timeToBeDisplayed.split(":")[1]);
		$(".paperSecs").html(timeToBeDisplayed.split(":")[2]);
	}
	else if(mockVar.timeFormat=='HH:MM'){
		$(".secsDiv").hide();
		$(".paperHrs").html(timeToBeDisplayed.split(":")[0]);
		$(".paperMins").html(timeToBeDisplayed.split(":")[1]);
	}
});

$(window).resize(function() {
	if(mockVar.examOverview==1)
	$('.buttons-div.btntab').hide();
});

function addskinningtoFITBQues(){
	$('.BlankSA.FITBQuestionList textarea').attr({
	    'style': 
	             'border-radius: unset !important;' +
	             'height: unset !important;' +
	             'max-height: unset !important;' +
	             'min-height: unset !important;' +
	             'background: none !important;' +
	             'overflow: hidden !important;' +
	             'max-width: 140px !important;' +
	             'border: none !important;' +
	             'border-bottom: 1px solid #d9dce1 !important;' +
	             'display: inline-block;'+
	             'resize: none !important;',
	    'rows': '1',
	    'cols': '1'
	});
}


function addLabelsForSkinning(){
	if ($(window).width() < 767){   // add these labels later in the lang xmls // also add condition for 767 i.e ilearn/myclass
		 mockLabels.savenext='Next';
		 mockLabels.btnSaveNext='Next';
		 mockLabels.previous='';
		 mockLabels.nextQ='Next';
		 mockLabels.btnSave='Next';
	}
}

function setStyleForSkinningUI(){
	//$('.previousBtn, .previousBtnGroup').attr('style','padding: 3px;background-color: #eaf4fc !important; width:48px !important; height: 48px !important; display: inline-block;border: none;border-radius: 50px;');
	
	if ($(window).width() < 767){
		 mockLabels.savenext='Next';
		 mockLabels.btnSaveNext='Next';
		 mockLabels.previous='';
		 $('#savenextMbl').val(mockLabels.savenext);
		 $('.previousBtn').val(mockLabels.previous);
		 $('.previousBtnGroup').val(mockLabels.previous);
	ilearnStylePrevBtn = document.createElement('style'); 
	ilearnStylePrevBtn.textContent=`
	#previousBtnMbl,#previousBtnGroupMbl{
		background-color: #eaf4fc !important;
	    width: 48px !important;
	    height: 48px !important;
	    border: none !important;
	    border-radius: 50px !important;
	    padding: 3px !important;
	} 
	.save_buttoncontainer_prev{
		position:relative;
	}
	 `;
	 document.head.appendChild(ilearnStylePrevBtn);
	}
}
window.addEventListener('fillQuesContentEnded',function(){
	$('.groupSectionPlaceholder').show();
	setStyleForSkinningUI();	
});

window.addEventListener('addLabelsLoadLabelsEnded',function(){
	addLabelsForSkinning();	
});

window.addEventListener('addskinningtoFITBQues',function(){
	addskinningtoFITBQues();	
});



window.addEventListener('fillNumberPanelFunctionEnded',function(){
	//console.log(timeToBeDisplayed);
	 $('.groupingListItems .allItems .countTxt').text('(' + iOAP.secDetails[iOAP.curSection].questions.length + ')');
	if(iOAP.secDetails[iOAP.curSection].answered>0){
		 $('.groupingListItems .answeredItems .countTxt').text('(' + iOAP.secDetails[iOAP.curSection].answered + ')');
        // $('.groupingListItems .answeredItems').attr('disabled', false);
	}else{
		$('.groupingListItems .answeredItems .countTxt').text('(0)');
       // $('.groupingListItems .answeredItems').attr('disabled', true);
	}
	if(iOAP.secDetails[iOAP.curSection].notanswered>0){
		$('.groupingListItems .notAnsweredItems .countTxt').text('(' + iOAP.secDetails[iOAP.curSection].notanswered + ')');
       // $('.groupingListItems .notAnsweredItems').attr('disabled', false);
	}else{
		  $('.groupingListItems .notAnsweredItems .countTxt').text('(0)');
         // $('.groupingListItems .notAnsweredItems').attr('disabled', true);
	}
	if(iOAP.secDetails[iOAP.curSection].marked>0 || iOAP.secDetails[iOAP.curSection].markedAndAnswered>0){
		$('.groupingListItems .markedforReviewButton .countTxt').text('(' +( iOAP.secDetails[iOAP.curSection].markedAndAnswered + iOAP.secDetails[iOAP.curSection].marked)+ ')');
       // $('.groupingListItems .markedforReviewButton').attr('disabled', false);
	}else{
		 $('.groupingListItems .markedforReviewButton .countTxt').html('(0)');
        // $('.groupingListItems .markedforReviewButton').attr('disabled', true);
	}
	/*if(iOAP.secDetails[iOAP.curSection].markedAndAnswered){
		$('.groupingListItems .notVisitedItems .countTxt').text('(' + iOAP.secDetails[iOAP.curSection].answered + ')');
        $('.groupingListItems .notVisitedItems').attr('disabled', false);
	}*/

	var noOfQuestions1 = iOAP.secDetails[iOAP.curSection].questions.length;
	var notAttemptedQuestions1 = noOfQuestions1  - iOAP.secDetails[iOAP.curSection].answered - iOAP.secDetails[iOAP.curSection].notanswered - iOAP.secDetails[iOAP.curSection].marked - iOAP.secDetails[iOAP.curSection].markedAndAnswered;
	if(notAttemptedQuestions1>0){
		 $('.groupingListItems .notVisitedItems .countTxt').text('(' + notAttemptedQuestions1 + ')');
        // $('.groupingListItems .notVisitedItems').attr('disabled', false);
	}else{
		$('.groupingListItems .notVisitedItems .countTxt').text('');
      //  $('.groupingListItems .notVisitedItems').attr('disabled', true);
	}
	/*$("label:has(.MCQanswer:checked),label:has(.MSQanswer:checked)").css({
		'border-color': '#00c36f',
	    'background': '#eafff6',
	    'transition': 'all 0.4s ease-in-out'
	});*/

	/*$("label:has(.MSQanswer:checked),span:has(.MSQanswer:checked),.MSQanswer:checked").css({
	    'border-radius': '0px'
	});*/
	$("label:has(.labelForOptText)").css({
	    'border': '1px solid #d9dce1',
	    'padding': '13px 15px 13px 15px',
	    'border-radius': '8px',
	    'margin-bottom': '15px',
	    'min-width': '350px',
	    'cursor': 'pointer'
	});
	/*$("span:has(.MCQanswer:checked),span:has(.MSQanswer:checked)").css({
	    'background': '#00c36f',
	    'border-radius': '15px',
	    'height': '15px',
	    'margin-right': '5px'
	});*/
	var deviceBodyHeight = $(window).height();
	var screenWidth = "100";
	var screenHeight = deviceBodyHeight;
	$('#minwidth,#wrapper').css({ 'width': screenWidth + '%', 'height': screenHeight + 'px' });

	var groupActions = $('.buttons-div.btntab').innerHeight();
	var deviceHeight = $('#minwidth').innerHeight();
	var commanHeaderHeight = $('.commanHeaderPatch').innerHeight() - 180;
	// console.log(groupActions)
	var groupSection = $('#questionContent .groupSectionPlaceholder').innerHeight();
	// console.log(groupSection)
	var addingAllQuestionLevel = (commanHeaderHeight + groupActions) + groupSection;
	// console.log(addingAllQuestionLevel)
	var oveflowHeightQuestion = (deviceHeight - addingAllQuestionLevel) - 30;
	if ($(window).width() < 767){
		$('.groupSectionPlaceholder').show();
		$('#divHeader_id').prependTo($('#currentQues'));
          setTimeout(function(){
	            $('#currentQues').css({ 'height': (deviceHeight-($('.commanHeaderPatch').innerHeight()+groupActions)+140) + 'px' });
	            $('#currentQues').css('max-height','unset');		
	            if(mockVar.curQuesBean.laqId==0 && mockVar.curQuesBean.comprehensionId==0)
		              $("#quesAnsContent").css({'height':  ($("#currentQues").innerHeight()-40-$(".divHeader").innerHeight()-30) +'px'});
	            else
		              $("#quesOuterDiv").css({'height':  ($("#currentQues").innerHeight() - ( $(".questionSwiperPannel").innerHeight() + 70)) +'px'});
		                       },100)	
	}
	else{
	var currentQuesHeight = oveflowHeightQuestion -10;
	$('#currentQues').css({ 'height': currentQuesHeight + 'px' });
	var ansHeight = currentQuesHeight - ($(".divHeader").innerHeight() + $(".questionSwiperPannel").innerHeight() + 70);
	if(mockVar.curQuesBean.laqId==0 && mockVar.curQuesBean.comprehensionId==0)
		$("#quesAnsContent").css({'height':  ansHeight +'px'});
	else
		$("#quesOuterDiv").css({'height':  ($("#currentQues").innerHeight() - ( $(".questionSwiperPannel").innerHeight() + 70)) +'px'});
	}
	});
$(document).on('click','.sectionChangeExamLab',function(event){

		if(!$(this).hasClass("mandatoryClass") ||(mockVar.groups[mockVar.currentGrp].secDetails[iOAP.curSection].isOptional== "true" && !mockVar.groups[mockVar.currentGrp].secDetails[iOAP.curSection].isSelected)){
			if(event.target.type!="checkbox"){
	
			if(this.id.split("sectionId")[1]!=iOAP.curSection){
				//clearTimeOut(mockVar.timeCounterForOptional);
				if(!iOAP.secDetails[this.id.split("sectionId")[1]].isDiabledForOptionalSection){
				if(mockVar.groups[mockVar.currentGrp].secDetails[iOAP.curSection].movetonext==null || mockVar.groups[mockVar.currentGrp].secDetails[iOAP.curSection].movetonext== true){
				if((iOAP.secDetails[iOAP.curSection].groupAllQuestions == "true" && checkMandatory())||(iOAP.secDetails[iOAP.curSection].groupAllQuestions == "false")){
				if(iOAP.secDetails[this.id.split("sectionId")[1]].secCount==null || typeof(iOAP.secDetails[this.id.split("sectionId")[1]].secCount)=="undefined" || isNaN(iOAP.secDetails[this.id.split("sectionId")[1]].secCount)){
					secNavigation=true;
					sectionToNavigate=this.id.split("sectionId")[1];
					changeSection(this.id.split("sectionId")[1]);
					secNavigation=false;
					sectionToNavigate=0;
					}
				else if(iOAP.secDetails[this.id.split("sectionId")[1]].secCount!=iOAP.secDetails[this.id.split("sectionId")[1]].questions.length){
					secNavigation=true;
					sectionToNavigate=this.id.split("sectionId")[1];
					changeSection(this.id.split("sectionId")[1]);
					secNavigation=false;
					sectionToNavigate=0;
					}
				else if(iOAP.secDetails[this.id.split("sectionId")[1]].secCount==iOAP.secDetails[this.id.split("sectionId")[1]].questions.length){
					/*
					 * if(iOAP.secDetails[iOAP.curSection].autoSave!=null &&
					 * typeof(iOAP.secDetails[iOAP.curSection].autoSave)!="undefined" &&
					 * iOAP.secDetails[iOAP.curSection].autoSave == "true"){
					 */
						saveQuestionAutomatically();
					/* } */
					eventBlock(event);
					showRevisitNotAllowedPop("Section");
				}
				}else{
					eventBlock(event);
				}
				}
			}}
		}
		}else if((mockVar.groups[mockVar.currentGrp].secDetails[iOAP.curSection].isOptional== "false") || (mockVar.groups[mockVar.currentGrp].secDetails[iOAP.curSection].isOptional== "true" && mockVar.groups[mockVar.currentGrp].secDetails[iOAP.curSection].isSelected)){
			var str="<table align='center'>";
			str +='<tr><td>'+$(globalXmlvar).find('MandatoryQuesMsg').text()+'</td></tr></table>';
			$("#infoMsg2").html(str);
			cnfPop('InfoPopup');
			eventBlock(event);
		}
	
});
function examOverview(){
	mockVar.examOverview=1;
	$('.groupInstrutionDataSection').show();
	var str="";
	var str1="";
	for(var i=0;i<mockVar.groups.length;i++){
		str+="<div class='groupDetails'><div class='groupItemHead'><div class='groupHeadCount'><span>"+(i+1)+"</span></div>";
        str+="<div class='groupHeadlineMain'><h3 class='groupHeadline'>"+mockVar.groups[i].groupName+"</h3>";
        str+="<span class='timedata'><em class='timeIcon'></em>"+mockVar.groups[i].maxTime/60+" "+$(globalXmlvar).find('mins').text()+"</span></div>";//group level timer
        str+="<span class='quesCount'>"+(mockVar.groups[i].grouptotalques)+"<span class='quesLabel'>"+$(globalXmlvar).find('ques').text()+".</span></span></div>";//total questions group level
        str+="<ul class='groupSectionDetails groupSectionDetailsExamLab'>";
        for(var j=0;j<mockVar.groups[i].secDetails.length;j++){
        	str+="<li><span class='sectionDet'>"+$(globalXmlvar).find('Section').text()+" "+(j+1)+":</span>";
            str+="<span class='sectionName'>"+mockVar.groups[i].secDetails[j].secName+"</span><span class='sectionQuesCount'>"+(mockVar.groups[i].secDetails[j].questions.length)+"</span></li>";//section level questions total
        }
        str+="</ul></div>";
	}
	str1+="<div class='groupInstructionsContextBtn'><button type='button' class='primaryBtnClr startExamAction'>"+$(globalXmlvar).find('okay').text()+"</button></div>";
	$('#questionContent, .profileDetailsCricle, .buttons-div').hide();
	
	$('#groupInstructionContextOverflow').prepend(str);
	$('.groupInstrutionDataSectionOk').append(str1);
	
	$('.startExamAction').on('click', function () {
	    $('.groupInstrutionDataSection').hide();
		$('.groupInstrutionDataSectionOk').hide();
	    afterArrangeMockVar();
	    $('.profileDetailsCricle').show(); 
	    mockVar.examOverview=0;
	});
	$('.buttons-div.btntab').hide();
}

function skipQuestion(){
	if((mockVar.curQuesBean.comprehensionId != 0 && mockVar.compreLaqQues[quesIdIndexes[mockVar.curQuesBean.comprehensionId]].groupComprehensionLaqQuestions == 'true') || 
			(mockVar.curQuesBean.laqId != 0 && mockVar.compreLaqQues[quesIdIndexes[mockVar.curQuesBean.laqId]].groupComprehensionLaqQuestions == 'true') ||
			iOAP.secDetails[iOAP.curSection].groupAllQuestions == 'true'){
		fnsubmitGroupQuestion('SKIP');	
	}else if(mockVar.curQuesBean.comprehensionId == 0 || mockVar.curQuesBean.laqId == 0){
		fnSubmit('SKIP');
	}
}
function submitGroupYes()
{
	$('.submitGroupPopup').hide();
	submitConfirmationNew('submit');
	

}
function setGroupPopupTexts()
{
	var grpNumber = mockVar.currentGrp + 1;
	var NoOfQues = iOAP.grouptotalques;
	var answered = iOAP.answeredQuestions;
	var marked = 0;
	var notAnswered = 0;
	iOAP.secDetails.forEach(function(sec){
		marked = marked + sec.marked + sec.markedAndAnswered;
		notAnswered = notAnswered + sec.notanswered;
	});
	if(iOAP.secDetails[0].secType.toUpperCase().indexOf("TYPING")!=-1){
		$(".groupQuesCountid,.groupAnsweQuesCountId,.groupNotAnsweQuesCountId,.groupMarkQuesCountId").hide();
		$(".elapsedTimeId,.keyStrokeCountId").show();
		$('#keyStrokeCountId').text(mockVar.typingGroup[mockVar.currentGrp].keyStrokesCount);
		$('#elapsedTimeId').text((mockVar.typingGroup[mockVar.currentGrp].ellapsedTime/60).toFixed(2));
	}else{
	$('#groupQuesCountid').text(NoOfQues);
	$('#groupAnsweQuesCountId').text(answered);
	$('#groupNotAnsweQuesCountId').text(notAnswered);
	$('#groupMarkQuesCountId').text(marked);
		$(".groupQuesCountid,.groupAnsweQuesCountId,.groupNotAnsweQuesCountId,.groupMarkQuesCountId").show();
		$(".elapsedTimeId,.keyStrokeCountId").hide();
		
	}
	
	$('#groupNameLabelid').text($(globalXmlvar).find('GroupSubmitTitle1').text() +' '+ grpNumber);
	

}
function submitGroupNo()
{
	$('.submitGroupPopup').hide();
}
function showOverallGroupSummaryPopup(){
	$("#viewExamSummaryPopup").show();
	$("#submitOnlineAssessment").hide();
}
function showOverallGroupSummary(){
	$("#viewExamSummaryPopup").hide();
	var summaryTxt = '<div class="tableContainer">'
    
	for(var i=0;i<mockVar.groups.length;i++){
		summaryTxt += '<div class="groupInstrPopup"><div class="groupDetails"><div class="groupItemHead"><div class="groupHeadCount">';
		summaryTxt += '<span>'+(i+1)+'</span>';//group Number
		summaryTxt += '</div><div class="groupHeadlineMain">';
		summaryTxt += '<h3 class="groupHeadline">'+mockVar.groups[i].groupName+'</h3>';//group Name
		summaryTxt += '<span class="timedata"><em class="timeIcon"></em>'+mockVar.groups[i].maxTime/60+' '+$(globalXmlvar).find('mins').text()+'</span>';//group time;
		summaryTxt += '</div>';
		summaryTxt += '<span class="quesCount">'+mockVar.groups[i].grouptotalques+' <span class="quesLabel">'+$(globalXmlvar).find('ques').text()+'.</span></span>';//question count
		summaryTxt += '</div></div></div>';    
		if($(window).width()>767){
		summaryTxt += '<table><tbody><tr><th class="catskillWhite txtLeft" scope="col">'+$(globalXmlvar).find('sectionName').text()+'</th>'+
            '<th class="lavenderMist txtCenter" scope="col">'+$(globalXmlvar).find('noOfQues').text()+'</th>'+
            '<th class="lightSeafoarm txtCenter" scope="col">'+$(globalXmlvar).find('Answered').text()+'</th>'+
            '<th class="melon txtCenter" scope="col">'+$(globalXmlvar).find('NotAnswered').text()+'</th>'+
            '<th class="orangyYellow txtCenter" scope="col">'+$(globalXmlvar).find('Marked').text()+'</th>'+
            '<th class="notVisitedPurple txtCenter" scope="col">'+$(globalXmlvar).find('NotVisited').text()+'</th></tr>';
		for(var j=0;j<mockVar.groups[i].secDetails.length;j++){
			summaryTxt += '<tr><td>'+$(globalXmlvar).find('Section').text()+':'+mockVar.groups[i].secDetails[j].secName+'</td>';//section Name;
			summaryTxt += '<td class="tdCenter"><span class="tdMinHeight">'+mockVar.groups[i].secDetails[j].questions.length+'</span></td>';//total no of questions;
			summaryTxt += '<td class="tdCenter"><span class="tdMinHeight">'+mockVar.groups[i].secDetails[j].answered+'</span></td>';//total no of questions Answered;
			var notAttemptedQuestions1 = mockVar.groups[i].secDetails[j].questions.length  - mockVar.groups[i].secDetails[j].answered -  mockVar.groups[i].secDetails[j].marked - mockVar.groups[i].secDetails[j].markedAndAnswered;
			summaryTxt += '<td class="tdCenter"><span class="tdMinHeight">'+mockVar.groups[i].secDetails[j].notanswered+'</span></td>';//total no of questions not answered;
			summaryTxt += '<td class="tdCenter"><span class="tdMinHeight">'+(mockVar.groups[i].secDetails[j].marked+mockVar.groups[i].secDetails[j].markedAndAnswered)+'</span></td>';//total no of questions marked for review;
			summaryTxt += '<td class="tdCenter"><span class="tdMinHeight">'+(mockVar.groups[i].secDetails[j].questions.length-mockVar.groups[i].secDetails[j].answered-mockVar.groups[i].secDetails[j].notanswered-mockVar.groups[i].secDetails[j].marked - mockVar.groups[i].secDetails[j].markedAndAnswered )+'</span></td>';//Not visited
			summaryTxt += '</tr>';
		}
		summaryTxt+=' </tbody></table>';
		}
		else{
		summaryTxt+= '<table class="exam_summary_table" style="--score_card_table_rows:6;"><thead><tr>'+ 
			'<th class="catskillWhite txtLeft" scope="col">'+$(globalXmlvar).find('sectionName').text()+'</th>'+
            '<th class="lavenderMist txtCenter" scope="col">'+$(globalXmlvar).find('noOfQues').text()+'</th>'+
            '<th class="lightSeafoarm txtCenter" scope="col">'+$(globalXmlvar).find('Answered').text()+'</th>'+
            '<th class="melon txtCenter" scope="col">'+$(globalXmlvar).find('NotAnswered').text()+'</th>'+
            '<th class="orangyYellow txtCenter" scope="col">'+$(globalXmlvar).find('Marked').text()+'</th>'+
            '<th class="notVisitedPurple txtCenter" scope="col">'+$(globalXmlvar).find('NotVisited').text()+'</th>'+
			'</tr></thead><tbody>';
		for(var j=0;j<mockVar.groups[i].secDetails.length;j++){
			summaryTxt += '<tr><td>'+$(globalXmlvar).find('Section').text()+':'+mockVar.groups[i].secDetails[j].secName+'</td>';//section Name;
			summaryTxt += '<td class="tdCenter"><span class="tdMinHeight">'+mockVar.groups[i].secDetails[j].questions.length+'</span></td>';//total no of questions;
			summaryTxt += '<td class="tdCenter"><span class="tdMinHeight">'+mockVar.groups[i].secDetails[j].answered+'</span></td>';//total no of questions Answered;
			var notAttemptedQuestions1 = mockVar.groups[i].secDetails[j].questions.length  - mockVar.groups[i].secDetails[j].answered -  mockVar.groups[i].secDetails[j].marked - mockVar.groups[i].secDetails[j].markedAndAnswered;
			summaryTxt += '<td class="tdCenter"><span class="tdMinHeight">'+mockVar.groups[i].secDetails[j].notanswered+'</span></td>';//total no of questions not answered;
			summaryTxt += '<td class="tdCenter"><span class="tdMinHeight">'+(mockVar.groups[i].secDetails[j].marked+mockVar.groups[i].secDetails[j].markedAndAnswered)+'</span></td>';//total no of questions marked for review;
			summaryTxt += '<td class="tdCenter"><span class="tdMinHeight">'+(mockVar.groups[i].secDetails[j].questions.length-mockVar.groups[i].secDetails[j].answered-mockVar.groups[i].secDetails[j].notanswered-mockVar.groups[i].secDetails[j].marked - mockVar.groups[i].secDetails[j].markedAndAnswered )+'</span></td>';//Not visited
			summaryTxt += '</tr>';
		}
		summaryTxt+=' </tbody></table>';
		}
		
		
	}
	summaryTxt+='</div>';
	var btnSummary = '<div class="examSummaryProcedBtn"><button class="primaryBtnClr proceedBtn" onclick="submitOnlineAssessment();">'+$(globalXmlvar).find('Proceed').text()+'</button></div>';
	$("#scoreCardDiv").removeAttr("align")
    $("#scoreSummaryDiv").html(summaryTxt+btnSummary);
    $('#scoreSummaryDiv,#scoreCardBtnDiv').unwrap(".examSummaryExamLab")
    $('#scoreSummaryDiv,#scoreCardBtnDiv').wrapAll('<div class="examSummaryExamLab"></div>');
    $("#scoreCardDiv .examHeading").remove();
    $("#scoreCardDiv").prepend('<h1 class="examHeading">'+$(globalXmlvar).find('examSummaryHeader').text()+'</h1>');
    $(".timerBoxPannel,#questionContent,#sub-header,#finalSubmitMbl,#savenextGroupMbl,.mob_save,.buttons-div").hide();
	$('#scoreCardDiv').show();
}

/*decommissioned--- 
function toggleQuesPallet(){
$('.mob_save').toggle();
$('.overlayPartMob').toggle();
$('.mobSnackCloseEle').toggle();
$(".buttons-div.btntab").toggleClass("buttons-div-view-change");
$("#number-of-ques-answered").toggleClass("number-of-ques-answered-view-change");
}

function toggleMoreActionBtn(){
	 $('.overlayPartMob').toggle();
	 $('#mobMoreOptionsBtnAction').toggle();
	 $('.paperSkipContainter').toggle();
	 $('.paperSaveContainer').toggle();
	 $('.paperSubmitContainer').toggle();
	 //$('#underreviewMbl').toggle();
	 $('.mobSnackCloseEle_Review').toggle();
	 $('#previousBtnMbl').toggle();
	 $('#previousBtnGroupMbl').toggle();
	 
}*/


// for group list
function groupHeadClickIlearn(ele){
	let clonedEle = ele.clone();
	$('.mobSnackActionItem').empty();
	$('.mobSnackActionItem').append(clonedEle);
	//$('.mobActionFixedLayer').show();
	$('.mobActionFixedLayer').css({"z-index":"9999"});
	$('.overlayPartMob').show();
	$('.mobSnackMainBottom').addClass('snackActionItemActive');
	$('.mobSnackActionItem #groupbox2id').show();
}


// for question pallete
function grouplistItemsDropDown(ele){
	let clonedEle = ele.clone();  // .append() deletes the ele, so use clone
	$('.mobSnackActionItem').empty();
	$('.mobSnackActionItem').append(clonedEle);
	//$('.mobActionFixedLayer').show();
	$('.mobActionFixedLayer').css({"z-index":"9999"});
	$('.overlayPartMob').show();
	$('.mobSnackMainBottom').addClass('snackActionItemActive');
	$('.mobSnackActionItem #number-of-ques-answered').show();
}

function removeStyleTagForIlearnReviewBtn(){
	if(iLearnStyleMarkforReview){
		 iLearnStyleMarkforReview.remove();
		 iLearnStyleMarkforReview=null;
	 }	 
}

function addStyleTagForIlearnReviewBtn(){
	if(!iLearnStyleMarkforReview){
	 iLearnStyleMarkforReview=document.createElement('style');
	  iLearnStyleMarkforReview.textContent=`
	  #underreviewMbl, #underreviewGrpMb1{
				display:none !important;
		 } 
		 `;
		 document.head.appendChild(iLearnStyleMarkforReview);
	}
}

function mobMoreOptionsBtnAction(ele){
	let clonedEle = ele.clone();  // .append() deletes the ele, so use clone
	$('.mobSnackActionItem').empty();
	$('.mobSnackActionItem').append(clonedEle);
	//$('.mobActionFixedLayer').show();
	$('.mobActionFixedLayer').css({"z-index":"9999"});
	$('.overlayPartMob').show();	
	$('.buttons-div.btntab').hide();
	$('.mobSnackActionItem #underreviewMbl').show();   // show mark for review button in mob action fixed layer if present 
	$('.mobSnackActionItem #underreviewGrpMb1').show();
	$('.mobSnackActionItem #mobMoreOptionsBtnAction').hide();
	$('.mobSnackActionItem #mobMoreOptionsBtnActionGrp').hide();
	$('.mobSnackMainBottom').addClass('snackActionItemActive');
	removeStyleTagForIlearnReviewBtn();
	
	
}

function mobSnackCloseEle(){
	$('.mobSnackActionItem').empty();
	//$('.mobActionFixedLayer').hide();
	$('.mobActionFixedLayer').css({"z-index":"-9999"});
	$('.overlayPartMob').hide();
	$('.buttons-div.btntab').show();
	$('.mobSnackMainBottom').removeClass('snackActionItemActive')
	addStyleTagForIlearnReviewBtn();
}

/*$('<div id = "number-of-ques-answered" class="groupingListItems">').insertAfter('#currentQues');
$('#number-of-ques-answered').append('<button class="groupItemSelected allItems" data-value="allItems"></button>');
$('#number-of-ques-answered').append('<button class="answeredItems" data-value="answeredItems" disabled="disabled"></button>');
$('#number-of-ques-answered').append('<button class="notAnsweredItems" data-value="notAnsweredItems" disabled="disabled"></button>');
$('#number-of-ques-answered').append('<button class="markedforReviewButton" data-value="markedforReviewButton" disabled="disabled"></button>');
$('#number-of-ques-answered').append('<button class="notVisitedItems" data-value="notVisitedItems" disabled="disabled"></button>');

$('.allItems').append('<em class="listIcon allQuestionIcon"></em>');
$('.allItems').append('<em class="conTxt emNormal">All</em>');
$('.allItems').append('<em class="countTxt emNormal">(20)</em>');

$('.answeredItems').append('<em class="listIcon answeredIcon"></em>');
$('.answeredItems').append('<em class="conTxt emNormal">Answered</em>');
$('.answeredItems').append('<em class="countTxt emNormal"></em>');

$('.notAnsweredItems').append('<em class="listIcon notAnsweredIcon"></em>');
$('.notAnsweredItems').append('<em class="conTxt emNormal">Not Answered</em>');
$('.notAnsweredItems').append('<em class="countTxt emNormal"></em>');

$('.markedforReviewButton').append('<em class="listIcon markedforReviewIcon"></em>');
$('.markedforReviewButton').append('<em class="conTxt emNormal">For Review</em>');
$('.markedforReviewButton').append('<em class="countTxt emNormal"></em>');

$('.notVisitedItems').append('<em class="listIcon notVisitedIcon"></em>');
$('.notVisitedItems').append('<em class="conTxt emNormal">Not Visited</em>');
$('.notVisitedItems').append('<em class="countTxt emNormal"></em>');*/








