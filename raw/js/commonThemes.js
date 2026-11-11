jQuery(document).ready(function() {
	applyThemes();
});
function applyThemes(){
	if(sessionStorage.userdefinedcandconsole==0 && (typeof(sessionStorage.userDefinedNum)!="undefined") && 
			(sessionStorage.userDefinedNum!="defaultUI" || sessionStorage.userDefinedNum!="paperUI"
				|| sessionStorage.userDefinedNum!="other" || sessionStorage.userDefinedNum!="ExamLab" || sessionStorage.userDefinedNum!="MyClassRoom")){
		var fileref=document.createElement('script')
        fileref.setAttribute("type","text/javascript")
        fileref.setAttribute("src","js/"+sessionStorage.userDefinedNum+".js?v="+ sessionStorage.jsVersion );
		var fileCss=document.createElement("link")
        fileCss.setAttribute("rel", "stylesheet")
        fileCss.setAttribute("type", "text/css")
       fileCss.setAttribute("href", "css/"+sessionStorage.userDefinedNum+".css?v="+ sessionStorage.jsVersion);
		 document.getElementsByTagName("head")[0].appendChild(fileref);
		 document.getElementsByTagName("head")[0].appendChild(fileCss);
	}
	}