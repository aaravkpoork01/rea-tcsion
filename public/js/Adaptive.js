$(document).bind("contextmenu",function(e){
	preventDefault(e);
});
//var quesIdIndexes =[];
var comprecount =0;
var count =0;
var isNextQuestionCallExecuting = false;
var isReliableAssessmentSubmitted = false;
function readXMLAdaptiveQP(qpId,orgId,mockId,subjectId){
	mockVar.qpId = qpId;
		//var xmlURL = "/IBACC/MockAssessmentAction.do?action=getCandidateData&orgId="+orgId+"&mockId="+mockId+"&candMasterId="+onlineAssessmentCandidateId+"&attemptNo="+onlineAttemptId+"&QPId="+qpId+"&keyType=Assessment&tokenKey="+($.cookie("tokenKey"))+"&isLauncher="+(($.cookie("isLauncher")=="true")?"true":"false");
		var xmlURL = "/IBACC/MockCandidateAction.do?action=adaptiveFirstCall&orgId="+orgId+"&mockId="+mockId+"&QPId="+qpId+"&subjectId="+subjectId+"&candId="+mockVar.candMasterId+"&attemptId="+mockVar.attemptId+"&isNewAssessment="+sessionStorage.isNewAssessment;
		$.ajax({
			url:xmlURL,
			type: 'POST',
			async: false,
			dataType: 'json',
			success: function (data) {
					try{
					data = JSON.parse(data);
					}catch(e){
						data = JSON.parse(JSON.stringify(data));
					}
					if(typeof(data.request_status)!="undefined" && data.request_status !="Failed"){
					mockVar.stageId=data.stage_id;
					mockVar.storeCandResponse = 1;
					mockVar.examType = data.exam_type;
					mockVar.candidateJson = data.candidateJson;
					mockVar.candidateGroup = data.candidateGroup;
					mockVar.previousQuestions = data.previousQuestions;
					mockVar.examStatus = data.exam_status;
					//mockVar.groups[0] = data;
					mockVar.currentGrp = 0;
					mockVar.backupTimeInterval=30000;
					mockVar.MaxGrpEnabled =0;
					mockVar.isAdaptive = sessionStorage.isAdaptive;
					//mockVar.time = data.completeTime *60;
					mockVar.completeTime = data.completeTime *60;
					mockVar.totalDurationOfAssessment = mockVar.completeTime;
					mockVar.selectedGroupIds = "NA";
					mockVar.isCAT=false;
					mockVar.nonTimeBoundTime = data.completeTime *60;
					mockVar.xmlFilePath=$.cookie("xmlFilePath") == undefined ? sessionStorage.xmlFilePath : $.cookie("xmlFilePath");
					secInstru= {};
					mockVar.timeFormat=sessionStorage.TimeFormat;
					mockVar.submitAllCandidatesOnTime = sessionStorage.submitAllCandidatesOnTime;
					mockVar.candResponseUrl = "/IBACC/MockCandResponseHandler";
					if(typeof(data.isCAT)!="undefined" && data.isCAT==true){
						mockVar.isCAT = data.isCAT;
						sessionStorage.noOfAdaptiveStages =1;
						}
					mockVar.currentAbility=data.currentAbility;
					mockVar.standardError=data.standardError;
					mockVar.itemDifficulty=data.itemDifficulty;
					//mockVar.nonTimeBoundTime = ;
					try{
					QPxml = jQuery.parseXML(data.QPXML);
					QPExml = QPxml;
					questionPaperNumberOfStages = typeof($(QPxml).find("questionPaperXML").attr('questionPaperNumberOfStages')) == "undefined" ? 4 : parseInt($(QPxml).find("questionPaperXML").attr('questionPaperNumberOfStages'));
					mockVar.questionPaperNumberOfStages = questionPaperNumberOfStages;
					mockVar.quesPaperName = typeof($(QPxml).find("questionPaperXML").attr('quesPaperName')) == "undefined"?"":$(QPxml).find("questionPaperXML").attr('quesPaperName');
					mockVar.assessmentStartDate = $(QPxml).find("AssessmentStartDate").length>0 && $(QPxml).find("AssessmentStartDate").text().trim().length>0 ?$(QPxml).find("AssessmentStartDate").text():null;
					mockVar.assessmentEndDate = $(QPxml).find("AssessmentEndDate").length>0 && $(QPxml).find("AssessmentEndDate").text().trim().length>0 ? $(QPxml).find("AssessmentEndDate").text() : null;
					
					}catch(e){}
					validateQuizPageUrl(false);
					if(data.compreLaqData!=undefined)
						prepareMockObjectForCompreAdaptive(data.compreLaqData.compreLaqDetails,qpId);
					prepareMockObjectForAdaptive(mockVar.candidateGroup,qpId);
					mockVar.languages = data.languages.langDetails;
					mockVar.languages.forEach((value, index) => {
						  if (value === null) {
						    delete mockVar.languages[index];  // removes value but keeps index position
						  }
						});
					mockVar.questionIndexDetails = quesIdIndexes;
					//iOAP = mockVar.groups[mockVar.currentGrp];
					//iOAP.curSection=0;
					mockVar.storeCandResponse =1;
					//mockVar.candName ="JOHN";
					mockVar.difficultyValues = [];
					mockVar.mockId = JSON.parse(sessionStorage.tempMockVar).mockId+"";
					mockVar.orgId = JSON.parse(sessionStorage.tempMockVar).orgId +"";
					mockVar.attemptId = JSON.parse(sessionStorage.tempMockVar).attemptId+"";
					getCandIdFromCookie();
					mockVar.subscribedFor = JSON.parse(sessionStorage.tempMockVar).subscribedFor;
					mockVar.subscriptionId = sessionStorage.subscriptionId;
					mockVar.AttemptStartTime = sessionStorage.startTime;
					mockVar.TotalTimeSpentInQuizPage =0;
					setTimeout(function(){candidateTotalTimeSpent();},1000);
					allowInterruptions = sessionStorage.allowInterruptions=="true"?"NO":"YES";
					var AuditJsonObject = new Object();
					var orgId = 0;
					var attemptId = 0;
					var mockId = 0;
					var candMasterId = 0;
					var buttonStatus = false;
					AuditJsonObject.ActionName = "StageId :"+mockVar.stageId;
					AuditJsonObject.RecordNumber = auditRecordNumber++;
					AuditJsonObject.candidateName = sessionStorage.isOfflinePaper=='1' ? sessionStorage.username : $.cookie("username") ;
					AuditJsonObject.loginId = sessionStorage.isOfflinePaper=='1' ? sessionStorage.username : $.cookie("loginId");
					AuditJsonObject.GroupId = "NA";
					AuditJsonObject.ActionDesc = mockVar.candidateJson==''?'NA':JSON.stringify(mockVar.candidateJson).replaceAll(",","<comma>");
					orgId = mockVar.orgId;
					mockId = mockVar.mockId;
					candMasterId =mockVar.candMasterId;
					attemptId = mockVar.attemptId;
					buttonStatus = false;
					AuditJsonObject.SectionId = "NA";
					AuditJsonObject.QuestionId = "NA";
					AuditJsonObject.SelectedOptionId = "NA";
					AuditJsonObject.OptionSequence = "NA";
					var currentDate = new Date();
					AuditJsonObject.Time = currentDate.yyyymmddHHmmss();
					AuditJsonObject.mockVarLoginId = mockVar.loginId;
					AuditJson.push(AuditJsonObject);
					if(!(sessionStorage.reliableMode == true || sessionStorage.reliableMode == 'true'))
						arrangeMockVar();
					else
						isModuleMediaDownloaded();
					}else{
						
						alert("back End error");
						}
			},
			error:function(){
				if(mockVar.reliableMode == 'true' || mockVar.reliableMode == true){
				cnfPop('backupAlerts');hideCloseAndOkayForSecuredAssessments();
				$("#backupAlertMsg").html($(globalXmlvar).find('CouldNotConnectToServer').text());
				}
			}
		})
		
	
}
function arrangeTool(){
	if(typeof(sessionStorage.userdefinedcandconsole) != "undefined" && sessionStorage.userdefinedcandconsole == 1)
		$(".bc_footer,.selectmark_tool,.highlightTool").css({"display":"inline-block"});
}
function prepareMockObjectForAdaptive(candidateJson,qpId){
	try{
		var correctToIncorrectValueUpdated = false;
		var tempCompreId = 0;var prevCompreId=0;
		var correctSeqMap = {};
		
		arrangeTool();
		/* try{if(candidateJson.maxTime == 0)
			 candidateJson.maxTime = "NA";}catch(e){}*/
		if(mockVar.isCAT){
			candidateJson.AdaptiveGroupName=candidateJson.groupName;
			 $("#summaryBtn,#flagBtn").hide();
			//candidateJson.displaySummaryPage=false;
		}
			 candidateJson.MarksLost = 0;
			 candidateJson.MarksObtained = 0;
		xmlFilePath = decodeURIComponent(xmlFilePath);
		var groupDescriptionandImage = typeof(candidateJson.groupDescriptionandImage) != "undefined" ? candidateJson.groupDescriptionandImage :"";
		if(groupDescriptionandImage != ""){
			var tempgroupDescriptionandImage = makQuesAudVidDiv(groupDescriptionandImage,0,parseInt(candidateJson.groupId)+"GroupId");
			groupDescriptionandImage = tempgroupDescriptionandImage[0];
			groupDescriptionandImage = editAudioVideoImageFilePath(groupDescriptionandImage,false);
		}
		candidateJson.groupDescriptionandImage = groupDescriptionandImage;
		var secDetailsLength = candidateJson.secDetails.length;
		for(var sec=0;sec<secDetailsLength;sec++){
			var secImage = typeof(candidateJson.secDetails[sec].secImage) != "undefined" ? candidateJson.secDetails[sec].secImage:"";
			if(secImage != ""){
				secImage = secImage.replace(/tkcimages/g, xmlFilePath+ qpId + '/tkcimages');
				if(mockVar.reliableMode == 'true' || mockVar.reliableMode == true)
					secImage = editSecImageTag(secImage);
			}
			candidateJson.secDetails[sec].secImage = secImage;
			candidateJson.secDetails[sec].MarksLost = 0;
			 candidateJson.secDetails[sec].MarksObtained = 0;
			 candidateJson.secDetails[sec].isSelected = false;
			var tempQuestionsLength = candidateJson.secDetails[sec].questions.length;
			var qCountExcludingDummyQuestion = 0;
			candidateJson.secDetails[sec].qCountExcludingDummyQuestion = 0;
			candidateJson.secDetails[sec].compreIds = {};
			if(mockVar.isCAT){
				candidateJson.secDetails[sec].displayNumberPanel = "false";
			}
			for(var que=0;que<tempQuestionsLength;que++){
				audioVideoPresentAtQuesLevel = false;
				try{
					if(typeof(candidateJson.secDetails[sec].questions[que].fileUploadMessage) == "undefined")
						candidateJson.secDetails[sec].questions[que].fileUploadMessage = "";
					if(candidateJson.secDetails[sec].questions[que].maxTime == "0")
						candidateJson.secDetails[sec].questions[que].maxTime = -1;
					if(candidateJson.secDetails[sec].questions[que].quesType != "SUBJECTIVE")
						candidateJson.secDetails[sec].questions[que].issubjectivequestion = "true";
					candidateJson.secDetails[sec].questions[que].maxTimeConfigured = candidateJson.secDetails[sec].questions[que].maxTime;
					if(candidateJson.secDetails[sec].questions[que].issubjectivequestion == "true"){
					qCountExcludingDummyQuestion++;
					candidateJson.secDetails[sec].qCountExcludingDummyQuestion = qCountExcludingDummyQuestion;
				}}catch(e){}
				
				if(!correctToIncorrectValueUpdated){
					if(!correctToIncorrectValueUpdated){
						if(candidateJson.secDetails[sec].questions[que].CorrectToIncorrect == ""){
							candidateJson.secDetails[sec].questions[que].CorrectToIncorrect = 0;
							candidateJson.secDetails[sec].questions[que].IncorrectToIncorrect = 0;
							candidateJson.secDetails[sec].questions[que].CorrectToCorrect = 0;
							candidateJson.secDetails[sec].questions[que].IncorrectToCorrect = 0;
							candidateJson.secDetails[sec].questions[que].UnanswerdtoCorrect = 0;
							candidateJson.secDetails[sec].questions[que].UnanswerdtoIncorrect = 0;
							
						} else {
							correctToIncorrectValueUpdated = true;
						}
					} 
				}
				var quesLangBeansLength = candidateJson.secDetails[sec].questions[que].quesLangBeans.length;
				var tquestionLevelTextImage = typeof(candidateJson.secDetails[sec].questions[que].questionLevelTextImage) != "undefined" ? candidateJson.secDetails[sec].questions[que].questionLevelTextImage : "";
				tquestionLevelTextImage = tquestionLevelTextImage.replace(/tkcimages/g, xmlFilePath+ qpId + '/tkcimages');
				candidateJson.secDetails[sec].questions[que].questionLevelTextImage = tquestionLevelTextImage;
				var tempQueType = candidateJson.secDetails[sec].questions[que].quesType;
				var quesId = candidateJson.secDetails[sec].questions[que].quesId;
				tempCompreId = candidateJson.secDetails[sec].questions[que].comprehensionId;
				var correctSequence = -1;
				if(candidateJson.secDetails[sec].questions[que].correctSequence != undefined)
					correctSequence = parseInt(candidateJson.secDetails[sec].questions[que].correctSequence);
				if(correctSequence!=-1 && tempCompreId!=0){
					if(correctSeqMap[tempCompreId]==undefined) 
						correctSeqMap[tempCompreId] = new Array();
					correctSeqMap[tempCompreId].push(correctSequence);
				}
				try{
					 if(typeof(mockVar.adaptiveQuesIds) == "undefined")
						 mockVar.adaptiveQuesIds = [];
					 if(mockVar.adaptiveQuesIds.indexOf(quesId) < 0)
						 mockVar.adaptiveQuesIds.push(quesId);
					}catch(e){}
				 /*try{if(candidateJson.secDetails[sec].questions[que].maxTime == 0)
					 candidateJson.secDetails[sec].questions[que].maxTime = "NA";}catch(e){}*/
				candidateJson.secDetails[sec].questions[que].jwAudioVideo = [];
				if(tempQueType == "SA"){
					candidateJson.secDetails[sec].questions[que].thinkTime = parseInt(candidateJson.secDetails[sec].questions[que].SAThinkTime+"");
					candidateJson.secDetails[sec].questions[que].SAThinkTimeUpperLimit = parseInt(candidateJson.secDetails[sec].questions[que].SAThinkTime+"");
					candidateJson.secDetails[sec].questions[que].responseTime = parseInt(candidateJson.secDetails[sec].questions[que].SARecordingTime+"");
				}
				var qLangId = "";
				try{ if(typeof(qpDetailsMockVar[quesId]) == "undefined"){
					qpDetailsMockVar[quesId] = {};
					qpDetailsMockVar[quesId].quesLangBean = [];
					qpDetailsMockVar[quesId].options = {};
				
				}
					}catch(e){}
					qpDetailsMockVar[quesId].questionLevelTextImage = candidateJson.secDetails[sec].questions[que].questionLevelTextImage;
					candidateJson.secDetails[sec].questions[que].questionLevelTextImage = "";
				for(var quesLang=0;quesLang<quesLangBeansLength;quesLang++){
					
					var tempquesText = candidateJson.secDetails[sec].questions[que].quesLangBeans[quesLang].quesText;
					try{
					qLangId = candidateJson.secDetails[sec].questions[que].quesLangBeans[quesLang].langId;
					}catch(e){}
						var oldFileCounter = 0;
						var optCounter = 0;
						
						var newQuesText = makQuesAudVidDiv(tempquesText,oldFileCounter,quesId);
						tempquesText = newQuesText[0];
						oldFileCounter = newQuesText[1];
						
						tempquesText = editAudioVideoImageFilePath(tempquesText,true);
					//}							
					//candidateJson.secDetails[sec].questions[que].quesLangBeans[quesLang].quesText = tempquesText;
						candidateJson.secDetails[sec].questions[que].quesLangBeans[quesLang].quesText = "";
					var tempQuesTextObject = {};
					tempQuesTextObject["quesText"] = tempquesText;
					qpDetailsMockVar[quesId].quesLangBean[quesLang] = tempQuesTextObject;
					//qpDetailsMockVar[quesId+"_"+qLangId] = tempquesText;
				}
				if(tempQueType == "MCQ" || tempQueType == "MSQ"){
					var optionsLength = candidateJson.secDetails[sec].questions[que].options.length;
					var optionShuffling = candidateJson.secDetails[sec].questions[que].optionShuffling;
					//if(mockVar.isCAT)
						//optionShuffling='false';
					var sequenceArray = new Array();
					for(var opt = 0;opt<optionsLength;opt++){
						try{
							tempCompreId = candidateJson.secDetails[sec].questions[que].comprehensionId;
							if(prevCompreId!=tempCompreId && tempCompreId != 0 &&  candidateJson.secDetails[sec].questions[que].quesType == "MSQ"){
								candidateJson.secDetails[sec].compreIds[tempCompreId] = typeof(candidateJson.secDetails[sec].compreIds[tempCompreId]) == "undefined" ? candidateJson.secDetails[sec].questions[que].options[opt].optId : candidateJson.secDetails[sec].compreIds[tempCompreId]+","+candidateJson.secDetails[sec].questions[que].options[opt].optId;
							}
							
						}catch(e){}
						var optLangLength = candidateJson.secDetails[sec].questions[que].options[opt].optLangBean.length;
						var oLangId = "";
						var optionId = candidateJson.secDetails[sec].questions[que].options[opt].optId;
						var sequenceId = candidateJson.secDetails[sec].questions[que].options[opt].sequenceId;
						qpDetailsMockVar[quesId].options[optionId] = {};
						qpDetailsMockVar[quesId].options[optionId].optLangBean = [];
						for(var optLang = 0;optLang<optLangLength;optLang++){
							oLangId = "";
							var tempOptText = candidateJson.secDetails[sec].questions[que].options[opt].optLangBean[optLang].optText;
							try{
								oLangId = candidateJson.secDetails[sec].questions[que].options[opt].optLangBean[optLang].langId;
							}catch(e){}
							tempOptText = tempOptText.replace(/'/g,"\"");
							var tempImageTag = "";
							var tempImageName = "";
							if(tempOptText.indexOf("tkcimages/")!=-1){
								tempImageTag = tempOptText.split("tkcimages/");
								for(var k=1;k<tempImageTag.length;k++){
									// var temporaryImageName = "";
									// temporaryImageName =
									// tempImageTag[k];
									tempImageName=tempImageTag[k].split(".")[0];
									var temporaryFileName = tempImageTag[k].split(".")[0];
									tempImageName=tempImageName.replace(/\s/g, '_');
									var temporaryFileExtension = tempImageTag[k].split(".")[1].split("\"")[0];
									if(temporaryFileExtension.indexOf('>')!= -1){
										temporaryFileExtension = tempImageTag[k].split(".")[1].split("'")[0]; 
									}
									temporaryFileName = temporaryFileName+"."+temporaryFileExtension;
									tempImageName = tempImageName+"."+temporaryFileExtension;
									tempOptText = tempOptText.replace(temporaryFileName,tempImageName);
									if(temporaryFileExtension == "mp4"){
												tempOptText = tempOptText + "<div class='jwAudioVideo multiMediaOption' id='jwVideo_"+quesId+"_"+oldFileCounter+"' title='hasmedia@@tkcimages/"+tempImageName+"hasmedia@@'></div>";
										oldFileCounter++ ;
												getFileInBlob('tkcimages/'+ tempImageName, tempImageName,"","");
									}else if(temporaryFileExtension == "mp3"){
												tempOptText = tempOptText + "<div class='jwAudioVideo multiMediaOption' id='jwAudio_"+quesId+"_"+oldFileCounter+"' title='hasmedia@@tkcimages/"+tempImageName+"hasmedia@@'></div>";
										oldFileCounter++ ;
												getFileInBlob('tkcimages/'+ tempImageName, tempImageName,"","");
									}
								}
							}
							if(tempOptText.indexOf("<audio>")!=-1){
								var newAudioFile = new Array();
								newAudioFile = tempOptText.match(/(<audio>.+?<audio>)/g);
								for(var i=0;i<newAudioFile.length;i++){
									while (tempOptText.indexOf(newAudioFile[i])!=-1) {
										if(sessionStorage.assessmentMode == "2")
											makeAjaxCallToCache(newAudioFile[i].split("<audio>")[1]);
												tempOptText = tempOptText.replace(newAudioFile[i],"<div class='jwAudioVideo multiMediaOption' id='jwAudio_"+quesId+"_"+oldFileCounter+"' title='hasmedia@@tkcimages/"+newAudioFile[i].split("<audio>")[1]+"hasmedia@@'></div>");
										oldFileCounter++ ;
												getFileInBlob('/tkcimages/'+newAudioFile[i].split("<audio>")[1],newAudioFile[i].split("<audio>")[1],"","");
									}
								}
							}
							if(tempOptText.indexOf("<video>")!=-1){
								var newVideoFile = new Array();
								newVideoFile = tempOptText.match(/(<video>.+?<video>)/g);
								for(var i=0;i<newVideoFile.length;i++){
									while (tempOptText.indexOf(newVideoFile[i])!=-1) {
										if(sessionStorage.assessmentMode == "2")makeAjaxCallToCache(newVideoFile[i].split("<video>")[1]);
												tempOptText = tempOptText.replace(newVideoFile[i],"<div class='jwAudioVideo multiMediaOption' id='jwVideo_"+quesId+"_"+oldFileCounter+"' title='hasmedia@@tkcimages/"+newVideoFile[i].split("<video>")[1]+"hasmedia@@'></div>");
										oldFileCounter++ ;
												getFileInBlob('/tkcimages/'+ newVideoFile[i].split("<video>")[1], newVideoFile[i].split("<video>")[1],"","");
									}
								}
							}
							if(mockVar.MagnifyingGlass == 1){
								if(tempOptText.indexOf('<img') != -1 && tempOptText.indexOf('data-mathml') == -1) {
									var newImageFile = new Array();
									tempOptText = tempOptText.replace(/'/g,'"');
									newImageFile = tempOptText.match(/(<img.+?src="(.+?)".+?>)/g);
									if(newImageFile!=undefined){
									for (var i = 0; i < newImageFile.length; i++) {
										while (tempOptText.indexOf(newImageFile[i]) != -1) {
											var imageName = newImageFile[i].split('src=')[1].split('/>');
													tempOptText = tempOptText.replace(newImageFile[i], "<span class='ans'><a class='imageZoom' href=hasmedia@@"+imageName[0]+"hasmedia@@><img class='imageZoom' style='max-width:300px;max-height:300px' src=hasmedia@@"+imageName[0]+"hasmedia@@/></a></span>");
											oldFileCounter++;
													getFileInBlob('/'+ imageName[0], imageName[0].split('\\').pop().split('/').pop(),"","");
													
										}
									}
									}
								}	
							}else{
								if(tempOptText.indexOf('<img') != -1 && tempOptText.indexOf('data-mathml') == -1) {
									var newImageFile = new Array();
									tempOptText = tempOptText.replace(/'/g,'"');
									
									newImageFile = tempOptText.match(/(<img.+?src="(.+?)".+?>)/g);
									if(newImageFile!=undefined){
									for (var i = 0; i < newImageFile.length; i++) {
										while (tempOptText.indexOf(newImageFile[i]) != -1) {
											var imageName = newImageFile[i].split('src=')[1].split('/>');
											if(mockVar.storeCandResponse==1 || isProofReadingMock){
												if(sessionStorage.userdefinedcandconsole == 1)
															tempOptText = tempOptText.replace(newImageFile[i], "<img src=hasmedia@@"+imageName[0]+"hasmedia@@>");
												else
															tempOptText = tempOptText.replace(newImageFile[i], "<span class='ans'><span class='zoomimage' ><a target='_blank' rel='noopener noreferrer'><img src=hasmedia@@"+imageName[0]+"hasmedia@@ class='max_img_ico' title='"+$(globalXmlvar).find('clickImageToZoom').text()+"'></a></span></span>");
											} else
														tempOptText = tempOptText.replace(newImageFile[i], "<span class='ans'><span class='zoomimage' ><a target='_blank' rel='noopener noreferrer'><img src=hasmedia@@"+imageName[0]+"hasmedia@@></a></span></span>");
											oldFileCounter++;
													getFileInBlob('/'+ imageName[0], imageName[0].split('\\').pop().split('/').pop(),"","");
										}
									}
									}
								}
							}
							tempOptText = editAudioVideoImageFilePath(tempOptText,false);
							
							
							
							candidateJson.secDetails[sec].questions[que].options[opt].optLangBean[optLang].optText = "";//tempOptText
							//qpDetailsMockVar[quesId+"_"+optionId+"_"+oLangId] = tempOptText;
							//qpDetailsMockVar[quesId].options[optionId].optLangBean[]
							var tempoptTextObject = {};
							tempoptTextObject["optText"] = tempOptText;
							qpDetailsMockVar[quesId].options[optionId].optLangBean[optLang] = tempoptTextObject;
						}
						
						sequenceArray.push(new sequenceBean(sequenceId, candidateJson.secDetails[sec].questions[que].options[opt]));
					}
					
					sequenceArray=sequenceArray.sortBy('seqId');
					var options=new Array();
					for(var i=0;i<sequenceArray.length;i++){
						options[i]=sequenceArray[i].optBean;
					}
					if((optionShuffling=='true') && correctSequence<=0 ){
						shuffleArray(options);
					}
					candidateJson.secDetails[sec].questions[que].options = options;
					
				}else{
					var options=new Array();
					candidateJson.secDetails[sec].questions[que].options = options;
				}
				candidateJson.secDetails[sec].questions[que].audioVideoPresentAtQuesLevel = audioVideoPresentAtQuesLevel;
				prevCompreId = tempCompreId;
				if(mockVar.isCAT){
					candidateJson.secDetails[sec].questions[que].reVisitQues='false';
					candidateJson.secDetails[sec].questions[que].reEditQues='false';
					candidateJson.secDetails[sec].questions[que].isQuesMand='true';
					//candidateJson.secDetails[sec].questions[que].itemDifficulty=mockVar.itemDifficulty;
					//candidateJson.secDetails[sec].questions[que].standardError=mockVar.standardError;
					//candidateJson.secDetails[sec].questions[que].currentAbility=mockVar.currentAbility;
						
				}
				//andidateJson.secDetails[sec].questions[que].correct = cs;
			}
		}
		
		$(mockVar.compreLaqQues).each(function(){
			if(correctSeqMap[this.quesId]!=undefined)
				this.correctseq = correctSeqMap[this.quesId];
		});
		
	}catch(e){}
	if(typeof(mockVar.groups) == "undefined" || mockVar.groups.length == 0){
//	console.log(1);
	mockVar.groups = [];
	mockVar.grpIds = [];
	mockVar.secIds = [];
	 //mockVar.questionIndexDetails=[];
	// questionIndexDetails=[];
	var previousComprehensionId=0;
	var prevQuestionGroupAll = "false";var questionGroupAll = "false";	
	 mockVar.grpIds.push(candidateJson.groupId);
	 var tempSections = candidateJson.secDetails;
	 optionalSectionIndex = [];
	 optionalSectionCounter = 1;
	 $(tempSections).each(function(){
		 if(this.isOptional == 'true'){//console.log("isOptional "+this.isOptional);console.log("DefaultOptionalSections "+this.DefaultOptionalSections);
				if(this.DefaultOptionalSections == "true")
					optionalSectionIndex.push(optionalSectionCounter);
			}
			optionalSectionCounter++;
	  mockVar.secIds.push(this.secId);
	  this.secCount=0;
	  var tempQuestions = this.questions;
	   $(tempQuestions).each(function(){
	   	quesIdIndexes[this.quesId]= count++;
	   	this.isQuesMandUnanswered = false;
	    var isChild = this.comprehensionId!=0 || this.laqId !=0? true:false;
	    comprehensionId = this.comprehensionId!=0?this.comprehensionId:this.laqId;
		if(comprehensionId == previousComprehensionId){
			questionGroupAll = prevQuestionGroupAll;
		} else {
			$(mockVar.compreLaqQues).each(function(){
				if(this.quesId == comprehensionId){
					questionGroupAll = this.groupComprehensionLaqQuestions;
					prevQuestionGroupAll = questionGroupAll;
				}
			});
		}
		if(isChild)
			mockVar.compreLaqQues[mockVar.compreLaqQues.inArray((comprehensionId),"quesId")].childQuesCount= mockVar.compreLaqQues[mockVar.compreLaqQues.inArray((comprehensionId),"quesId")].childQuesCount+1;
		this.questionGroupAll=questionGroupAll;
		this.flagforReVistQues = true;
		if(this.isQuesMand=="true")
			this.isQuesMandUnanswered = true;
	   });
	 });
	 try{candidateJson.defaultOptionalSections = optionalSectionIndex}catch(e){}
	 mockVar.groups.push(candidateJson);
	 candidateOptionSequence();
	 $(mockVar.groups).each(function(){
		 this.groupCount=0;
			var grpObject=new Object();
			grpObject.isViewable =this.isViewable;
			grpObject.isEditable = this.isEditable;
			grpObject.maxTime=this.maxTime;
			grpObject.minTime=this.minTime;
			mockVar.groupConfigArray.push(grpObject)
	})
	 mockVar.currentGrp = 0;
	 iOAP.curSection=0;
	 mockVar.groups[mockVar.currentGrp].remainingTimeForGroup= 0;
	 mockVar.groups[mockVar.currentGrp].groupEllapsedTime =0;
	 mockVar.nonTimeBoundTime = mockVar.completeTime - (mockVar.groups[mockVar.currentGrp].maxTime == "NA" ? 0 : mockVar.groups[mockVar.currentGrp].maxTime);
	 if(mockVar.groups[mockVar.currentGrp].maxTime>0){
			mockVar.time = mockVar.groups[mockVar.currentGrp].maxTime;
			mockVar.groups[mockVar.currentGrp].remainingTimeForGroup= mockVar.groups[mockVar.currentGrp].maxTime;
		}else if(mockVar.groups.length>1 && mockVar.groups[mockVar.currentGrp].maxTime ==0){
			mockVar.time = mockVar.nonTimeBoundTime;
		}else{
			mockVar.time = mockVar.completeTime;
		}	
	} else {
		var tempGrpId = mockVar.grpIds;
		//console.log(tempGrpId.indexOf(candidateJson.groupId));
		if(tempGrpId.indexOf(candidateJson.groupId) > -1){
			mockVarSecIdsForAdaptive(candidateJson.secDetails , tempGrpId.indexOf(candidateJson.groupId));
			if(mockVar.isCAT){
				//this is applicable only for CAT with single group and section.
				 var tempSections = candidateJson.secDetails;
				 
				 $(tempSections).each(function(){
					mockVar.secIds.push(this.secId);
					 this.secCount=0;//console.log("isOptional "+this.isOptional);console.log("DefaultOptionalSections "+this.DefaultOptionalSections);
					 
						
					 var tempQuestions = this.questions;
					   $(tempQuestions).each(function(){
					   	quesIdIndexes[this.quesId]= count++;
					   	this.isQuesMandUnanswered = false;
						this.questionGroupAll=questionGroupAll;
						this.flagforReVistQues = true;
						if(this.isQuesMand=="true")
							this.isQuesMandUnanswered = true;
					   });
				 });
				if(mockVar.time>-1){
				mockVar.nonTimeBoundTime = mockVar.time;
				}
				else{fnSubmit("SUBMIT");}
				//saveBackUp();
			}
		} else {
		mockVar.grpIds.push(candidateJson.groupId);
		var previousComprehensionId=0;
		var prevQuestionGroupAll = "false";var questionGroupAll = "false";
		// mockVar.currentGrp++;
		 var tempSections = candidateJson.secDetails;
		 optionalSectionIndex = [];
		 optionalSectionCounter = 1;
		 //var DefaultOptionalSections;
		// try{DefaultOptionalSections = this.DefaultOptionalSections}catch(e){DefaultOptionalSections = "false";}
		 $(tempSections).each(function(){
		 //console.log("adding sec id");
			mockVar.secIds.push(this.secId);
			 this.secCount=0;//console.log("isOptional "+this.isOptional);console.log("DefaultOptionalSections "+this.DefaultOptionalSections);
			 if(this.isOptional == 'true'){
					if(this.DefaultOptionalSections == "true")
						optionalSectionIndex.push(optionalSectionCounter);
				}
				optionalSectionCounter++;
			 var tempQuestions = this.questions;
			   $(tempQuestions).each(function(){
			   	quesIdIndexes[this.quesId]= count++;
			   	this.isQuesMandUnanswered = false;
			    var isChild = this.comprehensionId!=0 || this.laqId !=0? true:false;
			    comprehensionId = this.comprehensionId!=0?this.comprehensionId:this.laqId;
				if(comprehensionId == previousComprehensionId){
					questionGroupAll = prevQuestionGroupAll;
				} else {
					$(mockVar.compreLaqQues).each(function(){
						if(this.quesId == comprehensionId){
							questionGroupAll = this.groupComprehensionLaqQuestions;
							prevQuestionGroupAll = questionGroupAll;
						}
					});
				}
				if(isChild)
					mockVar.compreLaqQues[mockVar.compreLaqQues.inArray((comprehensionId),"quesId")].childQuesCount= mockVar.compreLaqQues[mockVar.compreLaqQues.inArray((comprehensionId),"quesId")].childQuesCount+1;
				this.questionGroupAll=questionGroupAll;
				this.flagforReVistQues = true;
				if(this.isQuesMand=="true")
					this.isQuesMandUnanswered = true;
			   });
		 });
		 try{if(candidateJson.maxTime == 0)
			 candidateJson.maxTime = "NA";candidateJson.defaultOptionalSections = optionalSectionIndex}catch(e){}
			 mockVar.nonTimeBoundTime = mockVar.time;
		 mockVar.groups.push(candidateJson);
		 candidateOptionSequence();
		 mockVar.nonTimeBoundTime = mockVar.nonTimeBoundTime - (mockVar.groups[mockVar.currentGrp+1].maxTime == "NA" ? 0 : mockVar.groups[mockVar.currentGrp+1].maxTime);
		 mockVar.groupConfigArray = new Array();
		 $(mockVar.groups).each(function(){
			 this.groupCount=0;
				var grpObject=new Object();
				grpObject.isViewable =this.isViewable;
						grpObject.isEditable = this.isEditable;
						grpObject.maxTime=this.maxTime;
						grpObject.minTime=this.minTime;
						
		mockVar.groupConfigArray.push(grpObject)
		})
		 if(parseFloat(candidateExtraTime)>0){
				mockVar.groups[mockVar.currentGrp+1].minTime=Math.round(mockVar.groups[mockVar.currentGrp+1].minTime+((mockVar.groupConfigArray[mockVar.currentGrp+1].minTime*parseFloat(candidateExtraTime))/100));
				mockVar.groups[mockVar.currentGrp+1].maxTime=Math.round(mockVar.groups[mockVar.currentGrp+1].maxTime+((mockVar.groupConfigArray[mockVar.currentGrp+1].maxTime*parseFloat(candidateExtraTime))/100));
			}
		// if(!(sessionStorage.reliableMode == true || sessionStorage.reliableMode == 'true')){
		 mockVar.groups[mockVar.currentGrp+1].remainingTimeForGroup= 0;
		 mockVar.groups[mockVar.currentGrp+1].groupEllapsedTime =0;
		 if(mockVar.groups[mockVar.currentGrp+1].maxTime>0){
			 mockVar.groups[mockVar.currentGrp+1].remainingTimeForGroup= mockVar.groups[mockVar.currentGrp+1].maxTime;
		 }
			 submitGroup();
			 tempAuditJson=null;
			 tempAuditJson= [];
			 saveBackUp(); /// inorder to save mockvar.comprelaqques & mockvar.groups in backup immediately, to avoid error in invalidate scenario without backup passed
		 /*iOAP.curSection=0;*/
		/* }else{
			 isAdaptiveInBetweenGroup = true;
			 isModuleMediaDownloaded();
		 }*/
		}
	 

	}
	
	var nbTime=parseInt(mockVar.nonTimeBoundTime);
	mockVar.nonTbTime=nbTime;
	
	}

	function mockVarSecIdsForAdaptive(tempsecDetails,grpIndex){
	//console.log("mockVarSecIdsForAdaptive"+grpIndex);
	//console.log(mockVar.secIds);
	 if(typeof(mockVar.secIds) == "undefined"){
		mockVar.secIds = [];
	 }
	 //console.log(mockVar.secIds);
	 var tempSec = mockVar.secIds;
	// var tempsecDetails = tempGrp.secDetails;
	//console.log("tempsecDetails length "+tempsecDetails.length);
		$(tempsecDetails).each(function(){
		//console.log("secGrp"+ tempSec.indexOf(this.secId));
		 if(tempSec.indexOf(this.secId) > -1){
		  var tempQuestions = this.questions;
			mockVarQuestionIdsForAdaptive(tempQuestions,grpIndex,tempSec.indexOf(this.secId));
		 } else {
		// console.log("new section"+ JSON.stringify(this));
			mockVar.groups[grpIndex].secDetails.push(this);
			mockVar.secIds.push(this.secId);
			iOAP.curSection++;
			//console.log(mockVar.secIds);
		 }
		});
	}

	function mockVarQuestionIdsForAdaptive(tempQuestionsObject,grpIndex,secIndex){
		//console.log("mockVarQuestionIdsForAdaptive "+grpIndex+" "+secIndex+" "+tempQuestionsObject.length);
		$(tempQuestionsObject).each(function(){
		//console.log("adding "+ this.quesId +" "+ grpIndex +" "+secIndex);
		//console.log(JSON.stringify(this));
			if(typeof(mockVar.isCAT)!="undefined" && mockVar.isCAT){
				mockVar.groups[grpIndex].secDetails[secIndex].questions.push(this);
				 iOAP =mockVar.groups[grpIndex];
			}else{
				//mockVar.groups[grpIndex].secDetails[secIndex].questions.push(this);
				 iOAP.secDetails[iOAP.curSection].questions.push(this);
			}
				 
		});
	}
	function nextQuestioncall(qpId,orgId,mockId,curQuesData){
		//var quesType = curQuesBean.quesType;
		var ans;
		mockVar.qpId = qpId;
		var stageId= parseInt(mockVar.stageId);
		var jsonData = {};
		jsonData["candidate_json"] = JSON.stringify(mockVar.candidateJson);
		jsonData["previousQuestionResponseForStage"] = JSON.stringify(mockVar.previousQuestions);
		jsonData["currentResponseForStage"] = JSON.stringify(curQuesData);
		if(typeof(mockVar.isCAT)!="undefined" && mockVar.isCAT)
			jsonData["stageId"]= stageId;
		else
			jsonData["stageId"]= ++stageId;
		jsonData["candidateCounter"] = iOAP.curQues+2;
		jsonData["examStatus"] = mockVar.examStatus;
		jsonData["currGroupMaxTime"] =mockVar.groups[mockVar.currentGrp].maxTime;
		/*if(curQuesBean.quesType == "MCQ" || curQuesBean.quesType == "MSQ")
			ans = curQuesBean.quesParam.selectedOptId;
		else
			ans = curQuesBean.quesParam.answer;
		var correct_response = curQuesBean.correctAnswer;*/
		//if(mockVar.reliableMode == 'true' || mockVar.reliableMode == true)sendAllFiles();
		isNextQuestionCallExecuting = true;
		var xmlURL = "/IBACC/MockCandidateAction.do?action=adaptiveNextQuesCall&orgId="+orgId+"&mockId="+mockId+"&QPId="+qpId+"&subjectId="+sessionStorage.subjectId+"&candId="+mockVar.candMasterId+"&attemptId="+mockVar.attemptId+"&isNewAssessment="+sessionStorage.isNewAssessment;
		$.ajax({
			url:xmlURL,
			type: 'POST',
			data:jsonData,
			async: false,
			dataType: 'json',
			success: function (data) {
				try{
					data = JSON.parse(data);
					}catch(e){
						data = JSON.parse(JSON.stringify(data));
					}
					isNextQuestionCallExecuting = false;
					// request_status and exam_status
					if(typeof(data.request_status)!="undefined" && data.request_status !="Failed"){
						if(mockVar.reliableMode == 'true' || mockVar.reliableMode == true)sendAllFiles();
						mockVar.stageId=data.stage_id;
						mockVar.examType = data.exam_type;
						mockVar.candidateJson = data.candidateJson;
						mockVar.candidateGroup = data.candidateGroup;
						mockVar.previousQuestions = data.previousQuestions;
						mockVar.examStatus = data.exam_status;
						mockVar.navigatedGroups=data.candidateJson.previous_nav_group;
						mockVar.navigatedModules=data.candidateJson.previous_nav_module;
						if(mockVar.examStatus == "NEXT_QUESTION"){
							if(mockVar.reliableMode == 'true' || mockVar.reliableMode == true){$("#BCDyanamicLoader").show();startReliableLoader();}
							mockVar.currentAbility=data.currentAbility;
							mockVar.standardError=data.standardError;
							mockVar.itemDifficulty=data.itemDifficulty;
							prepareMockObjectForCompreAdaptive(data.compreLaqData.compreLaqDetails,qpId);
							prepareMockObjectForAdaptive(mockVar.candidateGroup,qpId);
							var AuditJsonObject = new Object();
							var orgId = 0;
							var attemptId = 0;
							var mockId = 0;
							var candMasterId = 0;
							var buttonStatus = false;
							if(typeof(data.isCAT) =="undefined" || data.isCAT==false){//for cat there is only one stage so this audit is not applicable.
							AuditJsonObject.ActionName = "StageId :"+mockVar.stageId;
							AuditJsonObject.RecordNumber = auditRecordNumber++;
							AuditJsonObject.candidateName = sessionStorage.isOfflinePaper=='1' ? sessionStorage.username : $.cookie("username");
							AuditJsonObject.loginId = sessionStorage.isOfflinePaper=='1' ? sessionStorage.username : $.cookie("loginId");
							AuditJsonObject.GroupId = "NA";
							AuditJsonObject.ActionDesc = JSON.stringify(mockVar.candidateJson).replaceAll(",","<comma>");
							orgId = mockVar.orgId;
							mockId = mockVar.mockId;
							candMasterId =mockVar.candMasterId;
							attemptId = mockVar.attemptId;
							buttonStatus = false;
							AuditJsonObject.SectionId = "NA";
							AuditJsonObject.QuestionId = "NA";
							AuditJsonObject.SelectedOptionId = "NA";
							AuditJsonObject.OptionSequence = "NA";
							var currentDate = new Date();
							AuditJsonObject.Time = currentDate.yyyymmddHHmmss();
							AuditJsonObject.mockVarLoginId = mockVar.loginId;
							AuditJson.push(AuditJsonObject);
							}
						}else if(mockVar.examStatus == "FINISHED"){
							mockVar.currentAbility=data.currentAbility;
							mockVar.standardError=data.standardError;//finalability, stderror.
							if(typeof(data.isCAT)!="undefined" && data.isCAT==true)
								auditlogCreation("Save & Next","exit criteria met","savenext");
							else
								auditlogCreation("Save & Next","","savenext");
							var AuditJsonObject = new Object();
							var orgId = 0;
							var attemptId = 0;
							var mockId = 0;
							var candMasterId = 0;
							var buttonStatus = false;
							if(typeof(data.isCAT) =="undefined" || data.isCAT==false){//for cat there is only one stage so this audit is not applicable.
							AuditJsonObject.ActionName = "StageId :"+mockVar.stageId;
							AuditJsonObject.RecordNumber = auditRecordNumber++;
							AuditJsonObject.candidateName = sessionStorage.isOfflinePaper=='1' ? sessionStorage.username : $.cookie("username");
							AuditJsonObject.loginId = sessionStorage.isOfflinePaper=='1' ? sessionStorage.username : $.cookie("loginId");
							AuditJsonObject.GroupId = "NA";
							AuditJsonObject.ActionDesc = JSON.stringify(mockVar.candidateJson).replaceAll(",","<comma>");
							orgId = mockVar.orgId;
							mockId = mockVar.mockId;
							candMasterId =mockVar.candMasterId;
							attemptId = mockVar.attemptId;
							buttonStatus = false;
							AuditJsonObject.SectionId = "NA";
							AuditJsonObject.QuestionId = "NA";
							AuditJsonObject.SelectedOptionId = "NA";
							AuditJsonObject.OptionSequence = "NA";
							var currentDate = new Date();
							AuditJsonObject.Time = currentDate.yyyymmddHHmmss();
							AuditJsonObject.mockVarLoginId = mockVar.loginId;
							AuditJson.push(AuditJsonObject);
							}
							if((mockVar.curQuesBean.comprehensionId>0||mockVar.curQuesBean.laqId>0) && mockVar.compreLaqQues[mockVar.compreLaqQues.inArray(mockVar.curQuesBean.comprehensionId>0?mockVar.curQuesBean.comprehensionId:mockVar.curQuesBean.laqId,"quesId")].groupComprehensionLaqQuestions=='true')
								fnsubmitGroupQuestion('SUBMIT');
							else
								fnSubmit('SUBMIT');
							setTimeout(function(){clearTimeout(mockVar.timeCounter);},1000)
							//console.log("final api should be called");
						}
							
					}else{
						alert("back End error");
					}
			},
			error:function(){
				isNextQuestionCallExecuting = false;
				if(mockVar.reliableMode == 'true' || mockVar.reliableMode == true){
					saveBackUp();
					if(mockVar.currentGrp == sessionStorage.noOfAdaptiveStages -1 ){

						auditlogCreation("Save & Next","","savenext");
						var AuditJsonObject = new Object();
						var orgId = 0;
						var attemptId = 0;
						var mockId = 0;
						var candMasterId = 0;
						var buttonStatus = false;
						AuditJsonObject.ActionName = "StageId :"+mockVar.stageId;
						AuditJsonObject.RecordNumber = auditRecordNumber++;
						AuditJsonObject.candidateName = sessionStorage.isOfflinePaper=='1' ? sessionStorage.username : $.cookie("username");
						AuditJsonObject.loginId = sessionStorage.isOfflinePaper=='1' ? sessionStorage.username : $.cookie("loginId");
						AuditJsonObject.GroupId = "NA";
						AuditJsonObject.ActionDesc = JSON.stringify(mockVar.candidateJson).replaceAll(",","<comma>");
						orgId = mockVar.orgId;
						mockId = mockVar.mockId;
						candMasterId =mockVar.candMasterId;
						attemptId = mockVar.attemptId;
						buttonStatus = false;
						AuditJsonObject.SectionId = "NA";
						AuditJsonObject.QuestionId = "NA";
						AuditJsonObject.SelectedOptionId = "NA";
						AuditJsonObject.OptionSequence = "NA";
						var currentDate = new Date();
						AuditJsonObject.Time = currentDate.yyyymmddHHmmss();
						AuditJsonObject.mockVarLoginId = mockVar.loginId;
						AuditJson.push(AuditJsonObject);
						if((mockVar.curQuesBean.comprehensionId>0||mockVar.curQuesBean.laqId>0) && mockVar.compreLaqQues[mockVar.compreLaqQues.inArray(mockVar.curQuesBean.comprehensionId>0?mockVar.curQuesBean.comprehensionId:mockVar.curQuesBean.laqId,"quesId")].groupComprehensionLaqQuestions=='true')
							fnsubmitGroupQuestion('SUBMIT');
						else
							fnSubmit('SUBMIT');
						setTimeout(function(){clearTimeout(mockVar.timeCounter);},1000)
						//console.log("final api should be called");
						isReliableAssessmentSubmitted = true;
					
					}
					else{	
						cnfPop('backupAlerts');hideCloseAndOkayForSecuredAssessments();
						$("#backupAlertMsg").html($(globalXmlvar).find('ReliableSlowNetwork').text());
					}
				}else if(mockVar.isCAT){//added for testing. 1926786
					saveBackUp();
					cnfPop('backupAlerts');hideCloseAndOkayForSecuredAssessments();
					$("#backupAlertMsg").html($(globalXmlvar).find('ReliableSlowNetwork').text());
				}
			}
		});
	}
	
	function evaluateAnswer(curQues,curQuesData){
		
		if(curQues.quesType == "MCQ"){
			for(var k=0;k<curQues.options.length;k++){
				if(curQues.quesParam.selectedOptId == curQues.options[k].optId){
					if(curQues.options[k].isCorrect =="true")
						return (curQues.options[k].OptionLevelMarks!=undefined && curQues.options[k].OptionLevelMarks!=0 ?curQues.options[k].OptionLevelMarks:curQues.allottedMarks);
					else
						return (curQues.options[k].OptionLevelMarks!=undefined && curQues.options[k].OptionLevelMarks!=0 ?-curQues.options[k].OptionLevelMarks:(curQues.negMarks==0?0:-curQues.negMarks));	
				}
			}
			if(sessionStorage.unansweredQuestionScore == "NO"){//assigning loweset marks for unasweredquestions
				return  (curQues.negMarks==0?0:-curQues.negMarks);	
			}
			return 0;
		}else if(curQues.quesType == "MSQ"){
			var msqSum=0,hasOM = false,proceed = false;
			//if(curQues.correctoptions.split(",").length == curQues.quesParam.selectedOptId.split(",").length){
			for(var s=0;s<curQues.quesParam.selectedOptId.split(",").length;s++){
				for(var k=0;k<curQues.options.length;k++){
						if(curQues.quesParam.selectedOptId.split(",")[s] == curQues.options[k].optId){
							if(curQues.options[k].OptionLevelMarks!=undefined ){//&& curQues.options[k].OptionLevelMarks!=0){
								hasOM = true;
								msqSum = msqSum + parseInt(curQues.options[k].OptionLevelMarks);
								proceed = true;
							}else{
								if(curQues.options[k].isCorrect =="true"){
									proceed = true;
									break;
								}else{
									proceed = false;
									break;
								}
							}
						}
					}
					if(!proceed)
						break;
				
			}			
			//}
			if(proceed && !hasOM){
				if(curQues.correctoptions.split(",").length == curQues.quesParam.selectedOptId.split(",").length)
					msqSum = msqSum +curQues.allottedMarks;
			}else if(!hasOM){
			if(curQues.quesParam.status=="answered" || !(sessionStorage.unansweredQuestionScore =="YES"))
				msqSum = msqSum -curQues.negMarks;
			}
			return msqSum;
			/*for(var k=0;k<curQues.options.length;k++){
				
				for(var s=0;s<curQues.quesParam.selectedOptId.split(",").length;s++){
					if(curQues.quesParam.selectedOptId.split(",")[s] == curQues.options[k].optId){
						if(curQues.options[k].OptionLevelMarks!=undefined && curQues.options[k].OptionLevelMarks!=0){
							msqSum = msqSum + curQues.options[k].OptionLevelMarks;
							hasOM = true;
						}
						else{
							hasOM = false;
						}
						
					}
				}
			}*/
		}else if(curQues.quesType == "SA"){//for sa type evaluation to be done
			if(curQues.isEvaluationRequired == "true"){
				if(curQues.keyboardType =="Alphanumeric"){
					if(curQues.answerType =="equals" || curQues.answerType =="Equals"){
						if(curQues.isCaseSensitive == "true"){
							if(curQues.quesParam.answer == curQues.correctoptions){
								return curQues.allottedMarks;
							}else
								{
								if(curQues.quesParam.status=="answered" || !(sessionStorage.unansweredQuestionScore =="YES"))
									return -curQues.negMarks;
								}
							
						}else{
							if(curQues.quesParam.answer.toLowerCase() == curQues.correctoptions.toLowerCase()){
								return curQues.allottedMarks;
							}else
							{
								if(curQues.quesParam.status=="answered" || !(sessionStorage.unansweredQuestionScore =="YES"))
									return -curQues.negMarks;
								}
						}
					}else if(curQues.answerType =="Set"){
						var crctoptset = curQues.correctoptions!=undefined?(curQues.correctoptions.split("<sa_ans_sep>")):"";
						var crctmarks=0;var crctfound =false;
						for(var i=0;i<crctoptset.length;i++){
							if(curQues.isCaseSensitive == "true"){
								if(curQues.quesParam.answer == crctoptset[i]){
									crctmarks = curQues.allottedMarks;
									crctfound = true;
									return crctmarks;
								}		
							}else{
								if(curQues.quesParam.answer.toLowerCase() == crctoptset[i].toLowerCase()){
									crctmarks = curQues.allottedMarks;
									crctfound = true;
									return crctmarks;
								}	
							}
						}
						if(!crctfound){			
							if(curQues.quesParam.status=="answered" || !(sessionStorage.unansweredQuestionScore =="YES"))								
								return -curQues.negMarks;
						}
					}else if(curQues.answerType =="Regex"){
						var answertocheck = curQues.quesParam.answer;
						if(curQues.considerLeadingorTrailingSpaces =="NO"){
							answertocheck = answertocheck.trim();
						}
						if(curQues.ignoreWhiteSpacesInTheResponse == "YES"){
							answertocheck = answertocheck.replaceAll("\\s","");
						}
						if(curQues.punctuationRequiredduringEvaluation =="NO"){
							answertocheck = answertocheck.replaceAll(/[?*]/g, "");
						}
						var term = answertocheck;
						var re = new RegExp(curQues.correctoptions);
						if (re.test(term)) {
						    console.log("Valid");
						    return curQues.allottedMarks;
						} else {
						    console.log("Invalid");   
						if(curQues.quesParam.status=="answered" || !(sessionStorage.unansweredQuestionScore =="YES"))
						    return -curQues.negMarks;
						}
					}
				}else if(curQues.keyboardType =="Numeric"){
					if(curQues.answerType =="equals" || curQues.answerType =="Equals"){
						if(curQues.quesParam.answer == curQues.correctoptions){
							return curQues.allottedMarks;
						}else
							{
						if(curQues.quesParam.status=="answered" || !(sessionStorage.unansweredQuestionScore =="YES"))
							return -curQues.negMarks;
							}
					}else if(curQues.answerType =="Set"){
						var crctoptset =curQues.correctoptions.split("<sa_ans_sep>");var crctmarks=0;var crctfound =false;
						for(var i=0;i<crctoptset.length;i++){
								if(curQues.quesParam.answer == crctoptset[i]){
									crctmarks = curQues.allottedMarks;
									crctfound = true;
									return crctmarks;
								}		
						}
						if(!crctfound){
						if(curQues.quesParam.status=="answered" || !(sessionStorage.unansweredQuestionScore =="YES"))
							return -curQues.negMarks;
						}
					}else if(curQues.answerType =="Range"){
						var crctoptset =curQues.correctoptions.split("<sa_ans_sep>");
						var lowerlimit = crctoptset[0]<crctoptset[1]?crctoptset[0]:crctoptset[1];
						var upperlimit = crctoptset[0]>crctoptset[1]?crctoptset[0]:crctoptset[1];
						if(curQues.quesParam.answer >= lowerlimit && curQues.quesParam.answer <=upperlimit){
							return curQues.allottedMarks;
						}else{
						if(curQues.quesParam.status=="answered" || !(sessionStorage.unansweredQuestionScore =="YES"))
							return -curQues.negMarks;
						}
					}
				}
			}
			
		}
		return 0;
	}
	function prepareMockObjectForCompreAdaptive(compreLaqData,qpId){
		
		$(compreLaqData).each(function(){
		try{
			audioVideoPresentAtQuesLevel = false;
			xmlFilePath = decodeURIComponent(xmlFilePath);
			//compreId = $(this).attr('id');
			var jwPlayerDetailsArray = new Object();
			var jwPlayerDetailsArrayIndex = new Object();
			var tempCountIndex = 0;
			var langBeanArr = new Array();
			var jwAudioVideo = new Array();
			var questionLevelTextImage = typeof(this.questionLevelTextImage) != "undefined" ? this.questionLevelTextImage :"";
			questionLevelTextImage = questionLevelTextImage.replace(/tkcimages/g, xmlFilePath+ qpId + '/tkcimages');
			try {
				this.questionLevelTextImage = questionLevelTextImage;
				this.responseTime = this.compreresponseTime;
				this.thinkTime = this.comprethinkTime;
				this.compremaxTime = this.compremaxTime==0?-1:this.compremaxTime;
			} catch (e) {}
			var comprelangDataLength = this.langData.length;
			var compreId = this.quesId;
			try{
				 if(typeof(mockVar.adaptiveQuesIds) == "undefined")
					 mockVar.adaptiveQuesIds = [];
				 if(mockVar.adaptiveQuesIds.indexOf(compreId) < 0)
					 mockVar.adaptiveQuesIds.push(compreId);
				}catch(e){}
			var tempText = "";
			var tempImageTag = "";
			var tempImageName = "";
			var qLangId = "";
			try{ if(typeof(qpDetailsMockVar[compreId]) == "undefined"){
				qpDetailsMockVar[compreId] = {};
				qpDetailsMockVar[compreId].quesLangBean = [];
			
			}
				}catch(e){}
				qpDetailsMockVar[compreId].questionLevelTextImage = this.questionLevelTextImage;
				this.questionLevelTextImage = "";
			for(var com=0;com<comprelangDataLength;com++){
				var oldFileCounter = 0;
				tempText = this.langData[com].quesText.split("@@@hintseperater@@@")[0];
				try{
					qLangId = this.langData[com].langId;
				}catch(e){}
				
				if(tempText.indexOf("tkcimages/")!=-1){
					tempImageTag = tempText.split("tkcimages/");
					for(var k=1;k<tempImageTag.length;k++){
						// var temporaryImageName = "";
						// temporaryImageName = tempImageTag[k];
						tempImageName=tempImageTag[k].split(".")[0];
						var temporaryFileName = tempImageTag[k].split(".")[0];
						tempImageName=tempImageName.replace(/\s/g, '_');
						var temporaryFileExtension = tempImageTag[k].split(".")[1].split("\"")[0];
						if(temporaryFileExtension.indexOf('>')!= -1){
							temporaryFileExtension = tempImageTag[k].split(".")[1].split("'")[0]; 
						}
						temporaryFileName = temporaryFileName+"."+temporaryFileExtension;
						tempImageName = tempImageName+"."+temporaryFileExtension;
						tempText = tempText.replace(temporaryFileName,tempImageName);
						if(temporaryFileExtension == "mp4"){
							// Rakesh
							audioVideoPresentAtQuesLevel = true;
							tempText = tempText + "<div class='jwAudioVideo' id='jwVideo_"+compreId+"_Claq_"+oldFileCounter+"' title='hasmedia@@tkcimages/"+tempImageName+"hasmedia@@'></div>";

							jwPlayerDetailsArray["jwVideo_" + compreId + "_Claq_" + oldFileCounter] = "<div class='jwAudioVideo' id='jwVideo_" + compreId + "_Claq_" + oldFileCounter + "' title='hasmedia@@tkcimages/" + tempImageName + "hasmedia@@'></div>";
							jwPlayerDetailsArrayIndex[tempCountIndex] = "jwVideo_" + compreId + "_Claq_" + oldFileCounter;
							tempCountIndex++;

							oldFileCounter++ ;
							getFileInBlob('/tkcimages/'+tempImageName,tempImageName,"","");
						}else if(temporaryFileExtension == "mp3"){
							// Rakesh
							audioVideoPresentAtQuesLevel = true;
							tempText = tempText + "<div class='jwAudioVideo' id='jwAudio_"+compreId+"_Claq_"+oldFileCounter+"' title='hasmedia@@tkcimages/"+tempImageName+"hasmedia@@'></div>";
							jwPlayerDetailsArray["jwAudio_" + compreId + "_Claq_" + oldFileCounter] = "<div class='jwAudioVideo' id='jwAudio_" + compreId + "_Claq_" + oldFileCounter + "' title='hasmedia@@tkcimages/" + tempImageName + "hasmedia@@'></div>";
							jwPlayerDetailsArrayIndex[tempCountIndex] = "jwAudio_" + compreId + "_Claq_" + oldFileCounter;
							tempCountIndex++;
							oldFileCounter++ ;
							getFileInBlob('/tkcimages/'+tempImageName,tempImageName,"","");
						};
						
						// tempText=tempImageTag[0]+"tkcimages/"+tempImageName+temporaryImageName.substring(temporaryImageName.indexOf("."));
					};
				}
				if(audioVideoWithHTMLTags){
					var jwplayerwidth = 600;
					var jwplayerHeight = 337.5;
					/*try{
					if(sessionStorage.userdefinedcandconsole==1 && mockVar.curQuesBean.quesType == "SUBJECTIVE"){
						jwplayerwidth = 800;
						jwplayerHeight = 450;
						// console.log("jwplayer width : 800");
					}
					}catch(e){}*/
					if (tempText.indexOf("<audio>") != -1) {

						audioVideoPresentAtQuesLevel = true;
						var newAudioFile = new Array();
						newAudioFile = tempText.match(/(<audio>.+?<audio>)/g);
						for (var i = 0; i < newAudioFile.length; i++) {
							while (tempText.indexOf(newAudioFile[i]) != -1) {
								//if(sessionStorage.assessmentMode == "2")makeAjaxCallToCache(newAudioFile[i].split("<audio>")[1]);
								tempText = tempText.replace(newAudioFile[i], '<audio id="audio_'+compreId+'_'+oldFileCounter+'" class="htmlAudioVideo"><source src="hasmedia@@tkcimages/' + newAudioFile[i].split("<audio>")[1] +'hasmedia@@" type="audio/mpeg"></audio>');
								//quesText = quesText.replace(newAudioFile[i], "<div class='jwAudioVideo' id='jwAudio_" + quesId + "_" + oldFileCounter + "' title='tkcimages/" + newAudioFile[i].split("<audio>")[1] + "'></div>");
								jwPlayerDetailsArray["jwAudio_" + compreId + "_" + oldFileCounter] = "<div class='jwAudioVideo' id='jwAudio_" + compreId + "_" + oldFileCounter + "' title='hasmedia@@tkcimages/" + newAudioFile[i].split("<audio>")[1] + "hasmedia@@'></div>";
								jwPlayerDetailsArrayIndex[tempCountIndex] = "jwAudio_" + compreId + "_" + oldFileCounter;
								tempCountIndex++;
								oldFileCounter++;
								getFileInBlob('/tkcimages/'+newAudioFile[i].split("<audio>")[1],newAudioFile[i].split("<audio>")[1],"","");
							}
						}
					
					}
					
					if (tempText.indexOf("<video>") != -1) {

						audioVideoPresentAtQuesLevel = true;
						var newVideoFile = new Array();
						newVideoFile = tempText.match(/(<video>.+?<video>)/g);
						for (var i = 0; i < newVideoFile.length; i++) {
							while (tempText.indexOf(newVideoFile[i]) != -1) {
								//if(sessionStorage.assessmentMode == "2")makeAjaxCallToCache(newVideoFile[i].split("<video>")[1]);
								tempText = tempText.replace(newVideoFile[i], '<video width="'+jwplayerwidth+'" height="'+jwplayerHeight+'" id="video_'+compreId+'_'+oldFileCounter+'"  class="htmlAudioVideo"><source src="hasmedia@@tkcimages/' + newVideoFile[i].split("<video>")[1] +'hasmedia@@" type="video/mp4"></video>');
								//quesText = quesText.replace(newVideoFile[i], "<div class='jwAudioVideo' id='jwVideo_" + quesId + "_" + oldFileCounter + "' title='tkcimages/" + newVideoFile[i].split("<video>")[1] + "'></div>");
								jwPlayerDetailsArray["jwVideo_" + compreId + "_" + oldFileCounter] = "<div class='jwAudioVideo' id='jwVideo_" + compreId + "_" + oldFileCounter + "' title='hasmedia@@tkcimages/" + newVideoFile[i].split("<video>")[1] + "hasmedia@@'></div>";
								jwPlayerDetailsArrayIndex[tempCountIndex] = "jwVideo_" + compreId + "_" + oldFileCounter;
								tempCountIndex++;
								oldFileCounter++;
								getFileInBlob('/tkcimages/'+ newVideoFile[i].split("<video>")[1], newVideoFile[i].split("<video>")[1],"","");
							}
						}
					
					}
				} else{
					if(tempText.indexOf("<audio>")!=-1){
						audioVideoPresentAtQuesLevel = true;
						var newAudioFile = new Array();
						newAudioFile = tempText.match(/(<audio>.+?<audio>)/g);
						for(var i=0;i<newAudioFile.length;i++){
							while (tempText.indexOf(newAudioFile[i])!=-1) {
								if(sessionStorage.assessmentMode == "2")makeAjaxCallToCache(newAudioFile[i].split("<audio>")[1]);
								tempText = tempText.replace(newAudioFile[i],"<div class='jwAudioVideo' id='jwAudio_"+compreId+"_Claq_"+oldFileCounter+"' title='hasmedia@@tkcimages/"+newAudioFile[i].split("<audio>")[1]+"hasmedia@@'></div>");
								jwPlayerDetailsArray["jwAudio_" + compreId + "_Claq_" + oldFileCounter] = "<div class='jwAudioVideo' id='jwAudio_" + compreId + "_Claq_" + oldFileCounter + "' title='hasmedia@@tkcimages/" + newAudioFile[i].split("<audio>")[1] + "hasmedia@@'></div>";
								jwPlayerDetailsArrayIndex[tempCountIndex] = "jwAudio_" + compreId + "_Claq_" + oldFileCounter;
								tempCountIndex++;
								oldFileCounter++ ;
								getFileInBlob('tkcimages/'+ newAudioFile[i].split("<audio>")[1], newAudioFile[i].split("<audio>")[1],"","");
							}
						}
					}
					if(tempText.indexOf("<video>")!=-1){
						audioVideoPresentAtQuesLevel = true;
						var newVideoFile = new Array();
						newVideoFile = tempText.match(/(<video>.+?<video>)/g);
						for(var i=0;i<newVideoFile.length;i++){
							while (tempText.indexOf(newVideoFile[i])!=-1) {
								if(sessionStorage.assessmentMode == "2")makeAjaxCallToCache(newVideoFile[i].split("<video>")[1]);
								tempText = tempText.replace(newVideoFile[i],"<div class='jwAudioVideo' id='jwVideo_"+compreId+"_Claq_"+oldFileCounter+"' title='hasmedia@@tkcimages/"+newVideoFile[i].split("<video>")[1]+"hasmedia@@'></div>");
								jwPlayerDetailsArray["jwVideo_" + compreId + "_Claq_" + oldFileCounter] = "<div class='jwAudioVideo' id='jwVideo_" + compreId + "_Claq_" + oldFileCounter + "' title='hasmedia@@tkcimages/" + newVideoFile[i].split("<video>")[1] + "hasmedia@@'></div>";
								jwPlayerDetailsArrayIndex[tempCountIndex] = "jwVideo_" + compreId + "_Claq_" + oldFileCounter;
								tempCountIndex++;
								oldFileCounter++ ;
								getFileInBlob('tkcimages/'+ newVideoFile[i].split("<video>")[1], newVideoFile[i].split("<video>")[1],"","");
							}
						}
					}
				}
				if(tempText.indexOf("<file>")!=-1){
					tempText = saReferenceDownloadFromQuestionText(tempText,oldFileCounter);
					oldFileCounter++;
				}
				if(mockVar.MagnifyingGlass == 1){
					if(tempText.indexOf('<img') != -1 && tempText.indexOf('data-mathml') == -1) {
						var newImageFile = new Array();	
						tempText = tempText.replace(/'/g,'"');
						newImageFile = tempText.match(/(<img.+?src="(.+?)".+?>)/g);
						if(newImageFile!=undefined){
						for (var i = 0; i < newImageFile.length; i++) {
							while (tempText.indexOf(newImageFile[i]) != -1) {
								var imageName = newImageFile[i].split('src=')[1].split('/>');
								// tempText = tempText.replace(newImageFile[i],
								// "<span class='ans'><a class='imageZoom'
								// href="+imageName[0]+"><img class='imageZoom'
								// style='max-width:300px;max-height:300px'
								// src="+imageName[0]+"/></a></span>");

								tempText = tempText.replace(newImageFile[i], "<span class='ans' id='MGIMG_"+compreId+"_Claq_"+oldFileCounter+"'><a class='imageZoom' href=hasmedia@@"+imageName[0]+"hasmedia@@><img class='imageZoom' style='max-width:300px;max-height:300px' src=hasmedia@@"+imageName[0]+"hasmedia@@/></a></span>");

								jwPlayerDetailsArray["MGIMG_" + compreId + "_Claq_" + oldFileCounter] = "<span class='ans' id='MGIMG_"+compreId+"_Claq_"+oldFileCounter+"'><a class='imageZoom' href=hasmedia@@"+imageName[0]+"hasmedia@@><img class='imageZoom' style='max-width:300px;max-height:300px' src=hasmedia@@"+imageName[0]+"hasmedia@@/></a></span>";
								jwPlayerDetailsArrayIndex[tempCountIndex] = "MGIMG_" + compreId + "_Claq_" + oldFileCounter;
								tempCountIndex++;
								oldFileCounter++;
								getFileInBlob('/'+ imageName[0], imageName[0].split('\\').pop().split('/').pop(),"","");
							}
						}
						}
					}	
				}else{
					if(tempText.indexOf('<img') != -1 && tempText.indexOf('data-mathml') == -1) {
						var newImageFile = new Array();	
						tempText = tempText.replace(/'/g,'"');
						newImageFile = tempText.match(/(<img.+?src="(.+?)".+?>)/g);
						if(newImageFile!=undefined){
						for (var i = 0; i < newImageFile.length; i++) {
							while (tempText.indexOf(newImageFile[i]) != -1) {
								var imageName = newImageFile[i].split('src=')[1].split('/>');
								if(mockVar.storeCandResponse==1 || isProofReadingMock){
									if(sessionStorage.userdefinedcandconsole == 1)
										tempText = tempText.replace(newImageFile[i], "<img src=hasmedia@@"+imageName[0]+"hasmedia@@>");
									else
										tempText = tempText.replace(newImageFile[i], "<span class='ans'><span class='zoomimage' ><a target='_blank' rel='noopener noreferrer'><img src=hasmedia@@"+imageName[0]+"hasmedia@@ class='max_img_ico' title='"+$(globalXmlvar).find('clickImageToZoom').text()+"'></a></span></span>");
								} else
									tempText = tempText.replace(newImageFile[i], "<span class='ans'><span class='zoomimage' ><a target='_blank' rel='noopener noreferrer'><img src=hasmedia@@"+imageName[0]+"hasmedia@@></a></span></span>");
								oldFileCounter++;
								getFileInBlob('/'+ imageName[0], imageName[0].split('\\').pop().split('/').pop(),"","");
							}
						}
						}
					}
				}
				tempText = editAudioVideoImageFilePath(tempText,this.additionalQuesType=="SEQUENCE"?true:false);
				//this.langData[com].quesText = tempText;
				this.langData[com].quesText = "";
				//qpDetailsMockVar[compreId+"_"+qLangId] = tempText;
				var tempQuesTextObject = {};
				tempQuesTextObject["quesText"] = tempText;
				qpDetailsMockVar[compreId].quesLangBean[com] = tempQuesTextObject;
			}
			
			jwPlayerDetails[compreId+""] = jwPlayerDetailsArray;
			jwPlayerDetailsIndex[compreId+""] = jwPlayerDetailsArrayIndex;
			//mockVar.compreLaqQues.push(new compreLaqQuesBean(compreId,langBeanArr,groupComprehensionQuestions,jwAudioVideo,allowedVolumeControl,allowedProgression,noOfReplays,timeIntervalToReplay,isControlEnable,autoplay,additionalQuesType,columnType,subquestionShuffling,AllowToggleForCompre,MovableSplitterForCompre,ResolutionForCompre,ResolutionForChild,showCalculatorQuesLevel,maxNoOfQuesLimitForCompreOrGrpCompre,compremaxTime,compreminTime,childQuesCount,isVertical,questionLevelTextImage,responseTime,thinkTime,minTime,issubjectivequestion));
			this.childQuesCount= 0;
		}catch(e){}
		if(typeof(quesIdIndexes) == "undefined" || typeof(quesIdIndexes[this.quesId]) == "undefined"){
			this.audioVideoPresentAtQuesLevel = audioVideoPresentAtQuesLevel;
			quesIdIndexes[this.quesId] = mockVar.compreLaqQues.length;
			mockVar.compreLaqQues.push(this);
			//quesIdIndexes[this.quesId]=comprecount++; commenting this because while relaunching the assessment comprecount will be again assigned to 0, even if there are compre questions.
		}
		compreGroupDetails[this.quesId+""] = this.groupComprehensionLaqQuestions;
		})
	}
	
	function prepareQpDetailsMockVarForRelaunch(){
		var tempKeys = Object.keys(qpDetailsMockVar);
		xmlFilePath = decodeURIComponent(xmlFilePath);
		var tempKeyLength = tempKeys.length;
		var tempQLangBeanLength = 0;
		var tempText = "";
		var iterationCount = 0;
		var tempImageTag = "";
		var tempImageName = "";
		var jwPlayerDetailsArray = new Object();
		var jwPlayerDetailsArrayIndex = new Object();
		audioVideoPresentAtQuesLevel = false;
		xmlFilePath = decodeURIComponent(xmlFilePath);
		var tempCountIndex = 0;
		var jwAudioVideo = new Array();
		var compreId = "";
		do{
		for(var qpDCount=0;qpDCount<tempKeyLength;qpDCount++){
			if((iterationCount == 0 && (qpDetailsMockVar[tempKeys[qpDCount]].quesType == "LAQ" || qpDetailsMockVar[tempKeys[qpDCount]].quesType == "COMPREHENSION")) || (iterationCount == 1 && qpDetailsMockVar[tempKeys[qpDCount]].quesType != "LAQ" && qpDetailsMockVar[tempKeys[qpDCount]].quesType != "COMPREHENSION") ){
				tempQLangBeanLength = qpDetailsMockVar[tempKeys[qpDCount]].quesLangBean.length;
				tempCountIndex = 0;
				if(typeof(qpDetailsMockVar[tempKeys[qpDCount]].questionLevelTextImage) != "undefined" && qpDetailsMockVar[tempKeys[qpDCount]].questionLevelTextImage != "" ){
					var questionLevelTextImage = qpDetailsMockVar[tempKeys[qpDCount]].questionLevelTextImage;
					if((!isProofReadingMock) && (!isOfflineIBA)){
						if(mockVar.storeCandResponse==1){
							questionLevelTextImage = questionLevelTextImage.replace(/tkcimages/g, xmlFilePath+ mockVar.qpId + '/tkcimages');
						}
						else{
							questionLevelTextImage = questionLevelTextImage.replace(/tkcimages/g, xmlFilePath + 'tkcimages');
						}
						
					}else if(isProofReadingMock){
						if(document.URL.indexOf("isProofReading")>-1)
							questionLevelTextImage = questionLevelTextImage.replace(/tkcimages/g, proofReadingQpPath + '/tkcimages');
					}else if(isOfflineIBA){
						// sessionStorage.offlineIBAQpPath
						questionLevelTextImage = questionLevelTextImage.replace(/tkcimages/g, xmlFilePath+'/'+sessionStorage.qp_id + '/tkcimages');
					}else{
					// Do Nothing
					}
					qpDetailsMockVar[tempKeys[qpDCount]].questionLevelTextImage = questionLevelTextImage;
				}
			for(var qLangBeanLength = 0; qLangBeanLength<tempQLangBeanLength;qLangBeanLength++){
				var oldFileCounter = 0;
				if(iterationCount == 0){
					compreId = tempKeys[qpDCount];
					tempText = qpDetailsMockVar[tempKeys[qpDCount]].quesLangBean[qLangBeanLength].quesText.split("@@@hintseperater@@@")[0];
					if(tempText.indexOf("tkcimages/")!=-1){
						tempImageTag = tempText.split("tkcimages/");
						for(var k=1;k<tempImageTag.length;k++){
							tempImageName=tempImageTag[k].split(".")[0];
							var temporaryFileName = tempImageTag[k].split(".")[0];
							tempImageName=tempImageName.replace(/\s/g, '_');
							var temporaryFileExtension = tempImageTag[k].split(".")[1].split("\"")[0];
							if(temporaryFileExtension.indexOf('>')!= -1){
								temporaryFileExtension = tempImageTag[k].split(".")[1].split("'")[0]; 
							}
							temporaryFileName = temporaryFileName+"."+temporaryFileExtension;
							tempImageName = tempImageName+"."+temporaryFileExtension;
							tempText = tempText.replace(temporaryFileName,tempImageName);
							if(temporaryFileExtension == "mp4"){
								tempText = tempText + "<div class='jwAudioVideo' id='jwVideo_"+compreId+"_Claq_"+oldFileCounter+"' title='hasmedia@@tkcimages/"+tempImageName+"hasmedia@@'></div>";

								jwPlayerDetailsArray["jwVideo_" + compreId + "_Claq_" + oldFileCounter] = "<div class='jwAudioVideo' id='jwVideo_" + compreId + "_Claq_" + oldFileCounter + "' title='hasmedia@@tkcimages/" + tempImageName + "hasmedia@@'></div>";
								jwPlayerDetailsArrayIndex[tempCountIndex] = "jwVideo_" + compreId + "_Claq_" + oldFileCounter;
								tempCountIndex++;

								oldFileCounter++ ;
								getFileInBlob('tkcimages/'+ tempImageName, tempImageName,"","");
							}else if(temporaryFileExtension == "mp3"){
								tempText = tempText + "<div class='jwAudioVideo' id='jwAudio_"+compreId+"_Claq_"+oldFileCounter+"' title='hasmedia@@tkcimages/"+tempImageName+"hasmedia@@'></div>";
								jwPlayerDetailsArray["jwAudio_" + compreId + "_Claq_" + oldFileCounter] = "<div class='jwAudioVideo' id='jwAudio_" + compreId + "_Claq_" + oldFileCounter + "' title='hasmedia@@tkcimages/" + tempImageName + "hasmedia@@'></div>";
								jwPlayerDetailsArrayIndex[tempCountIndex] = "jwAudio_" + compreId + "_Claq_" + oldFileCounter;
								tempCountIndex++;
								oldFileCounter++ ;
								getFileInBlob('tkcimages/'+ tempImageName, tempImageName,"","");
							};
						};
					}
					if(audioVideoWithHTMLTags){
						var jwplayerwidth = 600;
						var jwplayerHeight = 337.5;
						if (tempText.indexOf("<audio>") != -1) {
							var newAudioFile = new Array();
							newAudioFile = tempText.match(/(<audio>.+?<audio>)/g);
							for (var i = 0; i < newAudioFile.length; i++) {
								while (tempText.indexOf(newAudioFile[i]) != -1) {
									tempText = tempText.replace(newAudioFile[i], '<audio id="audio_'+compreId+'_'+oldFileCounter+'" class="htmlAudioVideo"><source src="hasmedia@@tkcimages/' + newAudioFile[i].split("<audio>")[1] +'hasmedia@@" type="audio/mpeg"></audio>');
									jwPlayerDetailsArray["jwAudio_" + compreId + "_" + oldFileCounter] = "<div class='jwAudioVideo' id='jwAudio_" + compreId + "_" + oldFileCounter + "' title='hasmedia@@tkcimages/" + newAudioFile[i].split("<audio>")[1] + "hasmedia@@'></div>";
									jwPlayerDetailsArrayIndex[tempCountIndex] = "jwAudio_" + compreId + "_" + oldFileCounter;
									tempCountIndex++;
									oldFileCounter++;
									getFileInBlob('tkcimages/'+newAudioFile[i].split("<audio>")[1],newAudioFile[i].split("<audio>")[1],"","");
								}
							}
						
						}
						
						if (tempText.indexOf("<video>") != -1) {
							var newVideoFile = new Array();
							newVideoFile = tempText.match(/(<video>.+?<video>)/g);
							for (var i = 0; i < newVideoFile.length; i++) {
								while (tempText.indexOf(newVideoFile[i]) != -1) {
									tempText = tempText.replace(newVideoFile[i], '<video width="'+jwplayerwidth+'" height="'+jwplayerHeight+'" id="video_'+compreId+'_'+oldFileCounter+'"  class="htmlAudioVideo"><source src="hasmedia@@tkcimages/' + newVideoFile[i].split("<video>")[1] +'hasmedia@@" type="video/mp4"></video>');
									jwPlayerDetailsArray["jwVideo_" + compreId + "_" + oldFileCounter] = "<div class='jwAudioVideo' id='jwVideo_" + compreId + "_" + oldFileCounter + "' title='hasmedia@@tkcimages/" + newVideoFile[i].split("<video>")[1] + "hasmedia@@'></div>";
									jwPlayerDetailsArrayIndex[tempCountIndex] = "jwVideo_" + compreId + "_" + oldFileCounter;
									tempCountIndex++;
									oldFileCounter++;
									getFileInBlob('/tkcimages/'+newVideoFile[i].split("<video>")[1],newVideoFile[i].split("<video>")[1],"","");
								}
							}
						
						}
					} else{
						if(tempText.indexOf("<audio>")!=-1){
							audioVideoPresentAtQuesLevel = true;
							var newAudioFile = new Array();
							newAudioFile = tempText.match(/(<audio>.+?<audio>)/g);
							for(var i=0;i<newAudioFile.length;i++){
								while (tempText.indexOf(newAudioFile[i])!=-1) {
									if(sessionStorage.assessmentMode == "2")makeAjaxCallToCache(newAudioFile[i].split("<audio>")[1]);
									tempText = tempText.replace(newAudioFile[i],"<div class='jwAudioVideo' id='jwAudio_"+compreId+"_Claq_"+oldFileCounter+"' title='hasmedia@@tkcimages/"+newAudioFile[i].split("<audio>")[1]+"hasmedia@@'></div>");
									jwPlayerDetailsArray["jwAudio_" + compreId + "_Claq_" + oldFileCounter] = "<div class='jwAudioVideo' id='jwAudio_" + compreId + "_Claq_" + oldFileCounter + "' title='hasmedia@@tkcimages/" + newAudioFile[i].split("<audio>")[1] + "hasmedia@@'></div>";
									jwPlayerDetailsArrayIndex[tempCountIndex] = "jwAudio_" + compreId + "_Claq_" + oldFileCounter;
									tempCountIndex++;
									oldFileCounter++ ;
									getFileInBlob('/tkcimages/'+newAudioFile[i].split("<audio>")[1],newAudioFile[i].split("<audio>")[1],"","");
								}
							}
						}
						if(tempText.indexOf("<video>")!=-1){
							audioVideoPresentAtQuesLevel = true;
							var newVideoFile = new Array();
							newVideoFile = tempText.match(/(<video>.+?<video>)/g);
							for(var i=0;i<newVideoFile.length;i++){
								while (tempText.indexOf(newVideoFile[i])!=-1) {
									if(sessionStorage.assessmentMode == "2")makeAjaxCallToCache(newVideoFile[i].split("<video>")[1]);
									tempText = tempText.replace(newVideoFile[i],"<div class='jwAudioVideo' id='jwVideo_"+compreId+"_Claq_"+oldFileCounter+"' title='hasmedia@@tkcimages/"+newVideoFile[i].split("<video>")[1]+"hasmedia@@'></div>");
									jwPlayerDetailsArray["jwVideo_" + compreId + "_Claq_" + oldFileCounter] = "<div class='jwAudioVideo' id='jwVideo_" + compreId + "_Claq_" + oldFileCounter + "' title='hasmedia@@tkcimages/" + newVideoFile[i].split("<video>")[1] + "hasmedia@@'></div>";
									jwPlayerDetailsArrayIndex[tempCountIndex] = "jwVideo_" + compreId + "_Claq_" + oldFileCounter;
									tempCountIndex++;
									oldFileCounter++ ;
									getFileInBlob('/tkcimages/'+newVideoFile[i].split("<video>")[1],newVideoFile[i].split("<video>")[1],"","");
								}
							}
						}
					}
					if(tempText.indexOf("<file>")!=-1){
						tempText = saReferenceDownloadFromQuestionText(tempText,oldFileCounter);
						oldFileCounter++;
					}
					if(mockVar.MagnifyingGlass == 1){
						if(tempText.indexOf('<img') != -1 && tempText.indexOf('data-mathml') == -1) {
							var newImageFile = new Array();	
							tempText = tempText.replace(/'/g,'"');
							newImageFile = tempText.match(/(<img.+?src="(.+?)".+?>)/g);
							if(newImageFile!=undefined){
							for (var i = 0; i < newImageFile.length; i++) {
								while (tempText.indexOf(newImageFile[i]) != -1) {
									var imageName = newImageFile[i].split('src=')[1].split('/>');
									tempText = tempText.replace(newImageFile[i], "<span class='ans' id='MGIMG_"+compreId+"_Claq_"+oldFileCounter+"'><a class='imageZoom' href=hasmedia@@"+imageName[0]+"hasmedia@@><img class='imageZoom' style='max-width:300px;max-height:300px' src=hasmedia@@"+imageName[0]+"hasmedia@@/></a></span>");
									jwPlayerDetailsArray["MGIMG_" + compreId + "_Claq_" + oldFileCounter] = "<span class='ans' id='MGIMG_"+compreId+"_Claq_"+oldFileCounter+"'><a class='imageZoom' href=hasmedia@@"+imageName[0]+"hasmedia@@><img class='imageZoom' style='max-width:300px;max-height:300px' src=hasmedia@@"+imageName[0]+"hasmedia@@/></a></span>";
									jwPlayerDetailsArrayIndex[tempCountIndex] = "MGIMG_" + compreId + "_Claq_" + oldFileCounter;
									tempCountIndex++;
									oldFileCounter++;
									getFileInBlob('/'+imageName[0],imageName[0].split('\\').pop().split('/').pop(),"","");
								}
							}
							}
						}	
					}else{
						if(tempText.indexOf('<img') != -1 && tempText.indexOf('data-mathml') == -1) {
							var newImageFile = new Array();	
							tempText = tempText.replace(/'/g,'"');
							newImageFile = tempText.match(/(<img.+?src="(.+?)".+?>)/g);
							if(newImageFile!=undefined){
							for (var i = 0; i < newImageFile.length; i++) {
								while (tempText.indexOf(newImageFile[i]) != -1) {
									var imageName = newImageFile[i].split('src=')[1].split('/>');
									if(mockVar.storeCandResponse==1 || isProofReadingMock){
										if(sessionStorage.userdefinedcandconsole == 1)
											tempText = tempText.replace(newImageFile[i], "<img src="+imageName[0]+">");
										else
											tempText = tempText.replace(newImageFile[i], "<span class='ans'><span class='zoomimage' ><a target='_blank' rel='noopener noreferrer'><img src=hasmedia@@"+imageName[0]+"hasmedia@@ class='max_img_ico' title='"+$(globalXmlvar).find('clickImageToZoom').text()+"'></a></span></span>");
									} else
										tempText = tempText.replace(newImageFile[i], "<span class='ans'><span class='zoomimage' ><a target='_blank' rel='noopener noreferrer'><img src=hasmedia@@"+imageName[0]+"hasmedia@@></a></span></span>");
									oldFileCounter++;
									getFileInBlob('/'+imageName[0],imageName[0].split('\\').pop().split('/').pop(),"","");
								}
							}
							}
						}
					}
					tempText = editAudioVideoImageFilePath(tempText,qpDetailsMockVar[tempKeys[qpDCount]].additionalQuesType=="SEQUENCE"?true:false);
					qpDetailsMockVar[tempKeys[qpDCount]].quesLangBean[qLangBeanLength].quesText = tempText;
				} else {
					var tempquesText = qpDetailsMockVar[tempKeys[qpDCount]].quesLangBean[qLangBeanLength].quesText;
					
						var oldFileCounter = 0;
						var optCounter = 0;
						
						var newQuesText = makQuesAudVidDiv(tempquesText,oldFileCounter,tempKeys[qpDCount]);
						tempquesText = newQuesText[0];
						oldFileCounter = newQuesText[1];
						
						tempquesText = editAudioVideoImageFilePath(tempquesText,true);
						qpDetailsMockVar[tempKeys[qpDCount]].quesLangBean[qLangBeanLength].quesText = tempquesText;
					}
			}
			if(iterationCount!=0){
				if(qpDetailsMockVar[tempKeys[qpDCount]].quesType == "MCQ" || qpDetailsMockVar[tempKeys[qpDCount]].quesType == "MSQ"){
					var optDetails = Object.keys(qpDetailsMockVar[tempKeys[qpDCount]].options);
					var optionsLength = optDetails.length;
					
					for(var opt = 0;opt<optionsLength;opt++){
						
						//var optLangLength = candidateJson.secDetails[sec].questions[que].options[opt].optLangBean.length;
						var optLangLength = qpDetailsMockVar[tempKeys[qpDCount]].options[optDetails[opt]].optLangBean.length;
						var oLangId = "";
						for(var optLang = 0;optLang<optLangLength;optLang++){
							oLangId = "";
							var tempOptText = qpDetailsMockVar[tempKeys[qpDCount]].options[optDetails[opt]].optLangBean[optLang].optText.replaceAll("&#39;","'");
							tempOptText = tempOptText.replace(/'/g,"\"");
							var tempImageTag = "";
							var tempImageName = "";
							if(tempOptText.indexOf("tkcimages/")!=-1){
								tempImageTag = tempOptText.split("tkcimages/");
								for(var k=1;k<tempImageTag.length;k++){
									tempImageName=tempImageTag[k].split(".")[0];
									var temporaryFileName = tempImageTag[k].split(".")[0];
									tempImageName=tempImageName.replace(/\s/g, '_');
									var temporaryFileExtension = tempImageTag[k].split(".")[1].split("\"")[0];
									if(temporaryFileExtension.indexOf('>')!= -1){
										temporaryFileExtension = tempImageTag[k].split(".")[1].split("'")[0]; 
									}
									temporaryFileName = temporaryFileName+"."+temporaryFileExtension;
									tempImageName = tempImageName+"."+temporaryFileExtension;
									tempOptText = tempOptText.replace(temporaryFileName,tempImageName);
									if(temporaryFileExtension == "mp4"){
										tempOptText = tempOptText + "<div class='jwAudioVideo multiMediaOption' id='jwVideo_"+quesId+"_"+oldFileCounter+"' title='hasmedia@@tkcimages/"+tempImageName+"hasmedia@@'></div>";
										oldFileCounter++ ;
										getFileInBlob('/tkcimages/'+tempImageName,tempImageName,"","");
									}else if(temporaryFileExtension == "mp3"){
										tempOptText = tempOptText + "<div class='jwAudioVideo multiMediaOption' id='jwAudio_"+quesId+"_"+oldFileCounter+"' title='hasmedia@@tkcimages/"+tempImageName+"hasmedia@@'></div>";
										oldFileCounter++ ;
										getFileInBlob('/tkcimages/'+tempImageName,tempImageName,"","");
									}
								}
							}
							if(tempOptText.indexOf("<audio>")!=-1){
								var newAudioFile = new Array();
								newAudioFile = tempOptText.match(/(<audio>.+?<audio>)/g);
								for(var i=0;i<newAudioFile.length;i++){
									while (tempOptText.indexOf(newAudioFile[i])!=-1) {
										if(sessionStorage.assessmentMode == "2")
											makeAjaxCallToCache(newAudioFile[i].split("<audio>")[1]);
										tempOptText = tempOptText.replace(newAudioFile[i],"<div class='jwAudioVideo multiMediaOption' id='jwAudio_"+quesId+"_"+oldFileCounter+"' title='hasmedia@@tkcimages/"+newAudioFile[i].split("<audio>")[1]+"hasmedia@@'></div>");
										oldFileCounter++ ;
										getFileInBlob('tkcimages/'+newAudioFile[i].split("<audio>")[1],newAudioFile[i].split("<audio>")[1],"","");
									}
								}
							}
							if(tempOptText.indexOf("<video>")!=-1){
								var newVideoFile = new Array();
								newVideoFile = tempOptText.match(/(<video>.+?<video>)/g);
								for(var i=0;i<newVideoFile.length;i++){
									while (tempOptText.indexOf(newVideoFile[i])!=-1) {
										if(sessionStorage.assessmentMode == "2")makeAjaxCallToCache(newVideoFile[i].split("<video>")[1]);
										tempOptText = tempOptText.replace(newVideoFile[i],"<div class='jwAudioVideo multiMediaOption' id='jwVideo_"+quesId+"_"+oldFileCounter+"' title='hasmedia@@tkcimages/"+newVideoFile[i].split("<video>")[1]+"hasmedia@@'></div>");
										oldFileCounter++ ;
										getFileInBlob('/tkcimages/'+newVideoFile[i].split("<video>")[1],newVideoFile[i].split("<video>")[1],"","");
									}
								}
							}
							if(mockVar.MagnifyingGlass == 1){
								if(tempOptText.indexOf('<img') != -1 && tempOptText.indexOf('data-mathml') == -1) {
									var newImageFile = new Array();
									tempOptText = tempOptText.replace(/'/g,'"');
									newImageFile = tempOptText.match(/(<img.+?src="(.+?)".+?>)/g);
									if(newImageFile==undefined || typeof(newImageFile)=="undefined"){
										newImageFile = tempOptText.match(/(<img.+?src=&#39;(.+?)&#39;.+?>)/g);
									}
									if(newImageFile!=undefined){
									for (var i = 0; i < newImageFile.length; i++) {
										while (tempOptText.indexOf(newImageFile[i]) != -1) {
											var imageName = newImageFile[i].split('src=')[1].split('/>');
											tempOptText = tempOptText.replace(newImageFile[i], "<span class='ans'><a class='imageZoom' href=hasmedia@@"+imageName[0].replaceAll(/&#39;/g,'"')+"hasmedia@@><img class='imageZoom' style='max-width:300px;max-height:300px' src=hasmedia@@"+imageName[0].replaceAll(/&#39;/g,'"')+"hasmedia@@/></a></span>");
											oldFileCounter++;
											getFileInBlob('/'+imageName[0],imageName[0].split('\\').pop().split('/').pop(),"","");
										}
									}
									}
								}	
							}else{
								if(tempOptText.indexOf('<img') != -1 && tempOptText.indexOf('data-mathml') == -1) {
									var newImageFile = new Array();
									tempOptText = tempOptText.replace(/'/g,'"');
									
									newImageFile = tempOptText.match(/(<img.+?src="(.+?)".+?>)/g);
									if(newImageFile==undefined || typeof(newImageFile)=="undefined"){
										newImageFile = tempOptText.match(/(<img.+?src=&#39;(.+?)&#39;.+?>)/g);
									}
									if(newImageFile!=undefined){
									for (var i = 0; i < newImageFile.length; i++) {
										while (tempOptText.indexOf(newImageFile[i]) != -1) {
											var imageName = newImageFile[i].split('src=')[1].split('/>');
											if(mockVar.storeCandResponse==1 || isProofReadingMock){
												if(sessionStorage.userdefinedcandconsole == 1)
													tempOptText = tempOptText.replace(newImageFile[i], "<img src=hasmedia@@"+imageName[0]+"hasmedia@@>");
												else
													tempOptText = tempOptText.replace(newImageFile[i], "<span class='ans'><span class='zoomimage' ><a target='_blank' rel='noopener noreferrer'><img src=hasmedia@@"+imageName[0].replaceAll(/&#39;/g,'"')+"hasmedia@@ class='max_img_ico' title='"+$(globalXmlvar).find('clickImageToZoom').text()+"'></a></span></span>");
											} else
												tempOptText = tempOptText.replace(newImageFile[i], "<span class='ans'><span class='zoomimage' ><a target='_blank' rel='noopener noreferrer'><img src=hasmedia@@"+imageName[0].replaceAll(/&#39;/g,'"')+"hasmedia@@></a></span></span>");
											oldFileCounter++;
											getFileInBlob('/'+imageName[0],imageName[0].split('\\').pop().split('/').pop(),"","");
										}
									}
									}
								}
							}
							tempOptText = editAudioVideoImageFilePath(tempOptText,false);
							qpDetailsMockVar[tempKeys[qpDCount]].options[optDetails[opt]].optLangBean[optLang].optText = tempOptText;
						}
					}
					
				}
			}
		}
		}
		iterationCount++;
		}while(iterationCount < 2);
	}
function returnShuffleCount(response,correctResponse){
		var n = response.length;
		var indices = {};
		for(var i=0;i<correctResponse.length;i++){
			indices[correctResponse[i]] =  i;
		}
	
		var arr = [];
		for(var i=0;i<response.length;i++){
			arr[i] = indices[response[i]];
		}
	
		
		var minSwaps = 0;
		for(var i=0;i<n-1;i++){
			for(var j=i+1;j<n;j++){
				if(arr[i]>arr[j]){
					minSwaps++;
				}
			}
		}
		return minSwaps;
	}