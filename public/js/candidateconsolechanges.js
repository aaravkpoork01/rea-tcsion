var divdata = "";
var filename= "";
var styleJSON = {};
var isPreAdded = false;
var isRemoteTab=false;
$(document).ready(function(){
	try{
		var userDefined = "0"
		var x=document.URL;
		let cdnServerPath = (typeof(sessionStorage.cdnPath)!="undefined" && sessionStorage.cdnPath != "") ? sessionStorage.cdnPath+"/" : "";
		filename=(x.indexOf("configurationCheck.html") > -1)?("configurationCheck"):(x.split("/").slice(-1)[0].split(".")[0]);
		if(x.indexOf('candidateDashboard.html')>-1){
			isRemoteTab=true;
			filename="candidateDashboard";
			}
		/*changed filename check for configurationCheck page to work incase of iDH launch because they will pass other URL params which can have ?,/,other characters. */
		if(sessionStorage.userDefinedNum != undefined && typeof(sessionStorage.userDefinedNum)!="undefined" && sessionStorage.userDefinedNum != "0")
			filename += "_"+sessionStorage.userDefinedNum;
		if(x.indexOf("isProofReading") >= 0){
			filePath=proofReadingQpPath.split("/").slice(0,-4).join("\\")+"\\"+filename+".json";
			if(document.URL.indexOf("mode")>0){
				userDefined = document.URL.split("mode=")[1];
				sessionStorage.userdefinedcandconsole = userDefined;
	    		if (userDefined.indexOf("&") > 0) {
	    			sessionStorage.userdefinedcandconsole = userDefined.split("&")[0];
	    		}
	    	}
		}
		else
			filePath=cdnServerPath+sessionStorage.xmlFilePath.split("/").slice(0,-2).join("\\")+"\\"+filename+".json";
		if(sessionStorage.userdefinedcandconsole==1 || (sessionStorage.userdefinedcandconsole==0 && sessionStorage.userDefinedNum=="other") || isRemoteTab){
			//console.log("Reading this file from file path: ",filePath);
			loadDataFromCache().then(function(e){
				console.log(e);
			}).finally(function(){
				readcandconsole(filePath);
			});
		}
	}catch(e){
		console.log(e.message);
	}
	
	
});

