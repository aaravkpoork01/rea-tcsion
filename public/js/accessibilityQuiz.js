/* author sreejith 
 * dont remove code in the comments
 * useful for future reference
 * */
let lastFocusedElement = null;
const shortCuts = [
  ["Alt + T", "Listen to the remaining time (screen reader only)."],
  ["Alt + S", "Announce the summary of current group (screen reader only)."],
  ["Alt + N", "Save and move to next question."],
  ["Alt + P", "Save and move to previous question."],
  ["Alt + R", "Mark the current question for review."],
  ["Alt + C", "Clear the responses for the current question."],
  ["Ctrl + Alt + Enter", "Submit the current group."],
  ["Alt + /", "Open or close keyboard shortcuts menu."]
];
$(document).ready(function () {
	
	//addEventsToAnswerCtrls
	// not working for save so wrote seperately in addeventstosave
	const ctrlsIds = [
	          	    '#underreview',
	          	    '#clearResponse',
	          	    '#reset',
	          	    '#saveProgram',
	          	    '#previousBtnGroup',
	          	    '#previousBtn',
	          	    '#savenextGroup',
	          	    '#optionselectionButton',
	          	    '#savenext',
	          	    '#underreviewGrp',
	          	    '#clearResponseGrp',
	          	    '#reportissue'
	          	  ];
	          	const ctrlSelector = ctrlsIds.join(', '); 

	          	
	          		$(document).off('keydown.ctrls1').on('keydown.ctrls1', ctrlSelector, function (event) {
	          			if(event.key === 'Enter' || event.pointerId===1 || event.type==='click'){
	          				if($('#Questn_Area').is(':visible')){
	          				setFocusOnQuestionArea(100);
	          			     }
	          			}
	          		 });
	          		 


	          		 
	          		 $(document).off('click.ctrls2').on('click.ctrls2', ctrlSelector, function (event) {
	          			 	 if(event.key === 'Enter' || event.pointerId===1 || event.type==='click'){
	          			 		if($('#Questn_Area').is(':visible')){
	          			 		setFocusOnQuestionArea(100);		 
	          				     }
	          			 	 }
	          			  });
	          		 
	          		 
  		 
	
	/*const target = document.getElementById("sectionSummaryDiv");
	const observer = new MutationObserver(() => {
	 const isVisible = window.getComputedStyle(target).display !== "none";
	 if (isVisible) {
	   onVisible();
	 }
	});
	observer.observe(target, { attributes: true, attributeFilter: ["style"] });
	function onVisible() {
		$('#asmntSummaryHeader').focus();
		const liveRegion = document.getElementById("sr_announcement");
		 liveRegion.textContent = "";
		 setTimeout(()=>{
			 liveRegion.textContent="Summary page loaded. Contains tabular information.";
		 },50);
			 
	}*/
	
	
/*	const target1 = document.getElementById("sectionSummaryDiv");
	const target2 = document.getElementById("breakTimeDiv");
	const isVisible =(target)=> window.getComputedStyle(target).display !== "none";
	const callback=(mutations,observer)=>{
		mutations.forEach((mutation)=>{
			const target= mutation.target;
			if(isVisible(target)){
				onVisible(target.id);
			}
		})
		
	};
	
	const observer = new MutationObserver(callback);
	if(target1)observer.observe(target1, { attributes: true, attributeFilter: ["style"] });
	if(target2)observer.observe(target2, { attributes: true, attributeFilter: ["style"] });

commenting out the above code as the callback is getting called so many times due to so many changes to the style attr of the resp ele */
	
	
	
	/*function onVisiblee(target) {
		target.querySelector('[role="heading"]').setAttribute('tabindex','-1');
		target.querySelector('[role="heading"]').style.outline="none";
        target.querySelector('[role="heading"]').focus();
		const liveRegion = document.getElementById("sr_announcement");
		 liveRegion.textContent = "";
		 setTimeout(()=>{
			 liveRegion.textContent=target.querySelector('[role="heading"]').innerText+" loaded.";
		 },50);
			 
	}
	
	const target1 = document.getElementById("instruTimeDiv");
	const target2 = document.getElementById("quesInstruTimeDiv");
	const isVisible =(target)=> window.getComputedStyle(target).display !== "none";
	const callback=(mutations,observer)=>{
		mutations.forEach((mutation)=>{
			const target= mutation.target;
			if(isVisible(target)){
				onVisiblee(target);
			}
		})
		
	};
	
	const observer = new MutationObserver(callback);
	if(target1)observer.observe(target1, { attributes: true, attributeFilter: ["style"] });
	if(target2)observer.observe(target2, { attributes: true, attributeFilter: ["style"] });
	*/
	
	// event delegation ::: this is work even when the ele is not present at the time of this event exe.
	
	/*$(document).on('blur', '.skip-link, .skip-link-banner', function (e) {
		    e.stopPropagation();
			$('.skip-link').css("top",'-9999px');
	});*/
	
	// cand profile desktop on blur 
	document.addEventListener('click', (e) => {
		 if (!isThemes && (sessionStorage.userDefinedNum=="defaultUI" || sessionStorage.userDefinedNum=="0") && !document.getElementById('courseInfoPop_id').contains(e.target) && !document.getElementById('col2').contains(e.target)) {
		    document.getElementById('courseInfoPop_id').style.display = 'none'; 
		 }  
		});
	
	
	$(document).on('click', '#closeCandProfile', function (e) {
		  $('#User_Hldr').focus();
		  $('#User_Hldr').attr('aria-expanded','false');
	});
	
	$(document).on('click', '#sub_Conf_Sum_No', function (e) {
		
	});
	    
	$(document).on('click', '.skip-link', function (e) {
		e.preventDefault();
		e.stopPropagation();
			if(this.text.toLowerCase()==="skip to ans controls"){
				    $('#buttons-div-id').attr('tabindex','-1');
					$('#buttons-div-id').focus();
					$('#buttons-div-id').removeAttr('tabindex');
			 }
			else if(this.text.toLowerCase()==="skip to ques navigation"){
				
				$('#numberpanelQues').attr('tabindex','-1');
				$('#numberpanelQues').focus();
				$('#numberpanelQues').removeAttr('tabindex');
				setTimeout(() => {
					//announceShortCutContent("You are now in the Question Navigation section.")
					triggerNumberPanel("rightSectionDiv2");
					}, 50);
				setTimeout(() => {$('.qarea_resp .numberpanelQues span')
				    .eq(iOAP.curQues)
				    .attr("tabindex", "0")
				    .attr("aria-selected", true);}, 1600); // slightly more than your internal 500ms
			}
			$('.skip-link').css("top",'-9999px');
		
	});
	
	$(document).on('click', '.skip-link-banner', function (e) {
		e.preventDefault();
		e.stopPropagation();
		$('#currentQues').attr('tabindex','-1');
		$('#currentQues').focus();
		$('#currentQues').removeAttr('tabindex');
		 triggerNumberPanel("currentQues");
		//focusMainQues("");
	});
	

	
	



	var skiplinkindex=0;
	var skipLinks = [
			                 { href: '#numberpanelQues', arialabel: 'Skip to question navigation content',text: 'Skip To Ques Navigation' },
			                 /*{ href: '#buttons-div-id', arialabel: 'Skip to answer submission controls',text: 'Skip To Ans Controls' },*/
			                 { href: '#quesOuterDiv', arialabel: 'Read question text',text: 'Read Question Text' }
			               ];
		$(document).on('keydown', '.skip-link', function (e) {
			/* if (e.key === "ArrowDown") {
				 e.preventDefault();
				 skiplinkindex = (skiplinkindex + 1) % skipLinks.length;
				 
				 } 
			 else if (e.key === "ArrowUp") {
				 e.preventDefault();
				 skiplinkindex = (skiplinkindex - 1 + skipLinks.length) % skipLinks.length;
				 }*/
			  if(e.key === "Enter"){
				 e.preventDefault();
				 if(this.text==='Skip to ans controls'){
					    $('#buttons-div-id').attr('tabindex','-1');
						$('#buttons-div-id').focus();
						$('#buttons-div-id').removeAttr('tabindex');
				 }
				else if(this.text==='Skip to ques navigation'){
					$('#numberpanelQues').attr('tabindex','-1');
					$('#numberpanelQues').focus();
					$('#numberpanelQues').removeAttr('tabindex');
				}
				$('.skip-link').css("top",'-9999px');
			 }
		});
		document.addEventListener('keydown', (e) => {

			  const container = document.querySelector('.Ans_Area');
			  if (!container) return;

			  const radios = container.querySelectorAll('.radioBtnClass');
			  const active = document.activeElement;

			  // Only inside Ans_Area
			  if (!container.contains(active)) return;

			  //  Only for radio buttons
			  if (!active.classList.contains('radioBtnClass')) return;

			  let current = Array.from(radios).indexOf(active);

			  //  DOWN → next radio
			  if (e.key === 'ArrowDown') {
			    e.preventDefault();

			    const next = radios[current + 1];
			    if (next) {
			      next.focus();
			      
			    }
			  }
			  // UP → previous radio
			  if (e.key === 'ArrowUp') {
			    e.preventDefault();

			    const prev = radios[current - 1];
			    if (prev) {
			      prev.focus();
			     
			    }
			  }

			});
			


	
	
});

function updateAriaLevels(){
if($('#questiontype-details_id').length && $('#questiontype-details_id').is(':visible')){
	$('#questiontype-details_id').attr("aria-level",'2');
	if($('.divHeader').length && $('.divHeader').is(':visible')){
		$('.divHeader').attr("aria-level",'3');
	}
	if($('.compQName').length && $('.compQName').is(':visible')){
		$('.compQName').attr({role: 'heading','aria-level': '3','tabindex':'0'});
	}
	if($('.questionNumber').length && $('.questionNumber').is(':visible')){
		$('#divHeader_id').attr({'tabindex':'0'});
	}
}
else {
	if($('.divHeader').length && $('.divHeader').is(':visible')){
		$('.divHeader').attr("aria-level",'2');
	}
	if($('.compQName').length && $('.compQName').is(':visible')){
		$('.compQName').attr({role: 'heading','aria-level': '2','tabindex':'0'});
	}
	if($('.questionNumber').length && $('.questionNumber').is(':visible')){
		$('#divHeader_id').attr({'tabindex':'0'});
	}
}
}

