function applyWatermark(selector, text) {
   const $el = $(selector).first();
   if (!$el.length) return;
   const baseName  = selector.replace('#', '').replace('.', '');
   const ruleClass = baseName + '2';
   let targetEl;
   
       targetEl = $el;
       targetEl.addClass('watermark ' + ruleClass);
   
   const imgData = createCanvasDataURL(baseName, text);

   let styleTag = document.getElementById('canvasBGStyles');
   if (!styleTag) {
       styleTag = document.createElement('style');
styleTag.id = 'canvasBGStyles';
       document.head.appendChild(styleTag);
   }
   const sheet = styleTag.sheet;
   for (let i = sheet.cssRules.length - 1; i >= 0; i--) {
       if (sheet.cssRules[i].selectorText === '.' + ruleClass) {
           sheet.deleteRule(i);
       }
   }
   sheet.insertRule(`
       .${ruleClass} {
           background-image: url(${imgData})!important;
       }
   `, sheet.cssRules.length);
}

function getWaterMarkColor(){
	
	var lightThemeColors = {
	        1: "#F5F7F7", // Light
	        2: "#E8EBEB", // Medium
	        3: "#DEE0E0" ,// High
			4: "#D4D7D7",
			5: "#C9CCCC",
			6: "#BFC2C2",
			7: "#B4B7B7",
			8: "#AAADAD"
	    };
	    var darkThemeColors = {
	        1: "#1E202E", // Light
	        2: "#26293B", // Medium
	        3: "#2E3147", // Dark
			4: "#363A53",
			5: "#3F435F",
			6: "#484C6B",
			7: "#51557A",
			8: "#5A5E88",
			9:"#3B3B3B"
	    }; 
	    var isDark = document.body.classList.contains("darkThemeParent") || document.body.classList.contains("highContrast") ;
	    var colorForWaterMark=isDark ? "#E8EBEB" : "#26293B";
	    if(sessionStorage.userDefinedNum==="schoolUI" || sessionStorage.userDefinedNum==="certificationUI" || sessionStorage.userDefinedNum==="corporateUI" ){
	    	colorForWaterMark=isDark ? "#AAADAD" : "#5A5E88";
	    }
	    else{
	    	 var level = [1, 2, 3,4,5,6,7,8,9].includes(Number(sessionStorage.getItem("intensityLevel"))) ? Number(sessionStorage.getItem("intensityLevel")) : 2;
	 	    colorForWaterMark=isDark ? darkThemeColors[level] : lightThemeColors[level];
	    }
	    
	    return colorForWaterMark;
}
function createCanvasDataURL(dataclass,text) {
    var color = getWaterMarkColor();
    var canvas = document.createElement("canvas");
    var fontSize = watermarkfontsize;
    canvas.setAttribute('height', '150px');
    // canvas.setAttribute('height', fontSize*(text.length/3));
    canvas.setAttribute('width', '200px');
    var context = canvas.getContext('2d');
    context.setTransform(1, -0.90, 1, 2, 0, 120);
    if (sessionStorage.userDefinedNum === "schoolUI") {
        context.globalAlpha = 0.3;
    } else
        context.globalAlpha = contextGlobalAlphaValue;
    // context.setTransform(1,-0.90, 1, 2, 0,(fontSize*(text.length/6)));
    context.fillStyle = color;
    context.font = watermarksize + ' ' + fontSize + 'px sans-serif';
    context.fillText(text, 0, fontSize);
    return canvas.toDataURL('image/png');
}

function waterMark(text) {
	   try {
		   if((mockVar.curQuesBean.keyboardType==='AudioFile' || mockVar.curQuesBean.keyboardType=== 'VideoFile') && (sessionStorage.userDefinedNum==="corporateUI" || sessionStorage.userDefinedNum==="certificationUI" )){
			   [
	               "#LAQuesText",
	               "#quesOuterDiv",
	               ".rightDiv"
	           ].forEach(selector => applyWatermark(selector, text));  
		   }
		   else if(sessionStorage.userDefinedNum==="schoolUI" || sessionStorage.userDefinedNum==="certificationUI"   ){
			   [
	               ".leftDiv",
	               ".rightDiv"
	           ].forEach(selector => applyWatermark(selector, text));
		   }
		    
		   else{
		   if (iOAP.secDetails[iOAP.curSection].secType != "TYPING" && iOAP.secDetails[iOAP.curSection].secType != "Typing Test") {
				
				
	           [
	               "#quesOuterDiv",
	              // ".groupQuestionsDiv",
	               ".viewQPDiv",
	               ".mContent",
	               ".program_container",
	               ".programingAnsContent"
	           ].forEach(selector => applyWatermark(selector, text));
	       } else {
	           [
	               ".leftDiv"
	           ].forEach(selector => applyWatermark(selector, text));
	       }
	   }
	   } catch (e) {
	       setTimeout(() => waterMark(sessionStorage.waterMarkId), 500);
	   }
	}

