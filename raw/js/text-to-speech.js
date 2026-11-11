/* author 1184615 sreejith */
const synth = window.speechSynthesis;
let voiceOverInstances=[];
var loadedVoices=synth.getVoices();
//console.log('first loaded voices '+loadedVoices);
let lastCount=0;
let timerForStableDropDown;
var announceSpecialChars= false;

function formVoiceOverTextForInstruPageHtml(langId){
	try{
				$('.voiceOverBtn').show();
				inputTxt='';
				// sreejith
				// first check if both the pages(firstpage, secondPagep1) are displayed or not (in case of mock two pages)
				// then check if all the content inside each page is displayed or not (remoteproc instrus, zoom etc)
				if(isInstruPageVisible($('#iframeId').contents().find('#firstPage')[0])){
				
				for(let ele of $('#iframeId').contents().find('.sysInstText' + langId).contents())
				{
				 if(ele.nodeType===Node.ELEMENT_NODE){
					 inputTxt+=isInstruPageVisible(ele)?ele.textContent+'.':' '; // if nodeType is Element , then im checking if the element is hidden
	             }
				 else if(ele.nodeType===Node.TEXT_NODE){
				 	 inputTxt+=ele.textContent; // if the nodeType is Text, since its not an element not possible to check if its hidden , so append directly(these are just white spaces)
				 }
				
				}
				}
				
				if(isInstruPageVisible($('#iframeId').contents().find('#secondPagep1')[0])){
				inputTxt+=' ';
				for(let ele of $('#iframeId').contents().find('.cusInstText' + langId).contents()){
				if(ele.nodeType===Node.ELEMENT_NODE){
				     inputTxt+=isInstruPageVisible(ele)?ele.textContent+'.':' ';
				}
				else if(ele.nodeType===Node.TEXT_NODE){
					inputTxt+=ele.textContent;
				}
				}
				}
				
				inputTxt=inputTxt.trim().replace(/\s+/g," ");
				instantiateVOobj();
				$('#iframeId').css('height',"calc(100% - 60px)");
			}
			catch(e){}
}



		function isInstruPageVisible(el){

			 if (!el) return false;
			 const style = window.getComputedStyle(el);
			 return style.display !== "none" &&
			        style.visibility !== "hidden" &&
			        style.opacity !== "0";
			
        }

const symbolMap = {
 // Brackets / Parentheses
 "(": "open parenthesis",
 ")": "close parenthesis",
 "[": "open bracket",
 "]": "close bracket",
 "{": "open brace",
 "}": "close brace",
 "<": "less than",
 ">": "greater than",
 // Math symbols
 "+": "plus",
 "-": "minus",
 "*": "multiply",
 "/": "divide",
 "%": "percent",
 "=": "equals",
 "±": "plus or minus",
 "×": "times",
 "÷": "divide",
 "^": "caret",
 // Punctuation
 // ".": "dot",
 // ",": "comma",
 ":": "colon",
 ";": "semicolon",
 "!": "exclamation mark",
 "?": "question mark",
 "\"": "quote",
 "'": "apostrophe",
 "`": "backtick",
 // Lines & dashes
 "_": "underscore",
 "-": "hyphen",
 "–": "en dash",
 "—": "em dash",
 "|": "vertical bar",
 // Currency
 "$": "dollar",
 "€": "euro",
 "£": "pound",
 "¥": "yen",
 "₹": "rupee",
 // Special symbols
 // "@": "at", commenting as @ is used in @@optionPause@@
 "#": "hash",
 "&": "ampersand",
 "~": "tilde",
 "\\": "backslash",
 "/": "slash",
 // Misc
 "^": "caret",
 "°": "degree",
 "©": "copyright",
 "®": "registered",
 "™": "trademark",
};

$(document).on('change', '#chooseAccent', function(e) {
	let selectedVal = $(this).val();
	sessionStorage.setItem('selectedVoice', selectedVal);
	mockVar.selectedVoice=selectedVal;
});