function  addEventsToSavebtn(event){ // special case of the above (in document ready)
				if($('#Questn_Area').is(':visible'))
				setFocusOnQuestionArea(100); 
}   

document.querySelectorAll("scratch-pad-container .tools ul button").forEach(btn => {
	 btn.addEventListener("click", () => {
	   document.querySelectorAll("scratch-pad-container .tools ul button").forEach(b => b.setAttribute("aria-pressed", "false"));
	   btn.setAttribute("aria-pressed", "true");
	 });
	});

function takeFocusBackToExam(){
	/*try{
	setTimeout(()=>{
		setFocusForNumPan(iOAP.curQues);
		if($('#currentQues').is(':visible')){
			$('#currentQues').attr('tabindex','-1');
			$('#currentQues').focus();
			$('#currentQues').removeAttr('tabindex');
		}	 
		},50);
}
	catch(e){
		
	}*/
}

function addAccessibilityonQuesLoad(){
	try{
	if(!fromMoveToExam){
	announceQuesLoad(iOAP.curQues);
	}
	fromMoveToExam=false;
	//addEventsToAnswerCtrls();
	//showSkipLinkk();
	removeDuplicateQuesRead();//added on recommendation from Candidate.
	setTabsForNocnDocs();
	if(sessionStorage.orgId==32669){   //nocn previous btn show for examiner grp
		if(isExaminer)
		$('#previousBtn').attr('style','display:inline-block !important');
	}
	}
	catch(e){}
}
function removeDuplicateQuesRead(){
	try{
		if(mockVar.curQuesBean.quesType!="SA")
			   $('.removeAria').removeAttr('aria-describedby');
	}catch(e){}
}


function setFocusOnQuestionArea(delay){
	$('#questionContent').attr('aria-hidden', 'false');
    $('#footer').attr('aria-hidden', 'false');
    $('.skipLink_div').attr('aria-hidden', 'false');
    $('.helpinstruction_div').attr('aria-hidden', 'false');
    $('.time-details_new').attr('aria-hidden', 'false');
    $('.subheader_tab').attr('aria-hidden', 'false');
    $('.grup_components').attr('aria-hidden', 'false');
	 $('#Questn_Area').attr('tabindex','-1');
	 $('#Questn_Area #currentQues').attr('aria-hidden','true');
	 $('.audioRecordingButtonsPanel').attr('role','group');
	 $('.videoRecordingButtonsPanel').attr('role','group');
	 $('.audioRecordingButtonsPanel').attr('aria-label','Recording Controls');
	 $('.videoRecordingButtonsPanel').attr('aria-label','Recording Controls');
	/*if(mockVar.currentGrp==prevGroupSR){
		if(iOAP.curSection==preSecSR){*/
			setTimeout(function(){
				 $('#Questn_Area').focus();
				// $('#Questn_Area').removeAttr('tabindex');
			},delay)
			
			 setTimeout(function(){
				 $('#Questn_Area #currentQues').attr('aria-hidden','false');
			 },delay+200)
		/*}else{
			//section level focus
			$('#s'+iOAP.curSection).attr('tabindex','-1');
			$('#s'+iOAP.curSection).removeAttr('tabindex');//added for wcag test
			setTimeout(function(){
				$('#s'+iOAP.curSection).focus();
				//$('#s'+iOAP.curSection).attr('aria-hidden','false');
				},delay);
			
		}
	}else{
		//group header level focus
		$('#g'+mockVar.currentGrp).attr('tabindex','-1');
		$('#g'+mockVar.currentGrp).removeAttr('tabindex');//added for wcag test
		setTimeout(function(){$('#g'+mockVar.currentGrp).focus();
		//$('#g'+mockVar.currentGrp).attr('aria-hidden','false');
		},delay);
	}*/
}

function addEventsToAnswerCtrls(){

}

function setTabsForNocnDocs(){
try{
    if($('.nocnHeadingBtns').length>0){
	$('.nocnHeadingBtns').attr('role','tablist');
	$('.nocnHeadingBtns').attr('aria-label','document');
	if($('.nocnDocumentContent').length>0){
		$('.nocnDocumentContent').attr('role','tabpanel');
		$('.nocnDocumentContent').attr('aria-label','document content');
	}
	const $tabs = $('.nocnHeadings');
	 $tabs.attr({
       'role': 'tab',
       'tabindex': '-1',
       'aria-controls': 'currentQues',
       'aria-selected': 'false',
       'onkeypress': 'clickThisElement(this,event)'
   });
	if($tabs.hasClass("nonactive")){
		$(".nocnHeadings.nonactive").attr("aria-selected",true);
		$(".nocnHeadings.nonactive").attr("tabindex","0");
	}
	$(document).on('click', '.nocnHeadingBtns  [role="tab"]', function () {
		 const index = $('[role="tab"]').index(this);
		 activateTab(index); console.log('hi')
		});
		$(document).on('keydown', '.nocnHeadingBtns  [role="tab"]', function (e) {
		 const $tabs = $('.nocnHeadingBtns  [role="tab"]');
		 const index = $tabs.index(this);
		 let newIndex = index;
		 if (e.key === "ArrowRight") {
		   newIndex = (index + 1) % $tabs.length;
		   $tabs.eq(newIndex).focus();
		 } else if (e.key === "ArrowLeft") {
		   newIndex = (index - 1 + $tabs.length) % $tabs.length;
		   $tabs.eq(newIndex).focus();
		 } else if (e.key === "Home") {
		   $tabs.eq(0).focus();
		 } else if (e.key === "End") {
		   $tabs.eq($tabs.length - 1).focus();
		 } else if (e.key === "Enter" || e.key === " ") {
		   activateTab(index);
		 } 
		});
		function activateTab(activeIndex) {
		 const $tabs = $('.nocnHeadingBtns  [role="tab"]');
		 $tabs.each(function (i) {
		   const isSelected = i === activeIndex;
		   $(this)
		     .attr('aria-selected', isSelected)
		     .attr('tabindex', isSelected ? '0' : '-1');
		 });
		 $tabs.eq(activeIndex).focus();
		}
}
	}
catch(e){}
}


function showSkipLinkk(){
	/*$("<a>")
	.attr({
		href: "#buttons-div-id",
	    class: "skip-link",
	    tabindex:0,
	    "aria-label":"Skip to answer submission controls", 
	    "aria-hidden":"true"
	})
	.text("Skip to ans controls")
	.prependTo("#currentQues");*/
	
	$("<a>")
	.attr({
		href: "#numberpanelQues",
	    class: "skip-link",
	    tabindex:0,
	    "aria-label":"Skip to question navigation", 
	    "aria-hidden":"true"
	})
	.text("Skip to ques navigation")
	.prependTo(".skipLink_div")
	//.prependTo("#currentQues");	
	
}


/* not in usage */
/*function showSkipLink(ele){
	$("#"+ele.id).removeClass('tipIcon');
	skiplinkindex=0;
	if($(ele).children().length===0){
	const id= ele.id;
		skipLink=$("<a>")
		.attr({
			href: "#currentQues",
		    class: "skip-link",
		    tabindex:0,
		    "aria-label":"Skip to main question content"
		})
		.text("Skip to ques content")
		.appendTo("#numberpanelQues ."+id);	
}
	skipLink.css("top", "10px");
}	*/
/* not in usage */
function openShortCutsPopup() {
	   console.log("openShortCutsPopup called");
       lastFocusedElement = document.activeElement;
	   const modal = document.getElementById("shortCutPopup");
	   const tbody = document.getElementById("shortcutTableBody");
	   tbody.innerHTML = "";
	   shortCuts.forEach((item, index) => {
	       const tr = document.createElement("tr");
	tr.id = `shortcutRow_${index}`;
	       const actionTd = document.createElement("td");
	actionTd.id = `shortcutAction_${index}`;
	       // ADDED: Get label from English.xml when shortcut popup is opened
	       const xmlLabel = $(globalXmlvar)
	           .find("shortcutAction_" + index)
	           .text();
	       actionTd.textContent = xmlLabel || item[1];
	       const keyTd = document.createElement("td");
	keyTd.id = `shortcutKey_${index}`;
	       keyTd.textContent = item[0];
	       tr.appendChild(actionTd);
	       tr.appendChild(keyTd);
	       tbody.appendChild(tr);
	   });
	   modal.classList.remove("hidden");
	   cnfPop("shortCutPopup");
	   setTimeout(() => {
	       document.getElementById("shortCutPopup").focus();
	   }, 150);
	   document.addEventListener("click", function (e) {
	       if (e.target && e.target.classList.contains("closeShortcutBtn")) {
	           closeShortCutsPopup();
	       }
	   });
	}
function closeShortCutsPopup() {
	  const modal = document.getElementById("shortCutPopup");

	  if (!modal.classList.contains("hidden")) {
		$("#okButton").click();
	    modal.classList.add("hidden");

	    announceShortCutContent("Keyboard shortcuts dialog closed.");

	    
	    if (lastFocusedElement) {
	      lastFocusedElement.focus();
	    }
	  }
	}
/*function openShortCutsPopup(){
	$(".cnfSCPopBdy").html(generateShortcutList(shortCuts));
	const listItems = document.querySelectorAll('.cnfSCPopBdy ol li');
	const total = listItems.length;

	listItems.forEach((li, index) => {
	  li.setAttribute('aria-posinset', index + 1);
	  li.setAttribute('aria-setsize', total);
	});
	cnfPop('shortCutPopup');
	var message = "Keyboard shortcuts available. Use arrow keys to navigate the table.";
	announceShortCutContent(message);
}
function generateShortcutList(data) {
	  const ol = document.createElement("ol");

	  data.forEach(item => {
	    const li = document.createElement("li");
	    li.textContent = ""; 
	    const visibleSpan = document.createElement("span");
	    visibleSpan.setAttribute("aria-hidden", "true");
	    visibleSpan.textContent = `${item[0]} : ${capitalize(item[1])}`;

	    const srSpan = document.createElement("span");
	    srSpan.className = "visuallyNotRequired";
	    srSpan.textContent = `Press ${item[0]} to ${item[1]}`;

	    li.appendChild(visibleSpan);
	    li.appendChild(srSpan);

	    ol.appendChild(li);
	  });

	  return ol;
	}*/

	function capitalize(text) {
	  return text.charAt(0).toUpperCase() + text.slice(1);
	}

	// Optional helper for better UI text formatting
	function capitalize(text) {
	  return text.charAt(0).toUpperCase() + text.slice(1);
	}

