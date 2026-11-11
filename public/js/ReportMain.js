var iOAP={};
var reportContentXML;
var currentSection;
var xmlFilePath = "";
var score=0;

jQuery(document).ready(function(){
	var url = document.URL;
	var orgId;
	var assessmentId;
	
	var params = "";
	//alert("Onload"+document.cookie);
	if(url.indexOf("report.html") >= 0 && url.indexOf("http") >=0){
	params = url.split("report.html?");
	orgId= $.trim(params[1]).split("@@")[0];
	assessmentId= $.trim(params[1]).split("@@")[1];
	 
	
	var mockType = "assessment";	
	var xmlURL = "/ASM/MockAssessmentAction.do?action=getXMLPath&orgId="+orgId+"&mockId="+assessmentId+"&mockType="+mockType;
	  jQuery.ajax({
	                url: xmlURL,
	                async: false,
	                type: 'POST',
	                dataType: 'text',
	                success: function(data) {	
					xmlFilePath = data.indexOf("<Sep>")!=-1?data.split("<Sep>")[0]:data;
					//consoleVersion=data.indexOf("<Sep>")!=-1?data.split("<Sep>")[1]:consoleVersion;
					//validity=data.indexOf("<Sep>")!=-1?data.split("<Sep>")[2]:validity;
					xmlFilePath=xmlFilePath.replace(/\\/g,"/");
					document.cookie = "xmlFilePath="+xmlFilePath;
			
						 if(url.indexOf("index.html") >= 0)
							 validateIndexPageURL();
						}
						});
	
	} 
	}); 

Array.prototype.inArray = function(searchFor, property) {
    var retVal = -1;
    $.each(this, function(index, item) {
        if (item.hasOwnProperty(property)) {
            if (item[property].toLowerCase() === searchFor.toLowerCase()) {
                retVal = index;
                return false;
            }
        }
    });
    return retVal;
};
function checkQuesAvailable(){
	if(mockVar.langIndex == -1){
		mockVar.langIndex = 0;
		checkQuesAvailable();
	}
}
function checkFileExist(filePath){
	var response=true;
	$.ajax({
		type: "POST",
		url: filePath,
		async : false,
		dataType: navigator.userAgent.indexOf('msie')!=-1 ? "text" : "xml",
		error : function(){
			response =  false;
		}
	});
	return response;
}

function readAndReturnXML(filePath){

//////alert(filePath);
	////////alert(filePath);
	var xml="";
	$.ajax({
		type: "POST",
		url: filePath,
		async : false,
		dataType: navigator.userAgent.indexOf('msie')!=-1 ? "text" : "xml",
		success: function(data) {
				if (typeof data == "string") {
					xml = new ActiveXObject("Microsoft.XMLDOM");
					xml.async = false;
					//console.log(data);
					xml.loadXML(data);
				} else {
				//console.log(data);
				   xml = data;
				}
			
			},
		error : function(){
		////////alert("");
				window.location.href="error.html?E404";
		}
	});
	return xml;
}

/*function activateAudioPlayer(){
	$(".almAudio .jp-jplayer").each(function(){
		var currentAudioContent = '';
		$($(this).next()).each(function(){
			currentAudioContent = $(this).attr("id");
		});
		$("#"+$(this).attr("id")).jPlayer({
			ready: function () {
				$(this).jPlayer("setMedia", {
					mp3: $(this).attr("title")
				});
			},
			play: function() {
				$(".jp-jplayer").not(this).jPlayer("pause");
			},
			swfPath: "js",
			supplied: "mp3",
			wmode: "window",
			smoothPlayBar: true,
			keyEnabled: true,
			remainingDuration: true,
			toggleDuration: true,
			 cssSelectorAncestor: '#'+currentAudioContent,
			 errorAlerts: false,
			 warningAlerts: false
		});
	});
}

function activateVideoPlayer(){
	$(".almVideo  .jp-jplayer").each(function(){
		$("#"+$(this).attr("id")).jPlayer({
			ready: function () {
				$(this).jPlayer("setMedia", {
					m4v: $(this).parent().parent().attr("name")
				});
			},
		    play: function() {
		        $(".jp-jplayer").not(this).jPlayer("pause");
		    },
			swfPath: "js",
			supplied: "m4v",
			size: {
				width: "640px",
				height: "360px",
				cssClass: "jp-video-360p"
			},
			smoothPlayBar: true,
			keyEnabled: true,
			remainingDuration: true,
			toggleDuration: true,
			cssSelectorAncestor: '#'+$(this).parent().parent().attr("id"),
			errorAlerts: false,
			warningAlerts: false
			
		});	 
	});
}
*/
function returnValidLangID(){
	var langId = 0;
	for(var k=1;k<iOAP.languages.length;k++){
		if(iOAP.languages[k]!=null && typeof(iOAP.languages[k])!='undefined'){
			langId=k;
			break;
		}
	}
	return langId;
}

function validateReportPageURL(){
	var url = document.URL;
	if(url.indexOf("http") >=0){
	var params = url.split("report.html?");
	var orgId = $.trim(params[1]).split("@@")[0];
	var mockId = $.trim(params[1]).split("@@")[1];
	var attemptId = $.trim(params[1]).split("@@")[2];
	var candidateId = $.trim(params[1]).split("@@")[3];
	if(params.length>1 ){
		if(attemptId.indexOf("#")>-1){
			attemptId = attemptId.substring(0,attemptId.indexOf("#"));
		}
		if($.trim(params[1]).length>0){
			mockVar.orgId = orgId;
			mockVar.mockId = mockId;
			mockVar.attemptId = attemptId;
			mockVar.candId = candidateId;
			mockVar.candMasterId = candidateId;
			//getCandIdFromCookie();
			populateMockObj();
			populateReportData();
			loadFunctionality();
		}
	}else{
		window.location.href="error.html";
	}
	} else {
		mockVar.orgId = 1;
			mockVar.mockId = 1;
			mockVar.attemptId = 1;
			mockVar.candId = 1;
			mockVar.candMasterId = 1;
			populateMockObj();
			populateReportData();
			loadFunctionality();
	}
}

