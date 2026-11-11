var trailLength = 10 // Trail Length (8 by default; put more for longer "tail")
var path = "./images/cursorTrail.png" 

var standardbody=(document.compatMode=="CSS1Compat")? document.documentElement : document.body  
var i,d = 0 
function initMouseTrail() {  
    images = new Array()  
    for (i = 0; i < parseInt(trailLength); i++) {
        images[i] = new Image()
        images[i].src = path
    }
    storage = new Array()  
    for (i = 0; i < images.length*3; i++) {
        storage[i] = 0
    }
    for (i = 0; i < images.length; i++) {  
        document.write('<div id="obj' + i + '" style="position: absolute; z-Index: 9999; height: 0; width: 0"><img class="accessabilityTrailCls" src="' + images[i].src + '"></div>')
    }
    acessMouseTrail()
}
function acessMouseTrail() {  
    for (i = 0; i < images.length; i++) {  
        document.getElementById("obj" + i).style.top = storage[d]+'px' 
        document.getElementById("obj" + i).style.left = + storage[d+1]+'px' 
        d = d+2
    }
    for (i = storage.length; i >= 2; i--) {  
        storage[i] = storage[i-2]
    }
    d = 0 
    var timer = setTimeout("acessMouseTrail()",10)  
}
function acessProcessEvent(e) {   
    if (window.event) {  
        storage[0] = window.event.y+standardbody.scrollTop+10
        storage[1] = window.event.x+standardbody.scrollLeft+10
    } else {
        storage[0] = e.pageY+12
        storage[1] = e.pageX+12
    }
}

initMouseTrail() 
document.onmousemove = acessProcessEvent  
            