function onVisible(event,action,ele) {
	const liveRegion = document.getElementById("sr_announcement");
	if(liveRegion)
	 liveRegion.textContent = "";
	 setTimeout(()=>{
		 if($('#sectionSummaryDiv').is(":visible")){ 
			 setAria('','Summary',ele);
			// liveRegion.textContent="Summary page loaded. Contains tabular information.";
		 }
		 
		 else
		 if($('#breakTimeDiv').is(":visible")){
			 setAria('','SummaryBreak',ele);
			// liveRegion.textContent="Break time page loaded. Contains tabular information.";
		 } 
		 
		 else
			 if(id==="sectionSummaryDivWithoutTable"){
				 setAria('section_Summary_id','Confirmation');
				// liveRegion.textContent="Confirmation page loaded.";
			 }
		 
	 },50);		 
}

function setAria(desc,label,ele){
	const dialog = $('#candidateConsoleId');
	dialog.attr({
      'role': 'dialog',
      'aria-modal': 'true',
      'aria-label': label,
      'tabindex':'-1'
  });
	//$('#sub_Conf_Sum_Yes').focus();
	adjustFocusSummary(label,ele);
	//fullDialogInstrutions('sectionSummaryDiv');
}

function adjustFocusSummary(action,ele){
	
	const actionConfig = {
	"Summary":{dialogId: "candidateConsoleId", ariaHidden: "#group_summary, #confirmation_buttons, .profile-grouping-section"},
	"SummaryBreak":{dialogId: "candidateConsoleId", ariaHidden: "#break_summary, #breakTimeCountDiv, .profile-grouping-section"}
	}
	const config = actionConfig[action];
	if (!config) return;
	
	const btnId = ele?ele.id:'';
	const dialogId = config.dialogId;
	//const closeBtnId = config.closeBtnId;
	const ariaHidden = config.ariaHidden;
	
	if (ariaHidden) $(ariaHidden).attr('aria-hidden', 'true');

	trapFocusUtilityForSummary(dialogId,btnId);
	setTimeout(function(){
	    $(ariaHidden).attr('aria-hidden', 'false');
	},1000);
}




function trapFocusUtilityForSummary(dialogId, btnId){ 
	 const $dialog =   $('#'+dialogId);  
	 let $button;
	 if(!btnId==''){
		  $button = $('#'+btnId);
	 }
	 $dialog.attr('tabindex','-1');
	 $dialog.css('outline','none');
	 $dialog.focus();

 if(!btnId)return;
 
 $(document).off('click.trapSum1').on('click.trapSum1', '#sub_Conf_Sum_No', function (event) {
	 if(event.key === 'Enter' || event.pointerId===1 || event.type==='click'){ // pointerId ===1 -> in case -> SR - SR->  keyb click as pointer click
		 $button.focus();
	     }
 });
 


 
 $(document).off('click.trapSum2').on('click.trapSum2', '#sub_Conf_Sum_Yes', function (event) {
	 	 if(event.key === 'Enter' || event.pointerId===1 || event.type==='click'){
	 		
	 			checkWhichScreen();
	 		 
		     }
	  });

}


function checkWhichScreen(){
	if($('#breakTimeDiv').is(':visible')){
		setAria('','SummaryBreak',undefined);
	}
}



// read question text on focus on options

$(document).on('focus', '.Ans_Area .optionLabel .answer', function () {
	const liveRegion = document.getElementById("sr_announcement");
	if(liveRegion){
	liveRegion.textContent = "";
	setTimeout(()=>{
		//liveRegion.textContent=qpDetailsMockVar[mockVar.curQuesBean.quesId].quesLangBean[mockVar.langIndex].quesText;
	 },50);	
	}
});


/* not in usage
function quesnumberPanelAccessibility(){
	//add focus to question number present in number panel
	$(".numpan").attr("tabindex",0);
	$(".numpan").attr("role","button");
	$(".numpan").attr("onkeypress","clickThisElement(this,event)"); // for space and enter keypress
	
	const buttons = document.querySelectorAll("#numberpanelQues span");
	const sr = document.getElementById("sr-announcement");
	const total = buttons.length;
	buttons.forEach((btn, i) => {
	 // update aria label dynamically
	btn.setAttribute("aria-label", `Question ${i + 1} of ${total}`);
	btn.setAttribute("aria-description", btn.getAttribute('objid'));

	});
}

*/

// question loaded

function announceQuesLoad(quesno){
	setTimeout(function(){
		try{
			if($('#Questn_Area').is(':visible')){
			 const liveRegion = document.getElementById("sr_announcement");
			 const quesNo = quesno+1;
			 if(liveRegion){
			 liveRegion.textContent = "";
				 if(iOAP.secDetails[iOAP.curSection].displayNumberPanel == "true"){
					 liveRegion.textContent="Question "+quesNo+" of "+(iOAP.secDetails[iOAP.curSection].questions.length)+" in the "+iOAP.secDetails[iOAP.curSection].secName+" section has loaded.";
				 }else{
				 liveRegion.textContent="Question "+quesNo+" in the "+iOAP.secDetails[iOAP.curSection].secName+" section loaded.";
				 
				 }
			 if($(".marking-details").is(":visible")){
				 liveRegion.textContent+=" Please Note: Allotted marks for this Question is:"+mockVar.curQuesBean.allottedMarks+" and "+mockVar.curQuesBean.negMarks+" Negative marks.";
			 }
			 }
			 //liveRegion.textContent+=" "+formQuestionTextForVoiceOver(qpDetailsMockVar[mockVar.curQuesBean.quesId].quesLangBean[mockVar.langIndex].quesText)
			// $('#currentQues').attr('tabindex','-1');
			// $('#currentQues').focus();
			// $('#currentQues').removeAttr('tabindex');
			 
				 // focusMainQues("");
				

			}
		}
		catch (e) {
		    console.error(e)
		  }
		},200)
}



function questionTabPanelAccessibility(){
	 
	 if($('.question_area .numberpanelQues span').length>0){
		    $('.question_area .numberpanelQues span').attr("tabindex","-1");
			$('.question_area .numberpanelQues span').attr('role','tab');
			$('.question_area .numberpanelQues span').attr("aria-controls","currentQues");
			$('.question_area .numberpanelQues span').attr("aria-selected",false);
			$('.question_area .numberpanelQues span').attr("aria-selected",false);
			$('.question_area .numberpanelQues span').attr("onkeypress","clickThisElement(this,event)");
			
			if(!$('.question_area .numberpanelQues span').hasClass("selectedquestion")){
				$('.question_area .numberpanelQues span')
			    .eq(iOAP.curQues)
			    .attr("tabindex", "0")
			    .attr("aria-selected", true);
			}
			
			const total = $('.question_area .numberpanelQues span').length;

			
			$('.question_area .numberpanelQues span').each(function(index){
				let oldOnclick = $(this).attr('onclick') || '';

				const newHandler = 'updatenumberpaneltabBtn(this)';

				if (!oldOnclick.includes(newHandler)) {
				  $(this).attr(
				    'onclick',
				    oldOnclick ? `${oldOnclick}; ${newHandler}` : newHandler
				  );
				}
		    	 const status = $(this).attr('objid');
		    	 const isMandatoryQues = $(this).hasClass('QuesMandatory')?'Mandatory':'';
		    	 $(this).attr("aria-label", `Question ${index + 1}, ${status}, ${isMandatoryQues}`);
		    	});
	 }
	 // for lower screen resolutions 
	 
	 else if($('.qarea_resp .numberpanelQues span').length>0){
		    $('.qarea_resp .numberpanelQues span').attr("tabindex","-1");
			$('.qarea_resp .numberpanelQues span').attr('role','tab');
			$('.qarea_resp .numberpanelQues span').attr("aria-controls","currentQues");
			$('.qarea_resp .numberpanelQues span').attr("aria-selected",false);
			$('.qarea_resp .numberpanelQues span').attr("aria-selected",false);
			$('.qarea_resp .numberpanelQues span').attr("onkeypress","clickThisElement(this,event)");
			
			if(!$('.qarea_resp .numberpanelQues span').hasClass("selectedquestion")){
				$('.question_area .numberpanelQues span')
			    .eq(iOAP.curQues)
			    .attr("tabindex", "0")
			    .attr("aria-selected", true);
			}
			
			const total = $('.qarea_resp .numberpanelQues span').length;
			
			$('.qarea_resp .numberpanelQues span').each(function(){
				let oldOnclick = $(this).attr('onclick') || '';

				const newHandler = 'updatenumberpaneltabBtn(this)';

				if (!oldOnclick.includes(newHandler)) {
				  $(this).attr(
				    'onclick',
				    oldOnclick ? `${oldOnclick}; ${newHandler}` : newHandler
				  );
				}
		    	 const status = $(this).attr('objid');
		    	 $(this).attr("aria-label", `Question ${index + 1} of ${total}, ${status}`); 
		    	});
	 }   
}


function updatenumberpaneltabBtn(ele){
	 const id= $(ele).attr('id');
	 $('#'+id).addClass('selectedquestion');
	 $(ele).attr("aria-selected",true);
	 $(ele).attr("tabindex","0");	
	 setTimeout(function(){
		 announceQuesLoad(iOAP.curQues);
		 triggerNumberPanel("currentQues");
		},1000);
}