function setCandCookie(){
	var candId = "1";
	document.cookie = "app_seq_no="+candId;
	document.cookie = "path=/";
}

/*function getCandIdFromCookie(){
	//setCandCookie();
	var i,x,y,attemptId="",candId="",ARRcookies=document.cookie.split(";");	
	//alert(document.cookie);
	if(ARRcookies != null && ARRcookies != ""){
		for (i=0;i<ARRcookies.length;i++){
			x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
			y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
			x=x.replace(/^\s+|\s+$/g,"");
			if (x=="cand_master_id"){
				candId = y;
				delete_cookie('cand_master_id');
			}
		}
	}else{
		window.location.href="error.html?E103";
	}
	if((candId != null || candId != "")){
		mockVar.candId = unescape(candId);
	}else{
		window.location.href="error.html?E103";
	}
	if(mockVar.candId == ""){
		window.location.href = "error.html?E108";
	}
}*/

function populateMockObj(){
	$.ajaxSetup({
		async: false
	});
	var url = "";
	//////alert("ab"+xmlFilePath+"populateMockObj"+xmlFilePath);
	if(document.URL.indexOf("http") >=0)
		url = xmlFilePath+'CandResponse/'+mockVar.candId+'/'+mockVar.attemptId+'/Report.json';
	else
		url = 'CandResponse/'+mockVar.candId+'/'+mockVar.attemptId+'/Report.json';
	//alert(url);
	$.getJSON(url, function(data){
  mockVar = data;
  mockVar.reportType = 1;
 //alert("Report.json");
  if(typeof(mockVar.difficultyLevelKey) == 'undefined'){
  mockVar.difficultyLevelKey = "Difficulty Level";
  var labelsArray = new Array();
  var cg = 0; cs = 0; cq = 0;
 jQuery(mockVar.groups).each(function(){
   var easyCorrect = 0;easyInCorrect = 0;easyUnAnswered = 0,easyNotEvaluated = 0;easyEvaluated = 0;
  var hardCorrect = 0;hardInCorrect = 0,hardUnAnswered = 0,hardNotEvaluated = 0;hardEvaluated = 0;
  var moderateCorrect = 0;moderateInCorrect = 0,moderateUnAnswered = 0,moderateNotEvaluated = 0;moderateEvaluated = 0;
  
  var secDetails = this.secDetails;
  jQuery(secDetails).each(function(){
  var difficultyLablesArray = new Array();
  var questions = this.questions;
  var questStatus = this.quesAnsStatus;
   
	
  jQuery(questions).each(function(){
  var quesKeyPair = this.quesKeyPair;
  
   jQuery(quesKeyPair).each(function(){
  var keyName = this.keyName;
  if(keyName == "Difficulty Level" && labelsArray.indexOf(this.keyVal)== -1){
	labelsArray.push(this.keyVal);
	////////alert(labelsArray.length +" "+this.keyVal);
	}
	
	if(keyName == "Difficulty Level" && difficultyLablesArray.indexOf(this.keyVal)== -1){
	difficultyLablesArray.push(this.keyVal);
	////////alert(labelsArray.length +" "+this.keyVal);
	}
	
	if(keyName == "Difficulty Level"){
	
	if(questStatus == "Correct" && this.keyVal == "Easy")
		easyCorrect++;
	else if(questStatus == "Incorrect" && this.keyVal == "Easy")
	easyInCorrect++;
	else  if(questStatus == "UnAnswered" && this.keyVal == "Easy")
	easyUnAnswered++;
	else  if(questStatus == "Not Evaluated" && this.keyVal == "Easy")
	easyNotEvaluated++;
	else  if(questStatus == "Evaluated" && this.keyVal == "Easy")
	easyEvaluated++;
	else  if(questStatus == "Correct" && this.keyVal == "Hard")
	hardCorrect++;
	else  if(questStatus == "Incorrect" && this.keyVal == "Hard")
	hardInCorrect++;
	else  if(questStatus == "UnAnswered" && this.keyVal == "Hard")
	hardUnAnswered++;
	else  if(questStatus == "Not Evaluated" && this.keyVal == "Hard")
	hardNotEvaluated++;
	else  if(questStatus == "Evaluated" && this.keyVal == "Hard")
	hardEvaluated++;
	else  if(questStatus == "Correct" && this.keyVal == "Moderate")
	moderateCorrect++;
	else  if(questStatus == "Incorrect" && this.keyVal == "Moderate")
	moderateInCorrect++;
	else  if(questStatus == "UnAnswered" && this.keyVal == "Moderate")
	moderateUnAnswered++;
	else  if(questStatus == "Not Evaluated" && this.keyVal == "Moderate")
	moderateNotEvaluated++;
	else  if(questStatus == "Evaluated" && this.keyVal == "Moderate")
	moderateEvaluated++;
	
	}
  
  });
  });
  var difficultyLevelObjectArray = new Array();
  var difficultyLevelObject = new Object();
  var difficultyObject = new Object();
  difficultyObject.Correct = easyCorrect;
  difficultyObject.Incorrect = easyInCorrect;
  difficultyObject.UnAnswered = easyUnAnswered;
  difficultyObject.Evaluated = easyEvaluated;
  difficultyObject.NotEvaluated = easyNotEvaluated;
  difficultyLevelObject.Easy = difficultyObject;
  difficultyLevelObjectArray.push(difficultyLevelObject.Easy);
  difficultyObject = new Object();
  difficultyObject.Correct = hardCorrect;
  difficultyObject.Incorrect = hardInCorrect;
  difficultyObject.UnAnswered = hardUnAnswered;
  difficultyObject.Evaluated = hardEvaluated;
  difficultyObject.NotEvaluated = hardNotEvaluated;
  difficultyLevelObject.Hard = difficultyObject;
  difficultyLevelObjectArray.push(difficultyLevelObject.Hard);
  difficultyObject = new Object();
  difficultyObject.Correct = moderateCorrect;
  difficultyObject.Incorrect = moderateInCorrect;
  difficultyObject.UnAnswered = moderateUnAnswered;
  difficultyObject.Evaluated = moderateEvaluated;
  difficultyObject.NotEvaluated = moderateNotEvaluated;
  difficultyLevelObject.Moderate = difficultyObject;
  difficultyLevelObjectArray.push(difficultyLevelObject.Moderate);
 // this.difficultyLabels = difficultyLablesArray;
// ////console.log(JSON.Stringify(difficultyLevelObject));
 mockVar.groups[cg].secDetails[cs].difficultyLevel = difficultyLevelObjectArray;
  mockVar.groups[cg].secDetails[cs].difficultyLabels = difficultyLablesArray; //SecLevel Easy,Hard
  cs++;
  //cq = 0;
  });
  cg++;
  cs = 0;
  });
  mockVar.difficultyValues = labelsArray; //qpLevel
  }
  
  
  
  
  
  	//////console.log(data);
		$.ajaxSetup({
			async: true
		});
})
.error(function() { 
//alert("reportjson error");
$.getJSON(xmlFilePath+'/CandResponse/'+mockVar.candId+'/'+mockVar.attemptId+'/Backup.json', function(data){
  mockVar = data;
  //alert("reportjson error");
  mockVar.reportType = 0;
  //console.log(JSON.stringify(mockVar));
		////console.log(data);
		////////alert("backupjson");
		$.ajaxSetup({
			async: true
		});
}); });
	
	
	reportContentXML = readAndReturnXML('ReportContent.xml');
	//mockVar.useDefaultReportFormat = true;
	fillResponseBean();
}

