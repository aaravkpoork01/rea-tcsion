$(document).ready(function() {
	$(function () {
		  $('#remoteProctoringDiv').draggable({
		    handle: '#rp-handle',
		    containment: 'window',
		    scroll: false
		  });
		});
	const win = document.getElementById("remoteProctoringDiv");
	const remoteprocframe = document.getElementById("remoteProctoringFrame");
  const header = win.querySelector("#rp-handle");
  const resizeHandle = win.querySelector(".video-resize-handle");
  const minimizeBtn = win.querySelector(".minimizeBtn");
const maximizeBtn = win.querySelector(".maximizeBtn");
win.setAttribute("tabindex", "0");
win.focus();


  /* ---------------- Drag logic ---------------- */
  let isDragging = false;
  let dragX = 0, dragY = 0;

  header.addEventListener("mousedown", e => {
    isDragging = true;
    dragX = e.clientX - win.offsetLeft;
    dragY = e.clientY - win.offsetTop;
    win.focus();
  });

  document.addEventListener("mousemove", e => {
    if (!isDragging) return;
    moveWindow(e.clientX - dragX, e.clientY - dragY);
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
  });

  /* ---------------- Keyboard movement ---------------- */
  document.addEventListener("keydown", e => {
    const step = 10;
    let x = win.offsetLeft;
    let y = win.offsetTop;

    switch (e.key) {
      case "ArrowUp": y -= step; break;
      case "ArrowDown": y += step; break;
      case "ArrowLeft": x -= step; break;
      case "ArrowRight": x += step; break;
      default: return;
    }

    e.preventDefault();
    moveWindow(x, y);
  });

  function moveWindow(x, y) {
    const maxX = window.innerWidth - win.offsetWidth;
    const maxY = window.innerHeight - win.offsetHeight;

    win.style.left = Math.max(0, Math.min(x, maxX)) + "px";
    win.style.top = Math.max(0, Math.min(y, maxY)) + "px";
  }

  /* ---------------- Resize logic ---------------- */
  let isResizing = false;
  let startW, startH, startX, startY;

  resizeHandle.addEventListener("mousedown", e => {
	    isResizing = true;
	    startW = win.offsetWidth;
	    startH = win.offsetHeight;
	    startX = e.clientX;
	    startY = e.clientY;
	    e.stopPropagation();
	  });

  document.addEventListener("mousemove", e => {
    if (!isResizing) return;

    const minW = 200;
    const minH = 120;
    const maxResizeW = 600;
    const maxResizeH = 600;

    let newW = startW + (e.clientX - startX);
    let newH = startH + (e.clientY - startY);

    const maxW = Math.min(
      maxResizeW,
      window.innerWidth - win.offsetLeft
    );

    const maxH = Math.min(
      maxResizeH,
      window.innerHeight - win.offsetTop
    );

    win.style.width = Math.max(minW, Math.min(newW, maxW)) + "px";
    win.style.height = Math.max(minH, Math.min(newH, maxH)) + "px";
    remoteprocframe.style.width = Math.max(minW, Math.min(newW, maxW)) + "px";
    remoteprocframe.style.height = Math.max(minH, Math.min(newH, maxH)) + "px";
  });

  document.addEventListener("mouseup", () => {
    isResizing = false;
  });
/* Minimize */
let minimized = false;
let normalState = {};

minimizeBtn.addEventListener("click", () => {
  normalState = {
    left: win.offsetLeft,
    top: win.offsetTop,
    width: win.offsetWidth,
    height: win.offsetHeight
  };

  win.classList.add("minimized");
  win.style.top = 'unset';
  win.style.bottom = 0;
  win.style.left = '10%'

  minimized = true;
});

/* Maximize (restore / expand only) */
let expanded = false;
maximizeBtn.addEventListener("click", () => {
   win.classList.remove("minimized");
    Object.assign(win.style, {
      left: normalState.left + "px",
      top: normalState.top + "px",
      width: normalState.width + "px",
      height: normalState.height + "px"
    });
    minimized = false;
    return;
});
})

//this logic is for the static mock live feed in feedback.html file(because jquery draggable logic was not working in feeback.html file)
if(sessionStorage.livefeedforstaticmock === '1')
{
	var div;
	
	let isDragging = false;
	let offsetX = 0;
	let offsetY = 0;
	
	function onRemoteProctoringMouseDown(e) {
	    isDragging = true;
	
	    const rect = div.getBoundingClientRect();
	    offsetX = e.clientX - rect.left;
	    offsetY = e.clientY - rect.top;
	
	    e.preventDefault();
	}
	
	function onRemoteProctoringMouseMove(e) {
	    if (!isDragging) return;
	
	    let left = e.clientX - offsetX;
	    let top = e.clientY - offsetY;
	
	    const maxLeft = window.innerWidth - div.offsetWidth;
	    const maxTop = window.innerHeight - div.offsetHeight;
	
	    left = Math.max(0, Math.min(left, maxLeft));
	    top = Math.max(0, Math.min(top, maxTop));
	
	    div.style.left = left + "px";
	    div.style.top = top + "px";
	}
	
	function onRemoteProctoringMouseUp() {
	    isDragging = false;
	}
	
	function enableRemoteProctoringDrag(a) {
		div = a;
	    div.addEventListener("mousedown", onRemoteProctoringMouseDown, true);
	    document.addEventListener("mousemove", onRemoteProctoringMouseMove, true);
	    document.addEventListener("mouseup", onRemoteProctoringMouseUp, true);
	}
	//To unregister the listners when there is any issue in further code
	function disableRemoteProctoringDrag(a) {
		div = a;
	    div.removeEventListener("mousedown", onRemoteProctoringMouseDown, true);
	    document.removeEventListener("mousemove", onRemoteProctoringMouseMove, true);
	    document.removeEventListener("mouseup", onRemoteProctoringMouseUp, true);
	}
   }