//for lower screen resolutions

		$(document).on('keydown', '.qarea_resp .numberpanelQues  [role="tab"]', function (e) {
			 const $tabs = $('.qarea_resp .numberpanelQues  [role="tab"]');
			 const index = $tabs.index(this);
			 let newIndex = index;
			 if (e.key === "ArrowRight") {
			   newIndex = (index + 1) % $tabs.length;
			   $tabs.eq(newIndex).focus();
			 } else if (e.key === "ArrowLeft") {
			   newIndex = (index - 1 + $tabs.length) % $tabs.length;
			   $tabs.eq(newIndex).focus();
			 } else if (e.key === "Home") {
			   $tabs.eq(0).focus();
			 } else if (e.key === "End") {
			   $tabs.eq($tabs.length - 1).focus();
			 }  
			});
		
		
		$(document).on('keydown', '.question_area .numberpanelQues  [role="tab"]', function (e) {
			 const $tabs = $('.question_area .numberpanelQues  [role="tab"]');
			 const index = $tabs.index(this);
			 let newIndex = index;
			 if (e.key === "ArrowRight") {
			   newIndex = (index + 1) % $tabs.length;
			   $tabs.eq(newIndex).focus();
			 } else if (e.key === "ArrowLeft") {
			   newIndex = (index - 1 + $tabs.length) % $tabs.length;
			   $tabs.eq(newIndex).focus();
			 } else if (e.key === "Home") {
			   $tabs.eq(0).focus();
			 } else if (e.key === "End") {
			   $tabs.eq($tabs.length - 1).focus();
			 } else if (e.key === "Enter" || e.key === " ") {
				 setTimeout(function(){
						activateNumPanTab(index);
					},500);
			 } 
			});

		
		function activateNumPanTab(activeIndex) {
			 const $tabs = $('#numberpanelQues [role="tab"]');
			 $tabs.each(function (i) {
			   const isSelected = i === activeIndex;
			   $(this)
			     .attr('aria-selected', isSelected)
			     .attr('tabindex', isSelected ? '0' : '-1');
			 });
			 $tabs.eq(activeIndex).focus();	
			 setTimeout(function(){
				 announceQuesLoad(iOAP.curQues);
				 triggerNumberPanel("currentQues");
				},1000);
			}

function sectionTabPanelAccessibility(){
	//add focus for section and tooltip
	$(".subject-name").attr("tabindex","-1");
	$(".subject-name").attr("role","tab");
	$(".subject-name").attr("aria-controls","currentQues");
	$(".subject-name").attr("onkeypress","clickThisElement(this,event);");
	$(".subject-name").attr("aria-selected",false);
	if($(".subject-name").hasClass("selectedsubject")){
		$(".subject-name.selectedsubject").attr("aria-selected",true);
		$(".subject-name.selectedsubject").attr("tabindex","0");
	}
	

	
	
	$(document).off('click.secTab1').on('click.secTab1', '#sections [role="tab"]', function () {
		

		const $currentTab = $('#sections [role="tab"]').filter(function () {
		  return $(this).attr('tabindex') === '0';
		});
		 const index = $('#sections [role="tab"]').index($currentTab);
		setTimeout(function(){
			activateTab(index);
		},500);
		 
		});
		$(document).off('keydown.secTab2').on('keydown.secTab2', '#sections [role="tab"]', function (e) {
		 const $tabs = $('#sections [role="tab"]');
		 const index = $tabs.index(this);
		 let newIndex = index;
		 if (e.key === "ArrowRight") {
		   newIndex = (index + 1) % $tabs.length;
		   $tabs.eq(newIndex).focus();
		 } else if (e.key === "ArrowLeft") {
		   newIndex = (index - 1 + $tabs.length) % $tabs.length;
		   $tabs.eq(newIndex).focus();
		 } else if (e.key === "Home") {
		   $tabs.eq(0).focus();
		 } else if (e.key === "End") {
		   $tabs.eq($tabs.length - 1).focus();
		 } else if (e.key === "Enter" || e.key === " ") {
			 setTimeout(function(){
					activateTab(index);
				},500);
		 } else if (e.key === "Tab" || (e.key==="Tab" && e.shiftKey)) {
			let thisthis= $(this).find('.subject_instruction_icon_section');
			 thisthis.attr('tabindex','-1')
			 const $sec_instru_icon =  $('.subject_instruction_icon_section');
			 $sec_instru_icon.each(function (i) {
				 if($sec_instru_icon.eq(i).is(thisthis)){
					 $sec_instru_icon.eq(i).attr('tabindex','0');
					 return false;
				 }
			 });
		 }
		});
}

function activateTab(activeIndex) {
	 const $tabs = $('#sections [role="tab"]');
	 $tabs.each(function (i) {
	   const isSelected = i === activeIndex;
	   $(this)
	     .attr('aria-selected', isSelected)
	     .attr('tabindex', isSelected ? '0' : '-1');
	 });
	 $tabs.eq(activeIndex).focus();

	 
	}