function fillResponseBean(){
var candidateId = "";
//alert("fillResponseBean");
//alert("mockVar.candMasterId"+mockVar.candMasterId+"mockVar.candId"+mockVar.candId);
	if(mockVar.candMasterId == null || mockVar.candMasterId == 0 || mockVar.candMasterId == "0")
		candidateId = mockVar.candId;
	else
		candidateId = mockVar.candMasterId;
	//alert(candidateId);
	//if(mockVar.useDefaultReportFormat)
		var responseXMLFilePath = document.URL.indexOf("http") >=0 ? xmlFilePath+'/CandResponse/'+candidateId+'/'+mockVar.attemptId+'/Response.xml' : 'CandResponse/1/1/Response.xml';
	//else
		//var responseXMLFilePath = 'CandResponse/'+candidateId+'/'+mockVar.attemptId+'/Response.xml';
	//alert("Before " +responseXMLFilePath);
	var responseXml = readAndReturnXML(responseXMLFilePath);
	//alert("after");
	var correctQuesCount = 0, incorrectQuesCount = 0, sectionScore = 0;
	var curGroup;
	//console.log(mockVar);
	for(var grpId=0; grpId<mockVar.groups.length; grpId++){
		curGroup = mockVar.groups[grpId];
		for(var secId=0; secId<curGroup.secDetails.length; secId++){
			curSec = curGroup.secDetails[secId];
			correctQuesCount = 0, incorrectQuesCount = 0, sectionScore = 0, evaluatedQues = 0, notEvaluatedQues = 0;
			for(var quesID=0; quesID<curSec.questions.length; quesID++){
				curQues = curSec.questions[quesID];
				var actualQuesId = curQues.quesId;
				$(responseXml).find('questions').each(function(){
					quesId = $(this).find('quesId').text();
					quesType = $(this).find('quesType').text();
					langId = $(this).find('langId').text();
					quesStatus = $(this).find('quesStatus').text();
					selectedOptId = $(this).find('selectedOptIds').text();
					givenAns = $(this).find('givenAns').text();
					GWPM = $(this).find('GWPM').text();
					NWPM = $(this).find('NWPM').text();
					accuracy = $(this).find('accuracy').text();
					marksObtained = eval($(this).find('marksObtained').text());
					if(actualQuesId == quesId){
						if(curQues.quesParam.status=='markedAndAnswered' && quesStatus=='Unanswered'){
							quesStatus='MarkedForReview';
							}
						sectionScore += marksObtained;
				//		//////alert('match found for quesId='+quesId+' and langId = '+givenAnsLangId);
						
						//Added by sai for evaluation status of typing test
						if(curQues.quesType.toLowerCase()=='typing test'){
							
							if(quesStatus.toLowerCase()!='unanswered'){
								quesStatus='Evaluated';
							}
							
						}
						//Added by sai for evaluation status of typing test ends
						
						//Added by sai for evaluation status of typing test
						if(curQues.quesType.toLowerCase()=='typing test'){
							
							if(quesStatus.toLowerCase()!='unanswered'){
								quesStatus='Evaluated';
							}
							
						}
						//Added by sai for evaluation status of typing test ends
						quesResultBean = new QuestionResultBean(quesId,quesType,langId,selectedOptId,givenAns,marksObtained,quesStatus,GWPM,NWPM,accuracy);
						if(quesStatus=='Correct'){
							correctQuesCount++;
						}else if(quesStatus=='Incorrect'){
							incorrectQuesCount++;
						}else if(quesStatus=='Not Evaluated'){
							notEvaluatedQues++;
						}else if(quesStatus=='Evaluated'){
							evaluatedQues++;
						}
						curQues.quesResultBean = quesResultBean;
					}
				});
			}
			curSec.correctQuesCount = correctQuesCount;
			curSec.incorrectQuesCount = incorrectQuesCount;
			curSec.attemptedQuesCount = correctQuesCount+incorrectQuesCount+evaluatedQues+notEvaluatedQues;
			curSec.sectionScore = sectionScore;
		}
	}
}