window.speechSynthesis.onvoiceschanged = function(e) {
	
	/*notes for sreejith: called?*/
	/*new voices are available*/
	/*software is updated and new voices are added in the windows*/
	/*new voices found by the browser*/
	/*special case: edge browser : gets called on synth.play() : lazy loaded*/
	
	loadedVoices=synth.getVoices();
//	console.log('second loaded voices '+loadedVoices);
	if(loadedVoices.length!==lastCount){
		lastCount=loadedVoices.length;
		clearTimeout(timerForStableDropDown);
		timerForStableDropDown=setTimeout(function(){
			loadedVoices= synth.getVoices();
			loadVoices(loadedVoices);
			//console.log('final loaded voices '+loadedVoices);
		},2000);
	}
	loadVoices(loadedVoices);
  };
function loadVoices(loadedVoices) {
	try{
		 let accents = sessionStorage.chooseAccent || mockVar.chooseAccent; 
		   let accentSelects = document.querySelectorAll('.chooseAccent');
		   if (!accentSelects.length) return;
		   let voices = loadedVoices;
		   accentSelects.forEach(accentSelect => {
		     // Clear existing options
		     accentSelect.innerHTML = accentSelect.innerHTML.replaceAll(/<option[^>]*>*?<\/option>/gi, "");
		     if (accents.includes('All')) {
		       voices.forEach((voice, i) => {
		         accentSelect.options[i] = new Option(`${voice.name} (${voice.lang})`, voice.name);
		       });
		     } else {
		       let i = 0;
		       voices.forEach(voice => {
		         if (accents.includes(voice.lang)) {
		           accentSelect.options[i++] = new Option(`${voice.name} (${voice.lang})`, voice.name);
		         }
		       });
		     }
		   });
		  // if(sessionStorage.selectedVoice)
		  // $('#chooseAccent').val(sessionStorage.selectedVoice);
	}
	catch(e){}
}

function instantiateVOobj(){
	try{
		if(sessionStorage.enableVoiceOver==='YES' || mockVar.enableVoiceOver==='YES'){
		synth.cancel();
		loadVoices(loadedVoices);	   
	    cleanUp();
		voiceOverInstances=[];
		const voiceOverBtns = document.querySelectorAll('.voiceOverBtn');
	    voiceOverBtns.forEach(function (vo) {
	    const voiceOverInstance=new VoiceOver(vo);
		voiceOverInstance.playPauseBtn.innerHTML=`Listen <i class="fa fa-play"></i>`; // added for instructions html page for mock as there are two pages and html content is not getting added everytime like ques load
	    voiceOverInstances.push(voiceOverInstance);
	    });
	}
		}
	catch(e){};
}

function cleanUp(){
	 document.querySelectorAll('.voiceOverBtn').forEach(el=>{
	 el.replaceWith(el.cloneNode(true));
})}


