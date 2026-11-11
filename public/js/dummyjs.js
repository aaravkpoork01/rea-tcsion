jQuery(document).ready(function(){
$("#texteditor").keyup(function () {
var autoS = document.getElementById("autoSave");
if ($(this).val() == "") {
autoS.style.display = "none";
} else {
	autoS.style.display = "block";
	setTimeout(function () {$("#autoSave").hide();}, 3000);}
});
});


// Method helps in selection of text
function getSelectedText() {
    var html = "";
    if (typeof window.getSelection != "undefined") {
        var sel = window.getSelection();
        if (sel.rangeCount) {
            var container = document.createElement("div");
            for (var i = 0, len = sel.rangeCount; i < len; ++i) {
                container.appendChild(sel.getRangeAt(i).cloneContents());
            }
            html = container.innerHTML;
        }
    } else if (typeof document.selection != "undefined") {
        if (document.selection.type == "Text") {
            html = document.selection.createRange().htmlText;
        }
    }
    return html;
}
/*function annotationForHighlightedText(){
//Create container where highlighter can be added
$('.highlightIcon').on('click', function () {
    $(this).toggleClass('selected');
    $('.highlightPara').toggleClass('highlightext');
});
// Create the highlighted area in yellow with close button
$(document).on('click touchend', ".highlightext", function () {
    if (!$(".highlightPara").hasClass("highlightext")) {
        $(".highlightext").on('mouseup', function (e) {
            e.stopPropagation();
        });
    } else if ($(".highlightPara").hasClass("highlightext")) {
        var selection = getSelectedText();
        var lenstr = 0, listr = 0;
        var selectedTextLength = selection.toString().length;
        if($('.highlighted_section').hasClass('highlighted_section')) {
            return false;
        }
        if (selectedTextLength > 1) {
            var range = window.getSelection().getRangeAt(0);
            var content = range.extractContents();
            span = document.createElement('span');
            span.appendChild(content);
            span.className = 'highlighted_section';
            range.insertNode(span);
        }
        // $(".highlightext").find('.closeH').remove();
        // $(".highlightext .highlighted_section").append("<button class='closeH'></button>");
        $(".highlighted_section").on('mouseup', function (e) {
            e.stopPropagation();
        });
    }
});
$(document).on('click touchend', '.highlighted_section', function () {
    if (!$(this).find('.hl_actions').length) {
        $(this).prepend("<div class='hl_actions'>'" +
        		"<button class='hl_edit' data-tooltip='tooltip' title='Annotation'></button> " +
        		"<span class='hl_separator'></span> <button class='hl_delete' data-tooltip='tooltip' title='Delete'></button></div>');
        $(this).find(".info_msg").hide();
    }

    if($(this).find('.info_msg').length){
        $(this).find('.hl_actions .hl_edit').addClass('active');
    }
});

// Show info message on mouseover
$(document).on('mouseover', '.highlighted_section', function (event) {
    if (!$(event.target).closest(".hl_actions").length) {
        $(this).find(".info_msg").show();
    }
});

// Hide info message on mouseout
$(document).on('mouseout', '.highlighted_section', function () {
    $(this).find(".info_msg").hide();
});

// Show annotation box to add info message
$(document).on('click touchend', '.hl_edit', function () {
    $(this).closest('.highlighted_section').append("<div class='annotaion_parent'><h2>Annotaion</h2>" +
    		"<textarea class='ap_inputBox'></textarea>" +
    		"<div class='ap_actions'><button class='ap_cancel'>Cancel</button>" +
    		"<button class='ap_save'>Save</button>" +
    		"</div></div>")
});

// Delete info message 
$(document).on('click touchend', '.hl_delete', function (e) {
    $(this).parents('.highlighted_section').find('.info_msg').remove();
    var allText = $(this).parents('.highlighted_section').html();
    $(this).parents('.highlighted_section').after(allText);
    $(this).parents('.highlighted_section').remove();
    $(this).parent().remove();
});

// Stop propagating to top element 
$(document).on('click touchend', '.annotaion_parent', function (e) {
    e.stopPropagation();
});

// Make save button active as user type in
$(document).on('keyup', '.ap_inputBox', function (e) {
    if ($(this).val().length) {
        $(this).parents('.annotaion_parent').find('.ap_save').addClass('active');
    }
});

// Close annotation box and actions on highlighted section
$(document).on('click', '.ap_cancel', function (e) {
    $(this).closest('.highlighted_section').find(".annotaion_parent").remove();
    $(this).parents('.highlighted_section').find('.hl_actions').hide();
});

// Save the info message and hide actions on highlighted section  - change 1
$(document).on('click', '.ap_save', function (e) {
    var msg = $(".ap_inputBox").val();
    $(this).parents('.highlighted_section').append("<span class='info_msg'>${msg}</span>");
    $(this).parents('.highlighted_section').find('.hl_actions').remove();
    $(this).parents('.highlighted_section').find('.info_msg').hide();
    $(this).closest('.highlighted_section').find(".annotaion_parent").remove();
    
});

// Remove actions on highlighted section on click of anywhere other than .highlightPara
$(document).on("mouseup", function (e) {
    var container = $(".highlighted_section");
    if (!container.is(e.target) && container.has(e.target).length === 0) {
        $('.hl_actions').remove();
    }
});
}
*/
VKI_AttachClassToSpecialKeys();
function VKI_AttachClassToSpecialKeys()
{
	  var tdTags = document.getElementsByTagName("td");
	  for (var i = 0;i<tdTags.length; i++)
	  	{
	  		if(tdTags[i].textContent == "Shift")
	  			{
	  				tdTags[i].classList.add("shift-key");
	  				tdTags[i].innerHTML = "shift";
	  			}
	  		else if(tdTags[i].textContent=="Tab")
	  			{
					tdTags[i].classList.add("tab-key");
					tdTags[i].innerHTML = "tab";
	  			}
	  		else if(tdTags[i].textContent=="Caps")
			{
					tdTags[i].classList.add("caps-key");
					tdTags[i].innerHTML = "caps lock";


			}
	  		else if(tdTags[i].textContent=="Enter")
			{
					tdTags[i].classList.add("return-key");
					tdTags[i].innerHTML = "return";
			}
	  		else if(tdTags[i].textContent=="Bksp")
			{
					tdTags[i].classList.add("delete-key");
					tdTags[i].innerHTML = "delete";
			}
	  		else if(tdTags[i].textContent=="Alt")
			{
					tdTags[i].classList.add("alt-key");
					tdTags[i].innerHTML = "alt";
			}

	  	}

}