function populateReportData(){
	if(mockVar.mockName.length>30){
		$('#mockName').html(mockVar.mockName.substr(0,30)+'...');
	}else{
		$('#mockName').html(mockVar.mockName);
	}
	$('#mockName').attr('title',mockVar.mockName);
	document.title = mockVar.mockName;
	//var langId = returnValidLangID();
	var pieChartData = '[';
	for(var groupNo=0;groupNo<mockVar.groups.length;groupNo++){
		curGroup = mockVar.groups[groupNo];
		//console.log("Group "+curGroup);
		for(var i=0;i<curGroup.secDetails.length;i++){
			curSec = curGroup.secDetails[i];
			//console.log("Section "+curSec);
			totalQues = curSec.questions.length;
			currentSection = curSec;
			if(curSec.sectionScore<0)
				pieChartData += '{"label": "'+curSec.secName+'","value": "0"},';
			else
				pieChartData += '{"label": "'+curSec.secName+'","value": "'+curSec.sectionScore+'"},';
			fillSecDetails(curSec);
			fillQuestionDetails(groupNo,curSec, i, totalQues);
			fillSections(groupNo,i,curSec);
			$('#secContent'+groupNo+i).html(fillSecContent(curSec));
			
		}
	}
	//activateAudioPlayer();
	//activateVideoPlayer();
	$(".almVideo").remove();
	$(".almAudio").remove();
	palyVideo();
	pieChartJSONGlobal += pieChartData.substr(0,pieChartData.length-1)+']}';
	//genPieChart();
	if(typeof(mockVar.resultMarks)!='undefined' && mockVar.resultMarks==0){
		$('.overAllPeformancetab').hide();
		$('.performanceAnalysisTab').hide();
	}
	else if (typeof(mockVar.resultMarks)=='undefined'){
		
	}
	else{
		
	}
}

function fillSections(groupNo, secNo, curSec){
	//genChart(groupNo,secNo);
	//console.log("fillSections");
	var secStr = '';
	secStr += '<li class="ab_tab_title">';
	if(curSec.secName.length>10){
		sec = curSec.secName.substring(0,10)+"...";
		}else{
		sec = curSec.secName;
		}
		secStr += '<a href="javascript:void(0)" title="'+curSec.secName+'">'+sec+'</a>'; 
	secStr += '<ul class="sub_tabs">';
	secStr += '<li class="ab_tab"><a href="javascript:void(0)">Overview</a></li>';
	secStr += '<li class="ab_tab"><a href="javascript:void(0)">Your Response Pattern</a></li>';
//	if(mockVar.difficultyValues.length == 0){
//		secStr += '<li class="ab_tab"><a href="javascript:void(0)">Performance Analysis</a></li>';
//	}else{
		secStr += '<li class="ab_tab performanceAnalysisTab"><a href="javascript:void(0)" onclick="genChart('+groupNo+','+secNo+');">Performance Analysis</a></li>';
//	}
	secStr += '</ul></li>';
	//console.log("secStr "+secStr);
	$('#SectionsLinks').append(secStr);
}

function fillSecDetails(curSec){
//console.log("fillSecDetails");
	var tableStr = '';
	if(curSec.secName.length>10){
		sec = curSec.secName.substring(0,10)+"...";
		}else{
		sec = curSec.secName;
		}
	tableStr += '<tr><td title="'+curSec.secName+'">'+sec+'</td>';
	tableStr += '<td class="center">'+curSec.attemptedQuesCount+'/'+curSec.questions.length+'</td>';
	tableStr += '<td class="center">'+curSec.correctQuesCount+'</td>';
	tableStr += '<td class="center">'+curSec.sectionScore+'</td></tr>';
	//console.log("tableStr"+tableStr);
	$('#overAllReportTable').append(tableStr);
	score=score+parseInt(curSec.sectionScore);
}