class VoiceOver {
 constructor(vo) {
  // console.log("constructor");
   this.baseSelector = vo;
   this.voiceOverIcon = this.baseSelector.previousSibling;
   this.playPauseBtn = this.baseSelector.querySelector("#voiceOverBtn");
   this.voiceOverSlider = this.baseSelector.querySelector(".voiceOverSlider");
   this.voiceOverSettings = this.baseSelector.querySelector(".settings_vo");
   this.voiceOverSettingsDialog= this.baseSelector.querySelector(".voiceOver_Accent_Container");
   this.voiceChange = this.baseSelector.querySelector("#chooseAccent");
   this.paused = false;
   this.index=0;
   this.totalVOBtnsInPage  = $('.voiceOverBtn').length;
   this.setup();
   //this.cleanup();
 }
 setup() {
   if(this.playPauseBtn.getAttribute("quesid")){
   this.inputTxt =  announceSpecialChars
    ? voiceOverObjectforCompre[this.playPauseBtn.getAttribute("quesid")].split("").map(ch=>symbolMap[ch] || ch).join("")
    : voiceOverObjectforCompre[this.playPauseBtn.getAttribute("quesid")];
   this.pauseGap = 0;
   }
   else{
   this.inputTxt=  announceSpecialChars? inputTxt.split("").map(ch=>symbolMap[ch] || ch).join(""): inputTxt;
   this.pauseGap=500;
   }
   this.playPauseBtn.addEventListener("click", () => this.handleVoiceToggle());
   this.playPauseBtn.addEventListener("keydown", (e) => {
     if (e.key === "Enter") this.handleVoiceToggle();
   });
   this.voiceOverSettings.addEventListener("click", () => this.handleVoiceSettings());
   this.voiceOverSettings.addEventListener("keydown", (e) => {
	     if (e.key === "Enter") this.handleVoiceSettings();
	   });
   this.voiceOverSlider.addEventListener("click", (e) => this.handleVolumeChange(e));
   this.voiceOverSlider.addEventListener("keydown", (e) => {
     if (["ArrowRight", "ArrowLeft"].includes(e.key)) {
       this.handleVolumeChange(e);
     }
   });
   this.voiceChange.addEventListener("change", (e) => this.handleVoiceChange(e));
   
   
   
 }
 
 cleanup(){
	 /*
	 this.playPauseBtn.removeEventListener("click", () => this.handleVoiceToggle());
	 this.playPauseBtn.removeEventListener("keydown", (e) => {
	     if (e.key === "Enter") this.handleVoiceToggle();
	   });
	 this.voiceOverSettings.removeEventListener("click", () => this.handleVoiceSettings());
	   this.voiceOverSettings.removeEventListener("keydown", (e) => {
		     if (e.key === "Enter") this.handleVoiceSettings();
		   });
	   this.voiceOverSlider.removeEventListener("click", (e) => this.handleVolumeChange(e));
	   this.voiceOverSlider.removeEventListener("keydown", (e) => {
	     if (["ArrowRight", "ArrowLeft"].includes(e.key)) {
	       this.handleVolumeChange(e);
	     }
	   });
	   this.voiceChange.removeEventListener("change", (e) => this.handleVoiceChange(e));*/
	 
	 // the above process is not working as the handler ( ex: this.handleVoiceToggle() is different for the previous object )
	 // so im replacing the element with a new clone element without any event listeners 
	 
	 /// the above process of removing event listeners is not working because we were caliing the cleanup method from 
	 // within the class
	 // we need to call it using the reference of that class like below 
	 // then it will work , but instead of that we can simply clone the dom nodes to remove all attached event 
	 // listeners and, in effect, reset the node- including breaking references to any class instances 
	 // however the code is like below 
	 
	 /*  
	  
	  voiceOverInstances.forEach(voiceOverInstance=>voiceOverInstance.cleanup());
	  
	  */
	
	 
	 
	 
	 
 }
 
 handleVoiceChange(e){
	 try{
	 const voices =  synth.getVoices();
	 const voiceChange = this.voiceChange.value;
	 for(const voice of voices){
		 if(voice.name==voiceChange){
			 this.utterThis.voice = voice;
		     this.utterThis.lang = voice.lang;
		     break;
		 }
	 }
	 if(document.URL.indexOf("quiz.html")>=0)
	 auditlogCreation("chooseAccent","Candidate Changed to "+voiceChange,"voiceAccentChange");
	 }
	 catch(e){
		 
	 }
 }
 
 handleVoiceSettings(){
	 if(sessionStorage.selectedVoice)
		   $('#chooseAccent').val(sessionStorage.selectedVoice);
	 else if(mockVar.selectedVoice) 
		 $('#chooseAccent').val(mockVar.selectedVoice);
	 
	 const el =  this.voiceOverSettingsDialog;
	 if (el) {
	  const isHidden = window.getComputedStyle(el).display === 'none';
	  el.style.setProperty('display', isHidden ? 'flex' : 'none', 'important');
	 }
 }