function readcandconsole(filePath) {
	try{
		var styleText = "";
		var filePath1 = "";
		if(Object.keys(styleJSON).length==0){
			try{
				filePath1 = filePath.replaceAll('\\','/');
			}catch(e){
				console.log(e);
			}
			var fileName =  filePath1.substr(filePath1.lastIndexOf('/')+1,filePath1.length);
			fileName += "?v="+sessionStorage.quizJsonUpdatedDate;
			if(typeof(fileURL) == "undefined" || typeof(fileURL[fileName])=="undefined" || fileURL[fileName]==undefined){
			jQuery.ajax({
				type: "POST",
				url: filePath+"?v="+sessionStorage.quizJsonUpdatedDate,
				async: false,
				dataType:"text",
				success: function(data) {
						customUIChanges(data);
						try{
							storeJsonFile(fileName,data);
						}catch(e){
							console.log(e);
						}
					},
					error: function() {}
				});
			}else{
				jQuery.ajax({
					type: "GET",
					url: fileURL[fileName],
					async: false,
					dataType:"text",
					success: function(data) {
						customUIChanges(data);
						try{
							storeJsonFile(fileName,data);
						}catch(e){
							console.log(e);
						}
					},
					error: function() {
						delete fileURL[fileName];
						readcandconsole(filePath);
					}
				});
			}
		}else{
					if(!isPreAdded){
						isPreAdded = true;
					$(styleJSON).each(function(e){
						if(typeof(this.ishtml) != "undefined" && this.ishtml == "1" && this.ispre == "1"){
							if(this.type != "js"){
							styleText =  (this.type == "id" ? "#" : ".") +this.key;
							if(this.isbefore == "1"){
								$(styleText).before(this.style);
							} else {
								$(styleText).after(this.style);
							}
							}
							try {
								if (typeof (this.js) != "undefined" && this.js == "1") {
									var script = document.createElement("script");
									script.type = "text/javascript";
									script.text = this.jscode;
									setTimeout(function(){
									$('body').append(script);
									},10);
								}
					} catch (e) {
						console.log(e);
					}
				} else if(this.type == "height"){
					extraHeight = parseFloat(this.style);
					extraHeightAddOrMinus = this.key;
				}
			});
			}
			candconsole();
		}
	}catch(e){
		
	}
}
function customUIChanges(data){
	var styleText = "";
	divdata = data;
	styleJSON = JSON.parse(data);
	if(!isPreAdded){
		isPreAdded = true;
	$(styleJSON).each(function(e){
		if(typeof(this.ishtml) != "undefined" && this.ishtml == "1" && this.ispre == "1"){
			if(this.type != "js"){
			styleText =  (this.type == "id" ? "#" : ".") +this.key;
			if(this.isbefore == "1"){
				$(styleText).before(this.style);
			} else {
				$(styleText).after(this.style);
			}
			}
			try {
				if (typeof (this.js) != "undefined" && this.js == "1") {
					var script = document.createElement("script");
					script.type = "text/javascript";
					script.text = this.jscode;
					setTimeout(function(){
					$('body').append(script);
					},10);
				}
			} catch (e) {
				console.log(e);
			}
		} else if(this.type == "height"){
			extraHeight = parseFloat(this.style);
			extraHeightAddOrMinus = this.key;
		}
	});
	}
	candconsole(divdata);

}
function addExtraJS(){
	if(sessionStorage.isPaperUI == "1")
		addExtraPaperJs();
	$(styleJSON).each(function(e){
		if(typeof(this.ishtml) != "undefined" && this.ishtml == "1" && this.ispre == "0"){
			if(this.type != "js"){
			styleText =  (this.type == "id" ? "#" : ".") +this.key;
			//if()
			if(this.isbefore == "1"){
				$(styleText).before(this.style);
			} else {
				$(styleText).after(this.style);
			}
			}
			try {
				if (typeof (this.js) != "undefined" && this.js == "1") {
					var script = document.createElement("script");
					script.type = "text/javascript";
					script.className = "userDefinedScripts";
					$(".userDefinedScripts").remove();
					script.text = this.jscode;
					setTimeout(function(){
					$('body').append(script);
					},10);
				}
			} catch (e) {
				console.log(e);
			}
		} 
	});
}
function candconsole(){
	//var myjson=JSON.parse(divdata);
	try{
	var myjson = styleJSON;
//	var jsonLen=myjson.length; 
	var displayClassName=null;
	var buttonHovr=null;
	var buttonOut=null;
	var styleText = "";
	var mobileStyle = "";
	$(styleJSON).each(function(e){
		if((typeof(this.ishtml) == "undefined" || this.ishtml == "0") && this.type != "js" ){
		if(this.type !="NA" && this.type != "mobilemediascreen"){
			styleText = styleText + (this.type == "id" ? "#" : ".") +this.key+ this.style;
		}
		if(this.type == "mobilemediascreen"){
			mobileStyle += (this.type == "id" ? "#" : ".") +this.key+ this.style;
		}
		try{
		if(this.key == "circleTimer"){
			displayCircleTime = true;
		} else if(this.key == "displayMic"){
			displayMic = true;
		} else if(this.key == "displayQuestionTypeContent"){
			displayQuestionTypeContent = true;
		} else if((this.key).indexOf("titleHover_") > -1 ){
			titleHover = (this.key).split("_")[1] == "true" ? true : false;
		} else if((this.key).indexOf("jwplayerControls_") > -1){
			jwplayerControls = (this.key).split("_")[1] == "true" ? true : false;
		} else if((this.key).indexOf("displayDefaultFeedbackQuestions") > -1){
			displayDefaultFeedbackQuestions = (this.key).split("_")[1] == "true" ? true : false;
		} else if((this.key).indexOf("startTheResponseTimeAfterMediaPlay") > -1){
			startTheResponseTimeAfterMediaPlay = (this.key).split("_")[1] == "true" ? true : false;
		}  else if((this.key).indexOf("wordCountCheckRequired") > -1){
			wordCountCheckRequired = (this.key).split("_")[1] == "true" ? true : false;
		} else if((this.key).indexOf("audioVideoWithHTMLTags") > -1){
			audioVideoWithHTMLTags = (this.key).split("_")[1] == "true" ? true : false;
		}  else if((this.key).indexOf("recordingInProgressRequired_") > -1){
            recordingInProgressRequired = (this.key).split("_")[1] == "true" ? true : false;
        }  else if((this.key).indexOf("displayCircleTime_") > -1){
            displayCircleTime = (this.key).split("_")[1] == "true" ? true : false;
        }  else if((this.key).indexOf("displayMic_") > -1){
            displayMic = (this.key).split("_")[1] == "true" ? true : false;
        }  else if((this.key).indexOf("displayQuestionTypeContent_") > -1){
            displayQuestionTypeContent = (this.key).split("_")[1] == "true" ? true : false;
        } else if((this.key).indexOf("userDefinedRequired_") > -1){
        	userDefinedRequired = (this.key).split("_")[1] == "true" ? true : false;
        } else if((this.key).indexOf("customeTime_") > -1){
        	customeTime = (this.key).split("_")[1] == "true" ? true : false;
        } else if((this.key).indexOf("slimScrollRequired_") > -1){
        	slimScrollRequired = (this.key).split("_")[1] == "true" ? true : false;
        }else if((this.key).indexOf("isPreviousButtonReq_") > -1){
        	isPreviousButtonReq = (this.key).split("_")[1] == "true" ? true : false;
        }else if((this.key).indexOf("isMacat_") > -1){
        	isMacat = (this.key).split("_")[1] == "true" ? true : false;
        }else if((this.key).indexOf("audioFormatForSAAudioQuestions_") > -1){
        	audioFormatForSAAudioQuestions = (this.key).split("_")[1];
        } else if((this.key).indexOf("videoFormatForSAAudioQuestions_") > -1){
        	videoFormatForSAAudioQuestions = (this.key).split("_")[1];
        }else if((this.key).indexOf("isDeakin_") > -1){
        	isDeakin = (this.key).split("_")[1] == "true" ? true : false;
        }
        else if((this.key).indexOf("isOxford_") > -1){
        	sessionStorage.isOxford = (this.key).split("_")[1] == "true" ? true : false;
        }
        else if((this.key).indexOf("isVirtualKeyboardReq_") > -1){
        	sessionStorage.isVirtualKeyboardReq = (this.key).split("_")[1] == "true" ? true : false;
        	isVirtualKeyboardReq = sessionStorage.isVirtualKeyboardReq;
        }else if((this.key).indexOf("startFromTheBegining_") > -1){
        	startFromTheBegining = (this.key).split("_")[1] == "true" ? true : false;
        }else if((this.key).indexOf("byPassZoomStatus_") > -1){
        	byPassZoomStatus = (this.key).split("_")[1] == "true" ? true : false;
        }else if((this.key).indexOf("additionalToolsRequiredForPR_") > -1){
        	additionalToolsRequiredForPR = (this.key).split("_")[1] == "true" ? true : false;
        }
        else if((this.key).indexOf("textEditorRequired_") > -1){
        	textEditorRequired =  (this.key).split("_")[1] == "true" ? true : false;
        	sessionStorage.textEditorRequired = "1";
        }

        	
		
		
		
		} catch(e){
			
		}
		}

	});
	$(".userDefinedDyanmicStyling").remove();
	var sheet = document.createElement('style');
	sheet.className = "userDefinedDyanmicStyling"
	if(typeof(sequenceoptionscolorForBC)!='undefined')
		sheet.innerHTML = styleText + sequenceoptionscolorForBC + mobileStyle;
	else
		sheet.innerHTML = styleText  + mobileStyle;
	document.body.appendChild(sheet);
	
	}catch(e){
		
	}
	

}

$(document).ready(function(){ 
	$(document).on('click touchstart', '.summary', function () {
		alert("summary");
	});
	$(document).on('click touchstart', '.previousQuestionBackButton', function () {
		alert("backButton");
	});
	
});
