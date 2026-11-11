var bobFiles = [];
var mediaCount = 0;
var successMediaCount = 0;
var uniqueIdForIndexedDb = 0;
var onLoadBackupExecuted = false;
var errorCountForOpen = 0;
var fetchingQuesMediaDone = false;
var invokedArrangeMockVar = false;
var isDataStoring = false;
var isAudioVideoResponseEncrypting = false;
var isResponseDownloaded = false;
var countRPA = 0;
var beepObjectURL = "";
var publicKey = "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCKl0uWPlsNRIvtGoDWlBmEbJF07gY8Vk94hJ4mWJQ3qmjb/GnQQtKJU5v5/1qSz11cAqoDs/wHFDwwrJ8ckXzlomTUg4XwvSt4eDmWCwgh7X1LS7CsXT/5XDGMRZAouAlVC5QZBvpV+DVQn6VfUZnm07TmMB5P1o7M+fbCvn6+iQIDAQAB";
//var publicKey = "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCKl0uWPlsNRIvtGoDWlBmEbJF07gY8Vk94hJ4mWJQ3qmjb/GnQQtKJU5v5/1qSz11cAqoDs/wHFDwwrJ8ckXzlomTUg4XwvSt4eDmWCwgh7X1LS7CsXT/5XDGMRZAouAlVC5QZBvpV+DVQn6VfUZnm07TmMB5P1o7M+fbCvn6+iQIDAQAB"
var rsaEncrypt = null;

if (!String.prototype.cordwood) {
	  String.prototype.cordwood = function(cordlen) {
	  if (cordlen === undefined || cordlen > this.length) {
	    cordlen = this.length;
	  }
	  var yardstick = new RegExp(`.{${cordlen}}`, 'g');
	  var pieces = this.match(yardstick);
	  var accumulated = (pieces.length * cordlen);
	  var modulo = this.length % accumulated;
	  if (modulo) pieces.push(this.slice(accumulated));	
	  return pieces;
	 };
}
jQuery(document).ready(function(){
	if(sessionStorage.reliableMode == true || sessionStorage.reliableMode == 'true' ){
		//openIndexedDb();
		if(document.URL.indexOf("close.html")>=0 || document.URL.indexOf("FeedBack.html")>=0 || document.URL.indexOf("scanCopyUpload.html")>=0){
			deleteIndexedDB();	
			return;
		}
		//rsaEncrypt = new JSEncrypt();
		//rsaEncrypt.setPublicKey(sessionStorage.publicKey);
		rsaEncrypt = {
			publicKey : forge.pki.publicKeyFromPem(sessionStorage.publicKey),
			encrypt : function(data){
				var e = this.publicKey.encrypt(data, 'RSA-OAEP', {
					md : forge.md.sha256.create(), 
					mgf1: { md: forge.md.sha1.create()} 
				});
				return btoa(e);
			}
		};
	
		//loadTransporter();
	}
	
});