function fillQuestionDetails(groupNo,curSec,secId,totalQues){
//////console.log("fillQuestionDetails");
////////alert('');
	mockVar.correct = 0, mockVar.incorrect = 0, mockVar.unanswered = 0;
	var str = '', quesText = '' , quesId = '' ,oldFileCounter = 0;
	str += '<li id="secContent'+groupNo+secId+'"></li>';
	str += '<li> <div class="inner_title">Question wise details</div> </br><div>Please click on question to view detailed analysis</div> <br>';
	
	str += '<ul class="icon_annotations"><li class="icon"><img src="img/NotEvaluated.png"></li><li class="text">= Not Evaluated</li><li class="icon"><img src="img/Evaluated.png"></li><li class="text">= Evaluated</li><li class="icon"><img src="img/Correct.png"></li><li class="text">= Correct</li><li class="icon"><img src="img/Incorrect.png"></li><li class="text">= Incorrect</li><li class="icon"><img src="img/Unanswered.png"></li><li class="text">= Not Attempted</li><li class="icon"><img src="img/MarkedForReview.png"></li><li class="text">= Marked for Review</li></ul><ul class="icon_annotations"><li class="icon"><img src="img/Answered.png"></li><li class="text">= Answered</li><li class="icon"><img src="img/correct_option.png"></li><li class="text">= Correct Option</li><li class="icon"><img src="img/user_option.png"></li><li class="text">= Your Option</li><li class="icon"><img class="PartiallyCorrect" src="img/PartiallyCorrect.png"></li><li class="text">= Partially Correct</li></ul><div class="clear"></div>';
	
	str += '<div class="answer_report"> <div class="titlebar"> <div class="title"> Question Details </div> <div class="filterbar"><a href="javascript:void(0)" class="button question_expand_all">Expand All</a> </div> </div> <ul class="question_list">';
	
	for(var j=0;j<totalQues;j++){
		
	    curQues = curSec.questions[j];
		//console.log("curQues "+curQues);
		var givenAnsStr = '';
		//curQuesResult = curSec.questionResultDetails[j];
		givenAnsLangId = curQues.quesParam.langID;
		mockVar.langIndex=curSec.questions[j].quesLangBeans.inArray(givenAnsLangId.toString(),'langId');
		checkQuesAvailable();
		keyDetailsLen = curQues.quesKeyPair.length;
		if(typeof(curQues.quesLangBeans[mockVar.langIndex])!='undefined')
			quesText = curQues.quesLangBeans[mockVar.langIndex].quesText;
		    quesId = curQues.quesId;
		    oldFileCounter = 0;
		   if(quesText.indexOf('jwAudioVideo')== -1){
		   	    var tempImageTag;
    var tempImageName;
    if (quesText.indexOf("tkcimages/") != -1) {
        tempImageTag = quesText.split("tkcimages/");
        for (var k = 1; k < tempImageTag.length; k++) {


            var temporaryImageName = "";
            temporaryImageName = tempImageTag[k];
            tempImageName = tempImageTag[k].split(".")[0];
            var temporaryFileName = tempImageTag[k].split(".")[0];
            tempImageName = tempImageName.replace(/\s/g, '_');
            var temporaryFileExtension = tempImageTag[k].split(".")[1].split("\"")[0];
            temporaryFileName = temporaryFileName + "." + temporaryFileExtension;
            tempImageName = tempImageName + "." + temporaryFileExtension;
            quesText = quesText.replace(temporaryFileName, tempImageName);
            if (temporaryFileExtension == "mp4") {
                quesText = quesText + "<div class='jwAudioVideo' id='jwVideo_" + quesId + "_" + oldFileCounter + "' title='tkcimages/" + tempImageName + "'></div>";
                oldFileCounter++;
            } else if (temporaryFileExtension == "mp3") {
                quesText = quesText + "<div class='jwAudioVideo' id='jwAudio_" + quesId + "_" + oldFileCounter + "' title='tkcimages/" + tempImageName + "'></div>";
                oldFileCounter++;
            }


        }

    }
		   }
		//calculateQuesStatusCount(curQuesResult.quesStatus);
		str += '<li><div class="question">';
		
		if(typeof(mockVar.resultQuesStatus)!='undefined' && mockVar.resultQuesStatus==1){
			
				str += '<div class="question_type "><img src="img/'+curQues.quesResultBean.quesStatus.replace(/\ /g,"")+'.png"></div>';
				str += '<span class="question_no '+curQues.quesResultBean.quesStatus.replace(/\ /g,"")+'">Q'+(j+1)+'.</span>';
			
			}
			else if(typeof(mockVar.resultQuesStatus)=='undefined'){
				str += '<div class="question_type "><img src="img/'+curQues.quesResultBean.quesStatus.replace(/\ /g,"")+'.png"></div>';
				str += '<span class="question_no '+curQues.quesResultBean.quesStatus.replace(/\ /g,"")+'">Q'+(j+1)+'.</span>';
			}
			else{
				if(curQues.quesResultBean.quesStatus!='Unanswered'){
					if(curQues.quesResultBean.quesStatus=="MarkedForReview"||curQues.quesResultBean.quesStatus=="Marked For Review"){
						str += '<div class="question_type "><img src="img/'+curQues.quesResultBean.quesStatus.replace(/\ /g,"")+'.png"></div>';
						str += '<span class="question_no '+curQues.quesResultBean.quesStatus.replace(/\ /g,"")+'">Q'+(j+1)+'.</span>';
					}else{
						str += '<div class="question_type "><img src="img/Answered.png"></div>';
						str += '<span class="question_no Answered">Q'+(j+1)+'.</span>';
					}
				}
				else{
					str += '<div class="question_type "><img src="img/'+curQues.quesResultBean.quesStatus.replace(/\ /g,"")+'.png"></div>';
					str += '<span class="question_no '+curQues.quesResultBean.quesStatus.replace(/\ /g,"")+'">Q'+(j+1)+'.</span>';
				}
			}
		
        str += '<span class="question_text">'+quesText+'</span></div>';
        str += '<div class="answer clear">';
		str += '<ul class="attributes clear">';
		for(var keyNo=0; keyNo<keyDetailsLen; keyNo++){
			quesKey = curQues.quesKeyPair[keyNo];
			if(keyNo%2==0){
				str+="</ul>";
				str+='<ul class="attributes clear">';
			}
		str += '<li>'+quesKey.keyName+' : <span class="values">'+quesKey.keyVal+'</span></li>';	
			if(quesKey.keyName == mockVar.difficultyLevelKey){
				countDifficultyLevelSecWise(quesKey.keyVal.toUpperCase(),curSec,curQues.quesResultBean.quesStatus);
			}else if(quesKey.keyName == "Difficulty Level"){
				countDifficultyLevelSecWise(quesKey.keyVal.toUpperCase(),curSec,curQues.quesResultBean.quesStatus);
			}
		}
		str += "</ul>";
		str += '<ul class="attributes clear">';
		str += '<li>Response : <span class="values">@@givenAnsStr@@</span></li>';
		
		
		if(typeof(mockVar.resultQuesStatus)!='undefined' && mockVar.resultQuesStatus==1){
			str += '<li>Status : <span class="values">'+curQues.quesResultBean.quesStatus+'</span></li></ul>';
			}
			else if(typeof(mockVar.resultQuesStatus)=='undefined'){
				str += '<li>Status : <span class="values">'+curQues.quesResultBean.quesStatus+'</span></li></ul>';
			}
			else{
				if(curQues.quesResultBean.quesStatus!='Unanswered'){
					if(curQues.quesResultBean.quesStatus=="MarkedForReview"||curQues.quesResultBean.quesStatus=="Marked For Review"){
						str += '<li>Status : <span class="values">'+curQues.quesResultBean.quesStatus+'</span></li></ul>';
					}else{
					str += '<li>Status : <span class="values">Answered</span></li></ul>';
					}
				}
				else{
					str += '<li>Status : <span class="values">'+curQues.quesResultBean.quesStatus+'</span></li></ul>';
				}
				
			}
		if(curQues.quesType.toLowerCase()=='mcq' || curQues.quesType.toLowerCase()=='msq'){
			var givenAnsArr = curQues.quesResultBean.selectedOptIds.split(',');
		}else{
			var givenAnsStr = curQues.quesResultBean.givenAns.replace(/\</g,"&lt;");
		}	
		if(curQues.options.length>0){
			str += '<table class="options_table clear">';
			for(var optNo = 0; optNo<curQues.options.length; optNo++){
				var className = "Unanswered", title = '';
				str += '<td class="user_answer_td">';
				if($.inArray(curQues.options[optNo].optId.toString(), givenAnsArr) != -1){
					givenAnsStr += eval(optNo+1)+',';
					str += '<img src="img/user_option.png" title="You Answered This Option">';
				}
				str += '</td>';
				str += '<td class="correct_answer_td">';
				if(typeof(mockVar.resultQuesStatus)!='undefined' && mockVar.resultQuesStatus==1){
				if($.inArray(curQues.options[optNo].optId.toString(), curQues.correctAnswer)!=-1){
					str += '<img src="img/correct_option.png" title="Correct Option For This Question">';
				}
				}
				else if(typeof(mockVar.resultQuesStatus)=='undefined'){
					if($.inArray(curQues.options[optNo].optId.toString(), curQues.correctAnswer)!=-1){
						str += '<img src="img/correct_option.png" title="Correct Option For This Question">';
					}
				}
				else{
					
				}
				str += '</td>';
				str += '<td class="option_td">Option '+eval(optNo+1)+' :</td><td>'+curQues.options[optNo].optLangBean[mockVar.langIndex].optText+'</td></tr>';
			}
			str += '</table>';
			givenAnsStr = givenAnsStr.substr(0,givenAnsStr.length-1)
		}
		
		
		if(typeof(mockVar.resultQuesStatus)!='undefined' && mockVar.resultQuesStatus==1){
			if(curQues.quesType.toLowerCase()=='sa'){
				if(typeof(curQues.correctAnswer)!='undefined'){
					if(curQues.keyboardType.toLowerCase()!='fileupload'){
						str+='<ul class="attributes clear">';
						str+='<li> Answer Type : <span class="values">'+curQues.answerType+'</span></li>'; 
						str += '<li class="last"> Correct Answer : <span class="values">';
						if(typeof(curQues.correctAnswer)=='string'){
							str+=curQues.correctAnswer;
						}else{
							if(curQues.correctAnswer.length>0){
								for(var ans=0; ans<curQues.correctAnswer.length; ans++){
									str += curQues.correctAnswer[ans]+',';	
								}
								str = str.substring(0,str.length-1);
							}
							str += '</li></ul>';
						}

					}else{
						if(typeof(curQues.annotatedFilePath)!='undefined'){
							str+='<ul class="attributes clear">';
							str+='<li> Evaluated File : <a href='+curQues.annotatedFilePath+' title="Evaluated File"> <embed src='+curQues.annotatedFilePath+' width="260" height="100"  alt="" /></a></li></ul>'; 
						}	
					}
					if(typeof(curQues.evaluatorComments)!='undefined'){
						str+='<ul class="attributes clear">';
						str+='<li> Evaluator Comments : <span class="values">'+curQues.evaluatorComments+'</span></li></ul>'; 
					}
				}

			}
			}
			else if(typeof(mockVar.resultQuesStatus)=='undefined'){
				if(curQues.quesType.toLowerCase()=='sa'){
					if(typeof(curQues.correctAnswer)!='undefined'){
						if(curQues.keyboardType.toLowerCase()!='fileupload'){
						str+='<ul class="attributes clear">';
						str+='<li> Answer Type : <span class="values">'+curQues.answerType+'</span></li>'; 
						str += '<li class="last"> Correct Answer : <span class="values">';
						if(typeof(curQues.correctAnswer)=='string'){
							str+=curQues.correctAnswer;
						}else{
							if(curQues.correctAnswer.length>0){
								for(var ans=0; ans<curQues.correctAnswer.length; ans++){
									str += curQues.correctAnswer[ans]+',';	
								}
								str = str.substring(0,str.length-1);
							}
							str += '</li></ul>';
						}
						}
					}
				
				}
			}
			else{
				
			}
		

		//Added by sai for typing type questions ends
		
		if(typeof(mockVar.resultQuesStatus)!='undefined' && mockVar.resultQuesStatus==1){
			if(curQues.quesType.toLowerCase()=='typing test' && curQues.quesResultBean.quesStatus.toLowerCase()!='unanswered'){
				
					
					str+='<ul class="attributes clear">';
					str+='<li> GWPM : <span class="values">'+curQues.quesResultBean.GWPM+'</span></li>'; 
					str += '<li> NWPM : <span class="values">'+curQues.quesResultBean.NWPM+'</li>';
					str += '<li class="last"> Accuracy : <span class="values">'+curQues.quesResultBean.accuracy+'%</li></ul>';
			}
			}
			else if(typeof(mockVar.resultQuesStatus)=='undefined'){
				if(curQues.quesType.toLowerCase()=='typing test' && curQues.quesResultBean.quesStatus.toLowerCase()!='unanswered'){
				str+='<ul class="attributes clear">';
				str+='<li> GWPM : <span class="values">'+curQues.quesResultBean.GWPM+'</span></li>'; 
				str += '<li> NWPM : <span class="values">'+curQues.quesResultBean.NWPM+'</li>';
				str += '<li class="last"> Accuracy : <span class="values">'+curQues.quesResultBean.accuracy+'%</li></ul>';
				}
			}
			else{
				
			}
		
		
		//Added by sai for typing type questions ends
	str += '</div></li>';
		if(givenAnsStr==''){
			givenAnsStr='NA';
		}
		str = str.replace('@@givenAnsStr@@', givenAnsStr);
	}
	str += '</ul></div></li>';
	str += '<li><div id="G'+groupNo+'S'+secId+'" class="chart_container"></div></li>';
	
	$('#secDetails').append(str);
}