function groupTabPanelAccessibility(){
	//add focus for group and tooltip
	$(".allSections").attr("tabindex","-1");
	$(".allSections").attr("role","tab");
	$(".allSections").attr("aria-controls","currentQues");
	$(".allSections").attr("aria-selected",false);
	$(".allSections").attr("aria-selected",false);
	if($(".allSections").hasClass("currentSectionSelected")){
		$(".allSections.currentSectionSelected").attr("aria-selected",true);
		$(".allSections.currentSectionSelected").attr("tabindex","0");
	}
	
	document.querySelectorAll('.subject_instruction_icon1').forEach(function(element) {
	    element.addEventListener('blur', function() {
	        this.parentElement.setAttribute('aria-hidden', 'true');
	    });
	});
	
	$(document).on('keydown', '#groups [role="tab"]', function (e) {
		
		$(".allSections").attr("tabindex","-1");
		$(".allSections").attr("role","tab");
		
		
		 const $tabs = $('#groups [role="tab"]');
		 const index = $tabs.index(this);
		 let newIndex = index;
		 if (e.key === "ArrowRight") {
		   newIndex = (index + 1) % $tabs.length;
		   $tabs.eq(newIndex).focus();
		 } else if (e.key === "ArrowLeft") {
		   newIndex = (index - 1 + $tabs.length) % $tabs.length;
		   $tabs.eq(newIndex).focus();
		 } else if (e.key === "Home") {
		   $tabs.eq(0).focus();
		 } else if (e.key === "End") {
		   $tabs.eq($tabs.length - 1).focus();
		 }  else if (e.key === "Tab" || (e.key==="Tab" && e.shiftKey)) {
			 $(".allSections").removeAttr("tabindex");
			 $(".allSections").removeAttr("role");
			let thisthis= $(this).find('.subject_instruction_icon_group');
			 thisthis.attr('tabindex','-1');
			 const $grp_instru_icon =  $('.subject_instruction_icon_group');
			 $grp_instru_icon.each(function (i) {
				 if($grp_instru_icon.eq(i).is(thisthis)){
					 $grp_instru_icon.eq(i).parent().attr('aria-hidden','false');
					 $grp_instru_icon.eq(i).attr('tabindex','0');
					 return false;
				 }
			 });
		 }
		});
}


	
	 function trapFocus() {
		 const $button = $('#User_Hldr');
		 $button.attr('aria-expanded','true');
		 const $dialog = $('.courseInfoPop');
		 const $firstFocusableElement = $dialog.find('input, button, [tabindex="0"]').first();
		 $firstFocusableElement.focus();
	     const $focusableElements = $dialog.find(
	     'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
	   ).filter(':visible');
		 
		 
	   const $firstElement = $focusableElements.first();
	   const $lastElement = $focusableElements.last();
	   
	   $(document).on('keydown', '.courseInfoPop', function (event) {
		   // no need to trap focus in desktop as aria modal false
	     if (event.key === 'Tab') {
	       if (event.shiftKey && document.activeElement === $firstElement[0]) {
	         event.preventDefault();
	         $('.courseInfoPop').hide();
			 $('#User_Hldr').focus();
	       } else if (!event.shiftKey && document.activeElement === $lastElement[0]) {
	         event.preventDefault();
	         $('.courseInfoPop').hide();
			 $('#User_Hldr').focus();
	       }
	     }
	     
	     if (event.key === 'Escape') {
	       $dialog.hide();
	       $button.focus(); // Return focus to the button
	       $button.attr('aria-expanded','false');
	     }
	     
	     else if(event.key === 'Enter' && (document.activeElement && document.activeElement.id==='closeCandProfile')){
		    	$button.focus(); // Return focus to the button
		    	$button.attr('aria-expanded','false');
		     }
	   });
	   
	   
	 }
	 
	 
	 function  trapFocusImgDialog(btn){
		 const $button = btn;
		 $button.attr('aria-expanded','true');
		 const $dialog = $('#maximg_popup_id'); 
                const $focusableElements = $dialog.find(
               'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
               ).filter(':visible');
               const $firstElement = $focusableElements.first();
               const $lastElement = $focusableElements.last();
               $dialog.attr('tabindex','-1');
               $dialog.css('outline','none');
               setTimeout(()=>{
            	   $dialog.focus();
               })
               
		 $(document).off('keydown.trapFocusImgDialog1').on('keydown.trapFocusImgDialog1', '#maximg_popup_id', function (event)  {
			 if (event.key === 'Tab') {
	       if (event.shiftKey && document.activeElement === $firstElement[0]) {
	         event.preventDefault();
	         $lastElement.focus();
	       } else if (!event.shiftKey && document.activeElement === $lastElement[0]) {
	         event.preventDefault();
	         $firstElement.focus();
	       }
			 }
			 if (event.key === 'Escape') {
			       $dialog.hide();
			       $button.focus();
			       $button.attr('aria-expanded','false');
			     }
			
		 })

$(document).off('keydown.trapFocusImgDialog2 click.trap2').on('keydown.trapFocusImgDialog2 click.trap2', "#close_ico_img_id", function (event) {
        	 if(event.key === 'Enter' || event.pointerId===1 || event.type==='click'){
    	    	$($button).attr('aria-expanded','false');
    	    	setTimeout(function(){
    	    		$button.focus(); 
    	    	},500);
    	     }
         });
		 
	 }
	 
	 function fullDialogInstrutions(action){ 
		 const actionConfig = {
			"instruTimeDiv":{dialogId: "instruTimeDiv", ariaHidden: "#instruContentDiv, #instruPrcdBtnDiv, .preGroupInstR"},
			"quesInstruTimeDiv":{dialogId: "quesInstruTimeDiv", ariaHidden: "#quesInstruContentDiv, #quesInstruPrcdBtnDiv, .preGroupInstR"},
			"qrCodeDiv":{dialogId: "qrCodeDiv", ariaHidden: "#qrCode, #scanCopyUrlValue, #qrCodeMessage, #fileuploadNote"},
		 };
		 
		 $('#skip-link-banner').hide();
		 $('#skip-link').hide();
		 const config = actionConfig[action];
			if (!config) return;
		 const ariaHidden = config.ariaHidden;	
		 const dialogId = config.dialogId;
		if (ariaHidden) $(ariaHidden).attr('aria-hidden', 'true');
		         $(`#${dialogId}`).css('outline','none');
				 $(`#${dialogId}`).focus(); 
				setTimeout(() => {
					 $(ariaHidden).attr('aria-hidden', 'false'); 
					}, 2000);
		
				adjustFocusOnProceedClick(action);
				
	 }
	 
	 function adjustFocusOnProceedClick(action){
		 
		 if(action==='instruTimeDiv'){
			 $(document).off('click.instruProc1').on('click.instruProc1', '#proceedToGrp', function (event) {
			 	 if(event.key === 'Enter' || event.pointerId===1 || event.type==='click'){ // pointerId ===1 -> in case -> SR - SR->  keyb click as pointer click
			 		
			 		if(mockVar.currentGrp==0 && iOAP.curSection==0 && iOAP.curQues==0) {
			 			if(!$('#quesInstruDialogContainer').is(':visible') && !$('#grpInstruDialogContainer').is(':visible'))
			 			onLoadEssentialsQuiz(0);
			 		}
			 		else {
			 			if(!$('#quesInstruDialogContainer').is(':visible') && !$('#grpInstruDialogContainer').is(':visible'))
			 				setFocusOnQuestionArea(0);
			 		}
					
				     }
			  });
			 }
		 
		 
		 if(action==='quesInstruTimeDiv'){
		 $(document).off('click.instruProc2').on('click.instruProc2', '#proceedToGrpxx', function (event) {
		 	 if(event.key === 'Enter' || event.pointerId===1 || event.type==='click'){ // pointerId ===1 -> in case -> SR - SR->  keyb click as pointer click
		 		
		 		if(mockVar.currentGrp==0 && iOAP.curSection==0 && iOAP.curQues==0) {
		 			if(!$('#quesInstruDialogContainer').is(':visible'))
		 			onLoadEssentialsQuiz(0);
		 		}
		 		else{
		 			if(!$('#quesInstruDialogContainer').is(':visible'))
		 				setFocusOnQuestionArea(0);
		 		}
				
			     }
		  });
		 }
		 
	 }

	 function onKeyPressButton(event, action, ele) {
		 if(event)
			event.preventDefault();
			const actionConfig = {
				"VI": { dialogId: "TB_window", closeBtnId: "closeInstruction", ariaHidden: ".TB_modal" },
				"viewQuesInstru": { dialogId: "TB_window", closeBtnId: "instructionCloseQI", ariaHidden: ".TB_modal" },
				"viewSecInstru": { dialogId: "TB_window", closeBtnId: "instructionCloseSI", ariaHidden: ".TB_modal" },
				"viewGrpInstru": { dialogId: "TB_window", closeBtnId: "instructionCloseGI", ariaHidden: ".TB_modal" },
				"viewQPButton": { dialogId: "TB_window", closeBtnId: "InstructionCloseQP", ariaHidden: ".TB_modal" },
				"textarea-icon-container-id": { dialogId: "dragNotePadDiv", closeBtnId: "closeButton", ariaHidden:".toolModal"  },
				"scratchpad-icon-container-id": { dialogId: "scratch-pad-container-id", closeBtnId: "closeButton_scratchpad", ariaHidden: ".toolModal" },
				"ruler-icon-container-id": { dialogId: "ruler-div-id", closeBtnId: "rulerClose", ariaHidden:".toolModal" },
				"protactor-icon-container-id": { dialogId: "protactor-div-id", closeBtnId: "protactorClose", ariaHidden:".toolModal" },
				"calculator-icon-container-id": { dialogId: "keyPad", closeBtnId: "closeButton1", ariaHidden: ".toolModal" },
			};

			const config = actionConfig[action];
			if (!config) return;


			const btnId = ele.id;
			const dialogId = config.dialogId;
			const closeBtnId = config.closeBtnId;
			const ariaHidden = config.ariaHidden;


			if (ariaHidden) $(ariaHidden).attr('aria-hidden', 'true');


			if (action === 'VI' || action === 'viewQuesInstru' || action === 'viewSecInstru' || action === 'viewGrpInstru' || action === 'viewQPButton') {
				adjustFocusInstru().then(() => {
					setTimeout(() => {
						$('.TB_modal').attr('aria-hidden', 'false'); 
						}, 1000);
				});
			} else {

				setTimeout(() => {
				  $(`#${dialogId}`).focus();

				  setTimeout(() => {
				    $(ariaHidden).attr('aria-hidden', 'false');
				  }, 1000);
				}, 50);


				/*if (action === "scratchpad-icon-container-id" || action === "calculator-icon-container-id" || action === "textarea-icon-container-id") {
					setTimeout(() => {
						$(ariaHidden).attr('aria-hidden', 'false');
					}, 1500);
				}*/
			}




			trapFocusUtility(btnId, dialogId, closeBtnId);
			instructionsLiveRegion(ele.getAttribute('data-for-model-dialog'));


		}
	 

	 function adjustFocusInstru() {
	     return new Promise((resolve) => {
	         setTimeout(() => {
	             $('#TB_window').focus();
	             resolve();
	         }, 50);
	     });
	 }

	 
	  function instructionsLiveRegion(text) {
			const liveRegion = document.getElementById("sr_announcement_instructions");
			if(liveRegion){
			 liveRegion.textContent = "";
			 setTimeout(()=>{
				 if(text)
				 liveRegion.textContent=text+" dialog ";	 
			 },50);		
			}
		}


	 function clickThisElement(element,event){
			if(event.keyCode==13 || event.keyCode==32){
				event.preventDefault();
				$(element).click();
			}
		}


	 function DragAndDrop(elem, event)
	 {
	 	if($(elem).parent('.droptrue.dropTarget.droppableContainer.dragSource.ui-sortable').length==0)
	 	{
	 		if(event.keyCode == '37')
	 		{
	 			var unfilledDrop;
	 			$('.que-col-1 div ul').each(function(index){
	 				if($(this)[0].children.length < $(this).attr('data-max'))
	 				{
	 					unfilledDrop = this;
	 					return false;
	 				}
	 			});
	 			$(unfilledDrop).append(elem);
	 			$(elem).focus();
	 			DragAndDropLiveRegion($(unfilledDrop).siblings('h4').text(),elem);
	 		}
	 		var prevElem = elem.previousElementSibling;
	 	var nextElem = elem.nextElementSibling;
	 	if(event.keyCode == '38')
	 	{
	 		if(prevElem!=null)
	 		{
	 			var prevElemTxt = prevElem.textContent;
	 			var currElemTxt = elem.textContent;
	 			elem.textContent= prevElemTxt;
	 			prevElem.textContent = currElemTxt;
	 			prevElem.focus();
	 		}
	 	}
	 	if(event.keyCode == '40')
	 	{
	 		if(nextElem!=null)
	 		{
	 			var nextElemTxt = nextElem.textContent;
	 			var currElemTxt = elem.textContent;
	 			elem.textContent= nextElemTxt;
	 			nextElem.textContent = currElemTxt; 
	 			nextElem.focus();
	 		}
	 	}
	 	}
	 	else{
	 		if(event.keyCode == '39')
	 		{
	 			$('.que-col-2 ul').prepend(elem);
	 			$(elem).focus();
	 			DragAndDropLiveRegion();
	 		}
	 		 currentDrop = $(elem).parent();
	 		
	 		var currentParentDrop = $(currentDrop).parent();
	 		
	 	
	 		if(event.keyCode == '38')
	 		{
	 			if(currentParentDrop.prev().length!=0){
	 			$(elem).remove();
	 			currentParentDrop.prev().children('ul').append(elem);
	 			$(elem).focus();
	 			DragAndDropLiveRegion(currentParentDrop.prev().children('ul').siblings('h4').text(),elem);

	 			}
	 			
	 		}
	 		if(event.keyCode == '40')
	 		{
	 				if(currentParentDrop.next().length!=0){
	 				$(elem).remove();
	 				currentParentDrop.next().children('ul').append(elem);
	 				DragAndDropLiveRegion(currentParentDrop.next().children('ul').siblings('h4').text(),elem);
	 				$(elem).focus();
	 				}
	 		
	 	    }	
	 }
	 }
	 
	 function sequenceDrag(elem, event)
	 {
	 	var prevElem = elem.previousElementSibling;
	 	var nextElem = elem.nextElementSibling;
	 	if(event.keyCode == '37' || event.keyCode == '38')
	 	{
	 		if(prevElem!=null)
	 		{
	 			elem.remove();
	 			prevElem.before(elem);
	 			elem.focus();
	 			updateARIA('#fill-sequence-div ol');
	 			sequenceMtcDragLiveRegion(elem);
	 		}
	 	}
	 	if(event.keyCode == '39' || event.keyCode == '40')
	 	{
	 		if(nextElem!=null)
	 		{
	 			elem.remove();
	 			nextElem.after(elem);
	 			elem.focus();
	 			updateARIA('#fill-sequence-div ol');
	 			sequenceMtcDragLiveRegion(elem);	 
			
	 		}
	 	}
	 }
	 
	 
	 function sequenceMtcDragLiveRegion(elem){
		const liveRegion = document.getElementById("sr_announcement");
		if(liveRegion){
		liveRegion.textContent = "";
		liveRegion.textContent =  $(elem).text()+ ' moved to position '+$(elem).attr('aria-posinset'); 
		}
		}

	 
	 function DragAndDropLiveRegion(text,elem) {
			const liveRegion = document.getElementById("sr_announcement");
			if(liveRegion){
			 liveRegion.textContent = "";
			 setTimeout(()=>{
				 if(text)
				 liveRegion.textContent=$(elem).text()+" moved to "+text;
				 else
				 liveRegion.textContent=$(elem).text()+" moved to option bucket";	 
			 },50);		
			}
		}

	 function sortableKeyboard(elem, event){
			var prevElem = elem.previousElementSibling;
			var nextElem = elem.nextElementSibling;
			var currElem = elem;
			if(event.keyCode == '38')
			{
				if(prevElem!=null)
				{
					$(currElem).append(prevElem.firstChild).append(prevElem.firstChild);
					$(prevElem).append(currElem.firstChild).append(currElem.firstChild);
					prevElem.focus();
					updateARIA('#mtc-drag ul');
					sequenceMtcDragLiveRegion(prevElem);
					
				}
			}
			if(event.keyCode == '40')
			{
				if(nextElem!=null)
				{
					$(currElem).append(nextElem.firstChild).append(nextElem.firstChild);
					$(nextElem).append(currElem.firstChild).append(currElem.firstChild);
					nextElem.focus();
					updateARIA('#mtc-drag ul');
					sequenceMtcDragLiveRegion(nextElem);
				}
			}
		}
	 
	 function updateARIA(id) {
		   const list = document.querySelector(id);
		   const items = list.querySelectorAll("li");
		   const total = items.length;
		   items.forEach((item, index) => {
		     item.setAttribute("aria-posinset", index + 1);
		     item.setAttribute("aria-setsize", total);
		   });
		 }
	 

	 function keyboardDrag(event, elem)
	 {
	 	
	 	var currentTop = $(elem).css("top");
	 	currentTop = Number(currentTop.substring(0, currentTop.length -2));
	 	var precision = 10;
	 	var currentLeft = $(elem).css("left");
	 	currentLeft = Number(currentLeft.substring(0, currentLeft.length - 2));
	 	if(event.keyCode == '38')
	 	{
	 		$(elem).css("top", currentTop - precision);
	 			
	 	}
	 	if(event.keyCode == '40')
	 	{		
	 		$(elem).css("top", currentTop + precision);
	 	}
	 	if(event.keyCode =='37')
	 	{
	 		$(elem).css("left", currentLeft - precision);
	 	}
	 	if(event.keyCode == '39')
	 	{
	 		$(elem).css("left", currentLeft + precision);
	 	}
	 }



	 
	 
	 function announceLastFivemins(){
		 const liveRegion = document.getElementById("sr_announcement_time");
		 if(liveRegion)
		   liveRegion.textContent=`Only 5 mins remaining`;
	 }
	
	 function match(e, config) {
		  const keyMatch =
		   ( config.key.length === 1)
		      ? e.key.toLowerCase() === config.key.toLowerCase()
		      : e.key === config.key;

		  return (
		    keyMatch &&
		    e.ctrlKey === !!config.ctrl &&
		    e.altKey === !!config.alt &&
		    e.shiftKey === !!config.shift &&
		    e.metaKey === !!config.meta && e.key!=' '
		  );
		}
	 document.addEventListener("keyup", (e) => {
		  pressedKeys.clear();
		});
