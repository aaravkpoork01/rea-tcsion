function disableKeysInTest(e){
	$(document).unbind('keydown').bind('keydown', function 	(event) {
		var doPrevent = false;
		var key_code = (window.event) ? event.keyCode : event.which;
		var ctrl_key = (window.event) ? event.ctrlKey : event.ctrlKey;
		var alt_key = (window.event) ? event.altKey : event.altKey;
		if(!(document.getElementById('typedAnswer'))){	
			if(!isNaN(key_code) || ctrl_key || alt_key){
				if (key_code == 8) {
					var d = event.srcElement || event.target;
					if ((d.tagName.toUpperCase() === 'INPUT' && (d.type.toUpperCase() === 'TEXT' || d.type.toUpperCase()=== 'PASSWORD'))  || d.tagName.toUpperCase()=='TEXTAREA') {
						doPrevent = d.readOnly || d.disabled;
					}else {
						doPrevent = true;
					}
				}else if(key_code==9){
					doPrevent = true;
				}else if(alt_key){
					var d = event.srcElement || event.target;
					if (!(d.tagName.toUpperCase()=='TEXTAREA')) {
						doPrevent = true;
					}
				}else if ((alt_key && ctrl_key) || (ctrl_key && key_code==78)){
					doPrevent = true;
				}else if(!((event.shiftKey)||(key_code>=65 && key_code<=90) ||(key_code>=96 && key_code<=105) || (key_code>=48 && key_code<=57) 
						|| (key_code==107)|| (event.shiftKey && key_code==187) || (key_code==109)|| (key_code==106)|| (key_code==111)|| (key_code==189)|| (key_code==190)  || (key_code==110) 
						|| (key_code==46)  || (key_code==13)|| (key_code==16) || (key_code==20) || (key_code==144) || (key_code==32) || (key_code==188) 
						|| (key_code==186) || (key_code==33)|| (key_code==64)|| (key_code==35)|| (key_code==36)|| (key_code==37)|| (key_code==94)
						|| (key_code==42)|| (key_code==38)|| (key_code==39)|| (key_code==40)|| (key_code==41)|| (key_code==95)|| (key_code==123)|| (key_code==125)
						|| (key_code==219)|| (key_code==221)|| (key_code==124)|| (key_code==220)|| (key_code==126)|| (key_code==192) || (key_code==12) || (key_code==45)
						|| (key_code==58)|| (key_code==34)|| (key_code==222)|| (key_code==60)|| (key_code==62)|| (key_code==63)|| (key_code==191) || key_code==187 || key_code == 9 || key_code == 61 || key_code == 59 || key_code == 173)){
					doPrevent = true;
					console.log("keyBoard true");
				}
				if (doPrevent) {
					event.preventDefault();
				}
			}
		} else {
			if (key_code == 8) {
				var d = event.srcElement || event.target;
				if ((d.tagName.toUpperCase() === 'INPUT' && (d.type.toUpperCase() === 'TEXT' || d.type.toUpperCase()=== 'PASSWORD'))  || d.tagName.toUpperCase()=='TEXTAREA') {
					doPrevent = d.readOnly || d.disabled;
				}else {
					doPrevent = true;
				}
			}else if(key_code==27 || ctrl_key || alt_key || key_code==9 || (key_code>=17 && key_code<=19) || key_code==13 || (key_code>=91 && key_code<=93) || (key_code>=33 && key_code<=36) || key_code==38 || key_code==40 || key_code==45 || (key_code>=112 && key_code<=123) || key_code==145){
				doPrevent = true;
				console.log("keyBoard true");
			}
			if (doPrevent) {
				event.preventDefault();
			}
		}
	});
}