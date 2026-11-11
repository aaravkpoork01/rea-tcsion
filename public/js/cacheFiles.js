var fileURL = {};
var assessmentIdCache = 0;
var orgIdCache = 0;
var objectStore = "files";
var dataLoadedFromCache = false;
var constantsProperties = {
		objectStore:"files",
		readWrite:"readwrite",
		read:"read",
		write:"write",
		AssessmentConfigurations:"AssessmentConfigurations_",
		langFiles:"langFiles",
		filesIndex:"filesIndex",
		customUIFiles:"customUIFiles"
}
// Paper files are cached per revision so an edited/uploaded paper is picked up
// instead of the XML stored by an earlier session.
function assessmentCacheRevision(){
	var revision = sessionStorage.assessmentUpdatedDate;
	return (revision != undefined && revision != null && revision !== "") ? "_r" + revision : "_runversioned";
}
async function initializeAllData(){
	assessmentIdCache = sessionStorage.assessmentId;
	orgIdCache = sessionStorage.orgId;
	var url = document.URL;
	if(url.indexOf('configurationCheck.html')>-1){
		var urlParams = url.split("configurationCheck.html?")[1];
		assessmentIdCache = urlParams.split("AsmntId=")[1];
    	if (assessmentIdCache.indexOf("&") > 0) {
    		assessmentIdCache = assessmentIdCache.split("&")[0];
    	}
		orgIdCache = urlParams.split("orgId=")[1];
		if (orgIdCache.indexOf("&") > 0) {
			orgIdCache = orgIdCache.split("&")[0];
    	}
	}else if(url.indexOf('login.html')>-1){
		var urlParams = url.split("login.html?");
		assessmentIdCache = urlParams[1].trim().split("@@")[1];
		orgIdCache= urlParams[1].trim().split("@@")[0];
	}else if(url.indexOf('index.html')>-1){
		var urlParams = url.split("index.html?");
		assessmentIdCache = urlParams[1].trim().split("@@")[1];
		orgIdCache= urlParams[1].trim().split("@@")[0];
		
	}
	if(assessmentIdCache!=undefined && (assessmentIdCache+"").indexOf("#")>-1)
		assessmentIdCache = (assessmentIdCache+"").substring(0,(assessmentIdCache+"").indexOf("#"));
	if(assessmentIdCache == undefined)
		assessmentIdCache = new Date().getTime();
	if(orgIdCache!=undefined && (orgIdCache+"").indexOf("#")>-1)
		orgIdCache = (orgIdCache+"").substring(0,(orgIdCache+"").indexOf("#"));
	if(orgIdCache == undefined)
		orgIdCache = new Date().getTime();
	var res = "";
	res = await getAssessmentConfigurationFiles(constantsProperties.AssessmentConfigurations+orgIdCache+"_"+assessmentIdCache+assessmentCacheRevision());
	console.log(res);
	res = await getAssessmentConfigurationFiles(constantsProperties.langFiles+orgIdCache+assessmentCacheRevision());
	console.log(res);
	res = await getJsonFiles(constantsProperties.customUIFiles+orgIdCache);
	console.log(res);
	
	

}
async function getAssessmentConfigurationFiles(dbName){
	var isDataFetched = false;
	var startTime = "";
	var operation = "readwrite";
	//var fileName =  filePath.substr(filePath.lastIndexOf('/')+1,filePath.length);
	var promise =  new Promise(function(resolve, reject) {
		try{
			var req =  window.indexedDB.open(dbName,1);
			var existed = true;
			req.onsuccess = function () {
				try{
					tx = req.result.transaction(constantsProperties.objectStore,constantsProperties.readWrite);
					tx.onerror = function(err){
							
					}
					tx.oncomplete = function(){
						req.result.close();
					};
					const xmlTable = tx.objectStore(constantsProperties.objectStore);
					const xmlIndex = xmlTable.index(constantsProperties.filesIndex);
					const resultSet = xmlIndex.getAll();
					resultSet.onsuccess = function(){
						try{
							//console.log(resultSet.result);
							if(resultSet.result.length>0){
								var arr = resultSet.result;
								for(var i=0;i<arr.length;i++){
									var parser=new DOMParser();
							        /*xml = parser.parseFromString(arr[i].XML,"text/xml");
							        var serializer = new XMLSerializer();*/
							        fileURL[arr[i].fileName] = URL.createObjectURL(arr[i].XML);
							        /*console.log(arr[i].fileName);
									console.log(arr[i].fileName,arr[i].XML);
									console.log(arr[i].fileName,fileURL[arr[i].fileName]);*/
								}
								resolve('success');
						     }
							else{
								resolve('no Records found');
						    }
						}catch(e){
							resolve(e);
						}
					};
				}catch(e){
					resolve(e);
				}
			}	
			req.onupgradeneeded = function () {
				existed = false;
				 const xmlFileTable = req.result.createObjectStore(objectStore,{keyPath:"fileName",autoIncrement:true});
				 xmlFileTable.createIndex(constantsProperties.filesIndex,["fileName"],{unique:true});
			}
			req.onerror = function (e) {
				  //  console.log("Couldn't delete database");
				console.log(e);
				resolve('Error Occured');
			};
		}catch(e){
			resolve(e);
		}
	});
			
		
	var xml = await promise;
	return xml;

}

