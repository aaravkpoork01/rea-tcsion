/**
 * 
 */

function checkRtl(){
	try{
	isSoftwareRtl = typeof mockVar.langName === "string" && mockVar.langName.trim().length > 0 && SoftwareRtlList.includes(mockVar.langName);
	isRightToLeftIsRequired = isSoftwareRtl;
	sessionStorage.isRightToLeftIsRequired=isSoftwareRtl;
	isQuesRtl = false;
	 var QuesRtlListArray = QuesRtlList.split(",");
	  for(var i=0;i<QuesRtlListArray.length;i++){
		  if(mockVar.defaultLang == QuesRtlListArray[i]){
			  isQuesRtl = true;
			  isRightToLeftIsRequired = true;
		  }
	  }
	  rtlChange();
	}
	catch(e){}
} 

function rtlChange(){
	try{
	if(isSoftwareRtl){
		if(isThemes){
			$('#warningPopup').css('direction','rtl');
			$('.candidateProfle').css('flex-direction','row-reverse');
			$('.candidateProfle').css({"text-align":"left"});
			$('.courseInfoPop').addClass('courseInfoPop_Rtl');
			$('#dragNotePadDiv textarea').css({"direction":"rtl"});
			if(sessionStorage.userDefinedNum==='certificationUI' || sessionStorage.userDefinedNum==='xeroxUI'){
				$('#highlightDisclaimer').css({"float":"right"});
				$('#header').css('flex-direction','row-reverse');
				$('#bannerImage').css('flex-direction','row-reverse');
				$('.profileDiv').css('flex-direction','row-reverse');
			}
			
			else if(sessionStorage.userDefinedNum==='corporateUI'){
				$('#highlightDisclaimer').css({"float":"right"});
				$('#header').css('flex-direction','row-reverse');
				$('#bannerImage').css('flex-direction','row-reverse');
				$('.profileDiv').css('flex-direction','row-reverse');
				$('.highlightTool .selectmark_tool').addClass('highlightTool_rtl');
			}
			
			else if(sessionStorage.userDefinedNum==='schoolUI'){
				$('.queSteps .module span').addClass('queSteps-rtl');
				$('.queSteps').css('direction','rtl');
				$('#header').css('flex-direction','row-reverse');
				$('#bannerImage').css('flex-direction','row-reverse');
				$('#assessmentName').css('justify-content','flex-start');
				$('.Bttn_Area').css('flex-direction','row-reverse');
				$('.save_buttoncontainer').each(function(){
					this.style.setProperty('margin-left','0px','important');
					this.style.setProperty('margin-right','auto','important');
				})
				$('.popMain').css('left','unset');
				$('.popMain').css('right','-25px');
				
			}
			
			
			
		}
		$('.cnfPopHdr').addClass('cnfPopHdrRtl');
		$('.cnfPopBdy').addClass('cnfPopBdyRtl');
		$('#sub_Conf_Sum_No').css({'position':'relative','left':'170px'});
        $('#sub_Conf_Sum_Yes').css({'position':'relative','right':'148px'});
		$("#User_Hldr").css({"border-right": "1px solid #c3c3c1"});
		$(".collapsebel_panel").css({"border-right": "2px solid #000","border-left":"none"});
		$(".rightSectionDiv").css({"direction": "rtl"});
		$(".preGrpInstruL").addClass("preGrpInstruLR");
		$(".exam_name").addClass("exam_nameR");
		$('select').addClass("drRight");
		$('#grpInstruction').addClass("floatRight");
		$('.arrowplace').addClass("floatLeft");
		$('.arrowplace').addClass("arrowplaceR");
		$('.instView').addClass("floatLeft");
		$('.sectionInstructionMedia').addClass("textRight");
		$('.helpinstruction_div').addClass("floatLeft");
		$('.help_div, .instruction_div, #viewQPTD, .viewGrpInstruDiv, .viewSecInstruDiv').addClass("floatLeft");
		$('.instruction_icon').addClass("instruction_iconR");
		$('.help_icon').addClass("help_iconR");
		$('.questionpaper_icon').addClass("questionpaper_iconR");
		$('.Rght_Section').addClass("Rght_SectionR");
		$('.Lft_Section ').addClass("Lft_SectionR");
		$('.Questn_Area').addClass("floatRight");
		$('.subject_information_div1').addClass("Rght_Tooltip");
		$('.save_buttoncontainer').addClass("floatLeft");
		$('.bc_footer').addClass("floatRight");
		$('.finalSubmit').addClass("finalSubmitR");
		$('.profile_image').addClass("floatRight");
		$('.notation_type_description .notation_typeDiv').addClass("floatRight");
		$('.diff_type_notation_area_inner span.not_answered, .diff_type_notation_area_inner span.not_visited, .diff_type_notation_area_inner span.answered, .diff_type_notation_area_inner span.review, .diff_type_notation_area_inner span.review_marked, .diff_type_notation_area_inner span.review_answered').addClass("floatRight");
		$('.type_title').addClass("textRight");
		$('.question_area').css({"right": "0px"});
		$('.grupbox2').addClass("grpBxRight");
		$('.components-section').addClass("floatLeft");
		$('.component-icon-container').addClass("floatRight");
		$('.group-panel').addClass("floatRight");
		$('.allSections').addClass("floatRight");
		$('.tooltip1').addClass("floatLeft");
		$('.time-details').addClass("floatLeft");
		$('.section-details').addClass("floatRight");
		$('.subject-selection').addClass("floatRight");
		$('#sections div').addClass("floatRight");
		$('#sections').css({"display": "auto"});
		$('.questiontype-details').addClass("floatRight");
		$('.questionType').addClass("floatRight");
		$('span.correctAnswer').addClass("floatRight");
		$('span.viewLang').addClass("floatRight");
		$('.questionNumber').addClass("floatRight");
		$(".preGrpinstruContent p").css({"text-align":"right","direction":"rtl"});
		$(".preGrpinstruContent").css("float", "right");
		$('.nano-pane').css({"left":"0","right":"none"});
		$('.save_buttoncontainer').css({"margin-left":"1px","margin-right":"1px"});
		$('.helpinstruction_div').addClass("floatLeft");
		$('.marking-details').addClass("floatLeft");
		$('span.negativeMarks').addClass("floatLeft");
		$('.save_buttoncontainer').addClass("floatLeft");//  margin-left: 255px;
		$('.helpinstruction_div div').addClass("floatLeft");
		$('.time-details').addClass("floatLeft");
		$('.marking-details').addClass("floatLeft");
		$('.divHeader').addClass("textRight");
		$('table').addClass("drRight");
		$('#sectionSummaryDiv').addClass("drRight");
		$('#group_summary div').css({"text-align": "right"});  
		$('#break_summary div').css({"text-align": "right"});
		$('.diff_type_notation_area_inner').css({"padding-right": "8px"}); 
		$('#mainleft').css({"float":"right","border-left": "1px solid rgb(0, 0, 0)"});
		$('#instruction').css({"text-align":"right","padding-right": "10px"});
		$('#instPaginationa').css({"float":"left"});
		$('#PreviousInst').css({"float":"right"});
		$('#defaultDisclaimerDiv').css({"direction": "rtl"});
		$('.tb').css({"float":"right"});
		$('#agreementMessageDef').css({"margin-right":"1.5em"});
		$('li').css({"text-align": "right"});
		$('#firstPage').css({"direction": "rtl"});
		$('.question_area span').addClass("floatRight");
        
		$('.hamburgerBar').addClass("floatLeft");
		$('.arw_drpdown').addClass("floatRight");
		$('.grups').addClass("floatRight");
		$('span.crumb').addClass("floatLeft");
		$('#finalSubmitMbl').addClass("floatRight");
		$('#savenextMbl').addClass("floatLeft");
		$('.other_buttoncontainer_mbl').addClass("floatRight");
//        $('#underreviewMbl').addClass("floatLeft");
//		$('#clearResponseMbl').addClass("floatRight");
		$('.setngbx').css({"left":"4px","right":""});
		$('.qarea_resp').addClass("floatRight");	
		$('.qcontainer.numberpanelQues').addClass("floatRight");
		$('.user_dtls').addClass("floatRight");
		//$('.pic_box').addClass("floatRight");
		$('.pic1').addClass("floatRight");
		$('.pic_box').css({"direction":"rtl"});
//		$('.candidateImg').addClass("floatRight");
//		$('.verifiedImg').addClass("floatLeft");
		$('.menu_descp').addClass("floatRight");
		$('.panel_icons_sm').addClass("floatRight");
		$('.canvasmenu').css({"direction":"rtl"});
		$('.rightImage').css({"left":"102px","right":""});
		$(".other_buttoncontainer").css({"right": "0px","text-align":"right"});
		$(".other_buttoncontainerGrp").css({"right": "0px","text-align":"right"});
		$('.collapse_icon').css({"left": "249px","rotate": "180deg"});
		$('.expand_icon').css({"left": "0","right": "auto"});
		$('.tooltipDiv').css({"right": "unset"});
		$('#highlightDisclaimer').css({"float":"right"});
	} else {
		
		if(isThemes){
			$('#dragNotePadDiv textarea').css({"direction":"ltr"});
			$('#warningPopup').css('direction','ltr');
			$('.candidateProfle').css('flex-direction','row');
			$('.candidateProfle').css({"text-align":"right"});
			$('.courseInfoPop').removeClass('courseInfoPop_Rtl');
			if(sessionStorage.userDefinedNum==='certificationUI' || sessionStorage.userDefinedNum==='xeroxUI'){
			$('#highlightDisclaimer').css({"float":"left"});
			$('#header').css('flex-direction','row');
			$('#bannerImage').css('flex-direction','row');
			$('.profileDiv').css('flex-direction','row');
			}
			
			else if(sessionStorage.userDefinedNum==='corporateUI'){
				$('#highlightDisclaimer').css({"float":"left"});
				$('#header').css('flex-direction','row');
				$('#bannerImage').css('flex-direction','row');
				$('.profileDiv').css('flex-direction','row');
				$('.highlightTool .selectmark_tool').removeClass('highlightTool_rtl');
			}
			else if(sessionStorage.userDefinedNum==='schoolUI'){
				$('.queSteps .module span').removeClass('queSteps-rtl');
				$('.queSteps').css('direction','ltr');
				$('#header').css('flex-direction','row');
				$('#bannerImage').css('flex-direction','row');
				$('#assessmentName').css('justify-content','flex-end');
				$('.Bttn_Area').css('flex-direction','row');
				$('.save_buttoncontainer').each(function(){
					this.style.setProperty('margin-left','auto','important');
					this.style.setProperty('margin-right','0px','important');
				})	
				$('.popMain').css('right','unset');
				$('.popMain').css('left','-25px');
			}
		
		}
		$('.cnfPopHdr').removeClass('cnfPopHdrRtl');
		$('.cnfPopBdy').removeClass('cnfPopBdyRtl');
		$('.collapse_icon').css({"left": "","rotate": ""});	
		$('.tooltipDiv').css({"right": "unset"});
		$(".other_buttoncontainer").css({"right": "","text-align":""});
		$(".other_buttoncontainerGrp").css({"right": "","text-align":""});
		$("#User_Hldr").css({"border-left": "1px solid #c3c3c1"});
		$(".collapsebel_panel").css({"border-left": "2px solid #000","border-right":"none"});
		$(".rightSectionDiv").css({"direction": "ltr"});
		$(".preGrpInstruL").removeClass("preGrpInstruLR");
		$(".exam_name").removeClass("exam_nameR");
		$('select').removeClass("drRight");
		$('#grpInstruction').removeClass("floatRight");
		$('.arrowplace').removeClass("floatLeft");
		$('.arrowplace').removeClass("arrowplaceR");
		$('.instView').removeClass("floatLeft");
		$('.sectionInstructionMedia').removeClass("textRight");
		$('.helpinstruction_div').removeClass("floatLeft");
		$('.help_div, .instruction_div, #viewQPTD, .viewGrpInstruDiv, .viewSecInstruDiv').removeClass("floatLeft");
		$('.instruction_icon').removeClass("instruction_iconR");
		$('.help_icon').removeClass("help_iconR");
		$('.questionpaper_icon').removeClass("questionpaper_iconR");
		$('.Rght_Section').removeClass("Rght_SectionR");
		$('.Lft_Section ').removeClass("Lft_SectionR");
		$('.Questn_Area').removeClass("floatRight");
		$('.subject_information_div1').removeClass("Rght_Tooltip");
		$('.save_buttoncontainer').removeClass("floatLeft");
		$('.bc_footer').removeClass("floatRight");
		$('.finalSubmit').removeClass("finalSubmitR");
		$('.profile_image').removeClass("floatRight");
		$('.notation_type_description .notation_typeDiv').removeClass("floatRight");
		$('.diff_type_notation_area_inner span.not_answered, .diff_type_notation_area_inner span.not_visited, .diff_type_notation_area_inner span.answered, .diff_type_notation_area_inner span.review, .diff_type_notation_area_inner span.review_marked, .diff_type_notation_area_inner span.review_answered').removeClass("floatRight");
		$('.type_title').removeClass("textRight");
		$('.question_area').css({"right": "-17px","left": "0px"});
		$('.components-section').removeClass("floatLeft");
		$('.grupbox2').removeClass("grpBxRight");
		$('.component-icon-container').removeClass("floatRight");
		$('.group-panel').removeClass("floatRight");
		$('.allSections').removeClass("floatRight");
		$('.tooltip1').removeClass("floatLeft");
		$('.time-details').removeClass("floatLeft");
		$('.section-details').removeClass("floatRight");
		$('.subject-selection').removeClass("floatRight");
		$('#sections div').removeClass("floatRight");
		$('#sections').css({"display": "auto"});
		$('.questiontype-details').removeClass("floatRight");
		$('.questionType').removeClass("floatRight");
		$('span.correctAnswer').removeClass("floatRight");
		$('span.viewLang').removeClass("floatRight");
		$('.questionNumber').removeClass("floatRight");
		$(".preGrpinstruContent p").css({"text-align":"left","direction":"ltr"});
		$('.nano-pane').css({"right":"0","left":"none"});
		$('.save_buttoncontainer').css({"margin-right":"255px","margin-left":"1px"});
		$('.helpinstruction_div').removeClass("floatLeft");
		$('.marking-details').removeClass("floatLeft");
		$('span.negativeMarks').removeClass("floatLeft");
		$('.save_buttoncontainer').removeClass("floatLeft");//  margin-left: 255px;
		$('.helpinstruction_div div').removeClass("floatLeft");
		$('.time-details').removeClass("floatLeft");
		$('.marking-details').removeClass("floatLeft");
		$('.divHeader').removeClass("textRight");
		$('table').removeClass("drRight");
		$('#sectionSummaryDiv').removeClass("drRight");
		$('#group_summary div').css({"text-align": "left"});  
		$('#break_summary div').css({"text-align": "left"});
		$('.diff_type_notation_area_inner').css({"padding-left": "8px","padding-right": "none"}); 
		
		$('#mainleft').css({"float":"left","border-right": "1px solid rgb(0, 0, 0)"});
		$('#instruction').css({"text-align":"left","padding-left": "10px"});
		$('#instPaginationa').css({"float":"right"});
		$('#PreviousInst').css({"float":"left"});
		$('#defaultDisclaimerDiv').css({"direction": "ltr"});
		$('.tb').css({"float":"left"});
		$('#agreementMessageDef').css({"margin-left":"1.5em"});
		$('li').css({"text-align": "left"});
		$('#firstPage').css({"direction": "ltr"});
		$('.question_area span').removeClass("floatRight");
		
		$('.hamburgerBar').removeClass("floatLeft");
		$('.arw_drpdown').removeClass("floatRight");
		$('.grups').removeClass("floatRight");
		$('span.crumb').removeClass("floatLeft");
		$('#finalSubmitMbl').removeClass("floatRight");
		$('#savenextMbl').removeClass("floatLeft");
		$('.other_buttoncontainer_mbl').removeClass("floatRight");
//        $('#underreviewMbl').removeClass("floatLeft");
//		$('#clearResponseMbl').removeClass("floatRight");
		$('.setngbx').css({"right":"4px","left":""});
		$('.qarea_resp').removeClass("floatRight");	
		$('.qcontainer.numberpanelQues').removeClass("floatRight");
		$('.user_dtls').removeClass("floatRight");
		//$('.pic_box').removeClass("floatRight");
		$('.pic1').removeClass("floatRight");
		$('.pic_box').css({"direction":"ltr"});
//		$('.candidateImg').removeClass("floatRight");
//		$('.verifiedImg').removeClass("floatLeft");
		$('.menu_descp').removeClass("floatRight");
		$('.panel_icons_sm').removeClass("floatRight");
		$('.canvasmenu').css({"direction":"ltr"});
		$('.rightImage').css({"right":"60px","left":""});
	}
	var qLanguage = $(".choose_lang").length > 0 ? $(".choose_lang").val() : 0;
	var tempisQuesRtl = false;
	 var tempQuesRtlListArray = QuesRtlList.split(",");
	  for(var i=0;i<tempQuesRtlListArray.length;i++){
		  if(qLanguage == tempQuesRtlListArray[i])
			  tempisQuesRtl = true;
	  }
	if((isQuesRtl && (tempisQuesRtl || qLanguage == 0 )) || tempisQuesRtl){
		sessionStorage.RTLinQuesArea=true;
		$('.canvas-main-area').addClass('canvas-rtl');
		$('.cat-button').addClass('canvas-rtl');
		$('.answer.MSQanswer.checkBtnClass').addClass("chkbox_rtl");
		$('.noOfWordsClass').css({"float":"right"});
		$('select option').css({'text-align':'right'});
		if(sessionStorage.userDefinedNum==='certificationUI'){
			if(iOAP.secDetails[iOAP.curSection].groupAllQuestions != "undefined" && iOAP.secDetails[iOAP.curSection].groupAllQuestions != "" && iOAP.secDetails[iOAP.curSection].groupAllQuestions == "true")
				$('#compreQuesText').css({"clear":"both"});
			$('#compreText').css({"float":"right"});
			$('#compreQuesText').css({"right":"unset"});
			$('#compreQuesText').css({"left":"0px"});
			$('#laq_text').css({"float":"right !important"});
			$('#LAQuesText').css({"right":"unset !important"});
			$('#LAQuesText').css({"left":"0px !important"});
			
			
			$('.labelForOptText').attr('style','padding-left:0px !important; padding-right:25px !important; width: 95%');
			$('.leftDiv').css('padding-right','30px');
			$('.leftDiv').css('padding-left','0px');
			$('.tempnewnumberpannel').css('direction','rtl');
			$('.tempnewnumberpannel').css('width','100dvw');
		}
		
		else if(sessionStorage.userDefinedNum==='schoolUI'){
			$('#quesOuterDiv.compLaq').css('direction','rtl');
			
			$('.timerClock').each(function(){
				this.style.setProperty('left','60px','important');
				this.style.setProperty('right','unset','important');
			})
			
		}
		else if(sessionStorage.userDefinedNum==='corporateUI'){
			$('#quesOuterDiv').addClass('quesOuterDiv_rtl');
			$('#compreText').css({"float":"right"});
			$('#compreQuesText').css({"float":"right"});
			$('#laq_text').css({"float":"right "});
			$('#LAQuesText').css({"float":"right "});   // not setting left 0 like certification because of its natural design 
			
			$('.tempnewnumberpannel').css('direction','rtl');
			$('.tempnewnumberpannel').css('width','100dvw');
		}
		
		//$('.quesAnsContent').addClass("floatRight");
		//$('.numberpanelQues').addClass("floatRight");
		$('.typingQuesDiv').addClass("floatRight");
		$('.que .que-col-1').addClass("floatRight");
		$("#scrollToBottom").parent().css({"float":"left"});
		$("#scrollToTop").parent().css({"float":"left"});
		$('.que .que-col').addClass("floatRight");
		$('.que .que-col-2').addClass("floatLeft");
		$('.que-col-full').addClass("floatRight");
		$('.dragSource ul').css({"margin-left":"1px","margin-right":"20px"});
		$('#warningMsgDiv').css({"direction": "rtl"});
		$('.textHighlighter').addClass("drRight");
		$('.textHighlighter').addClass("textRight");
		$('label').not('#highlightDisclaimer').css({"float":"right"});
		$('.singleLineOptions label').css({"float":"none","display":"inline-block"});
		$('.singleLineOptions').css({"display":"inline-block"});
		$('#numericKeyBoardDiv input').css({"text-align": "right"});
		//$('input[type=radio], input[type=checkbox]').addClass("floatRight");
		$('.jwplayer, .jwplayer div, .jwplayer span, .jwplayer a, .jwplayer img, .jwplayer ul, .jwplayer li, .jwplayer video, .jwclick').addClass("floatRight");
		$('span.jwcontrolbar span, span.jwcontrolbar .jwgroup button, span.jwcontrolbar .jwleft').addClass("floatRight");
		$('.Ans_Area').addClass("drRight");
		$('.Ans_Area textarea').addClass("drRight");
		$('.leftDiv').addClass("drRight");
		$(".canvas-wrapper .canvas-top-tools").css({"right":"48px"});
		$(".addtional-colorset").css({"padding-right":"11px","padding-left":"0px"});
		$(".canvas-wrapper .canvas-zoom-tools").css({"left":"10px","right":"initial"});
		$(".canvas-top-right").css({"margin-right":"auto","margin-left":"initial"});
		if(!isThemes){
			$('#quesOuterDiv').css({"display": "block"});  
			$(".compLaq").css({"display":"block"});
		}
		$('.leftDiv').css({"text-align": "right"});
		$('.rightSectionDiv .header').css({"text-align": "right"});
		$('.rightSectionDiv .subheader').css({"text-align": "right"});

		
		
	
	} else {
		sessionStorage.RTLinQuesArea=false;
		$('.canvas-main-area').removeClass('canvas-rtl');
		$('.cat-button').removeClass('canvas-rtl');
		$('.answer.MSQanswer.checkBtnClass').removeClass("chkbox_rtl");
		$('.noOfWordsClass').css({"float":"left"});
		$('select option').css({'text-align':'left'})
        if(sessionStorage.userDefinedNum==='certificationUI'){
        	$('#compreText').css({"float":"left"});
			$('#compreQuesText').css({"right":"0px"});
			$('#compreQuesText').css({"left":"unset"});
			$('#laq_text').css({"float":"left !important"});
			$('#LAQuesText').css({"left":"unset !important"});
			$('#LAQuesText').css({"right":"0px !important"});
			$('.labelForOptText').attr('style','padding-left:25px !important; padding-right:0px !important; width: 95%')
			$('.leftDiv').css('padding-left','30px');
			$('.leftDiv').css('padding-right','0px');
			$('.tempnewnumberpannel').css('direction','ltr');
		}
		else if(sessionStorage.userDefinedNum==='corporateUI'){
			$('#quesOuterDiv').removeClass('quesOuterDiv_rtl');
			$('.tempnewnumberpannel').css('direction','ltr');
			$('#compreText').css({"float":"left"});
			$('#compreQuesText').css({"float":"left"});
			$('#laq_text').css({"float":"left"});
			$('#LAQuesText').css({"float":"left"});
		}
		else if(sessionStorage.userDefinedNum==='schoolUI'){
			$('#quesOuterDiv.compLaq').css('direction','ltr');
			
				$('.timerClock').each(function(){
					this.style.setProperty('right','60px','important');
					this.style.setProperty('left','unset','important');
				})
				
			}
		$('.typingQuesDiv').removeClass("floatRight");
		$('.que .que-col-1').removeClass("floatRight");
		$("#scrollToBottom").parent().css({"float":"right"});
		$("#scrollToTop").parent().css({"float":"right"});
		$('.que .que-col').removeClass("floatRight");
		$('.que .que-col-2').removeClass("floatLeft");
		$('.que-col-full').removeClass("floatRight");
		$(".que-col").find("li").css({"text-align":"left"});
		$('.dragSource ul').css({"margin-right":"1px","margin-left":"20px"});
		$('#warningMsgDiv').css({"direction": "ltr"});
		$('.textHighlighter').removeClass("drRight");
		$('.textHighlighter').removeClass("textRight");
		//$('label').css({"float":"left"});
		$('.singleLineOptions label').css({"float":"none","display":"inline-block"});
		$('.singleLineOptions').css({"display":"inline-block"});
		$('#numericKeyBoardDiv input').css({"text-align": "left"});
		//$('input[type=radio], input[type=checkbox]').removeClass("floatRight");
		$('.jwplayer, .jwplayer div, .jwplayer span, .jwplayer a, .jwplayer img, .jwplayer ul, .jwplayer li, .jwplayer video, .jwclick').removeClass("floatRight");
		$('span.jwcontrolbar span, span.jwcontrolbar .jwgroup button, span.jwcontrolbar .jwleft').removeClass("floatRight");
		$('.Ans_Area').removeClass("drRight");
		$('.Ans_Area textarea').removeClass("drRight");
		$('.leftDiv').removeClass("drRight");
		if(!isThemes){
			$('#quesOuterDiv').css({"display": "block"});
			$(".compLaq").css({"display":"block"});
		}
		$('.leftDiv').css({"text-align": "left"});
		$(".canvas-wrapper .canvas-top-tools").css({"right":""});
		$(".addtional-colorset").css({"padding-right":"","padding-left":""});
		$(".canvas-wrapper .canvas-zoom-tools").css({"left":"","right":""});
		$(".canvas-top-right").css({"margin-right":"","margin-left":""});
		$('.rightSectionDiv .header').css({"text-align": "left"});
		$('.rightSectionDiv .subheader').css({"text-align": "left"});
	}
}
	catch(e){}
}

window.onload=function(){
    checkRtl();
};
	$(document).on('click touchstart', function () {
			checkRtl();
	});

	$('select').on('change', function() {
		checkRtl();
		});

	$('.langselect').on('click', function() {
		checkRtl();
	  });


	$('#basInst, #basInst,.grpInst,.secInst').on('change', function() {
		try{
	var QuesRtlListArray = QuesRtlList.split(",");
	var instruRTL = false;
		  for(var i=0;i<QuesRtlListArray.length;i++){
			  if($(this).val() == QuesRtlListArray[i]){
				  instruRTL = true;			  
			  }
		  }
		  if(instruRTL){
			  /*console.log("instruRtl");*/
		  }
		}
		catch(e){}
		});


  
	




	
	