function calculateQuesStatusCount(quesDifficultyObj, quesAnsStatus){
	if(quesAnsStatus == 'Correct'){
		quesDifficultyObj.correct++;
	}else if(quesAnsStatus == 'Incorrect'){
		quesDifficultyObj.incorrect++;
	}else if(quesAnsStatus == 'Unanswered'){
		quesDifficultyObj.unanswered++;
	}else if(quesAnsStatus == 'Not Evaluated'){
		quesDifficultyObj.notEvaluated++;
	}else if(quesAnsStatus == 'Evaluated'){
		quesDifficultyObj.evaluated++;
	}
}

function countDifficultyLevelSecWise(quesDifficultyLevel, curSec, quesAnsStatus){
	if(mockVar.reportType == 1){
		var difficultyValues = curSec.difficultyLabels;
		for(var val=0; val<difficultyValues.length; val++){
			if(quesDifficultyLevel == curSec.difficultyLevel[val].key){
				calculateQuesStatusCount(curSec.difficultyLevel[val].quesStatusCount,quesAnsStatus);
			}
		}
	}else if(mockVar.reportType == 0){
		if(quesDifficultyLevel == 'HARD'){
			calculateQuesStatusCount(curSec.hardQues,quesAnsStatus);
		}else if(quesDifficultyLevel == 'MODERATE'){
			calculateQuesStatusCount(curSec.moderateQues,quesAnsStatus);
		}if(quesDifficultyLevel == 'EASY'){
			calculateQuesStatusCount(curSec.easyQues,quesAnsStatus);
		}
	}
}