 updatePlayPauseUI(isPlaying) {
   this.playPauseBtn.innerHTML = isPlaying
     ? `Stop Listening <i class="fa fa-pause"></i>`
     : `Listen <i class="fa fa-play"></i>`;
 }
 handleVolumeChange(e) {
	 try{
   const volume = e.target.value;
   this.volume = volume;
	 }
	 catch(e){}
 }
 handleVoiceToggle() {
   if (!this.inputTxt) return;
   if(this.totalVOBtnsInPage>1){
	   synth.cancel();
   if (this.paused) {
      this.paused = false;
	  this.updatePlayPauseUI(true);
	  this.commonFunction();
	  return;
   }   
	   
   if (this.speaking) {
     synth.pause();
     this.paused = true;
     this.updatePlayPauseUI(false);
     return;
   }
	   this.commonFunction();
   return;
   }
   if (this.paused) {
     synth.resume();
     this.paused = false;
     this.updatePlayPauseUI(true);
     return;
   }
   if (synth.speaking) {
     synth.pause();
     this.paused = true;
     this.updatePlayPauseUI(false);
     return;
   }
	   this.commonFunction();
 
 }
 
 commonFunction(){
	 try{
	  const rawText = this.inputTxt;
	  const parts = this.splitTextIntoParts(rawText);
	  this.speakPartsSequentially(parts);
	  this.updatePlayPauseUI(true); 
	  this.speaking=true;
	 }
	 catch(e){}
 }
 
 splitTextIntoParts(text) {
   // Smart split based on number or punctuation patterns (customize as needed)
   if(this.playPauseBtn.getAttribute("quesid")!=undefined && !this.inputTxt.includes('@@optionPause@@')){
					this.quesTxtParts = this.inputTxt.split(/(?<!\b[A-Z])(?<!\b(?:Dr|Mr|Mrs|Prof|Sr|Jr|Ph|e\.g|i\.e))\.(?=\s)|[।?!,]/); 
					//dot(.) or(|) comma(,) or(|) hindi-danda(।) // no digit before and after dot
					// negative look behind  AND negative look behind AND positive look ahead  OR  comma, hindi danda or exclamation
				}
				else
				{
			          this.quesTxtParts = this.inputTxt.split('@@optionPause@@');
				const tempquesTxtParts=this.quesTxtParts[0].split(/(?<!\b[A-Z])(?<!\b(?:Dr|Mr|Mrs|Prof|Sr|Jr|Ph|e\.g|i\.e))\.(?=\s)|[।?!,]/); 
				// dot(.) or(|) comma(,) or(|) hindi-danda(।) // no digit before and after dot
				// negative look behind AND negative look behind AND positive look ahead  OR  comma, hindi danda or exclamation
				if(tempquesTxtParts.length>1){  
					let x = tempquesTxtParts.length;
					for(let a=0;a<this.quesTxtParts.length-1;a++){
						tempquesTxtParts[a+x]=this.quesTxtParts[a+1];
					}
					this.quesTxtParts = tempquesTxtParts;
				}
					
				}
   
   return this.quesTxtParts;
 }
 
 
 
 speakPartsSequentially(parts) {
   this.utterThis = new SpeechSynthesisUtterance();
   this.utterThis.rate = 1; // 0.1 to 10
   this.utterThis.pitch = 1; // 0 to 2
   const speakNext = () => {
	   this.utterThis.volume = this.volume?this.volume:1;
	   this.handleVoiceChange();
     if (this.index >= parts.length) return;
     this.utterThis.text = parts[this.index];
     
     
     this.utterThis.onstart = () => {
    	 
     };
     
     this.utterThis.onend = () => {
    	 this.index++;
       if (this.index < parts.length) {
         setTimeout(speakNext, this.pauseGap);
       } else {
	     this.index=0;
         this.updatePlayPauseUI(false);
       }
     };
     synth.speak(this.utterThis);
   };
   speakNext();
 }
}