// keyboard short cuts for keyboard users 
	 const pressedKeys = new Set();
	 //genericIdForShortCuts
	 $(document).keydown(function (e) {
		 if (sessionStorage.shortcutMenuRequired != "true") {
			 return;
		 }
		 if(!e.repeat && !(e.key.startsWith("F")))
			 pressedKeys.add(e.code);
		 // time left
		 if (match(e, { key: 't', ctrl: 0, alt: 1 }) && pressedKeys.size === 2) {
			 auditlogCreation("Keyboard shortcut","candidate clicked Alt+T ","Keyboard shortcut");
		     e.preventDefault();
		     announceTimeLeft();
		   }
		 else{
		 let infoPopups= $('.confrmPopup:visible').not('#shortCutPopup').length > 0 || $('#sectionSummaryDiv').is(':visible') || $('#breakTimeDiv').is(':visible') || $('#scoreCardDiv').is(':visible') || $('.preGrpInstruL').is(':visible') || $("#TB_window").is(":visible");
		 let matched=match(e, { key: '/', ctrl: 0, alt: 1 }) && pressedKeys.size === 2;
		 if(sessionStorage.isLauncher == "true" || (infoPopups) || 
			(navigator.userAgentData?.platform === 'macOS' || navigator.platform.includes('Mac')) ||
			(!matched && $("#shortCutPopup").is(":visible")))// shortcuts are not applicable for launcher based assessment until they whitelist them.
			 return;
		 }
		 // status   
		   if (match(e, { key: 's', ctrl: 0, alt: 1 }) && pressedKeys.size === 2) {
			   auditlogCreation("Keyboard shortcut","candidate clicked Alt+S ","Keyboard shortcut");
			     e.preventDefault();
			     announceExamStatus();
			   }
		  /* if (match(e, { key: 'a', alt: 1 }) && pressedKeys.size === 2) {
			   auditlogCreation("Keyboard shortcut","candidate clicked Alt+A ","Keyboard shortcut");
			  
			     e.preventDefault();
			     	$('#buttons-div-id').attr('tabindex','-1');
					$('#buttons-div-id').focus();
					$('#buttons-div-id').removeAttr('tabindex');
			      
			   }
	 if (match(e, { key: 'q', alt: 1 }) && pressedKeys.size === 2) {
		   auditlogCreation("Keyboard shortcut","candidate clicked Alt+Q ","Keyboard shortcut");
		  
		     e.preventDefault();
		     $('#numberpanelQues').attr('tabindex','-1');
				$('#numberpanelQues').focus();
				$('#numberpanelQues').removeAttr('tabindex');
				setTimeout(() => {
					announceShortCutContent("You are now in the Question Navigation section.")
					}, 50);
		      
		   }*/
		   if (match(e, { key: 'n', alt: 1 }) && pressedKeys.size === 2) {
			   auditlogCreation("Keyboard shortcut","candidate clicked Alt+N ","Keyboard shortcut");
			   const btn = $("#savenextGroup:visible, #savenext:visible");

			   if (!btn.length || btn.is(":disabled")) {
				   announceShortCutContent("Save and next is not available for this question. Please wait for the timer to complete.");
				   announceTimeLeft();
				   return;
				 }
			     e.preventDefault();
			     console.log("keycode pressed");
			     if(iOAP.curQues==iOAP.secDetails[iOAP.curSection].questions.length-1 )
			    	 announceShortCutContent("Response saved.");
			     else
			    	 announceShortCutContent("Response saved. Loading question number "+(iOAP.curQues+2)+"");
			     if ($(".savenextGroup").is(":visible"))
			    	 	$("#savenextGroup").click();
			     else
			    		 $("#savenext").click();
			     
			   }
		   
		   if (match(e, { key: 'p', alt: 1 }) && pressedKeys.size === 2) {
			   auditlogCreation("Keyboard shortcut","candidate clicked Alt+P ","Keyboard shortcut");
			   const btn = $("#previousBtn:visible, #previousBtnGroup:visible");

			   if (!btn.length || btn.is(":disabled") || iOAP.curQues==0 ){
				   //console.log("Button is disabled");
				   announceShortCutContent("You cannot go to previous Question.");
				   return;
				 }
			     e.preventDefault();
			     announceShortCutContent("Response saved. Loading previous question.");
			     if ($(".previousBtnGroup").is(":visible"))
			    	 	$("#previousBtnGroup").click();
			     else
			    		 $("#previousBtn").click();
			    
			   }
		   
		   if (match(e, { key: 'c', ctrl: 0, alt: 1 }) && pressedKeys.size === 2) {
			   auditlogCreation("Keyboard shortcut","candidate clicked Alt+C ","Keyboard shortcut");
			   const btn = $("#clearResponseGrp:visible, #clearResponse:visible");
		 if(mockVar.curQuesBean.quesType == "SA" && (mockVar.curQuesBean.keyboardType == "Alphanumeric" || mockVar.curQuesBean.plainOrRichText =="RichText")
				|| !btn.length ){
			 announceShortCutContent("Clear responses will not be available for Short Answer (SA) questions of type Rich Text and Alphanumeric.");
			 return;
		 }
			     e.preventDefault();
			     announceShortCutContent("responses cleared.");
			     
			     if ($("#clearResponseGrp").is(":visible"))
			    	 	$("#clearResponseGrp").click();
			     else
			    		 $("#clearResponse").click();
			     
			   }
		   
		   if (match(e, { key: 'r', ctrl: 0, alt: 1 }) && pressedKeys.size === 2) {
			   auditlogCreation("Keyboard shortcut","candidate clicked Alt+R ","Keyboard shortcut");
			   const btn = $("#underreviewGrp:visible, #underreview:visible");

			   if (!btn.length || btn.is(":disabled")) {				   
				   announceShortCutContent("Mark for review is not available for this Question.");
				   return;
				 }
			     e.preventDefault();
			     var quesNo=iOAP.curQues==iOAP.secDetails[iOAP.curSection].questions.length-1?"":(iOAP.curQues+2);
			     	if(quesNo=="")
			     		announceShortCutContent("Question marked for review.");
			     	else
			     		announceShortCutContent("Question marked for review. Loading "+quesNo+" question.");
				
			     
			     if ($("#underreviewGrp").is(":visible"))
			    	 	$("#underreviewGrp").click();
			     else
			    		 $("#underreview").click();
			     
			   }
		   
		   if (match(e, { key: 'Enter', ctrl: 1, alt: 1 }) && pressedKeys.size === 3) {
			   auditlogCreation("Keyboard shortcut","candidate clicked Ctrl+Alt+Enter ","Keyboard shortcut");
			   if ($("#finalSubmit").is(":disabled") || !$("#finalSubmit").is(":visible")) {
				   //console.log("Button is disabled");
				   announceShortCutContent("Group submission button is not available. Please wait for the timer to complete.");
				   announceTimeLeft();
				   return;
			   }
			     e.preventDefault();
			     announceShortCutContent("Group submission selected.");
			     $("#finalSubmit").click();
			    
			   }
		   
		   if (match(e, { key: '/', ctrl: 0, alt: 1 }) && pressedKeys.size === 2) {
			   auditlogCreation("Keyboard shortcut","candidate clicked Alt+Slash ","Keyboard shortcut");
			   e.preventDefault();
			   /*var str = "";
			   str += "Keyboard shortcuts available:";
			   str += "Press Control Alt T to know the remaining time.";
			   str += "Press Control Alt S to know the summary of current group and section";
			   str += "Press Control Shift N to save and move to next question.";
			   str += "Press Control Shift P to save and move to previous question.";
			   str += "Press Control Alt R to mark question for review.";
			   str += "Press Control Alt C to clear responses.";
			   str += "Press Control Alt Enter to submit the group.";
			   str += "Press Alt Slash to open this help again.";
			   announceShortCutContent(str);
			   
			   $("#finalSubmit").click();*/
			   if(!$("#shortCutPopup").is(":visible")){
				   openShortCutsPopup();
			   }else{
				   closeShortCutsPopup();
				   announceShortCutContent("shortcuts menu closed.");  
			   }
			   
		   }
		   
		   
		   
		   
		   
		   
		 });
	
	 
	 function announceWarning(warning){
		 try{
			 $("<div>")
			 .attr({
				 class: "visually-hidden",
				 id:"sr_announcement_warning",
				 role:"alert"
			 })
			 .prependTo("#quesAnsContent");

				 const liveRegion = document.getElementById("sr_announcement_warning");
				 if(liveRegion){
				 liveRegion.textContent = "";
				 setTimeout(()=>{
					 liveRegion.textContent=`${warning}`;
				 },50);
				 }
		 }catch(e){
			 console.log(e);
		 }
	 }
	 
	 function announceTimeLeft() {
		   const formatted = timeFormat(mockVar.time);
		   const liveRegion = document.getElementById("sr_announcement_time");
		   if(liveRegion){
			   liveRegion.textContent = "";
			   setTimeout(() => {
		   liveRegion.textContent=`Time left is ${formatted}`;
			   },50);
		   }
		 }
	 function timeFormat(seconds) {
		 var hrs = 0, mins = 0, secs = 0;
		 var returnText = "";
		 if(mockVar.timeFormat === "HH:MM"){
			 hrs = Math.floor(seconds / 3600);
			 mins = Math.floor((seconds % 3600) / 60);
			 returnText = hrs != 0 ? hrs +" hours ":"";
			 returnText += mins != 0 ? mins +" minutes ":"";
			 //returnText;
		 } else {
			 mins = Math.floor(seconds / 60);
			 /*if(mins>60){
				 hrs = Math.floor(seconds / 3600);
				 mins = Math.floor((seconds % 3600) / 60);
				 returnText = hrs != 0 ? hrs +" hours ":"";
				 returnText += mins != 0 ? mins +" minutes ":"";
				 //returnText;
			 }
			 else{*/
			 secs = seconds % 60;
			 returnText = mins != 0 ? mins +" minutes ":"";
			 returnText += secs != 0 ? secs +" seconds ":"";
		 }

		 return returnText;
		 /*var mins = Math.floor(seconds / 60);
		   var secs = seconds % 60;
		   return `${mins} minutes ${secs} seconds`;*/
	 }
	 
	 function announceShortCutContent(messageData){
		 const liveRegion = document.getElementById("genericIdForShortCuts");
		/* if(liveRegion)
			 liveRegion.textContent = messageData;*/
		 if (liveRegion) {
			    liveRegion.textContent = "";
			    setTimeout(() => {
			    	liveRegion.textContent = messageData;
			    }, 50); // small delay helps screen readers
			  }
	 }
	 function announceExamStatus() {
		  const status = getStatus();
		  const liveRegion = document.getElementById("sr_announcement_status");
		  const groupName = iOAP.groupName;
		  const sectionName = iOAP.secDetails[iOAP.curSection].secName;
		  if (liveRegion) {
		    liveRegion.textContent = "";
		    setTimeout(() => {
		      liveRegion.textContent = `Group summary for the ${groupName} group and ${sectionName} section. ${status}`;
		    }, 100); // small delay helps screen readers
		  }
		}
	 
	 function getStatus(){
		 const answered = iOAP.secDetails[iOAP.curSection].answered;
		 const notAnswered = iOAP.secDetails[iOAP.curSection].notanswered;
	     const marked = iOAP.secDetails[iOAP.curSection].marked;
	     const markedandAnswered = iOAP.secDetails[iOAP.curSection].markedAndAnswered;
	     const noOfQuestions = iOAP.secDetails[iOAP.curSection].questions.length;
		 const notVisited = noOfQuestions  - iOAP.secDetails[iOAP.curSection].answered - iOAP.secDetails[iOAP.curSection].notanswered - iOAP.secDetails[iOAP.curSection].marked - iOAP.secDetails[iOAP.curSection].markedAndAnswered;
		 var returnData = "";
		 if(answered != "0")
			 returnData += answered+" "+mockLabels.answered+".";
		 if(notAnswered != "0")
			 returnData += notAnswered+" "+mockLabels.notAnswered+".";
		 if(marked != "0")
			 returnData += marked+" "+mockLabels.markReview+".";
		 if(markedandAnswered != "0")
			 returnData += markedandAnswered+" "+mockLabels.markAnsTitle+".";
		 if(notVisited != "0")
			 returnData += notVisited+" "+mockLabels.notAttempted+".";
		 return returnData;
		 //return `${answered}  answered, ${notAnswered}  not answered, ${notVisited}  not visited,  ${marked}  marked for review, ${markedandAnswered}  Answered & Marked for Review (will not be considered for evaluation) `;
	 }
	 
	 