async function getDataFromIndexedDB(){
	var res = "";
	res = await getAssessmentConfigurationFiles(constantsProperties.AssessmentConfigurations+orgIdCache+"_"+assessmentIdCache+assessmentCacheRevision());
	console.log(res);
	res = await getAssessmentConfigurationFiles(constantsProperties.langFiles+orgIdCache+assessmentCacheRevision());
	console.log(res);
	res = await getJsonFiles(constantsProperties.customUIFiles+orgIdCache);
	console.log(res);
	
	
}
function storeAssessmentFile(fileName,xml,assConfigFile){
	try{
		if(document.URL.indexOf("autoMock")>=0)
			return;
		if(assConfigFile)
			dbName = constantsProperties.AssessmentConfigurations+orgIdCache+"_"+assessmentIdCache+assessmentCacheRevision();
		else 
			dbName = constantsProperties.langFiles+orgIdCache+assessmentCacheRevision();
		
		var req =  window.indexedDB.open(dbName,1);
		var existed = true;
		req.onsuccess = function () {
			tx = req.result.transaction(constantsProperties.objectStore,constantsProperties.readWrite);
			tx.onerror = function(err){
					
			}
			tx.oncomplete = function(){
				req.result.close();
			};
			const xmlTable = tx.objectStore(constantsProperties.objectStore);
			var serializer = new XMLSerializer();
			xmlTable.put({'fileName':fileName,'XML': new Blob([serializer.serializeToString(xml)] ,{type:'plain/text'})});
			fileURL[fileName] = URL.createObjectURL(new Blob([serializer.serializeToString(xml)],{'type':'text/xml'}));
			/*console.log("getData :: "+fileName,xml);
			console.log("getData :: "+fileName,serializer.serializeToString(xml));
			console.log("getData :: "+fileName,fileURL[fileName]);*/
		
		}	
		req.onupgradeneeded = function () {
			existed = false;
			 const xmlFileTable = req.result.createObjectStore(objectStore,{keyPath:"fileName",autoIncrement:true});
			 xmlFileTable.createIndex(constantsProperties.filesIndex,["fileName"],{unique:true});
		}
	}catch(e){
		console.log(e);
	}

	
}
function storeJsonFile(fileName,json){
	try{
		if(orgIdCache==0 && sessionStorage.orgId != undefined){
			orgIdCache = sessionStorage.orgId;
		}
		if(orgIdCache == undefined)
			orgIdCache = new Date().getTime();
		dbName = constantsProperties.customUIFiles+orgIdCache;
		
		var req =  window.indexedDB.open(dbName,1);
		var existed = true;
		req.onsuccess = function () {
			tx = req.result.transaction(constantsProperties.objectStore,constantsProperties.readWrite);
			tx.onerror = function(err){
					
			}
			tx.oncomplete = function(){
				req.result.close();
			};
			const xmlTable = tx.objectStore(constantsProperties.objectStore);
			var serializer = new XMLSerializer();
			xmlTable.put({'fileName':fileName,'JSON': new Blob([json] ,{type:'plain/text'})});
			fileURL[fileName] = URL.createObjectURL(new Blob([json],{'type':'plain/text'}));
			/*console.log("getData :: "+fileName,json);
			console.log("getData :: "+fileName,JSON.stringify(json));
			console.log("getData :: "+fileName,fileURL[fileName]);*/
		
		}	
		req.onupgradeneeded = function () {
			existed = false;
			 const xmlFileTable = req.result.createObjectStore(objectStore,{keyPath:"fileName",autoIncrement:true});
			 xmlFileTable.createIndex(constantsProperties.filesIndex,["fileName"],{unique:true});
		}
	}catch(e){
		console.log(e);
	}

	
}
async function getJsonFiles(dbName){
	var isDataFetched = false;
	var startTime = "";
	var operation = "readwrite";
	//var fileName =  filePath.substr(filePath.lastIndexOf('/')+1,filePath.length);
	var promise =  new Promise(function(resolve, reject) {
		try{
			var req =  window.indexedDB.open(dbName,1);
			var existed = true;
			req.onsuccess = function () {
				try{
					tx = req.result.transaction(constantsProperties.objectStore,constantsProperties.readWrite);
					tx.onerror = function(err){
							
					}
					tx.oncomplete = function(){
						req.result.close();
					};
					const xmlTable = tx.objectStore(constantsProperties.objectStore);
					const xmlIndex = xmlTable.index(constantsProperties.filesIndex);
					const resultSet = xmlIndex.getAll();
					resultSet.onsuccess = function(){
						try{
							//console.log(resultSet.result);
							if(resultSet.result.length>0){
								var arr = resultSet.result;
								for(var i=0;i<arr.length;i++){
									var parser=new DOMParser();
							        /*xml = parser.parseFromString(arr[i].XML,"text/xml");
							        var serializer = new XMLSerializer();*/
							        fileURL[arr[i].fileName] = URL.createObjectURL(arr[i].JSON);
							        /*console.log(arr[i].fileName);
									console.log(arr[i].fileName,arr[i].JSON);
									console.log(arr[i].fileName,fileURL[arr[i].fileName]);*/
								}
								resolve('success');
						     }
							else{
								resolve('no Records found');
						    }
						}catch(e){
							resolve(e);
						}
					};
				}catch(e){
					resolve(e);
				}
			}	
			req.onupgradeneeded = function () {
				existed = false;
				 const xmlFileTable = req.result.createObjectStore(objectStore,{keyPath:"fileName",autoIncrement:true});
				 xmlFileTable.createIndex(constantsProperties.filesIndex,["fileName"],{unique:true});
			}
			req.onerror = function (e) {
				  //  console.log("Couldn't delete database");
				console.log(e);
				resolve('Error Occured');
			};
		}catch(e){
			resolve(e);
		}
	});
			
		
	var xml = await promise;
	return xml;

}
function deleteEntryFromDB(fileName,isAssConfig,isJson){
	try{
		if(!isJson){
			if(assConfigFile)
				dbName = constantsProperties.AssessmentConfigurations+orgIdCache+"_"+assessmentIdCache+assessmentCacheRevision();
			else 
				dbName = constantsProperties.langFiles+orgIdCache+assessmentCacheRevision();
		}else{
			dbName = constantsProperties.customUIFiles+orgIdCache;
		}
		try{
			var req =  window.indexedDB.open(dbName,1);
			var existed = true;
			req.onsuccess = function () {
				try{
					tx = req.result.transaction(constantsProperties.objectStore,constantsProperties.readWrite);
					tx.onerror = function(err){
							
					}
					tx.oncomplete = function(){
						req.result.close();
					};
					const xmlTable = tx.objectStore(constantsProperties.objectStore);
					const xmlIndex = xmlTable.index(constantsProperties.filesIndex);
					const resultSet = xmlIndex.getAll();
					resultSet.onsuccess = function(){
						try{
							//console.log(resultSet.result);
							if(resultSet.result.length>0){
								xmlTable.delete(fileName);
							}
							else{
								console.log("no records");
						    }
						}catch(e){
							console.log(e);
						}
					};
				}catch(e){
					console.log(e);
				}
			}	
			req.onupgradeneeded = function () {
				existed = false;
				 const xmlFileTable = req.result.createObjectStore(objectStore,{keyPath:"fileName",autoIncrement:true});
				 xmlFileTable.createIndex(constantsProperties.filesIndex,["fileName"],{unique:true});
			}
		}catch(e){
			console.log(e);
		}
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

	}catch(e){
		console.log(e);
	}

}
function loadDataFromCache(){
	var promise =  new Promise(async function(resolve, reject) {
		try{
			var res = "already Loaded";
			if(!dataLoadedFromCache)
				res = await initializeAllData();
			dataLoadedFromCache = true;
			resolve(res);
		}catch(e){
			resolve(e);
		}
    });
    return promise;
}