function fillSecContent(curSec){
//console.log("fillSecContent");
	var quesCount ;
	var secContent = '<div class="master_title">'+curSec.secName+'</div></br>';
	secContent += $(reportContentXML).find('SectionContent').text();
	var totalQuesCount = curSec.questions.length;
	if(mockVar.reportType == 1){
		if(mockVar.difficultyValues.length != 0){
			secContent += 'with the following difficulty level distribution: - <br/><br/>';
			secContent += '<div class="dataTbl"><table cellspacing="0" cellpadding="0"><tr><th class="center">Difficulty Level</th><th class="center">No. of questions</th></tr> ';
			var difficultyValues = curSec.difficultyLabels;
			for(var i=0; i<mockVar.difficultyValues.length;i++){
				var value = 0;
				var val=0;
				for(val=0; val<difficultyValues.length; val++){
					if(mockVar.difficultyValues[i] == curSec.difficultyLevel[val].key){
						value = 1;
						break;
					}
				}
				if(value == 0)
					secContent +='<tr><td>'+mockVar.difficultyValues[i]+'</td><td> 0 </td></tr>';
				else{
					quesCount = curSec.difficultyLevel[val].quesStatusCount.correct + curSec.difficultyLevel[val].quesStatusCount.incorrect + curSec.difficultyLevel[val].quesStatusCount.unanswered + curSec.difficultyLevel[val].quesStatusCount.notEvaluated + curSec.difficultyLevel[val].quesStatusCount.evaluated;
					secContent +='<tr><td>'+mockVar.difficultyValues[i]+'</td><td>'+quesCount+'</td></tr>';
				}
			}
			secContent +='</table></div>';
		}
		secContent = secContent.replace(/\@@secName@@/g, curSec.secName).replace(/\@@totQues@@/g,totalQuesCount);
	}else if(mockVar.reportType == 0){
		secContent += ' with the following difficulty level distribution: - <br/><br/><div class="dataTbl"><table cellspacing="0" cellpadding="0"><tr><th class="center">Difficulty Level</th><th class="center">No. of questions</th></tr> <tr><td>Easy</td><td>@@easyQues@@</td></tr> <tr><td>Moderate</td><td>@@modQues@@</td></tr>  <tr><td>Hard</td><td>@@hardQues@@</td></tr> </table></div>';
		var hardQuesCount = typeof(curSec.hardQues.correct)!='undefined'?curSec.hardQues.correct:0 + typeof(curSec.hardQues.incorrect)!='undefined'?curSec.hardQues.incorrect:0 + typeof(curSec.hardQues.unanswered)!='undefined'?curSec.hardQues.unanswered:0 + typeof(curSec.hardQues.notEvaluated)!='undefined'?curSec.hardQues.notEvaluated:0 + typeof(curSec.hardQues.evaluated)!='undefined'?curSec.hardQues.evaluated:0;
		var moderateQuesCount = typeof(curSec.moderateQues.correct)!='undefined'?curSec.moderateQues.correct:0 + typeof(curSec.moderateQues.incorrect)!='undefined'?curSec.moderateQues.incorrect:0 + typeof(curSec.moderateQues.unanswered)!='undefined'?curSec.moderateQues.unanswered:0 + typeof(curSec.moderateQues.notEvaluated)!='undefined'?curSec.moderateQues.notEvaluated:0 + typeof(curSec.moderateQues.evaluated)!='undefined'?curSec.moderateQues.evaluated:0;
		var easyQuesCount = typeof(curSec.easyQues.correct)!='undefined'?curSec.easyQues.correct:0 + typeof(curSec.easyQues.incorrect)!='undefined'?curSec.easyQues.incorrect:0 + typeof(curSec.easyQues.unanswered)!='undefined'?curSec.easyQues.unanswered:0 + typeof(curSec.easyQues.notEvaluated)!='undefined'?curSec.easyQues.notEvaluated:0 + typeof(curSec.easyQues.evaluated)!='undefined'?curSec.easyQues.evaluated:0;
		secContent = secContent.replace(/\@@secName@@/g, curSec.secName).replace(/\@@easyQues@@/g,easyQuesCount).replace(/\@@modQues@@/g,moderateQuesCount).replace(/\@@hardQues@@/g,hardQuesCount).replace(/\@@totQues@@/g,totalQuesCount);
	}
	return secContent;
}