// recording live
	 
	 function recordingLiveAnnouncement(status){
		 const liveRegion = document.getElementById("sr_announcement_recording");
		 if(liveRegion)
		 liveRegion.textContent=`${status}`;
	 }
	 
	 
	 function trapFocusPhotoGuideLinesDialog(btnId,dialogId) {
		 $('#photo-dialog-modal-id').attr('aria-hidden','true');
		 $('#photoDialog_Closeid').attr('aria-hidden','true');
		 
  		 setTimeout(function(){
  			trapFocusUtility(btnId,dialogId,'photoDialog_Closeid','photoGuideLines');
  			$('#photoUploadGuideLinesId').focus();
  			//instructionsLiveRegion('Photo Guidelines');
  		 },200);
  		 
  		setTimeout(function(){
  			$('#photo-dialog-modal-id').attr('aria-hidden','false');
  			$('#photoDialog_Closeid').attr('aria-hidden','false');
  		},1000);
  	 }
	 
	 function trapFocusDeletePopup(btnId,dialogId) {
		 $('#model_header_dlte_id').attr('aria-hidden','true');
		 $('#model_body_dlte_id').attr('aria-hidden','true');
		 $('#model_footer_dlte_id').attr('aria-hidden','true');
		 
  		 setTimeout(function(){
  			trapFocusUtility(btnId,dialogId);
  			$('#deletePopupId').focus();
  		 },200);
  		 
  		setTimeout(function(){
  			 $('#model_header_dlte_id').attr('aria-hidden','false');
  			 $('#model_body_dlte_id').attr('aria-hidden','false');
  			 $('#model_footer_dlte_id').attr('aria-hidden','false');
  		},1000);
  	 }
	 
	 function trapFocusUtilityForCnfPop(dialogId, btnId){ 
		 const $dialog =   $('#'+dialogId);  
		/* let $closeBtn;
		 let $okBtn;
		 let btnId;
		 if(dialogId===''){
			 btnId = "readylink" ; 
		 }
		 const $button = $('#'+btnId);*/
		 let $button;
		 if(!btnId==''){
			  $button = $('#'+btnId);
		 }
		 $dialog.attr('tabindex','-1');
		 $dialog.css('outline','none');
		 $dialog.focus();
		 const $firstFocusableElement = $dialog.find('input, button, [tabindex="0"]').first();
	    const $focusableElements = $dialog.find(
	    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
	  ).filter(':visible');

	  const $firstElement = $focusableElements.first();
	  const $lastElement = $focusableElements.last();
	  
	  $(document).off('keydown.trapPop1').on('keydown.trapPop1', '#'+dialogId, function (event) {
	    if (event.key === 'Tab') {
	      if (event.shiftKey && document.activeElement === $firstElement[0]) {
	        event.preventDefault();
	        $lastElement.focus();
	      } else if (!event.shiftKey && document.activeElement === $lastElement[0]) {
	        event.preventDefault();
	        $firstElement.focus();
	      }
	    }
	    else if (event.key === 'Escape') {
	    	$firstElement.click();
	      $button.focus(); 
	    }
	  });
	  
	  
	  
	  $(document).off('click.trapPop2').on('click.trapPop2', '.greenBtn', function (event) {
	 	 if(event.key === 'Enter' || event.pointerId===1 || event.type==='click'){ // pointerId ===1 -> in case -> SR - SR->  keyb click as pointer click
	 		 $button.focus();
		     }
	  });
	  
	 
	  if($firstElement.attr('id')){
	  
	  $(document).off('click.trapPop3').on('click.trapPop3', '#'+$firstElement.attr('id'), function (event) {
		 	 if(event.key === 'Enter' || event.pointerId===1 || event.type==='click'){
		 		 $button.focus();
			     }
		  });
	  }
	 }
	 
	
	 
	 function trapFocusUtility(btnId,dialogId,closeBtn,extra){
         const $button=   $('#'+btnId) ; 
		 const $dialog =   $('#'+dialogId);  
		 const $closeBtn = $('#'+closeBtn);
		 $button.attr('aria-expanded','true');
         const $focusableElements = $dialog.find(
               'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
               ).filter(':visible');

         const $firstElement = $focusableElements.first();
         const $lastElement = $focusableElements.last();
    
         //$firstElement.focus();

	   


         $(document).off('keydown.trap1').on('keydown.trap1', '#'+dialogId, function (event) { // listen event on the doc-> but w a condition-> check if the event is originating from the dialog or its descendants 
	     if (event.key === 'Tab') {
	       if (event.shiftKey && document.activeElement === $firstElement[0]) {
	         event.preventDefault();
	         $lastElement.focus();
	       } else if (!event.shiftKey && document.activeElement === $lastElement[0]) {
	         event.preventDefault();
	         $firstElement.focus();
	       }
	     }
	     
	     else if (event.key === 'Escape') {
	    	 $($button).attr('aria-expanded','false');
	    	 $closeBtn.click();
	        $button.focus(); 
	        if(extra==='photoGuideLines'){
	        	 $(".modal-backdrop.fade.in").remove();
	        }

	  

	     }
	   });  
         
         
        $(document).off('keydown.trap2 click.trap2').on('keydown.trap2 click.trap2', '#'+closeBtn, function (event) {
        	 if(event.key === 'Enter' || event.pointerId===1 || event.type==='click'){
    	    	$($button).attr('aria-expanded','false');
    	    	setTimeout(function(){
    	    		
    	    		$button.focus(); 
    	    	},500);
    	     }
         });
}

