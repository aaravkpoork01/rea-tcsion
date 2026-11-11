function LMSAPI(){
    //this.cache = {};
   this.LMSInitialize=LMSInitialize;
   this.LMSGetValue=LMSGetValue;
   this.LMSSetValue=LMSSetValue;
   this.LMSCommit=LMSCommit;
  function LMSInitialize(){
	  return "true";
  }
 
   function LMSGetValue(varname) {  // "cmi.core.student_name"
       var v = sessionStorage.getItem(varname); // retrive data from mockvar here 
       if(v == null || v==undefined ){
           v = "";
       }
       if(typeof(v) == "string")
       {
       v.replace(/&#147/g, '"');
       }
       return v
   }

   function LMSSetValue(varname,varvalue) {            
      if(typeof(varvalue) == "string")
      {
      varvalue.replace(/"/g, "&#147");
      }
       sessionStorage.setItem(varname,""+varvalue);
       return "true";
   }

   function LMSCommit() {
   	//var selectedAnswer = responses.toString ();
   	//save(selectedAnswer,"GAME",quesType); // save("ODIsha","NEXT","MCQ") , save('USA<ANS_SEP>Bubaneswar<ANS_SEP>Mumbai','NEXT','MSQ'), save('<html><head><title></title></head><body><p>sreejith&nbsp;</p></body></html>','NEXT','SA'), save('delhi','NEXT','SA')
   	//saveBackUp(false); -- need to run start counter method somehow
	try{
		    mockVar.gameJson = JSON.parse(LMSGetValue('cmi.core.lesson_location'));
	}
	catch(e){
		
	}
	if(LMSGetValue('cmi.core.question_details')!=''){
		mockVar.curGameQuesDetails = JSON.parse(LMSGetValue('cmi.core.question_details'));
		var quesData  = mockVar.curGameQuesDetails.quesData;
   		for(var grp=0;grp<mockVar.groups.length;grp++){
   			if(mockVar.groups[grp].groupId==quesData.groupID){
				for(var sec=0;sec<mockVar.groups[grp].secDetails.length;sec++){
					if(mockVar.groups[grp].secDetails[sec].secId==quesData.sectionID){
						for(var ques=0;ques<mockVar.groups[grp].secDetails[sec].questions.length;ques++){
							if(mockVar.groups[grp].secDetails[sec].questions[ques].quesId==quesData.id){
								mockVar.groups[grp].secDetails[sec].questions[ques].quesParam.langID=quesData.LangId;
								//mockVar.groups[grp].secDetails[sec].questions[ques].quesParam.status=quesData.status;
								mockVar.groups[grp].secDetails[sec].questions[ques].quesParam.answer=quesData.answer;
								mockVar.groups[grp].secDetails[sec].questions[ques].quesParam.selectedOptId=quesData.selectedoptionid;
								var selectedoptionidList = quesData.selectedoptionid.split(",");
								if(selectedoptionidList.length>1){
									var isMultipleOptions = false;
									mockVar.groups[grp].secDetails[sec].questions[ques].options.forEach(function(ele){
										if($.inArray(ele.optId,selectedoptionidList)!=-1){
											mockVar.groups[grp].secDetails[sec].questions[ques].quesParam.selectedOptId =  ele.optId;
											if(isMultipleOptions)
												mockVar.groups[grp].secDetails[sec].questions[ques].quesParam.selectedOptId+=",";
											isMultipleOptions = true;
										}
									});
								}
								//if(quesData.status == "answered")	
									//mockVar.groups[grp].secDetails[sec].answered++;// = quesData.answered;
								//mockVar.groups[grp].secDetails[sec].notanswered = quesData.notanswered;
								if(mockVar.gameAtQpLevel || mockVar.groups[mockVar.currentGrp].gameAtGrpLevel){
									mockVar.curQuesBean = mockVar.groups[grp].secDetails[sec].questions[ques];
									save(mockVar.groups[grp].secDetails[sec].questions[ques].quesParam.answer,'saveSA',"");
									mockVar.curQuesBean = {};
								}
									
							}
						}
					}
				}
			}
   		}
   		// storing values in mockVar logic 
   	
   }if(LMSGetValue('cmi.core.lesson_status')=='completed' || LMSGetValue('cmi.core.lesson_status')=='incomplete'){

  		//LMSSetValue('cmi.core.lesson_status','');//writing this reattempt the same question or to navigate to another game question;
  		//console.log(document);
  		var gameFrameDocument = document.getElementById("gamifiedFrame").contentDocument || document.getElementById("gamifiedFrame").contentWindow.document ;
  		gameFrameDocument.webkitCancelFullScreen();
  		$("#gamifiedDiv").hide();
		$("#questionContent").show();
		quizPageHeight();
			//$("#gamifiedFrame").hide();
			
			//showDivs();
			/*if(mockVar.gameAtQpLevel || mockVar.groups[mockVar.currentGrp].gameAtGrpLevel){
			for(var sec=0;sec<mockVar.groups[mockVar.currentGrp].length;sec++){
				mockVar.groups[mockVar.currentGrp].answeredQuestions += mockVar.groups[mockVar.currentGrp].secDetails[sec].answered;
			}
			var notansrduestions = mockVar.groups[mockVar.currentGrp].totalNoOfQuestions - mockVar.groups[mockVar.currentGrp].answeredQuestions;
			var ntvisitedQues = mockVar.groups[mockVar.currentGrp].totalNoOfQuestions - notansrduestions - mockVar.groups[mockVar.currentGrp].answeredQuestions;
			mockVar.groups[mockVar.currentGrp].notansrduestions =notansrduestions;
			$('.answered').text(mockVar.groups[mockVar.currentGrp].answeredQuestions);
	        $('.not_answered').text(notansrduestions);
	        $('.not_visited').text(ntvisitedQues);
	        $('.review').text('0');
			$('.review_marked').text('0');
			}*/
		if(mockVar.gameAtQpLevel){
  			submitMock("");
		}
		else if(mockVar.groups[mockVar.currentGrp].gameAtGrpLevel){
			finalSubmit('group');
			submitGroup();
		}
		else if(mockVar.curQuesBean.comprehensionId != 0 && mockVar.compreLaqQues[quesIdIndexes[mockVar.curQuesBean.comprehensionId]].gameAtCompreLevel ){
			fnsubmitGroupQuestion("NEXT");
			reLaunchGameLabQues = false;
			//$("#gamifiedDiv").hide();
		}
		else if(mockVar.curQuesBean.gameAtQuesLevel){
			fnSubmit('NEXT');
			reLaunchGameLabQues = false;
			//$("#gamifiedDiv").hide();
		}
			
   }
	return true;
   }
}
function timerForGroupLevelOrQPLevelGame(){
	if(mockVar.time<=0){
		clearTimeout(mockVar.timeCounter);
		if(mockVar.gameAtQpLevel){
			submitMock("");
		}else{
			finalSubmit('group');
  			submitGroup();
  			
		}
		var gameFrameDocument = document.getElementById("gamifiedFrame").contentDocument || document.getElementById("gamifiedFrame").contentWindow.document ;
  		gameFrameDocument.webkitCancelFullScreen();
		$("#gamifiedDiv").hide();
		$("#gamifiedFrame").attr("src","");	
		$("#questionContent").show();
	}
	else{
		mockVar.time -=1;
		mockVar.timeCounter = setTimeout(function(){timerForGroupLevelOrQPLevelGame();},1000);
	}
			
}
function gameInitialization(){
	//window.API.LMSSetValue('cmi.core.question_details','');
	window.API.LMSSetValue('cmi.core.lesson_status','');
	window.API.LMSSetValue("cmi.core.student_name",sessionStorage.username);
	if(mockVar.gameAtQpLevel){
		$('#questionContent').hide();
		//timer();
		timerForGroupLevelOrQPLevelGame();
			window.API.LMSSetValue('cmi.customparam.iba.n.scorm_attached_at_level','QP');
			window.API.LMSSetValue('cmi.customparam.iba.n.assessment_xml',new XMLSerializer().serializeToString(QPExml));
			window.API.LMSSetValue('cmi.customparam.iba.n.is_restart_allowed','YES');
			window.API.LMSSetValue('cmi.customparam.iba.n.scorm_config_path',mockVar.scormConfigXml);
			scormHandling(mockVar.scormPath,'qp');
	}
	else if(mockVar.groups[mockVar.currentGrp].gameAtGrpLevel){
		$('#questionContent').hide();
		//timer();
		timerForGroupLevelOrQPLevelGame();
		    window.API.LMSSetValue('cmi.customparam.iba.n.scorm_attached_at_level','Group'+','+mockVar.groups[mockVar.currentGrp].groupId);
			window.API.LMSSetValue('cmi.customparam.iba.n.assessment_xml',new XMLSerializer().serializeToString(QPExml));
			window.API.LMSSetValue('cmi.customparam.iba.n.is_restart_allowed','YES');
			window.API.LMSSetValue('cmi.customparam.iba.n.scorm_config_path',mockVar.groups[mockVar.currentGrp].scormConfigXml);
			scormHandling(mockVar.groups[mockVar.currentGrp].scormPath,'group');
	}
	else if(mockVar.curQuesBean.gameAtQuesLevel){
			fillNumberPanel();
			window.API.LMSSetValue('cmi.customparam.iba.n.scorm_attached_at_level','Ques'+','+mockVar.groups[mockVar.currentGrp].groupId+','+mockVar.groups[mockVar.currentGrp].secDetails[iOAP.curSection].secId+','+mockVar.curQuesBean.quesId);
			window.API.LMSSetValue('cmi.customparam.iba.n.assessment_xml',new XMLSerializer().serializeToString(QPExml));
			window.API.LMSSetValue('cmi.customparam.iba.n.is_restart_allowed','YES');
			window.API.LMSSetValue('cmi.customparam.iba.n.scorm_config_path',mockVar.curQuesBean.scormConfigXml);
			scormHandling(mockVar.curQuesBean.scormPath,'ques');
		
		}
		else if(mockVar.curQuesBean.comprehensionId != 0 && mockVar.compreLaqQues[quesIdIndexes[mockVar.curQuesBean.comprehensionId]].gameAtCompreLevel){
			fillNumberPanel();
			window.API.LMSSetValue('cmi.customparam.iba.n.scorm_attached_at_level','Compre'+','+mockVar.groups[mockVar.currentGrp].groupId+','+mockVar.groups[mockVar.currentGrp].secDetails[iOAP.curSection].secId+','+mockVar.curQuesBean.comprehensionId);
			window.API.LMSSetValue('cmi.customparam.iba.n.assessment_xml',new XMLSerializer().serializeToString(QPExml));
			window.API.LMSSetValue('cmi.customparam.iba.n.is_restart_allowed','YES');
			window.API.LMSSetValue('cmi.customparam.iba.n.scorm_config_path',mockVar.compreLaqQues[quesIdIndexes[mockVar.curQuesBean.comprehensionId]].scormConfigXml);
			scormHandling(mockVar.compreLaqQues[quesIdIndexes[mockVar.curQuesBean.comprehensionId]].scormPath,'ques');
		}
}
function toggleGamelabScreen(){
	try{	var gameFrameDocument = document.getElementById("gamifiedFrame").contentDocument || document.getElementById("gamifiedFrame").contentWindow.document ;
		gameFrameDocument.webkitCancelFullScreen();}catch(e){}
		$("#gamifiedDiv").hide();
		$("#questionContent").show();
}
function scormHandling(scormPath,level){
	//hideDivs();
	
	if(level=='game')
	$('#gamifiedQuesDiv').show();
else
	$('#gamifiedDiv').show();
	var path = "";
	if(isProofReadingMock == "true" || isProofReadingMock == true)
		path = '../'+sessionStorage.proofReadingQpPath+'/'+mockVar.qpId+'/tkcimages/'+scormPath+'/index.html';
	else
		path = '../'+sessionStorage.xmlFilePath+mockVar.qpId+'/tkcimages/'+scormPath+'/index.html';
	if(level=='game')
	$('#gamifiedQuesDiv').show();
	$("#gamifiedQuesFrame").attr("src",path);
	$("#gamifiedFrame").attr("src",path);
	$("#questionContent").hide();
}
function hideDivs(){
	$('.Questn_Area').hide();
	$('#col2').hide();
	$('.helpinstruction_div').hide();
	$('.nav-container').hide();
	$('.section-timepanel').hide();
	$('.subject-selection').hide();
	$('.viewProfile').hide();
	$('.collapsebel_panel').hide();
	$('.expand_icon').hide();
	$('.subject-section-rightarrow').hide();
	$('#loadCalc').hide();
	$('.protactor-div').hide();
	$('.scratch-pad-container').hide();
	$('.textarea-div').hide();
	$('.courseInfoPop').hide();
	$('.subject-section-rightarrow').hide();
	$('.subheader_tab,.grup_components,.q_tab,.btntab,.hamburgerBar').hide();
	$("#pWait").hide();
	$('#showTimee').hide();
}
function showDivs(){
		$('#col2').show();
		$('.Questn_Area').show();
		$('#quesInstruTimeDiv').hide();
		$('.preGroupInstR').hide();
		$('.helpinstruction_div').show();
		$('.nav-container').show();
		$('.section-timepanel').show();
		$('.subject-selection').show();
		$('.viewProfile').show();
		$('.collapsebel_panel').show();
		$('.expand_icon').show();
		$('.subject-section-rightarrow').show();
}

window.API = new LMSAPI();