function printReport(){
	var pageContent = $('#secDetails').html();
	var pwin=window.open('','print_content','width=100,height=100');
	pwin.document.open();
	pwin.document.write('<html><head><link rel="stylesheet" type="text/css" href="css/style.css" /><link href="https://fonts.googleapis.com/css?family=Open+Sans:,400,300,600" rel="stylesheet" type="text/css"/><script type="text/javascript" src="js/jquery-3.6.0.min.js"></script><style>li,ul{list-style:none}</style></head><body onload="window.print()" style="background:#fff">'+pageContent+'<script>$(".question_expand_all").hide();</script></body></html>');
	pwin.document.close();
	setTimeout(function(){pwin.close();},1000);
}


var delete_cookie = function(name) {
	  document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}; 

function palyVideo(){

$(".jwAudioVideo").each(function(){
		if (($(this).attr("id").indexOf("jwAudio"))) {
			try{
				videojs.getPlayer("VideoJS-"+$(this).attr("id")).dispose();}
			catch(e){}
			document.getElementById($(this).attr("id")).innerHTML='<video class="video-js" id="VideoJS-'+($(this).attr("id"))+'" ></video>';
			var vidplayer = videojs("VideoJS-"+$(this).attr("id"),{
				//var jwp = jwplayer($(this).attr("id")).setup({
				//file: $(this).attr("title"),
				sources: [
				          {
				        	  src: $(this).attr("title"),
				          },
				          ], 
				          aspectRatio: "16:9",
				          controls : true,
				          controlBar:{
				        	  children: [
				        	             "playToggle",
				        	             "currentTimeDisplay",
				        	             "progressControl",
				        	             "durationDisplay",                                                                                                                                                               
				        	             "volumePanel",
				        	             "fullscreenToggle"
				        	             ]
				          }
				          
				          //controlbar: 'bottom'
     });
 }else{
			try{
				videojs.getPlayer("VideoJS-"+$(this).attr("id")).dispose();}
			catch(e){}
			document.getElementById($(this).attr("id")).innerHTML='<video class="video-js" id="VideoJS-'+($(this).attr("id"))+'" ></video>';
			var vidplayer = videojs("VideoJS-"+$(this).attr("id"),{
				//var jwp = jwplayer($(this).attr("id")).setup({
				//file: $(this).attr("title"),
				sources: [
				          {
				        	  src: $(this).attr("title"),
				          },
				          ], 

				          //controlbar: 'bottom',
				          width:'400',
				          height:"30",
				          audioOnlyMode : true,
				          controls : true,
				          controlBar:{
				        	  children: [
				        	             "playToggle",
				        	             "currentTimeDisplay",
				        	             "progressControl",
				        	             "durationDisplay",                                                                                                                                                               
				        	             "volumePanel",
				        	             "fullscreenToggle"
				        	             ]
				          }
     });

 	

 }
		});
 


}