//accessibility for lower screen resolutions 
	 
	 

		

	 // groupMenuAccessibility
		 
		 $(document).on('keydown', '#groupbox2id [role="menuitem"]', function (e){
			 const $menuitems = $('#groupbox2id [role="menuitem"]');
			 const index = $menuitems.index(this);
			 let newIndex = index;
			 if (e.key === "ArrowDown") {
				   newIndex = (index + 1) % $menuitems.length;
				   $menuitems.eq(newIndex).focus();
				 } else if (e.key === "ArrowUp") {
				   newIndex = (index - 1 + $menuitems.length) % $menuitems.length;
				   $menuitems.eq(newIndex).focus();
				 } else if (e.key === "Home") {
					 $menuitems.eq(0).focus();
				 } else if (e.key === "End") {
					 $menuitems.eq($menuitems.length - 1).focus();
				 }  else if (e.key === "Tab" || (e.key==="Tab" && e.shiftKey) ) {
					 $('#groupbox2id').hide();
					 $('.bx_arrow').hide();
					 
				 } else if(e.key === "Escape"){
					 $('#groupbox2id').hide();
					 $('#groupsResp .grup_head').focus();
				 }
		 });
		 
	// sectionMenuAccessibility
		 
		 $(document).on('keydown', '#sectionbox2id [role="menuitem"]', function (e){
			 const $menuitems = $('#sectionbox2id [role="menuitem"]');
			 const index = $menuitems.index(this);
			 let newIndex = index;
			 if (e.key === "ArrowDown") {
				   newIndex = (index + 1) % $menuitems.length;
				   $menuitems.eq(newIndex).focus();
				 } else if (e.key === "ArrowUp") {
				   newIndex = (index - 1 + $menuitems.length) % $menuitems.length;
				   $menuitems.eq(newIndex).focus();
				 } else if (e.key === "Home") {
					 $menuitems.eq(0).focus();
				 } else if (e.key === "End") {
					 $menuitems.eq($menuitems.length - 1).focus();
				 } else if (e.key === "Tab" || (e.key==="Tab" && e.shiftKey)) {
					 $('#sectionbox2id').hide();
					 $('.bx_arrow').hide();
				 } else if(e.key === "Escape"){
					 $('#sectionbox2id').hide();
					 $('#secResp .grup_head').focus();
				 }
		 });
				 
		 
		 // close icon hamburger menu 
		 
		 
		 $(document).on('keydown', '#hamcloseid', function (e){
			 if(e.key === "Enter"){
				 $('#canvasmenuid').focus();
			 }
		 });
	 
		 
		 // trap focus hamburger menu 

		 function trapFocusinHamMenu() {
			 const $button = $('#hamiconid');
			 const $dialog = $('#canvasmenuid');
			 const $firstFocusableElement = $dialog.find('input, button, [tabindex="0"]').first();
			 $firstFocusableElement.focus();
		     const $focusableElements = $dialog.find(
		     'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
		   ).filter(':visible');
		
		   const $firstElement = $focusableElements.first();
		   const $lastElement = $focusableElements.last();
		   
		   $(document).on('keydown', '#canvasmenuid', function (event) {
		     if (event.key === 'Tab') {
		       if (event.shiftKey && document.activeElement === $firstElement[0]) {
		         event.preventDefault();
		         $lastElement.focus();
		       } else if (!event.shiftKey && document.activeElement === $lastElement[0]) {
		         event.preventDefault();
		         $firstElement.focus();
		       }
		     }
		     
		     else if (event.key === 'Escape') {
		       $('#hamcloseid').click();
		       $button.focus(); // Return focus to the button
		     }
		     
		     else if(event.key === 'Enter' && (document.activeElement && document.activeElement.class==='hamcloseid')){
	 		    	$button.focus(); // Return focus to the button
	 		     }
		   });
		 }


		 function trapFocusInstructions(buttonid) {
			 setTimeout(function(){
				 trapFocusInstructions1(buttonid);
			 },200)
		 }

          function trapFocusInstructions1(buttonid){
        	 const $button=$('#'+buttonid);
 			 const $dialog = $('#mpopid');
 			 const $firstFocusableElement = $dialog.find('input, button, [tabindex="0"]').first();
 			 $firstFocusableElement.focus();
 		     const $focusableElements = $dialog.find(
 		     'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
 		   ).filter(':visible');
 		
 		   const $firstElement = $focusableElements.first();
 		   const $lastElement = $focusableElements.last();
 		   
 		   $(document).on('keydown', '#mpopid', function (event) {
 		     if (event.key === 'Tab') {
 		       if (event.shiftKey && document.activeElement === $firstElement[0]) {
 		         event.preventDefault();
 		         $lastElement.focus();
 		       } else if (!event.shiftKey && document.activeElement === $lastElement[0]) {
 		         event.preventDefault();
 		         $firstElement.focus();
 		       }
 		     }
 		     
 		     else if (event.key === 'Escape') {
 		       $dialog.hide();
 		       $button.focus(); // Return focus to the button
 		     }
 		     
 		     else if(event.key === 'Enter' && (document.activeElement && document.activeElement.id==='closePop')){
 		    	$button.focus(); // Return focus to the button
 		     }
 		   });  
          }
          
          function focusMainQues(action) {
        	  try {
        		  requestAnimationFrame(() => {
        			    setTimeout(() => {
        			        const el = document.getElementById("currentQues");
        			        if (el) {
        			            el.setAttribute("tabindex", "-1");
        			            el.focus();
        			            curQuesFocused=true;
        			            setTimeout(() => {
        			            el.removeAttribute("tabindex");
        			            }, 1500);
        			        }
        			    }, 100);
        			});
        		  /*
        	    if (action !== "SUBMIT") {
        	      setTimeout(() => {
        	        const main = document.getElementById("currentQues");
        	        if (!main) return;

        	        const heading = main.querySelector('[role="heading"]');
        	        if (!heading) return;

        	        const announcer = document.getElementById("sr_announcement");
        	       // const buttons = document.getElementById("buttons-div-id");

        	        // Silence live announcer
        	        if (announcer) announcer.setAttribute("aria-live", "off");

        	        // Hide buttons region temporarily 
        	        //if (buttons) buttons.setAttribute("aria-hidden", "true");

        	        // Focus heading
        	        heading.setAttribute("tabindex", "-1");
        	        heading.focus({ preventScroll: true });

        	        curQuesFocused = true;

        	        setTimeout(() => {
        	        	console.log("in last fun.");
        	          heading.removeAttribute("tabindex");

        	          // Restore announcer
        	          if (announcer) announcer.setAttribute("aria-live", "polite");

        	          // Restore buttons region 
        	          $("#buttons-div-id").attr("aria-hidden", "false");

        	        }, 1500);

        	      }, 1000);
        	    }
        	  */} catch (e) {
        	    console.error(e);
        	  }
        	}
          function triggerNumberPanel(newId){
          requestAnimationFrame(() => {
			    setTimeout(() => {

			        const container = document.getElementById(newId);
			        var firstHeading=null;
			        if (container) {
			        	if(newId=='rightSectionDiv2'){
			        	const headings = container.querySelectorAll(
			        	    'h1, h2, h3, h4, h5, h6, [role="heading"]'
			        	);

			        	firstHeading= headings[1]; // index 1 = second element
			        	}else{
				             firstHeading = container.querySelector(
				                'h1, h2, h3, h4, h5, h6, [role="heading"]'
				            );
			        	}

			            if (firstHeading) {

			                Array.from(container.children).forEach(child => {
			                    child.setAttribute("aria-hidden", "true");
			                });
			                $("#buttons-div-id").attr('aria-hidden', 'true');
			                firstHeading.removeAttribute("aria-hidden");

			                firstHeading.setAttribute("tabindex", "-1");
			                firstHeading.focus();

			                setTimeout(() => {
			                    firstHeading.removeAttribute("tabindex");

			                    Array.from(container.children).forEach(child => {
			                        child.removeAttribute("aria-hidden");
			                    });
			                }, 1500);
			                setTimeout(() => {
			                	 $("#buttons-div-id").attr('aria-hidden', 'false');
			                }, 2500);
			                
			            }
			        }

			    }, 100);
			});
          }
         function skipNumeberPanelFocus(delay){//  Elements
        	 const saveNextBtn = document.getElementById('savenext');
        	 const finalSubmit1 = document.getElementById('finalSubmit');
        	 const parent = document.getElementById('numberpanelQues');
        	 
        	//  Reset all tabs (make non-focusable)
         	 function resetTabs() {
         	   const tabs = parent.querySelectorAll('[role="tab"]');
         	   tabs.forEach(tab => tab.setAttribute('tabindex', '-1'));
         	   $(".collapse_icon").attr("tabindex",'-1');
         	 }

         	 //  Get current question tab using ID
         	 function getCurrentTab() {
         	   return document.querySelector(
         	     `#numberpanelQues [role="tab"][id="${String(iOAP.curQues)}"]`
         	   );
         	 }
        	 //  Run once initially
        	 resetTabs();

        	 //  MAIN KEYDOWN HANDLER (CAPTURE PHASE )
        	 document.addEventListener('keydown', (e) => {
        	   if (e.key !== 'Tab') return;

        	   const currentTab = getCurrentTab();
        	   if (!currentTab) return;

        	   //  ALWAYS reset before applying
        	   resetTabs();

        	   //  CASE 1: SaveNext  NumberPanel
        	   if (!e.shiftKey && (e.target === saveNextBtn || saveNextBtn?.contains(e.target))) {
        	     e.preventDefault();
        	     e.stopImmediatePropagation();

        	     currentTab.setAttribute('tabindex', '0');
        	     currentTab.focus();

        	     questionTabPanelAccessibility();
        	     return;
        	   }

        	   //  CASE 2: FinalSubmit  NumberPanel (Shift + Tab)
        	   if (e.shiftKey && (e.target === finalSubmit1 || finalSubmit1?.contains(e.target))) {
        	     e.preventDefault();
        	     e.stopImmediatePropagation();

        	     currentTab.setAttribute('tabindex', '0');
        	     currentTab.focus();

        	     questionTabPanelAccessibility();
        	     return;
        	   }

        	   //  CASE 3: NumberPanel  SaveNext (Shift + Tab)
        	   if (e.shiftKey && e.target === currentTab) {
        	     e.preventDefault();
        	     e.stopImmediatePropagation();

        	     saveNextBtn?.focus();
        	     return;
        	   }

        	   //  CASE 4: NumberPanel  FinalSubmit / Header
        	   if (!e.shiftKey && e.target === currentTab) {
        	     e.preventDefault();
        	     e.stopImmediatePropagation();

        	     if (!finalSubmit1?.disabled) {
        	       finalSubmit1.focus();
        	     } else {
        	       document.getElementById('sub-header')?.focus();
        	     }
        	     return;
        	   }

        	 }, true); //  CRITICAL: capture phase
        	 }