function createIndexedDB(){
	var request = indexDB.open('quesDetailsSchema'+sessionStorage.app_seq_no+sessionStorage.assessmentId,1) 
	request.onerror = function(e){
		console.log(e);
	};
	request.onupgradeneeded = function(){
		
		const db = request.result;
		const quesTable = db.createObjectStore("quesDetails"+sessionStorage.assessmentId,{keyPath:"fileName",autoIncrement:true});
		quesTable.createIndex("quesIdindex",["quesId"],{unique:false});
		quesTable.createIndex("getAudioVideoFile",["quesId","langId","fileName","mockId"],{unique:false});
		quesTable.createIndex("fileName",["fileName"],{unique:false});
		
		const backup = db.createObjectStore("backUp"+sessionStorage.assessmentId,{keyPath:"sequenceId"});
		backup.createIndex("sequenceId",["sequenceId"],{unique:true});
		
		const CandResponse = db.createObjectStore("CandResponse"+sessionStorage.assessmentId,{keyPath:"quesId"});
		CandResponse.createIndex("quesId",["quesId"],{unique:true});
		
		const auditData = db.createObjectStore("audit"+sessionStorage.assessmentId,{keyPath:"sequenceId"});
		auditData.createIndex("sequenceId",["sequenceId"],{unique:true});

	};
	request.onblocked = function(e){
		console.log(e);indexDBObj.close();
	};
	request.onsuccess = function(){
		indexDBObj = request.result;
			
	};
	
}
function deleteIndexedDB(){
	if(sessionStorage.reliableMode == true || sessionStorage.reliableMode == 'true' ){
	try{
		if(indexDBObj!=null)indexDBObj.close();
	}catch(e){console.log(e);}
	var req = indexedDB.deleteDatabase('quesDetailsSchema'+sessionStorage.app_seq_no+sessionStorage.assessmentId);
	req.onsuccess = function () {
	    //console.log("Deleted database successfully");
	};
	req.onerror = function () {
	  //  console.log("Couldn't delete database");
	};
	req.onblocked = function () {
	   // console.log("Couldn't delete database due to the operation being blocked");
	};
	}
}
function openIndexedDb(flag){
	try{
		if(sessionStorage.reliableMode == true || sessionStorage.reliableMode == 'true' ){
		if(flag){
			var req = indexedDB.deleteDatabase('quesDetailsSchema'+sessionStorage.app_seq_no+sessionStorage.assessmentId);
			req.onsuccess = function () {
			   // console.log("Deleted database successfully");
			    createIndexedDB();
			};
			req.onerror = function () {
			    //console.log("Couldn't delete database");
			};
			req.onblocked = function () {
			    //console.log("Couldn't delete database due to the operation being blocked");
			};
		}else{
			 createIndexedDB();
		}
			
		}}catch(e){console.log(e);}
}
var fileNameArr={};
var moduleMediaErrorCount = 0;
var isAdaptiveInBetweenGroup = false;
function isModuleMediaDownloaded(){
	setTimeout(function(){clearTimeout(mockVar.timeCounter);},1000);
	if(mockVar.backupTimeInterval>0){
		if(!isFinalSubmitStarted){
			
			/*if(checkBackup==0 && !onLoadBackupExecuted){
				onLoadBackup();
			}*/
			
		}
	}
	fetchingQuesMediaDone = true;
	if(moduleMediaErrorCount>3){
		$('#pWait').hide();
		loadLabel();
		console.log("Error in Media Error count "+moduleMediaErrorCount);
		cnfPop('backupAlerts');hideCloseAndOkayForSecuredAssessments();
		$("#backupAlertMsg").html($(globalXmlvar).find('MediaFileDowloadError').text());
	}
	else{
		if(mediaCount == successMediaCount ){
			getBeepFile();
			valueToBeIncreasedForLoader = 5;
			$('#pWait').hide();
			invokedArrangeMockVar = true;
			/*if(!isAdaptiveInBetweenGroup)arrangeMockVar();
			else{
				submitGroup();
				isAdaptiveInBetweenGroup = false;
				tempAuditJson=null;
				tempAuditJson= [];
				saveBackUp();
			}*/
			setInterval(function(){sendAllFiles();},10*60000);
		}

			
	}
}
function getBeepFile(){
	if(!(sessionStorage.reliableMode == true || sessionStorage.reliableMode == 'true'))
		return;
	if(!beepSoundReq)
		return;
	var cdnPath = (typeof(sessionStorage.cdnPath)!="undefined" && sessionStorage.cdnPath != "") ? sessionStorage.cdnPath+"/" : "";
	var url ="audios/beep_pick_short_medium.mp3";
	xhr = new XMLHttpRequest();
	xhr.open('GET',url);
	xhr.responseType = "blob";
	xhr.onload = function(e){
		if(e.target.status != 200 && e.target.statusText != "OK"){
			console.log("Status :: "+e.target.status+" : : "+e.target.statusText);
			cnfPop('backupAlerts');hideCloseAndOkayForSecuredAssessments();
			$("#backupAlertMsg").html($(globalXmlvar).find('MediaFileDowloadError').text());
			$("#BCDyanamicLoader").hide();
		}
		else{
			fileNameArr["beepSoundForReliable"]=this.response;
			objURL = URL.createObjectURL(fileNameArr["beepSoundForReliable"]);
			fileBlobURL["beepSoundForReliable"] = objURL;
			beepObjectURL = objURL;
		}
	};
	xhr.onerror = function(e){
		console.log("Status :: "+e);
		cnfPop('backupAlerts');hideCloseAndOkayForSecuredAssessments();
		$("#backupAlertMsg").html($(globalXmlvar).find('MediaFileDowloadError').text());
		$("#BCDyanamicLoader").hide();
	};
	xhr.onreadystatechange=function(e){
		if(e.target.status != 200 && e.target.statusText != "OK"){
			console.log("Status :: "+e.target.status+" : : "+e.target.statusText);
			cnfPop('backupAlerts');hideCloseAndOkayForSecuredAssessments();
			$("#backupAlertMsg").html($(globalXmlvar).find('MediaFileDowloadError').text());
			$("#BCDyanamicLoader").hide();
		}
	};
	
	xhr.send();

}
function editSecImageTag(secImage){
	var newImageFile = new Array();
	secImage  = secImage.replace(/'/g,'"');
	newImageFile = secImage.match(/(<img.+?src="(.+?)".+?>)/g);
	if(newImageFile==undefined || typeof(newImageFile)=="undefined"){
		newImageFile = secImage.match(/(<img.+?src=&#39;(.+?)&#39;.+?>)/g);
	}
	if(newImageFile!=undefined){
		for (var i = 0; i < newImageFile.length; i++) {
			while (secImage.indexOf(newImageFile[i]) != -1) {
				var imageName = newImageFile[i].split('src=')[1].split('/>');
				secImage = secImage.replace(newImageFile[i], "<img src=hasmedia@@"+imageName[0]+"hasmedia@@>");
				getFileInBlob('/'+ imageName[0], imageName[0].split('\\').pop().split('/').pop(),"","",true);
			}
		}
	}
	return secImage;
}
function editHeaderImageTag(secImage){
	var newImageFile = new Array();
	secImage  = secImage.replace(/'/g,'"');
	newImageFile = secImage.match(/<img[^>]*src=(["'])(.*?)\1[^>]*>/g);
	if(newImageFile==undefined || typeof(newImageFile)=="undefined"){
		newImageFile = secImage.match(/(<img.+?src=&#39;(.+?)&#39;.+?>)/g);
	}
	if(newImageFile!=undefined){
		for (var i = 0; i < newImageFile.length; i++) {
			while (secImage.indexOf(newImageFile[i]) != -1) {
				var srcValue = newImageFile[i].match(/src=(["'])(.*?)\1/)[2]
				secImage = secImage.replace(srcValue, "hasmedia@@"+srcValue+"hasmedia@@");
				getQuesHeader(srcValue,srcValue.split('\\').pop().split('/').pop(),"","",true);
			}
		}
	}
	return secImage;
}
function getQuesHeader(filePath,fileName,quesId,langId){
	filePath=filePath.replaceAll(/&#39;/g,'"');
	filePath=filePath.replaceAll('"','').replaceAll("'","").trim();
	if(filePath.indexOf("data:image")<0){
	mediaCount++;
	if(!(sessionStorage.reliableMode == true || sessionStorage.reliableMode == 'true'))
		return;
	var cdnPath = (typeof(sessionStorage.cdnPath)!="undefined" && sessionStorage.cdnPath != "") ? sessionStorage.cdnPath+"/" : "";
	if(typeof(sessionStorage.xmlFilePath) != "undefined")
		xmlFilePath = sessionStorage.xmlFilePath;
	var url = "";
	if(isProofReadingMock=='true')
	{
		xmlFilePath = proofReadingQpPath;
		if(xmlFilePath.indexOf("localhost")>-1)
			xmlFilePath = "/IBAStaticContent";
	}
	url=decodeURI(filePath).split(" ")[0];
	url = url.replaceAll('"','').replaceAll("'","");
	fileName=fileName.replaceAll(/&#39;/g,'"');
	fileName=fileName.replaceAll('"','').replaceAll("'","").trim();
	xhr = new XMLHttpRequest();
	if(isProofReadingMock=='true')url = url+"?"+new Date().getTime();
	xhr.open('GET',url);
	xhr.responseType = "blob";
	xhr.onload = function(e){
		if(e.target.status != 200 && e.target.statusText != "OK"){
			console.log("Status :: "+e.target.status+" : : "+e.target.statusText);
			cnfPop('backupAlerts');hideCloseAndOkayForSecuredAssessments();
			$("#backupAlertMsg").html($(globalXmlvar).find('MediaFileDowloadError').text());
			$("#BCDyanamicLoader").hide();
		}
		else{
			successMediaCount++;
			fileName = fileName.split(' ')[0].trim();
			fileNameArr[fileName]=this.response;
			if(fetchingQuesMediaDone && successMediaCount == mediaCount){
				getBeepFile();
				valueToBeIncreasedForLoader = 5;
			}
		}
	};
	xhr.onerror = function(e){
		console.log("Status :: "+e);
		cnfPop('backupAlerts');hideCloseAndOkayForSecuredAssessments();
		$("#backupAlertMsg").html($(globalXmlvar).find('MediaFileDowloadError').text());
		$("#BCDyanamicLoader").hide();
	};
	xhr.onreadystatechange=function(e){
		if(e.target.status != 200 && e.target.statusText != "OK"){
			console.log("Status :: "+e.target.status+" : : "+e.target.statusText);
			cnfPop('backupAlerts');hideCloseAndOkayForSecuredAssessments();
			$("#backupAlertMsg").html($(globalXmlvar).find('MediaFileDowloadError').text());
			$("#BCDyanamicLoader").hide();
		}
	};
	
	xhr.send();
	}
}
var valueToBeIncreasedForLoader = 0.1;
function startReliableLoader() {
	if(sessionStorage.reliableMode == true || sessionStorage.reliableMode == 'true' ){
		isSubmitButtonClicked=true;
	valueToBeIncreasedForLoader = 0.1;
    var elem = document.getElementById("myBar");
    var width = 1;
    var id = setInterval(frame, 100);
    function frame() {
    	if (width >= 100) {
           clearInterval(id);
           i = 0;
           $('#pWait').hide();
			$("#BCDyanamicLoader").hide();
			invokedArrangeMockVar = true;
			if(isProofReadingMock=='true')
				proofReadingCleanUpActivity();
			if(!isAdaptiveInBetweenGroup)arrangeMockVar();
			else{
				afterSubmitGroup();
				isAdaptiveInBetweenGroup = false;
				 tempAuditJson=null;
				 tempAuditJson= [];
				 saveBackUp();
			}
			setInterval(function(){sendAllFiles();},10*60000);
        } else {
        	width+=valueToBeIncreasedForLoader;if(width>=100)width=100;
        	elem.style.width = width + "%";
        	$('.loadingMsg span').html(parseInt(width) + "%");
        }
   }
	}
};
function getFileInBlob(filePath,fileName,quesId,langId,isSecImage){
//	debugger;(commented debbuger)
	filePath=filePath.replaceAll(/&#39;/g,'"');
	filePath=filePath.replaceAll('"','').replaceAll("'","").trim();
	if(filePath.indexOf("data:image")<0){
	mediaCount++;
	if(!(sessionStorage.reliableMode == true || sessionStorage.reliableMode == 'true'))
		return;
	var cdnPath = (typeof(sessionStorage.cdnPath)!="undefined" && sessionStorage.cdnPath != "") ? sessionStorage.cdnPath+"/" : "";
	if(typeof(sessionStorage.xmlFilePath) != "undefined")
		xmlFilePath = sessionStorage.xmlFilePath;
	//if(isSecImage)xmlFilePath="";
	var url = "";
	if(isProofReadingMock=='true')
	{
		xmlFilePath = proofReadingQpPath;
		if(xmlFilePath.indexOf("localhost")>-1)
			xmlFilePath = "/IBAStaticContent";
	}
	if(isSecImage)xmlFilePath="";
	if(isSecImage)url=cdnPath+xmlFilePath+"/"+decodeURI(filePath).split(" ")[0];
	else url=cdnPath+xmlFilePath+mockVar.qpId+"/"+decodeURI(filePath).split(" ")[0];
	url = url.replaceAll('"','').replaceAll("'","");
	fileName=fileName.replaceAll(/&#39;/g,'"');
	fileName=fileName.replaceAll('"','').replaceAll("'","").trim();
	xhr = new XMLHttpRequest();
	if(isProofReadingMock=='true')url = (url.replace(/\/+/g,"/"))+"?"+new Date().getTime();
	xhr.open('GET',url);
	xhr.responseType = "blob";
	xhr.onload = function(e){
		if(e.target.status != 200 && e.target.statusText != "OK"){
			console.log("Status :: "+e.target.status+" : : "+e.target.statusText);
			cnfPop('backupAlerts');hideCloseAndOkayForSecuredAssessments();
			$("#backupAlertMsg").html($(globalXmlvar).find('MediaFileDowloadError').text());
			$("#BCDyanamicLoader").hide();
		}
		else{
			successMediaCount++;
			fileName = fileName.split(' ')[0].trim();
			fileNameArr[fileName]=this.response;
			if(fetchingQuesMediaDone && successMediaCount == mediaCount){
				getBeepFile();
				valueToBeIncreasedForLoader = 5;
			}
		}
	};
	xhr.onerror = function(e){
		console.log("Status :: "+e);
		cnfPop('backupAlerts');hideCloseAndOkayForSecuredAssessments();
		$("#backupAlertMsg").html($(globalXmlvar).find('MediaFileDowloadError').text());
		$("#BCDyanamicLoader").hide();
	};
	xhr.onreadystatechange=function(e){
		if(e.target.status != 200 && e.target.statusText != "OK"){
			console.log("Status :: "+e.target.status+" : : "+e.target.statusText);
			cnfPop('backupAlerts');hideCloseAndOkayForSecuredAssessments();
			$("#backupAlertMsg").html($(globalXmlvar).find('MediaFileDowloadError').text());
			$("#BCDyanamicLoader").hide();
		}
	};
	
	xhr.send();
	}
}
var retrievedAudioVideo = []
var errorCount = 0;
function getIndexDbTransaction(storeName,operation){
	var tx = null;
	try{
	tx = indexDBObj.transaction(storeName,operation);
	tx.onerror = function(err){console.log(err);}
	}catch(e){console.log(e);}
	return tx;
}
function retrieveAudioVideoDetails(quesId,langId,fileName){
	/*const request1 = indexDB.open('quesDetailsSchema',1);

	request1.onerror = function(e){
		console.log(e);
	};

	request1.onsuccess = function(){
		const db = request1.result;
		const transaction = db.transaction("quesDetails"+mockVar.mockId,"readwrite");
		
		const quesTable = transaction.objectStore("quesDetails"+mockVar.mockId);
		const quesTypeIndex = quesTable.index("getAudioVideoFile");
		
		

		const resultSet = quesTypeIndex.get([quesId, langId, fileName, mockVar.mockId]);
		
		resultSet.onsuccess = function(){
			console.log(resultSet.result);
			retrievedAudioVideo = resultSet.result
		};
		
		transaction.oncomplete = function(){
			db.close();
		};
	};*/
	var transaction = getIndexDbTransaction("quesDetails"+mockVar.mockId,"readwrite");
	if(transaction!=null){
	const quesTable = transaction.objectStore("quesDetails"+mockVar.mockId);
	const getAudioVideoFile = quesTable.index("getAudioVideoFile");
	const quesIdindex = quesTable.index("quesIdindex");
	const resultSet = getAudioVideoFile.get([quesId, langId, fileName, mockVar.mockId]);
	resultSet.onsuccess = function(){
		//console.log(resultSet.result);
		retrievedAudioVideo = resultSet.result
	};
	const quesIdFiles = quesIdindex.getAll([quesId]);
	quesIdFiles.onsuccess = function(){
		//console.log(quesIdFiles.result);
	};
	}
}

function insertAudioVideoDetails(){/*
	

	const request = indexDB.open('quesDetailsSchema',1);

	request.onerror = function(e){
		console.log(e);
	};
	request.onupgradeneeded = function(){
		
		const db = request.result;
		const quesTable = db.createObjectStore("quesDetails"+mockVar.mockId,{keyPath:"fileName"},{unique:false});
		quesTable.createIndex("quesType",["quesType"],{unique:false});
		quesTable.createIndex("getAudioVideoFile",["quesId","langId","fileName","mockId"],{unique:true});
	};

	request.onsuccess = function(){
		const db = request.result;
		const transaction = db.transaction("quesDetails"+mockVar.mockId,"readwrite");
		
		const quesTable = transaction.objectStore("quesDetails"+mockVar.mockId);
		const quesTypeIndex = quesTable.index("quesType");
		for(var i=0;i<bobFiles.length;i++)
			quesTable.put(bobFiles[i]);
		transaction.oncomplete = function(){
			db.close();
		};
	}
*/
	var transaction = getIndexDbTransaction("quesDetails"+mockVar.mockId,"readwrite");
	if(transaction!=null){
	const quesTable = transaction.objectStore("quesDetails"+mockVar.mockId);
	/*for(var i=0;i<bobFiles.length;i++)
		quesTable.put(bobFiles[i]);
	}*/
	var keys=Object.keys(fileNameArr);
	for(var i=0;i<keys.length;i++){
	   // console.log({'filename':keys[i],'blob':fileNameArr[keys[i]]})
	    quesTable.put({'fileName':keys[i],'blob':fileNameArr[keys[i]]});
	    }
	}
}
var blobURLType = {};
var fileBlobURL = {};
function replaceQuesText(quesText){
	if(quesText.indexOf('hasmedia@@')==-1)
		return quesText;
	var regex = /hasmedia@@(.+?)hasmedia@@/g;
	var Param = regex.exec(quesText);
	var objURL = "";
	while(Param!=null){
		replaceStr = Param[0];
		if(replaceStr.indexOf(xmlFilePath)!=-1){
			//filename= Param[1].split("tkcimages/")[1].split('"')[0].trim();
			filename= Param[1].split('\\').pop().split('/').pop().split('"')[0].trim();}
		else
		    filename = Param[1].split('\\').pop().split('/').pop().split('"')[0].trim();
		if(fileNameArr[filename]!= undefined){
			if(fileBlobURL[filename] == undefined){
			objURL = URL.createObjectURL(fileNameArr[filename]);
			quesText = quesText.replace(Param[0],objURL);
			blobURLType[objURL] = fileNameArr[filename].type;
			fileBlobURL[filename] = objURL;
		    //console.log("quesText::",quesText);
		    }else{
		    	quesText = quesText.replace(Param[0],fileBlobURL[filename]);
		    }
		}
		else if(replaceStr.indexOf(xmlFilePath)!=-1)
			quesText = quesText.replace(Param[0],Param[1]); 
		else
			quesText = quesText.replace(Param[0],Param[1]);
		regex = /hasmedia@@(.+?)hasmedia@@/g;
		Param = regex.exec(quesText);
	}
	return quesText;
}
function deleteCandAudioVideoData(quesId){
	if(!(sessionStorage.reliableMode == true || sessionStorage.reliableMode == 'true'))
		return;
	var transaction = getIndexDbTransaction("CandResponse"+mockVar.mockId,"readwrite");
	if(transaction!=null){
	const CandResponse = transaction.objectStore("CandResponse"+mockVar.mockId);
	const quesIndex = CandResponse.index("quesId");
	const resultSet = CandResponse.getAll(quesId);
	resultSet.onsuccess = function(){
		//console.log('Question id in delete cand audio video :: '+quesId);
		//console.log("data for delete candidate Audio Video Data "+resultSet.result);
		if(resultSet.result.length>0)
			CandResponse.delete(quesId)
	};
	}


}

function deleteAuditData(seqId){
	if(!(sessionStorage.reliableMode == true || sessionStorage.reliableMode == 'true'))
		return;
	var transaction = getIndexDbTransaction("audit"+mockVar.mockId,"readwrite");
	if(transaction!=null){
	const auditData = transaction.objectStore("audit"+mockVar.mockId);
	const seqIndex = auditData.index("sequenceId");
	const resultSet = auditData.getAll(seqId);
	resultSet.onsuccess = function(){
		//console.log("data for delete Audit Data "+resultSet.result);
		if(resultSet.result.length>0)
			auditData.delete(seqId)
	};
	}


}
/*function StoreCandAudioVideoData(blob,type,queId,itterationCount,grpId,secId){
	var reader = new FileReader();
	reader.onload = function(e){
		
		var transaction = getIndexDbTransaction("CandResponse"+mockVar.mockId+"@"+mockVar.attemptId,"readwrite");
		if(transaction!=null){
		const CandResponse = transaction.objectStore("CandResponse"+mockVar.mockId+"@"+mockVar.attemptId);
		const quesIndex = CandResponse.index("quesId");
		const resultSet = CandResponse.getAll(quesId);
		resultSet.onsuccess = function(){console.log('a'+quesId);
			console.log(resultSet.result);
			if(resultSet.result.length>0)
				CandResponse.delete([quesId])
			var blobArr = e.target.result.cordwood(100);
			var encryptedArr = [];
			var encryptedText = "";
			for(var i=0;i<blobArr.length;i++){
				encryptedArr.push(rsaEncrypt.encrypt(blobArr[i]));
				encryptedText += rsaEncrypt.encrypt(blobArr[i]) + "@@sep@@";
			}
			CandResponse.put({'quesId':quesId+'','grpId':grpId,'secId':secId,'blob': new Blob([encryptedText] ,{type:'plain/text'}),'type':type=="saveAudioFile"?'A':'V' });
		};
		}
	}
	reader.readAsDataURL(blob);
	
}*/
/*function StoreRPAData(fileName,blob,format){
	var reader = new FileReader();
	reader.onload = function(e){
		
		var transaction = getIndexDbTransaction("RPA"+mockVar.mockId+"@"+mockVar.attemptId,"readwrite");
		if(transaction!=null){
		const CandResponse = transaction.objectStore("RPA"+mockVar.mockId+"@"+mockVar.attemptId);
		const quesIndex = CandResponse.index("id");
		const resultSet = CandResponse.getAll(quesId);
		resultSet.onsuccess = function(){console.log('a'+quesId);
			console.log(resultSet.result);
			if(resultSet.result.length>0)
				CandResponse.delete([quesId])
            var tempObj = {"fileName":fileName+"@@RPA"+format,"blob":e.target.result};console.log(tempObj);
			var blobArr = JSON.stringify(tempObj).cordwood(100);
			var encryptedArr = [];
			var encryptedText = "";
			for(var i=0;i<blobArr.length;i++){
				encryptedArr.push(rsaEncrypt.encrypt(blobArr[i]));
				encryptedText += rsaEncrypt.encrypt(blobArr[i]) + "@@sep@@";
			}
			CandResponse.put({'id':countRPA++,'blob': new Blob([encryptedText] ,{type:'plain/text'}) });
		};
		}
	}
	reader.readAsDataURL(blob);
	
}*/

function StoreCandAudioVideoData(blob,type,quesId,itterationCount,grpId,secId){
	var reader = new FileReader();
	var encryptedText = "";
	reader.onload = function(e){
		
		var transaction = getIndexDbTransaction("CandResponse"+mockVar.mockId,"readwrite");
		if(transaction!=null){
		const CandResponse = transaction.objectStore("CandResponse"+mockVar.mockId);
		const quesIndex = CandResponse.index("quesId");
		const resultSet = CandResponse.getAll(quesId);
		resultSet.onsuccess = function(){
			//console.log('Ques id in '+quesId);
			//console.log("result set in save audio "+resultSet.result);
			if(resultSet.result.length>0)
				CandResponse.delete([quesId])
            var tempObj = {"fileName":type=="saveAudioFile"?'A@@'+quesId:'V@@'+quesId,"blob":e.target.result};
			var blobArr = JSON.stringify(tempObj).cordwood(180);
			var encryptedArr = [];
			setTimeout(function(){
				var time = Date();
				chillout.repeat(blobArr.length, function(i) {
					encryptedText+=rsaEncrypt.encrypt(blobArr[i]) + "@@sep@@"; 
					isAudioVideoResponseEncrypting = true;
				}).then(function() {
					
					//console.log("audio Text " +encryptedText);
					isAudioVideoResponseEncrypting = false;

					var transaction = getIndexDbTransaction("CandResponse"+mockVar.mockId,"readwrite");
					const CandResponse1 = transaction.objectStore("CandResponse"+mockVar.mockId);
					CandResponse1.put({'quesId':quesId+'','grpId':grpId,'secId':secId,'blob': new Blob([encryptedText] ,{type:'plain/text'}),'type':type=="saveAudioFile"?'A':'V' });
					//onAudioVideoResponseInserted(blob,type,quesId,itterationCount,grpId,secId);
				  var processingTime = Date();
				  //console.log("start time for Audio Storing :: " +time);
				  //console.log("End Time for Audio Storing :: "+processingTime);
				});
				
            
            },1);
			onAudioVideoResponseInserted(blob,type,quesId,itterationCount,grpId,secId);
			}
			
		};
		
	}
	reader.readAsDataURL(blob);
	
}
function retrieveBackupData(){
	var transaction = getIndexDbTransaction("backUp"+mockVar.mockId,"readwrite");
	if(transaction!=null){
	const quesTable = transaction.objectStore("backUp"+mockVar.mockId);
	const allRecords = quesTable.getAll();
	allRecords.onsuccess = function(){
		//console.log(allRecords.result);
		retrievedAudioVideo = allRecords.result
	};
	
	}
}
function encryptText(text){
	var textArr = text.cordwood(100);
	var encryptedArr = [];
	var encryptedText = "";
	for(var i=0;i<textArr.length;i++){
		//encryptedArr.push(rsaEncrypt.encrypt(textArr[i]));
		encryptedText += rsaEncrypt.encrypt(textArr[i]) + "@@sep@@";
	}
	return encryptedText;
}
function encryptionText(mockVarArr){
    var encryptedText = "";var itr = 0;var startTime = new Date();//console.log(startTime);
    for(var i=0;i<mockVarArr.length;i++){
			setTimeout(function(){
				isDataStoring = true;
				encryptedText += rsaEncrypt.encrypt(mockVarArr[itr++]) + "@@sep@@"; 
				if(itr==mockVarArr.length){
					//console.log('completed');
					var transaction = getIndexDbTransaction("backUp"+mockVar.mockId,"readwrite");
					if(transaction!=null){
						isDataStoring = false;
						//console.log(i,mockVarArr.length);
						const backup = transaction.objectStore("backUp"+mockVar.mockId);
						//console.log({'sequenceId':mockVar.sequenceId,'encryptedText': new Blob([encryptedText] ,{type:'plain/text'})});
						var end = new Date();
						//console.log(end);
						backup.put({'sequenceId':mockVar.sequenceId,'encryptedText': new Blob([encryptedText] ,{type:'plain/text'})});}
					setTimeout(function(){
						if(!isFinalSubmitStarted)
							saveBackUp(true);},50000);
					}
			},1);
		}
}
function parallelEncrypt(text){
	return new Promise(function (resolve){
		
		setTimeout(function(){resolve(rsaEncrypt.encrypt(text));},1)
	})
}
function storeAuditData(sequenceId){
	if(tempAuditJson.length<=0)
		return;
   	var encryptedText = "";
	var auditString = JSON.stringify(tempAuditJson);
	tempAuditJson=null;
	tempAuditJson= [];
	AuditJson=null,AuditJson= [];
	var reader = new FileReader()
	reader.onload =  function(e){
		setTimeout(function (){
			var startTime = new Date();
			
			var tempObj = {"fileName":"AuditJson_"+sequenceId+"_","blob":e.target.result};//console.log(tempObj);
			var auditArr = JSON.stringify(tempObj).cordwood(180);
			
			
			chillout.repeat(auditArr.length, function(i) {
				encryptedText+=rsaEncrypt.encrypt(auditArr[i]) + "@@sep@@"; 
			}).then(function() {
				tempAuditJson=null;
				tempAuditJson= [];
				//console.log('success');
				//console.log("audit text "+encryptedText);
				var transaction = getIndexDbTransaction("audit"+mockVar.mockId,"readwrite");
	           	if(transaction!=null){
					
					const audit = transaction.objectStore("audit"+mockVar.mockId);
					//console.log({'sequenceId':sequenceId,'encryptedText': new Blob([encryptedText] ,{type:'plain/text'})});
					var end = new Date();//console.log(end);
					audit.put({'sequenceId':sequenceId,'encryptedText': new Blob([encryptedText] ,{type:'plain/text'})});
				}
	           	var processingTime = Date();
	           	//console.log("Start Time to store audit Data "+startTime);
	           	//console.log("End time to store audit Data "+processingTime);
	           	
			});
       
		},1);
					
	}
	
	reader.readAsDataURL( new Blob([auditString] ,{type:'plain/text'}))
	
}
function storeBackUp(){
	var auditAndBackupObject=new Object();
	mockVar.closingTime = parseInt(new Date().getTime()/1000);
	auditAndBackupObject["AuditJSON"]="";
	auditAndBackupObject["BackUp"]=mockVar;
	//auditAndBackupObject["BackUpParameters"]="storeBackup@@BackUpParamSeparator@@"+submitVideoCallGroupByExaminer+"@@BackUpParamSeparator@@true@@BackUpParamSeparator@@"+authenticationKey;
	arrPromise = [];
   	var encryptedText = "";
	auditAndBackupObject["sequenceId"]=mockVar.sequenceId;
	var mockVarString = JSON.stringify(auditAndBackupObject);
	var reader = new FileReader()
	reader.onload =  function(e){
		isDataStoring = true;
		setTimeout(function (){
			var startTime = new Date();//console.log(startTime);
			var mockVarArr = e.target.result.cordwood(180);
			var time = Date();
			chillout.repeat(mockVarArr.length, function(i) {
				encryptedText+=rsaEncrypt.encrypt(mockVarArr[i]) + "@@sep@@"; 
			}).then(function() {
				
				//console.log('success');
				//console.log("Backup text "+encryptedText);
				var transaction = getIndexDbTransaction("backUp"+mockVar.mockId,"readwrite");
	           	if(transaction!=null){
					isDataStoring = false;
					//console.log(i,mockVarArr.length);
					const backup = transaction.objectStore("backUp"+mockVar.mockId);
					backup.clear();
					//console.log({'sequenceId':mockVar.sequenceId,'encryptedText': new Blob([encryptedText] ,{type:'plain/text'})});var end = new Date();console.log(end);
					backup.put({'sequenceId':mockVar.sequenceId,'encryptedText': new Blob([encryptedText] ,{type:'plain/text'})});
				}
	           	var processingTime = Date();
	           	//console.log("start time for backup Storing :: " +time);
	           	//console.log("End Time to Encrypt Backup :: "+processingTime);
	           	//storeAuditData(mockVar.sequenceId);
			});
       
		},1);
					
	}
	
	reader.readAsDataURL( new Blob([mockVarString] ,{type:'plain/text'}))
	
}

/*function storeBackUp(){
	 if(isDataStoring)return;
	var auditAndBackupObject=new Object();
	mockVar.closingTime = parseInt(new Date().getTime()/1000);
	auditAndBackupObject["AuditJSON"]=AuditJson.length>0?AuditJson:"";
	auditAndBackupObject["BackUp"]=mockVar;
	//auditAndBackupObject["BackUpParameters"]="storeBackup@@BackUpParamSeparator@@"+submitVideoCallGroupByExaminer+"@@BackUpParamSeparator@@true@@BackUpParamSeparator@@"+authenticationKey;
    arrPromise = [];
	auditAndBackupObject["sequenceId"]=mockVar.sequenceId;
	var mockVarString = JSON.stringify(auditAndBackupObject);
	reader = new FileReader()
	reader.onload =  function(e){
		isDataStoring = true;
		setTimeout(function (){
			var startTime = new Date();console.log(startTime);
			var mockVarArr = e.target.result.cordwood(200);
            for(var i=0;i<mockVarArr.length;i++){
            		arrPromise.push(parallelEncrypt(mockVarArr[i]));
            }
            Promise.all(arrPromise).then(function(e){
            	console.log(e.join("@@sep@@"));
            	var transaction = getIndexDbTransaction("backUp"+mockVar.mockId,"readwrite");
            	if(transaction!=null){
					isDataStoring = false;
					console.log(i,mockVarArr.length);
					const backup = transaction.objectStore("backUp"+mockVar.mockId);
					console.log({'sequenceId':mockVar.sequenceId,'encryptedText': new Blob([e.join("@@sep@@")] ,{type:'plain/text'})});var end = new Date();console.log(end);
					backup.put({'sequenceId':mockVar.sequenceId,'encryptedText': new Blob([e.join("@@sep@@")] ,{type:'plain/text'})});}
				
            	
            	var end = new Date();
            	console.log(end);
            	isDataStoring = false;
            });
		},1);
					
		var encryptedArr = [];
		var encryptedText = "";
		
		for(var i=0;i<mockVarArr.length;i++){
			encryptedArr.push(rsaEncrypt.encrypt(mockVarArr[i]));
			encryptedText += rsaEncrypt.encrypt(mockVarArr[i]) + "@@sep@@";
		}
		var transaction = getIndexDbTransaction("backUp"+mockVar.mockId+"@"+mockVar.attemptId,"readwrite");
		if(transaction!=null){
		const backup = transaction.objectStore("backUp"+mockVar.mockId+"@"+mockVar.attemptId);
		console.log({'sequenceId':mockVar.sequenceId,'encryptedText': new Blob([encryptedText] ,{type:'plain/text'})})
		backup.put({'sequenceId':mockVar.sequenceId,'encryptedText': new Blob([encryptedText] ,{type:'plain/text'})});
		}
	
	reader.readAsDataURL( new Blob([mockVarString] ,{type:'plain/text'}))
	
}*/

 /*function storeBackUp(){
	 if(isDataStoring)return;
	var auditAndBackupObject=new Object();
	mockVar.closingTime = parseInt(new Date().getTime()/1000);
	auditAndBackupObject["AuditJSON"]=AuditJson.length>0?AuditJson:"";
	auditAndBackupObject["BackUp"]=mockVar;
	//auditAndBackupObject["BackUpParameters"]="storeBackup@@BackUpParamSeparator@@"+submitVideoCallGroupByExaminer+"@@BackUpParamSeparator@@true@@BackUpParamSeparator@@"+authenticationKey;
	auditAndBackupObject["sequenceId"]=mockVar.sequenceId;
	var mockVarString = JSON.stringify(auditAndBackupObject);
	reader = new FileReader()
	reader.onload =  function(e){
		setTimeout(function (){var mockVarArr = e.target.result.cordwood(200);
		encryptionText(mockVarArr);},1);
		var encryptedArr = [];
		var encryptedText = "";
		
		for(var i=0;i<mockVarArr.length;i++){
			encryptedArr.push(rsaEncrypt.encrypt(mockVarArr[i]));
			encryptedText += rsaEncrypt.encrypt(mockVarArr[i]) + "@@sep@@";
		}
		var transaction = getIndexDbTransaction("backUp"+mockVar.mockId+"@"+mockVar.attemptId,"readwrite");
		if(transaction!=null){
		const backup = transaction.objectStore("backUp"+mockVar.mockId+"@"+mockVar.attemptId);
		console.log({'sequenceId':mockVar.sequenceId,'encryptedText': new Blob([encryptedText] ,{type:'plain/text'})})
		backup.put({'sequenceId':mockVar.sequenceId,'encryptedText': new Blob([encryptedText] ,{type:'plain/text'})});
		}
	
	reader.readAsDataURL( new Blob([mockVarString] ,{type:'plain/text'}))
	
}*/
function onAudioVideoResponseInserted(blob,type,queId,itterationCount,grpId,secId){

	
	isRecordedContentsaved = true;
	if(type.toLowerCase()=='savevideofile')
		mockVar.curQuesBean.quesParam.answer='recordingSaved';
		else
		mockVar.curQuesBean.quesParam.answer='recordingSaved';
		$('.overlay').hide();
		!isDeakin?$('#recordingUploadLoader').hide():$('.savingYourResponse').hide();
        !isDeakin?$("#recordingSaved").show():$(".responseSaved").show();
        setTimeout(function(){
            $("#recordingSaved").hide();},1000);
		//timer();
		if(!isExaminer){
			if(sessionStorage.userdefinedcandconsole==undefined || sessionStorage.userdefinedcandconsole==0){
				timer(3547+"M");
			}//Timer should not be displayed to the examiner as he can resume after candidate consume the whole time 
		}else{
			enableOrDisableSubmitForExaminer();
		} 
		timeSpentOnQuestionLevel();
		tempLocalBlobArray[queId]=null;
		if(typeof(sessionStorage.userdefinedcandconsole) != "undefined" && sessionStorage.userdefinedcandconsole==1 && !isDeakin){
			fnSubmitNew('NEXT');
		} else if(methodToCallPostAudioVideoResponseUploading) {
			if(methodToCallPostAudioVideoResponseUploading=="fnSubmit")
				fnSubmitNew(methodToCallPostAudioVideoResponseUploadingArgs[0], methodToCallPostAudioVideoResponseUploadingArgs[1], methodToCallPostAudioVideoResponseUploadingArgs[2]);
            else if(methodToCallPostAudioVideoResponseUploading=="navigateThroughNumberPanel")
                navigateThroughNumberPanel(methodToCallPostAudioVideoResponseUploadingArgs[0]);
            else if(methodToCallPostAudioVideoResponseUploading=="submitConfirmation")
                submitConfirmation(methodToCallPostAudioVideoResponseUploadingArgs[0],methodToCallPostAudioVideoResponseUploadingArgs[1]);
            methodToCallPostAudioVideoResponseUploading = "";
        } else if(showRecordingLimitReachedPopupPostAudioVideoResponseUploading) {
        	showRecordingLimitReachedPopupPostAudioVideoResponseUploading = false;
        	cnfPop('recordingLimitReachedPopup');
        }
	
}
function showZipDownload(){
	cnfPop('downloadPopup');
}
function sendAllFiles(isFinalSubmit,action){

	var candResponsesData=[];
	var auditData = [];
	var mockVarData = [];
	var transaction = getIndexDbTransaction("CandResponse"+mockVar.mockId,"readwrite");
	if(transaction!=null){
	const CandResponse = transaction.objectStore("CandResponse"+mockVar.mockId);
	
	const resultSet = CandResponse.getAll();
	
	 resultSet.onsuccess = function(){
		 candResponsesData = resultSet.result;
		 //console.log(resultSet.result);
		 
	 }
	}
	var transaction = getIndexDbTransaction("audit"+mockVar.mockId,"readwrite");
	if(transaction!=null){
	const auditJson = transaction.objectStore("audit"+mockVar.mockId);
	const auditSet = auditJson.getAll();
	auditSet.onsuccess = function(){
		 auditData = auditSet.result;
		 //console.log(auditSet.result);
		 
	 }
	}
	
	count = 0;
	
	setTimeout(function(){//console.log(mockVarData);
	arr = [rsaEncrypt.encrypt('data:plain/text;base64,{}')];
	arr.push(new Blob(["@@sep@@"+rsaEncrypt.encrypt("sepMockVarAndResponse")+"@@sep@@"],{'type':'plain/text'}));
    for(var i=0;i<candResponsesData.length;i++){
		var blobResponse = null;
        blobResponse = candResponsesData[i];//console.log(blobResponse)
        
        arr.push(blobResponse.blob);
        
        arr.push(new Blob(["@@sep@@"+rsaEncrypt.encrypt("sepResponseData")+"@@sep@@"],{'type':'plain/text'}));
        
     }
    for(var i=0;i<auditData.length;i++){
		var blobResponse = null;
        blobResponse = auditData[i];
        //console.log(blobResponse)
        arr.push(blobResponse.encryptedText);
        
        arr.push(new Blob(["@@sep@@"+rsaEncrypt.encrypt("sepResponseData")+"@@sep@@"],{'type':'plain/text'}));
        
    }

    	   formData = new FormData()
    	   formData.append("mockId",mockVar.mockId)
    	   formData.append("responseZip", new File([new Blob(arr,{'type':'plain/text'})],mockVar.candMasterId+"@@"+mockVar.attemptId+"@@demo.txt"))
    	   var URL = "/IBACC/MockAssessmentIBAAction.do?action=reliableModeZipUpload&orgId="+mockVar.orgId+"&submitAss=false&mockVarReq=false";
    	   	if(candResponsesData.length>0 || auditData.length > 0  || isFinalSubmit){
    	   	jQuery.ajax({
    	   		url : URL,
    	   		async : true,
    	   		type : "POST",
    	   		dataType : 'text',
    	   		data : formData,
    	   		processData : false,
    	   		contentType : false,
    	   		success : function(data) {
    	   			
    	   			for(var itr=0;itr<candResponsesData.length;itr++){
    	   				deleteCandAudioVideoData(candResponsesData[itr].quesId);
    	   			}
    	   			for(var itr=0;itr<auditData.length;itr++){
    	   				deleteAuditData(auditData[itr].sequenceId);
    	   			}
    	   			if(isFinalSubmit)
    	   				sendResponseToServlet(action);
    	   		},
    	   		error : function(){
    	   			if(isFinalSubmit)
    	   				sendResponseToServlet(action);
    	   		}
    					
    	   				
    	   		
    	   		
    	   	});
    	   	
    	   	}

      },2000)
}
function createResponseSingleZip(){
	if(isResponseDownloaded)return;
	$("#pWait").show();
	$("#processingMessage").show();
	mockVar.downloadedDate = sessionStorage.downloadedDate;
	var candResponsesData=[];
	var mockVarData = [],auditData=[];
	//const fileStream = streamSaver.createWriteStream(sessionStorage.cand_master_id+"@@"+sessionStorage.attemptId+'@@archive.zip');
	var transaction = getIndexDbTransaction("CandResponse"+mockVar.mockId,"readwrite");
	if(transaction!=null){
	const CandResponse = transaction.objectStore("CandResponse"+mockVar.mockId);
	const resultSet = CandResponse.getAll();
	 resultSet.onsuccess = function(){
		 candResponsesData = resultSet.result;
		 //console.log(resultSet.result);
		 
	 }
	}
	var transaction = getIndexDbTransaction("audit"+mockVar.mockId,"readwrite");
	if(transaction!=null){
	const auditJson = transaction.objectStore("audit"+mockVar.mockId);
	const auditSet = auditJson.getAll();
	auditSet.onsuccess = function(){
		 auditData = auditSet.result;
		 //console.log(auditSet.result);
		 
	 }
	}
	var auditAndBackupObject=new Object();
	mockVar.closingTime = parseInt(new Date().getTime()/1000);
	auditAndBackupObject["AuditJSON"]=AuditJson.length>0?AuditJson:"";
	auditAndBackupObject["BackUp"]=mockVar;
	//auditAndBackupObject["BackUpParameters"]="storeBackup@@BackUpParamSeparator@@"+submitVideoCallGroupByExaminer+"@@BackUpParamSeparator@@true@@BackUpParamSeparator@@"+authenticationKey;
	auditAndBackupObject["sequenceId"]=mockVar.sequenceId;
	var mockVarString = JSON.stringify(auditAndBackupObject);
	var reader = new FileReader();
	reader.onload = function(e){
		var encryptedText = "";var itr = 0;var startTime = new Date();//console.log(startTime);
		var startTime = new Date();//console.log(startTime);
		var mockVarArr = e.target.result.cordwood(180);
			var time = Date();
			chillout.repeat(mockVarArr.length, function(i) {
				encryptedText+=rsaEncrypt.encrypt(mockVarArr[i]) + "@@sep@@"; 
			}).then(function() {
				arr = [encryptedText];
				arr.push(new Blob(["@@sep@@"+rsaEncrypt.encrypt("sepMockVarAndResponse")+"@@sep@@"],{'type':'plain/text'}));
			    for(var i=0;i<candResponsesData.length;i++){
					var blobResponse = null;
			        blobResponse = candResponsesData[i];//console.log(blobResponse)
			        
			        arr.push(blobResponse.blob);
			        
			        arr.push(new Blob(["@@sep@@"+rsaEncrypt.encrypt("sepResponseData")+"@@sep@@"],{'type':'plain/text'}));
			    }
			    for(var i=0;i<auditData.length;i++){
					var blobResponse = null;
			        blobResponse = auditData[i];//console.log(blobResponse)
			        
			        arr.push(blobResponse.encryptedText);
			        
			        arr.push(new Blob(["@@sep@@"+rsaEncrypt.encrypt("sepResponseData")+"@@sep@@"],{'type':'plain/text'}));
			    }
			    if(!isResponseDownloaded){
			    var a = document.createElement("a");
			    a.href = URL.createObjectURL(new Blob(arr,{'type':'plain/text'}))
			    a.download = (sessionStorage.loginId.split('@')[0]!=""?sessionStorage.loginId.split('@')[0]:mockVar.candidate_Id)+".zip";
			   // a.download = sessionStorage.cand_master_id+"@@"+sessionStorage.attemptId+"@@demo.zip";
			    try{deleteIndexedDB();}catch(e){console.log(e);}
			    isResponseDownloaded = true;
			    $("#pWait").hide();
			    a.click();
			    URL.revokeObjectURL(a.href);
			    cnfPop('submitOnlineAssessmentReliable');
				$("#submitOnlineMsgReliable").html($(globalXmlvar).find('ReliableResponseDownload').text());
			    }
				
				
	           	var processingTime = Date();
	           	//console.log("start time for backup Storing :: " +time);
	           	//console.log("End Time to Encrypt Backup :: "+processingTime);
	           	//storeAuditData(mockVar.sequenceId);
			});
       
	/*
		for(var i=0;i<mockVarArr.length;i++){
		setTimeout(function(){
			encryptedText += rsaEncrypt.encrypt(mockVarArr[itr++]) + "@@sep@@"; 
			if(itr==mockVarArr.length){
				console.log('completed');
				console.log(mockVarData);
				arr = [encryptedText];
				arr.push(new Blob(["@@sep@@"+rsaEncrypt.encrypt("sepMockVarAndResponse")+"@@sep@@"],{'type':'plain/text'}));
			    for(var i=0;i<candResponsesData.length;i++){
					var blobResponse = null;
			        blobResponse = candResponsesData[i];console.log(blobResponse)
			        
			        arr.push(blobResponse.blob);
			        
			        arr.push(new Blob(["@@sep@@"+rsaEncrypt.encrypt("sepResponseData")+"@@sep@@"],{'type':'plain/text'}));
			    }
			    var a = document.createElement("a");
			    a.href = URL.createObjectURL(new Blob(arr,{'type':'plain/text'}))
			    a.download = (sessionStorage.loginId.split('@')[0]!=""?sessionStorage.loginId.split('@')[0]:"dummy")+".zip";
			   // a.download = sessionStorage.cand_master_id+"@@"+sessionStorage.attemptId+"@@demo.zip";
			    a.click();
			    URL.revokeObjectURL(a.href);
			    deleteIndexedDB();
			    $("#pWait").hide();
			    cnfPop('submitOnlineAssessmentReliable');
				$("#submitOnlineMsgReliable").html("Your Assessment has been Completed.Please share the downloaded zip to the admin to Evaluate the responses");
			}
			    
		},1);
		
			}*/
		}
	reader.readAsDataURL( new Blob([mockVarString] ,{type:'plain/text'}));
	count = 0;
	
	/*setTimeout(function(){console.log(mockVarData);arr = [mockVarData[0]];arr.push(new Blob(["@@sep@@"+rsaEncrypt.encrypt("sepMockVarAndResponse")+"@@sep@@"],{'type':'plain/text'}));
    for(var i=0;i<candResponsesData.length;i++){
		var blobResponse = null;
        blobResponse = candResponsesData[i];console.log(blobResponse)
        
        arr.push(blobResponse.blob);
        
        arr.push(new Blob(["@@sep@@"+rsaEncrypt.encrypt("sepResponseData")+"@@sep@@"],{'type':'plain/text'}));
        
        }var a = document.createElement("a");
        a.href = URL.createObjectURL(new Blob(arr,{'type':'plain/text'}))
        a.download = sessionStorage.cand_master_id+"@@"+sessionStorage.attemptId+"@@demo.txt";
        a.click();
        URL.revokeObjectURL(a.href);},2000);*/
	
}
function createResponseZip(){
	var candResponsesData=[];
	var mockVarData = [];
	const fileStream = streamSaver.createWriteStream(sessionStorage.cand_master_id+"@@"+sessionStorage.attemptId+'@@archive.zip');
	var transaction = getIndexDbTransaction("CandResponse"+mockVar.mockId,"readwrite");
	if(transaction!=null){
	const CandResponse = transaction.objectStore("CandResponse"+mockVar.mockId);
	const resultSet = CandResponse.getAll();
	 resultSet.onsuccess = function(){
		 candResponsesData = resultSet.result;
		// console.log(resultSet.result);
		 
	 }
	}
	var transaction = getIndexDbTransaction("backUp"+mockVar.mockId,"readwrite");
	if(transaction!=null){
	const CandResponse = transaction.objectStore("backUp"+mockVar.mockId);
	const resultSet = CandResponse.getAll();
	 resultSet.onsuccess = function(){
		 if(resultSet.result.length>0)
			 mockVarData.push(resultSet.result[resultSet.result.length-1].encryptedText)
		 
	 }
	}
	
	
	
	setTimeout(function(){const readableZipStream = new ZIP({
		 start (ctrl) {//console.log(mockVarData,candResponsesData);
			 for(var i=0;i<candResponsesData.length;i++){
				 var blobResponse = null;
                  blobResponse = candResponsesData[i];
                 
				 ctrl.enqueue({
			         name: 'candResponses/'+blobResponse.type+"@@"+blobResponse.quesId+'.txt',
			         stream: function(){ return blobResponse.blob.stream();}
			      });
			 }
			 for(var i1=0;i1<mockVarData.length;i1++){//console.log(mockVarData[i1]);
                var blob1 = mockVarData[i1];
                var file =  {
			         name: 'mockVar.txt',
			         stream: function(){ //console.log(blob1,i1);
			        	 return blob1.stream();
			        	 
			         }
			      }
				 ctrl.enqueue(file);
			 }
			 ctrl.close();
		 }
	 });
	 if (window.WritableStream && readableZipStream.pipeTo) {
        return readableZipStream.pipeTo(fileStream).then(() => console.log('done writing'))
      }

		// less optimized
      const writer = fileStream.getWriter()
      const reader = readableZipStream.getReader()
      const pump = () => reader.read()
        .then(res => res.done ? writer.close() : writer.write(res.value).then(pump))

      pump();},5000)
	
}
function proofReadingCleanUpActivity(){
	var organizationId = 0,bundleId = 0;
	if(document.URL.indexOf("bundleId")>0){
		bundleId = document.URL.split("bundleId=")[1];
		if (bundleId.indexOf("&") > 0) {
			bundleId = bundleId.split("&")[0];
		}
	}
	if(document.URL.indexOf("orgId")>0){
		organizationId = document.URL.split("orgId=")[1];
		if (organizationId.indexOf("&") > 0) {
			organizationId = organizationId.split("&")[0];
		}
	}
	jQuery.ajax({
		url : "/CAE/CAEIntegrationServlet?action=deleteMediaAfterConsolePreview&orgId="+organizationId+"&bundleId="+bundleId,
		async : true,
		type : 'POST',
		//data : paramsvalue,
		dataType : 'text',
		success : function(data) {
			console.log(data);
		}
	});
}