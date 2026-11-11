var roof = null;
var roofPoints = [];
var lines = [];
var lineCounter = 0;
var mousePressed = false;
var isTextAreaDeselected = false;
var x = 0;
var y = 0;
var fabricCanvas = null;
var drawingMode = 'pencil';
var erasingMode = false;
var strokeWidth = 5;
var strokeColor = 'black';
var fillColor = 'transparent';
var fontSize = 18;
var eraserBrush = null;
var backgroundImageData = '';
var backgroundImg = '';
var backgroundOimg = '';
var isPolygon = false;
var isLineDrawing = false;
var isFullScreenMode = false;
var strokeDashArrayValue = 0;
var fontFamily = 'sans-serif';
var fontStyle = 'normal';
var lineWithArrow = null;
var isProtractorAndRulerInitiated = false;
var state;
//past states
var undo = [];
//reverted states
var redo = [];
var protractor = null;
var ruler = null;
var zoomLevel = 1;
var normalWidth;
var normalHeight;
var backgroundImageForCanvas = null;
var mathToolTypes = {
	"protractor": true,
	"ruler": true
};
var canvasTopTools = `<div class="canvas-top-tools">
<div class="addtional-colorset">
<div class="addtools-colorbox" title="Stroke Color">
    <input type="color" aria-label="Stroke Color" value="#000000" data-canvascolor="stroke">
</div>
<div class="addtools-colorbox fillColorInput" title="Fill Color">
    <input type="color" aria-label="Fill Color" value="#ffffff" data-canvascolor="fill"> 
</div>
<label class="label-checkboxradio transparentCheck">
    <span>Transparent</span>
    <input type="checkbox" class="canvas-checkbox" id="canvas_filltransparent" data-lines="arrow" name="lines">
</label>
<span class="canvas-divider"></span>
</div>
<div class="addtional-toolset">    
<div class="additional-tools additional-tools-pencil">
    <div class="addtools-group">
        <button type="button" aria-label="Default Pencil Size" data-pencildot="1">
            <svg class="canvas-icon canvas-ts6" aria-hidden="true"><use href="#ci_pointfilled"></use></svg>
        </button>
        <button type="button" aria-label="Medium Pencil Size" data-pencildot="3">
            <svg class="canvas-icon" aria-hidden="true"><use href="#ci_pointfilled"></use></svg>
        </button>
        <button type="button" aria-label="Large Pencil Size" data-pencildot="6">
            <svg class="canvas-icon canvas-ts15" aria-hidden="true"><use href="#ci_pointfilled"></use></svg>
        </button>
        <button type="button" aria-label="Extra Large Pencil Size" data-pencildot="9">
            <svg class="canvas-icon canvas-ts18" aria-hidden="true"><use href="#ci_pointfilled"></use></svg>
        </button>
    </div>
</div>
<div class="additional-tools additional-tools-eraser">
    <div class="addtools-group">
        <button type="button" aria-label="Default Eraser Size" data-eraserdot="10">
            <svg class="canvas-icon canvas-ts14" aria-hidden="true"><use href="#ci_pointfilled"></use></svg>
        </button>
        <button type="button" aria-label="Medium Eraser Size" data-eraserdot="15">
            <svg class="canvas-icon canvas-ts18" aria-hidden="true"><use href="#ci_pointfilled"></use></svg>
        </button>
        <button type="button" aria-label="Large Eraser Size" data-eraserdot="20">
            <svg class="canvas-icon canvas-ts22" aria-hidden="true"><use href="#ci_pointfilled"></use></svg>
        </button>
        <button type="button" aria-label="Extra Large Eraser Size" data-eraserdot="25">
            <svg class="canvas-icon canvas-ts26" aria-hidden="true"><use href="#ci_pointfilled"></use></svg>
        </button>
    </div>
</div>
<div class="additional-tools additional-tools-text">
    <div class="addtools-group">
        <label title="Italic">
            <input type="checkbox" name="italic" data-textproperty="italic">
            <svg class="canvas-icon" aria-hidden="true"><use href="#ci_italic"></use></svg>
        </label>
        <label title="Bold">
            <input type="checkbox" name="bold" data-textproperty="bold">
            <svg class="canvas-icon" aria-hidden="true"><use href="#ci_bold"></use></svg>
        </label>
    </div>
    <select class="canvas-select cvs-maxw-120" title="Font Family" data-fontstyle="family">
        <optgroup label="Sans Serif">
            <option value="Arial">Arial</option>
            <option value="Arial Black">Arial Black</option>
            <option value="Arial Narrow">Arial Narrow</option>
            <option value="Calibri">Calibri</option>
            <option value="Comic Sans MS">Comic Sans</option>
            <option value="Gill Sans">Gill Sans</option>
            <option selected="" value="Helvetica">Helvetica</option>
            <option value="Impact">Impact</option>
            <option value="Tahoma">Tahoma</option>
            <option value="Trebuchet MS">Trebuchet MS</option>
            <option value="Verdana">Verdana</option>
        </optgroup>
        <optgroup label="Serif">
            <option value="Baskerville">Baskerville</option>
            <option value="Garamond">Garamond</option>
            <option value="Georgia">Georgia</option>
            <option value="Hoefler Text">Hoefler Text</option>
            <option value="Lucida Bright">Lucida Bright</option>
            <option value="Palatino">Palatino</option>
            <option value="Times New Roman">Times New Roman</option>
        </optgroup>
        <optgroup label="Monospace">
            <option value="Consolas/Monaco">Consolas/Monaco</option>
            <option value="Courier New">Courier New</option>
            <option value="Lucida Sans Typewriter">Lucida Sans Typewriter</option>
        </optgroup>
        <optgroup label="Other">
            <option value="Copperplate">Copperplate</option>
            <option value="Papyrus">Papyrus</option>
            <option value="Script">Script</option>
        </optgroup>
    </select>
    <select class="canvas-select" title="Font Size" data-fontstyle="size">
        <option value="8">8px</option>
        <option value="10">10px</option>
        <option value="12">12px</option>
        <option value="14">14px</option>
        <option value="16">16px</option>
        <option value="18" selected="">18px</option>
        <option value="20">20px</option>
        <option value="24">24px</option>
        <option value="36">36px</option>
        <option value="48">48px</option>
        <option value="64">64px</option>
        <option value="72">72px</option>
        <option value="96">96px</option>
        <option value="144">144px</option>
        <option value="288">288px</option>
    </select>
    <span class="canvas-divider" aria-hidden="true"></span>
    <div class="addtools-group">
        <label title="Left">
            <input type="radio" name="alignment" data-textalign="left">
            <svg class="canvas-icon" aria-hidden="true"><use href="#ci_alignleft"></use></svg>
        </label>
        <label title="Center">
            <input type="radio" name="alignment" data-textalign="center">
            <svg class="canvas-icon" aria-hidden="true"><use href="#ci_aligncenter"></use></svg>
        </label>
        <label title="Right">
            <input type="radio" name="alignment" data-textalign="right">
            <svg class="canvas-icon" aria-hidden="true"><use href="#ci_alignright"></use></svg>
        </label>
    </div>
</div>
<div class="additional-tools additional-tools-shapes">
    <div class="addtools-group">
        <button type="button" aria-label="Triangle Shape" data-shapes="triangle">
            <svg class="canvas-icon canvas-ts12" aria-hidden="true"><use href="#ci_triangle"></use></svg>
        </button>
        <button type="button" aria-label="Rectangle Shape" data-shapes="rectangle">
            <svg class="canvas-icon canvas-ts14" aria-hidden="true"><use href="#ci_rectangle"></use></svg>
        </button>
        <button type="button" aria-label="Circle Shape" data-shapes="circle">
            <svg class="canvas-icon canvas-ts12" aria-hidden="true"><use href="#ci_circle2"></use></svg>
        </button>
        <button type="button" aria-label="Ellipse Shape" data-shapes="ellipse">
            <svg class="canvas-icon canvas-ts15" aria-hidden="true"><use href="#ci_oval"></use></svg>
        </button>
        <button type="button" aria-label="Polygon Shape" data-shapes="polygon">
            <svg class="canvas-icon canvas-ts12" aria-hidden="true"><use href="#ci_polygon"></use></svg>
        </button>
    </div>
    <div class="addtools-group">
    <button type="button" aria-label="Small Line Stroke" data-linestroke=3>
        <svg class="canvas-icon canvas-ts6" aria-hidden="true"><use href="#ci_pointfilled"></use></svg>
    </button>
    <button type="button" class="active" aria-label="Default Line Stroke" data-linestroke=5>
        <svg class="canvas-icon" aria-hidden="true"><use href="#ci_pointfilled"></use></svg>
    </button>
    <button type="button" aria-label="Medium Line Stroke" data-linestroke=6>
        <svg class="canvas-icon canvas-ts15" aria-hidden="true"><use href="#ci_pointfilled"></use></svg>
    </button>
    <button type="button" aria-label="Large Line Stroke" data-linestroke=7>
        <svg class="canvas-icon canvas-ts18" aria-hidden="true"><use href="#ci_pointfilled"></use></svg>
    </button>
</div>
</div>
<div class="additional-tools additional-tools-lines">
    <label class="label-checkboxradio">
        <input type="radio" class="canvas-radiobutton" name="lines" data-lines="straight" checked="">
        <span>Straight</span>
    </label>
    <label class="label-checkboxradio">
        <input type="radio" class="canvas-radiobutton" name="lines" data-lines="dotted">
        <span>Dotted</span>
    </label>
    <label class="label-checkboxradio">
        <input type="radio" class="canvas-radiobutton" name="lines" data-lines="dashed">
        <span>Dashed</span>
    </label>                    
    <label class="label-checkboxradio">
        <input type="checkbox" class="canvas-checkbox" data-lines="arrow" name="lines">
        <span>Arrow Line</span>
    </label>
    <div class="addtools-group">
    <button type="button" aria-label="Small Line Stroke" data-linestroke=3>
        <svg class="canvas-icon canvas-ts6" aria-hidden="true"><use href="#ci_pointfilled"></use></svg>
    </button>
    <button type="button" class="active" aria-label="Default Line Stroke" data-linestroke=5>
        <svg class="canvas-icon" aria-hidden="true"><use href="#ci_pointfilled"></use></svg>
    </button>
    <button type="button" aria-label="Medium Line Stroke" data-linestroke=6>
        <svg class="canvas-icon canvas-ts15" aria-hidden="true"><use href="#ci_pointfilled"></use></svg>
    </button>
    <button type="button" aria-label="Large Line Stroke" data-linestroke=7>
        <svg class="canvas-icon canvas-ts18" aria-hidden="true"><use href="#ci_pointfilled"></use></svg>
    </button>
    </div>
    <div class="addtools-group" style="display: none;">
        <button type="button" aria-label="Triangle Shape" data-lines="line">
            <svg class="canvas-icon canvas-ts13" aria-hidden="true"><use href="#ci_line"></use></svg>
        </button>
        <button type="button" aria-label="Rectangle Shape" data-lines="dotted">
            <svg class="canvas-icon canvas-ts12" aria-hidden="true"><use href="#ci_dotsline"></use></svg>
        </button>
        <button type="button" aria-label="Circle Shape" data-lines="dashed">
            <svg class="canvas-icon canvas-ts17" aria-hidden="true"><use href="#ci_dashedline"></use></svg>
        </button>
        <button type="button" aria-label="Circle Shape" data-lines="dashed">
            <svg class="canvas-icon canvas-ts11" aria-hidden="true"><use href="#ci_arrowline"></use></svg>
        </button>
    </div>
</div>
<div class="additional-tools additional-tools-ruler">
    <label class="label-checkboxradio">
        <input type="checkbox" class="canvas-checkbox" id="rulerDrag" name="rulerDrag" checked="checked">
        <span>Drag Ruler</span>
    </label>
    <!-- <label class="label-checkboxradio">
        <input type="radio" class="canvas-radiobutton" id="rulerDrag" name="rulerDrag">
        <span>Drag Ruler</span>
    </label> -->
</div>
<div class="additional-tools additional-tools-protractor">
    <label class="label-checkboxradio">
        <input type="checkbox" class="canvas-checkbox" id="protractorDrag" name="protractorDrag" checked="checked">
        <span>Drag Protractor</span>
    </label>																	
</div>
<div class="additional-tools additional-tools-drag">
<label class="label-checkboxradio">
    <input type="checkbox" class="canvas-checkbox" id="pan" name="pan">
    <span>Select Entire Canvas</span>
</label>																	
</div>
</div>            
<div class="canvas-top-right l1">
<div class="" style="display: flex; align-items: center; gap: 0 10px">
    <button type="button" class="ctt-button" data-toptoolname="undo" data-info="Undo">
        <svg class="canvas-icon" aria-hidden="true"><use href="#ci_undo"></use></svg>
    </button>
    <button type="button" class="ctt-button" data-toptoolname="reset" data-info="Reset">
        <svg class="canvas-icon" aria-hidden="true"><use href="#ci_refresh"></use></svg>
    </button>
    <button type="button" class="ctt-button" data-toptoolname="redo" data-info="Redo" disabled="">
        <svg class="canvas-icon" aria-hidden="true"><use href="#ci_redo"></use></svg>
    </button>
</div>
<button type="button" class="ctt-button" data-toptoolname="fullscreen" data-info="Full Screen">
    <svg class="canvas-icon hide-onfullscreen" aria-hidden="true"><use href="#ci_maximize"></use></svg>
    <svg class="canvas-icon show-onfullscreen" aria-hidden="true"><use href="#ci_minimize"></use></svg>
</button>
</div>
</div>`;
var canvasAsideTools = [
{
	  toolName:'pencil',
	  info:'Pencil',
	  svgRef:'#ci_pencil'
 },
 {
	  toolName:'eraser',
	  info:'Eraser',
	  svgRef:'#ci_eraser'
 },
 {
	  toolName:'text',
	  info:'Text',
	  svgRef:'#ci_text'
 },
 {
 	  toolName:'shapes',
 	  info:'Shapes',
 	  svgRef:'#ci_shape'
 },
 {
	  toolName:'lines',
	  info:'Lines',
	  svgRef:'#ci_line'
  },
  {
	  toolName:'ruler',
	  info:'Ruler',
	  svgRef:'#ci_ruler'
  },
  {
 	  toolName:'protractor',
 	  info:'Protractor',
 	  svgRef:'#ci_angle'
  },
  {
  	  toolName:'drag',
  	  info:'Drag',
  	  svgRef:'#ci_dragndrop'
  },
  {
  	  toolName:'delete',
  	  info:'Delete',
  	  svgRef:'#ci_delete'
  }
];
var canvasZoomTools = [
  {
	  toolName:'zoomout',
	  info:'Zoom Out',
	  svgRef:'#ci_zoomout'
  },
  {
	  toolName:'zoomreset',
	  info:'Zoom Reset',
	  svgRef:'#ci_zoomreset'
  },
  {
	  toolName:'zoomin',
	  info:'Zoom In',
	  svgRef:'#ci_zoomin'
  }
];


/*var canvasTopTools = [
   {
	   tagName:'div',
	   attrs : [
	     {
	    	 keyName:'class',
	    	 value:'addtional-colorset'
	     }
	   ],
	   innerTags : [
	     {
	    	 
	     }
	   ],
   },
   {
	   tagName:'div',
	   attrs : [
	     {
	    	 keyName:'class',
	    	 value:'addtional-toolset'
	     }
	   ],
   },
   {
	   tagName:'div',
	   attrs : [
	     {
	    	 keyName:'class',
	    	 value:'canvas-top-right l1'
	     }
	   ],
   }
];*/


var startXPositionRect = null;
var startYPositionRect = null;
var rulerSelected = false;
var protractorSelected = false;
function canvasSetWidthHeight(){
	var canvas = document.getElementById("drawingArea");
	canvas.width = $(".canvas-main-area").width();
	canvas.height = $(".canvas-main-area").height();
}

fabric.util.addListener(window,'dblclick', function(e){
	if(drawingMode=='polygon' || drawingMode=='polyline'){
		//drawingMode = "";;
        lines.forEach(function(value, index, ar){
        	fabricCanvas.remove(value);
        });
        //fabricCanvas.remove(lines[lineCounter - 1]);
        roof = makeRoof(roofPoints);
        fabricCanvas.add(roof);
        fabricCanvas.renderAll();
        isPolygon = false;
       //console.log("double click");
       //clear arrays
       roofPoints = [];
       lines = [];
       lineCounter = 0;
	}/*else if(drawingMode == 'line'){
		//drawingMode = "";;
        lines.forEach(function(value, index, ar){
        	fabricCanvas.remove(value);
        });
        //fabricCanvas.remove(lines[lineCounter - 1]);
        var pointer = fabricCanvas.getPointer(e);
        roofPoints.push(new Point(pointer.x,pointer.y));
        roof = makeRoofForLine(roofPoints);
        fabricCanvas.add(roof);
        fabricCanvas.renderAll();
        isPolygon = false;
       //console.log("double click");
       //clear arrays
       roofPoints = [];
       lines = [];
       lineCounter = 0;
		
	}*/
});
/*document.getElementById('file').addEventListener("change", function(e) {
	  var file = e.target.files[0];
	  var reader = new FileReader();
	  reader.onload = function(f) {
	    var data = f.target.result;
	    fabric.Image.fromURL(data, function(img) {
	      backgroundImageData = data;
	      backgroundImg = img;
	      var oImg = img.set({
	        left: 0,
	        top: 0,
	        angle: 00,
	        border: '#000',
	        stroke: '#F0F0F0', //<-- set this
	      //  strokeWidth: 40, //<-- set this
	        width:fabricCanvas.width,
	        height:fabricCanvas.height,
	        selectable:false
	      })//.scale(0.2);
	      //fabricCanvas.add(img);
	      backgroundOimg = oImg;
	      fabricCanvas.setBackgroundImage(oImg,fabricCanvas.renderAll.bind(canvas));
	      //var a = fabricCanvas.setActiveObject(oImg);
	      var dataURL = fabricCanvas.toDataURL({
	        format: 'png',
	        quality: 1
	      });
	    });
	  };
	  reader.readAsDataURL(file);
});*/
//custom rotate icon
var iconFile = "images/rotate.png";
var base64RotateIcon;
var readerForRotate = new FileReader();
readerForRotate.onload = function(e){
	base64RotateIcon = btoa(e.target.result);
}
//reader.readAsBinaryString(iconFile);
function renderIcon(ctx, left, top, styleOverride, fabricObject) {
	  var size = this.cornerSize;
	  ctx.save();
	  ctx.translate(left, top);
	  ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle));
	  ctx.drawImage(imgIcon, -size / 2, -size /2, size, size);
	  ctx.restore();
};
const svgRotateIcon = encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" style="margin:0; width:0; height:0; position: absolute;">

<svg id="ci_refresh" viewBox="0 0 24 24">
    <path d="M4.05,11a8,8,0,1,1,.5,4m-.5,5V15h5" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
</svg>

</svg>
`);
const rotateIcon = `data:image/svg+xml;utf8,${svgRotateIcon}`
const imgIcon = document.createElement('img');
imgIcon.src = rotateIcon;

fabric.Object.prototype.controls.mtr = new fabric.Control({
	  x: 0,
	  y: -0.5,
	  offsetX: 0,
	  offsetY: -40,
	  cursorStyle: 'crosshair',
	  actionHandler: fabric.controlsUtils.rotationWithSnapping,
	  actionName: 'rotate',
	  render: renderIcon,
	  cornerSize: 30,
	  withConnection: true
	});
//new object for line with arrow
fabric.LineArrow = fabric.util.createClass(fabric.Line, {
	
	  type: 'lineArrow',

	  initialize: function(element, options) {
	    options || (options = {});
	    this.callSuper('initialize', element, options);
	  },

	  toObject: function() {
	    return fabric.util.object.extend(this.callSuper('toObject'));
	  },

	  _render: function(ctx) {
	    this.callSuper('_render', ctx);

	    // do not render if width/height are zeros or object is not visible
	    if (this.width === 0 || this.height === 0 || !this.visible) return;

	    ctx.save();

	    var xDiff = this.x2 - this.x1;
	    var yDiff = this.y2 - this.y1;
	    var angle = Math.atan2(yDiff, xDiff);
	    ctx.translate((this.x2 - this.x1) / 2, (this.y2 - this.y1) / 2);
	    ctx.rotate(angle);
	    ctx.beginPath();
	    //move 10px in front of line to start the arrow so it does not have the square line end showing in front (0,0)
	    ctx.moveTo(10, 0);
	    ctx.lineTo(-20, 15);
	    ctx.lineTo(-20, -15);
	    ctx.closePath();
	    ctx.fillStyle = this.stroke;
	    ctx.fill();

	    ctx.restore();

	  }
});
fabric.LineArrow.fromObject = function(object, callback) {
	callback && callback(new fabric.LineArrow([object.x1, object.y1, object.x2, object.y2], object));
};

var LineWithArrow = fabric.util.createClass(fabric.Line, {
	type:'lineWithArrow',
    initialize: function(points,options) {
        options || (options = {});
        //console.log('hi')
        this.callSuper('initialize',points, options);
 
        this.set({
           /* x1: options.x1 || 0,
            y1: options.y1 || 0,
            x2: options.x2 || 0,
            y2: options.y2 || 0,*/
            arrowLength: options.arrowLength || 10,
            arrowWidth:options.arrowWidth || 10,
            dashPattern :options.dashPattern
            //arrowAngle: options.arrowAngle || 30,
            /*fill: options.fill || 'black',
            stroke: options.stroke || 'black',
            strokeWidth: options.strokeWidth || 2,
            dashPattern :options.dashPattern || []*/
        });
    },
 
    _render: function(ctx) {
    	//console.log(this.points);
    	this.callSuper('_render',ctx);
    	var p = this.calcLinePoints();
    	/*var x1 = this.x1,
    		y1 = this.y1,
    		x2 = this.x2,
    		y2 = this.y2,
    		length = Math.sqrt(Math.pow(x2-x1,2)+Math.pow(y2-y1,2)),
    		angle = Math.atan2(y2-y1,x2-x1);*/
    	//console.log(p);
    	var x1 = p.x1,
		y1 = p.y1,
		x2 = p.x2,
		y2 = p.y2;
    	//console.log(this.arrowLength + " arrow Length");
		var length = Math.sqrt(Math.pow(x2-x1,2)+Math.pow(y2-y1,2));
		var angle = Math.atan2(y2-y1,x2-x1)
    	
		var arrowX1 = x2 - Math.cos(angle - Math.PI/6)*this.arrowLength;
    	var arrowY1 = y2 - Math.sin(angle - Math.PI/6)*this.arrowLength;
    	
    	var startX = x2 - Math.cos(angle) * this.arrowLength;
    	var startY = y2 - Math.sin(angle) * this.arrowLength;
    	
    	var arrowX2 = x2 - Math.cos(angle + Math.PI/6)*this.arrowLength;
    	var arrowY2 = y2 - Math.sin(angle + Math.PI/6)*this.arrowLength;
    	
    	var xDiff = x2 - x1;
	    var yDiff = y2 - y1;
	    var angle = Math.atan2(yDiff, xDiff);
	    ctx.translate((this.x2 - this.x1) / 2, (this.y2 - this.y1) / 2);
	    ctx.rotate(angle);
	    ctx.beginPath();
	    //move 10px in front of line to start the arrow so it does not have the square line end showing in front (0,0)
	    ctx.moveTo(strokeWidth, 0);
	    ctx.lineTo(-strokeWidth,strokeWidth);
	    ctx.lineTo(-strokeWidth, -strokeWidth);
	    ctx.closePath();
	    ctx.fillStyle = this.stroke;
	    ctx.fill();
	    ctx.restore();
    },
});
fabric.LineWithArrow = LineWithArrow;
fabric.LineWithArrow.fromObject = function(object, callback) {
	callback && callback(new fabric.LineWithArrow([object.x1, object.y1, object.x2, object.y2], object));
};
function createCanvasDivs(){
	var mainContainer = '<div class="canvas-wrapper">';
	var asideTools = '<div class="canvas-aside-tools">';
	for(var toolsItr=0;toolsItr<canvasAsideTools.length;toolsItr++){
		asideTools += '<button type="button" class="cat-button" data-asidetoolname="'+canvasAsideTools[toolsItr].toolName+'" data-info="'+canvasAsideTools[toolsItr].info+'" aria-label="'+canvasAsideTools[toolsItr].info+'">';
		asideTools += '<svg class="canvas-icon" aria-hidden="true"><use href="'+canvasAsideTools[toolsItr].svgRef+'"></use></svg>';
		asideTools += '</button>'
	}
	asideTools += '</div>';
	
	mainContainer += asideTools;
	mainContainer += canvasTopTools;
	
	var mainArea = '<div class="canvas-main-area">';
    mainArea += '<canvas id="drawingArea" class="drawingArea'+mockVar.curQuesBean.quesId+'" height="650" width="794"></canvas>'
    mainArea +=  '</div>';
    
    mainContainer += mainArea;
    
    var zoomoomTools = '<div class="canvas-zoom-tools">';
	for(var toolsItr=0;toolsItr<canvasZoomTools.length;toolsItr++){
		zoomoomTools += '<button type="button" class="czt-button" data-zoomtoolname="'+canvasZoomTools[toolsItr].toolName+'" data-info="'+canvasZoomTools[toolsItr].info+'" aria-label="'+canvasZoomTools[toolsItr].info+'">';
		zoomoomTools += '<svg class="canvas-icon" aria-hidden="true"><use href="'+canvasZoomTools[toolsItr].svgRef+'"></use></svg>';
		zoomoomTools += '</button>'
	}
	zoomoomTools += '</div>';
	
	mainContainer += zoomoomTools;
	mainContainer += '</div>';
	
	var zoomoomTools1='<div class="canvas-comment-box" >';
	zoomoomTools1+='<span class="canvasCommentBox" style="display:block;display:none;">Explanation(Optional):</span>';
	zoomoomTools1+='<textarea data-gramm="false" data-gramm_editor="false" class="canvasCommentBox" style="resize:none;display:none;" onkeyup="alphaWordLimitForMessage(this);" onkeydown="alphaWordLimitForMessage(this);" id="canvasCommentBox'+mockVar.curQuesBean.quesId+'" rows="10" cols="60" onchange="saveFileUploadMessage(this,'+mockVar.curQuesBean.quesId+');"></textarea>';
	
	zoomoomTools1+='</div>';
	mainContainer+=zoomoomTools1;
	
	return mainContainer;
}

function onLoadFabricCanvas(){

	/* */ 
	canvasSetWidthHeight();

	if(!isProtractorAndRulerInitiated){
		isProtractorAndRulerInitiated = true;
		/*canvasProtractor();
		canvasRuler();*/
	}
	initializeCanvasData();

	fabricCanvas = new fabric.Canvas('drawingArea');
	if(mockVar.curQuesBean.canvasBackgroundImage!=undefined && mockVar.curQuesBean.canvasBackgroundImage!=null && mockVar.curQuesBean.canvasBackgroundImage!="")
		addBackgroundImage(mockVar.curQuesBean.canvasBackgroundImage);
	//Set default brush properties
	fabricCanvas.freeDrawingBrush.fontSize = 18;
	fabricCanvas.freeDrawingBrush.color = 'black';
	fabricCanvas.freeDrawingBrush.width = 1;
	//eraserBrush = new fabric.EraserBrush(fabricCanvas,{eraser:false});
	eraserBrush = new fabric.EraserBrush(fabricCanvas);
	//Event listener for canvas drawing
	fabricCanvas.on({
		'object:moving' : onMoving,
		'selection:updated' : onSelection,
		'selection:created' : onSelection,
	});

	fabricCanvas.on('mouse:down', function(event) {
		
		if (drawingMode == 'text') {
			/*if (!isTextAreaDeselected ) {
				//console.log(event);
				isTextAreaDeselected = true;
				fabricCanvas.discardActiveObject().renderAll();
				return false;
			}*/
			if (!isTextAreaDeselected && (fabricCanvas.getActiveObject() != event.target || event.target == null)) {
				//console.log(event);
				isTextAreaDeselected = true;
				fabricCanvas.discardActiveObject().renderAll();
				return false;
			}else if(!isTextAreaDeselected && fabricCanvas.getActiveObject()!= null && fabricCanvas.getActiveObject() == event.target)
				return true;
		}

		//console.log("down");
		mousePressed = true;
		if (drawingMode === 'eraser') {
			erasingMode = true;
			return;
		}
		//fabricCanvas.isDrawingMode = false;
		var pointer = fabricCanvas.getPointer(event.e);
		if (drawingMode == 'pencil') {
			fabricCanvas.freeDrawingBrush.color = strokeColor;
			// break;
		} 
		else if (drawingMode === 'triangle') {
			startXPositionRect = pointer.x;
			startYPositionRect = pointer.y;
			var tri = new fabric.Triangle({
				left: pointer.x,
				top: pointer.y,
				width: 0,
				height: 0,
				stroke: strokeColor,
				strokeWidth: strokeWidth,
				fill: fillColor
			});
			fabricCanvas.add(tri);
			fabricCanvas.setActiveObject(tri);
			saveUndoRedoCanvas();
		}
		else if (drawingMode === 'rectangle') {
			startXPositionRect = pointer.x;
			startYPositionRect = pointer.y;
			var rect = new fabric.Rect({
				left : pointer.x,
				top : pointer.y,
				width : 0,
				height : 0,
				stroke : strokeColor,
				strokeWidth : strokeWidth,
				fill : fillColor
			});
			fabricCanvas.add(rect);
			fabricCanvas.setActiveObject(rect);
			saveUndoRedoCanvas();
		}
		else if(drawingMode === 'ellipse'){
			startXPositionRect = pointer.x;
			startYPositionRect = pointer.y;
			var shape = new fabric.Ellipse({
				left : pointer.x,
				top : pointer.y,
				rx : 0,
				ry : 0,
				stroke : strokeColor,
				strokeWidth : strokeWidth,
				fill : fillColor
			});
			fabricCanvas.add(shape);
			fabricCanvas.setActiveObject(shape);
			// save();
			saveUndoRedoCanvas();
		} 
		else if (drawingMode === 'circle') {
			startXPositionRect = pointer.x;
			startYPositionRect = pointer.y;
			var circle = new fabric.Circle({
				left: pointer.x,
				top: pointer.y,
				radius: 1,
				stroke: strokeColor,
				strokeWidth: strokeWidth,
				fill: fillColor
			});
			fabricCanvas.add(circle);
			fabricCanvas.setActiveObject(circle);
			saveUndoRedoCanvas();
		} 
		else if (drawingMode === 'text') {
			var text = new fabric.IText('Enter your text here...', {
				left : pointer.x,
				top : pointer.y,
				fontSize : fontSize,
				fill : strokeColor,
				fontFamily:fontFamily,
				fontStyle :fontStyle
			});
			fabricCanvas.add(text);
			fabricCanvas.setActiveObject(text);
			text.enterEditing();
			text.selectAll();
			isTextAreaDeselected = false
			saveUndoRedoCanvas();
			text.on("editing:exited",function(){
				text.editable = false;
				//console.log("text editing completed");
			})
		} 
		else if (drawingMode == "polygon" || drawingMode=='polyline') {
			fabricCanvas.selection = false;
			setStartingPoint(event); // set x,y
			roofPoints.push(new Point(x, y));
			var points = [ x, y, x, y ];
			lines.push(new fabric.Line(points, {
				strokeWidth : strokeWidth,
				selectable : false,
				stroke : strokeColor,
			})/*.set({
				originX : 'center',
				originY : 'center'
			})*/);
			fabricCanvas.add(lines[lineCounter]);
			lineCounter++;
			//fabricCanvas.add(lines[lineCounter]);
			//fabricCanvas.renderAll();
			/*  fabricCanvas.on('mouse:up', function (options) {
			    fabricCanvas.selection = true;
			});*/
		}
		else if (drawingMode == "line") {
			if(!isLineDrawing) {
				isLineDrawing = true
				fabricCanvas.selection = false;
				setStartingPoint(event); // set x,y
				roofPoints.push(new Point(x, y));
				var points = [ x, y, x, y ];
				lines.push(new fabric.Line(points, {
					strokeWidth : strokeWidth,
					strokeDashArray: [strokeDashArrayValue, strokeDashArrayValue],
					selectable : false,
					stroke : strokeColor,
					arrowLength:20,
					arrowWidth:10
		
				})/*.set({
					originX : 'center',
					originY : 'center'
				})*/);
				fabricCanvas.add(lines[lineCounter]);
				lineCounter++;
			}else{
				//drawingMode = "";;
		        lines.forEach(function(value, index, ar){
		        	fabricCanvas.remove(value);
		        });
		        //fabricCanvas.remove(lines[lineCounter - 1]);
		        //var pointer = fabricCanvas.getPointer(e);
		        //roofPoints.push(new Point(pointer.x,pointer.y));
		        roof = makeRoofForLine([roofPoints[0].x,roofPoints[0].y,pointer.x,pointer.y]);
		        fabricCanvas.add(roof);
		        fabricCanvas.renderAll();
		        isPolygon = false;
		       //console.log("double click");
		       //clear arrays
				roofPoints = [];
				lines = [];
				lineCounter = 0;
			    isLineDrawing =false;
			}
		}
		else if(drawingMode =='eraser'){
			fabricCanvas.isDrawingMode = true;
			//eraserBrush.onMouseDown(event);
		}
		else if(drawingMode == 'point'){
		    addCrossPoint(pointer.x, pointer.y); // Add cross point to canvas
		}
		canvasClear = false;
		stopSelectionOfObjects();
	});

	fabricCanvas.on('mouse:move', function(event) {
		if (mousePressed) {
			if (drawingMode === 'triangle' || drawingMode === 'rectangle' || drawingMode === 'circle' || drawingMode === 'ellipse') {
				if (fabricCanvas.getActiveObject()) {
					var pointer = fabricCanvas.getPointer(event.e);
					var activeObject = fabricCanvas.getActiveObject();
					if (drawingMode === 'triangle') {
						var left = Math.min(startXPositionRect,pointer.x);
						var top = Math.min(startYPositionRect,pointer.y);
						activeObject.set({
							left: left,
							top: top,
							width: Math.abs(startXPositionRect-pointer.x),
							height: Math.abs(startYPositionRect-pointer.y)
						});
						activeObject.setCoords();
					} 
					else if (drawingMode === 'rectangle') {
						var left = Math.min(startXPositionRect,pointer.x);
						var top = Math.min(startYPositionRect,pointer.y);
						activeObject.set({
							left: left,
							top: top,
							width: Math.abs(startXPositionRect-pointer.x),
							height: Math.abs(startYPositionRect-pointer.y)
							//width : pointer.x - activeObject.left,
							//height : pointer.y - activeObject.top
						});
						activeObject.setCoords();
					} 
					else if (drawingMode === 'ellipse') {
						var rx = Math.abs(startXPositionRect-pointer.x)/2;
						var ry = Math.abs(startYPositionRect-pointer.y)/2;
						var top,left;
						activeObject.set({
							/*left:left,
							top:top,*/
							rx:rx,
							ry:ry
							//width : pointer.x - activeObject.left,
							//height : pointer.y - activeObject.top
						});
						if(startXPositionRect>pointer.x){
							activeObject.set({
								left:startXPositionRect-rx
							});
						}
						if(startYPositionRect>pointer.y){
							activeObject.set({
								top:startYPositionRect-ry
							});
						}
						activeObject.setCoords();	
						/*
						activeObject.set({
							width : pointer.x - activeObject.left,
							height : pointer.y - activeObject.top
						});
						*/
					}
					else if (drawingMode === 'circle') {
						var dx = pointer.x - activeObject.left;
						var dy = pointer.y - activeObject.top;
						// var radius = Math.sqrt(dx * dx + dy * dy);
						var radius = Math.sqrt(dx/2 * dy/2);
						activeObject.set({
							radius : radius
						});
					}
					fabricCanvas.renderAll();
					//  saveUndoRedoCanvas();
				}
			}
			else if(drawingMode == 'pan'){
				/*var pointer = fabricCanvas.getPointer(event.e);
				var offsetDragX = pointer.x-startXPositionRect;
				var offsetDragY = pointer.y-startYPositionRect;
				fabricCanvas.relativePan({'x':offsetDragX,'y':offsetDragY});
				startXPositionRect = offsetDragX;
				startYPositionRect = offsetDragY*/
				if (event && event.e) {
					//debugger;
					var units = 10;
					var delta = new fabric.Point(event.e.movementX, event.e.movementY);
					fabricCanvas.relativePan(delta);
				}	
			}
		}
		else if(drawingMode == 'eraser'){
			//console.log(fabricCanvas.getActiveObject());	  
			//fabricCanvas.setBackgroundImage(backgroundImageData,fabricCanvas.renderAll.bind(canvas));
			//eraserBrush.onMouseMove(event)
		}
		/*else if(drawingMode == "line"){
			if(lineWithArrow!=null){
				var pointer = fabricCanvas.getPointer(event.e);
				lineWithArrow.set({x2:pointer.x,y2:pointer.y});
				fabricCanvas.renderAll();
			}
		}*/
		if (lines[0] !== null && lines[0] !== undefined && (drawingMode == "polygon"  || drawingMode=='polyline' || drawingMode == "line")) {
			setStartingPoint(event);
			lines[lineCounter - 1].set({
				x2 : x,
				y2 : y
			});
			fabricCanvas.renderAll();
		}
	});


	fabricCanvas.on('mouse:up', function(event) {
		//console.log("up");
		//  if(drawingMode =='text')

		if (drawingMode != 'drag' && drawingMode != 'text' && !mathToolTypes[drawingMode]) {
			fabricCanvas.discardActiveObject().renderAll()
		}
		mousePressed = false;
		if (drawingMode === 'eraser') {
			erasingMode = false;
			return;
		}
		/*else if (drawingMode === 'pencil') {
			//fabricCanvas.isDrawingMode = false;
		}*/
		else if (drawingMode === 'pencil') {
			// fabricCanvas.freeDrawingBrush = new fabric.PencilBrush(fabricCanvas);
			// fabricCanvas.isDrawingMode = true;
			// fabricCanvas.freeDrawingBrush.color = strokeColor;
			//fabricCanvas.freeDrawingBrush.width = 1; //RA
		}
		else if (drawingMode == "polygon" || drawingMode=='polyline' || drawingMode =="line") {
			fabricCanvas.selection = true;
		}
		else{
			//eraserBrush.onMouseUp(event)
		}
		saveUndoRedoCanvas();
	});
	fabricCanvas.on('mouse:leave', function(event) {
		//console.log("leave");
		mousePressed = false;
		saveUndoRedoCanvas();
		if (drawingMode === 'pencil') {
			fabricCanvas.isDrawingMode = true;
			fabricCanvas.freeDrawingBrush = new fabric.PencilBrush(fabricCanvas);
			fabricCanvas.freeDrawingBrush.color = strokeColor;
			fabricCanvas.isDrawingMode = true;
		}
		if (drawingMode != 'drag') {
			fabricCanvas.deactivateAll().renderAll();
		}
	});
	fabricCanvas.on('object:modified', function() {
		saveUndoRedoCanvas();
	});
	$('[data-toptoolname="undo"]').prop('disabled', true);
	$('[data-toptoolname="redo"]').prop('disabled', true);
	 try{
		 if(canvasBGColor!=''){
			 fabricCanvas.setBackgroundColor(canvasBGColor);
			 fabricCanvas.renderAll();
		 }
     }catch(e){
     	
     }
	saveUndoRedoCanvas();
}




$(document).on('click' ,".canvasBtns", function(e) {
	$(".additionalTools").hide();
});
$(document).on('click','#protractorDrag',function(e){
	fabricCanvas.remove(protractor);
	if (document.getElementById("protractorDrag").checked) {
		protractor.selectable = true;
	}else {
		protractor.selectable = false;
	}
	fabricCanvas.add(protractor);
	//fabricCanvas.renderAll();
});
$(document).on('click','#pan',function(e){
	
	if (document.getElementById("pan").checked) {
		drawingMode = 'pan';
	}else {
		drawingMode = 'drag';
		erasingMode = false;
		disableDrawingMode();
		isPolygon = false;
		for(var i=0;i<fabricCanvas.getObjects().length;i++){
			fabricCanvas.getObjects()[i].lockMovementX = false;
			fabricCanvas.getObjects()[i].lockMovementY = false;
			fabricCanvas.getObjects()[i].selectable = true;
		}
	}
	
	//fabricCanvas.renderAll();
});
$(document).on('click','#rulerDrag',function(e){
	fabricCanvas.remove(ruler);
	if (document.getElementById("rulerDrag").checked) {
		ruler.selectable = true;
	}else {
		ruler.selectable = false;
	}
	fabricCanvas.add(ruler);
	//fabricCanvas.renderAll();
});





/* Start | Aside Tools */ 
//Event listeners for tool buttons
$(document).on("click" ,"[data-asidetoolname]", function(e) {
	var aside_toolname = $(this).attr('data-asidetoolname');
	 
	 if(/*aside_toolname!="protractor" && aside_toolname!="ruler" &&*/ aside_toolname!="delete"){
		 $("[data-asidetoolname]").not(this).removeClass('active');
		 $(this).toggleClass('active');
	 }
	 if(aside_toolname!="protractor") 
		 protractorSelected = false;
	 if(aside_toolname!="ruler")
		 rulerSelected = false;
	 /*if(protractorSelected && aside_toolname!="protractor"){
		 $("[data-asidetoolname=protractor]").removeClass('active');
		 $("[data-asidetoolname=protractor]").addClass('active');
	 }
	 if(rulerSelected && aside_toolname!="ruler"){
		 $("[data-asidetoolname=ruler]").removeClass('active');
		 $("[data-asidetoolname=ruler]").addClass('active');
	 }*/
	 $(".transparentCheck").show();
	 $(".fillColorInput").show();
	/*Pencil Tool*/ 
	if(aside_toolname == "pencil"){
		drawingMode = 'pencil';
		erasingMode = false;
		isPolygon = false;
		fabricCanvas.isDrawingMode = true;
		fabricCanvas.freeDrawingBrush = new fabric.PencilBrush(fabricCanvas);
		fabricCanvas.freeDrawingBrush.color = strokeColor;
		$(".additional-tools").removeClass('active');
		$(".additional-tools-pencil").addClass('active');
		$(".addtional-colorset").addClass('active');
		$(".transparentCheck").hide();
		$(".fillColorInput").hide();
	}

	/*Eraser Tool*/ 
	if(aside_toolname == "eraser"){
		drawingMode = 'eraser';
		erasingMode = true;
		isPolygon = false;
		//  same as `PencilBrush`
		//fabricCanvas.freeDrawingBrush = new fabric.EraserBrush(canvas);
		fabricCanvas.isDrawingMode = true;
		fabricCanvas.freeDrawingBrush = eraserBrush;
		//  optional
		fabricCanvas.freeDrawingBrush.width = 10;
		//fabricCanvas.freeDrawingBrush.color = 'rgba(0,0,0,0)';
		//fabricCanvas.freeDrawingBrush.globalCompositeOperation = 'destination-out'
		//  undo erasing
		//fabricCanvas.freeDrawingBrush.inverted = true;
		//disableDrawingMode();
		//erasingMode();
		$(".additional-tools").removeClass('active');
		$(".additional-tools-eraser").addClass('active');
		$(".addtional-colorset").removeClass('active');
	}

	/*Text Tool*/ 
	if(aside_toolname == "text"){
		drawingMode = 'text';
		erasingMode = false;
		disableDrawingMode();
		isTextAreaDeselected = true;
		isPolygon = false;
		fabricCanvas.freeDrawingBrush.fontSize = 20;

		$(".additional-tools").removeClass('active');
		$(".additional-tools-text").addClass('active');
		$(".addtional-colorset").addClass('active');
	}

	if(aside_toolname == "shapes"){
		if($("[data-shapes].active")[0]!= undefined && $($("[data-shapes].active")[0]).attr("data-shapes")!=undefined)
			drawingMode = $($("[data-shapes].active")[0]).attr("data-shapes");
		else
			drawingMode = "";
		$(".additional-tools").removeClass('active');
		$(".additional-tools-shapes").addClass('active');
		$(".addtional-colorset").addClass('active');
	}

	if(aside_toolname == "lines"){
		isPolygon = true;
		if (drawingMode == "line") {
			drawingMode = "";
			lines.forEach(function(value, index, ar){
				fabricCanvas.remove(value);
			});
			//fabricCanvas.remove(lines[lineCounter - 1]);
			roof = makeRoofForLine(roofPoints);
			fabricCanvas.add(roof);
			fabricCanvas.renderAll();
			isPolygon = false;
		} else {
			drawingMode = "line"; // roof type
			disableDrawingMode();
		}

		$(".additional-tools").removeClass('active');
		$(".additional-tools-lines").addClass('active');
		$(".addtional-colorset").addClass('active');
	}

	/*Ruler Tool*/ 
	if(aside_toolname == "ruler"){
		// addProtractorToCanvas();
		if(!rulerSelected){
			
			$(".additional-tools").removeClass('active');
			$(".additional-tools-ruler").addClass('active');
			$(".addtional-colorset").removeClass('active');
		}else{
			
			$(".additional-tools").removeClass('active');
			$(".additional-tools-ruler").removeClass('active');
			$(".addtional-colorset").removeClass('active');
		}
		addRulerToCanvas();
		//rulerSelected = !rulerSelected;
		

		
	}

	/*protractor Tool*/ 
	if(aside_toolname == "protractor"){
		
		if(!protractorSelected){
			
			$(".additional-tools").removeClass('active');
			$(".additional-tools-protractor").addClass('active');
			$(".addtional-colorset").removeClass('active');
		}else{
			$(".additional-tools").removeClass('active');
			$(".additional-tools-protractor").removeClass('active');
			$(".addtional-colorset").removeClass('active');
		}
		addProtractorToCanvas();
	}

	/*Drag Tool*/ 
	if(aside_toolname == "drag"){
		if(drawingMode != "drag"){
			drawingMode = 'drag';
			$(".additional-tools").removeClass('active');
			$(".additional-tools-drag").addClass('active');
			$(".addtional-colorset").removeClass('active');
		}
		else
			drawingMode = "";
		erasingMode = false;
		disableDrawingMode();
		isPolygon = false;
		for(var i=0;i<fabricCanvas.getObjects().length;i++){
			if(fabricCanvas.getObjects()[i].subType!="question"){
				fabricCanvas.getObjects()[i].lockMovementX = false;
				fabricCanvas.getObjects()[i].lockMovementY = false;
				fabricCanvas.getObjects()[i].selectable = true;
			}
		}
	}

	/*Delete Tool*/
	if(aside_toolname == "delete"){
		isPolygon = false;
		if(fabricCanvas.getActiveObject()){
			if(fabricCanvas.getActiveObject().subType == 'protractor'){
				 $("[data-asidetoolname=protractor]").removeClass('active');
			}
			if(fabricCanvas.getActiveObject().subType == 'ruler'){
				$("[data-asidetoolname=ruler]").removeClass('active');
			}
			fabricCanvas.remove(fabricCanvas.getActiveObject());
		}
	} 
});


/* Start | Top Tools */
$(document).on("click" ,"[data-toptoolname]", function(e) {
	var _this = $(this);
	var top_toolname = _this.attr('data-toptoolname');

	/*Undo Tool*/ 
	if(top_toolname == "undo"){
		replay(undo, redo, '[data-toptoolname="redo"]', this);
	}
	/*Redo Tool*/ 
	if(top_toolname == "redo"){
		replay(redo, undo, '[data-toptoolname="undo"]', this);
	}
	if(top_toolname == "reset"){
		clearCanvasContent();
	}
	if(top_toolname == "fullscreen"){
		if(!isFullScreenMode){
			isFullScreenMode = true;
			canvasToggleFullScreen(_this);
		}else{
			isFullScreenMode = false;
			canvasToggleFullScreen(_this);
		}
	}
});


$(document).on("click" ,"[data-pencildot]", function(e) {
	var dotsize = $(this).attr('data-pencildot');
	drawingMode = 'pencil';
	erasingMode = false;
	isPolygon = false;
	fabricCanvas.freeDrawingBrush = new fabric.PencilBrush(fabricCanvas);
	fabricCanvas.isDrawingMode = true;
	fabricCanvas.freeDrawingBrush.color = strokeColor;
	fabricCanvas.freeDrawingBrush.width = Number(dotsize);
});
$(document).on("click" ,"[data-linestroke]", function(e) {
	strokeWidth = parseInt($(this).attr('data-linestroke'));
	$("[data-linestroke]").removeClass("active");
	$("[data-linestroke="+strokeWidth+"]").addClass("active");
	/*drawingMode = 'line';
	erasingMode = false;
	isPolygon = false;*/
	/*fabricCanvas.freeDrawingBrush = new fabric.PencilBrush(fabricCanvas);
	fabricCanvas.isDrawingMode = true;
	fabricCanvas.freeDrawingBrush.color = strokeColor;*/
	/*fabricCanvas.freeDrawingBrush.width = Number(dotsize);*/
});

/*Start | Eraser Addtional Tools */ 
$(document).on("click" ,"[data-eraserdot]", function(e) {
	var dotsize = $(this).attr('data-eraserdot');
	drawingMode = 'eraser';
	erasingMode = true;
	isPolygon = false;
	fabricCanvas.isDrawingMode = true;
	fabricCanvas.freeDrawingBrush = eraserBrush;
	fabricCanvas.freeDrawingBrush.width = Number(dotsize);
	// fabricCanvas.get('backgroundImage')?.set({ erasable: true });
	fabricCanvas.renderAll();
})
		



$(document).on("click" ,"[data-zoomtoolname]", function(e) {
	var _this = $(this);
	var zoom_toolname = _this.attr('data-zoomtoolname');
	if(zoom_toolname == "zoomout"){
		zoomOut();
	}
	if(zoom_toolname == "zoomreset"){
		resetZoom();
	}
	if(zoom_toolname == "zoomin"){
		zoomIn();
	}
});


$(document).on('click' ,"#clearCanvas", function(e) {
	// clearCanvasContent();
});

$(document).on('click' ,"#canvasPolygon", function(e) {
	isPolygon = true;
    if (drawingMode == "polygon") {
        drawingMode = "";
        lines.forEach(function(value, index, ar){
             fabricCanvas.remove(value);
        });
        //fabricCanvas.remove(lines[lineCounter - 1]);
        roof = makeRoof(roofPoints);
        fabricCanvas.add(roof);
        fabricCanvas.renderAll();
        isPolygon = false;
    } else {
      drawingMode = "polygon"; // roof type
      disableDrawingMode();
    }
});
$(document).on('click' ,"#canvasPolyline", function(e) {
	isPolygon = false;
    if (drawingMode == "polyline") {
        drawingMode = "";
        lines.forEach(function(value, index, ar){
             fabricCanvas.remove(value);
        });
        //fabricCanvas.remove(lines[lineCounter - 1]);
        roof = makeRoof(roofPoints);
        fabricCanvas.add(roof);
        fabricCanvas.renderAll();
    } else {
      drawingMode = "polyline"; // roof type
      disableDrawingMode();
    }
});
$(document).on('click' ,"#canvasLine", function(e) {
	isPolygon = true;
	$(".additionalTools").hide();
	$(".additionalToolsLine").show();
    if (drawingMode == "line") {
        drawingMode = "";
        lines.forEach(function(value, index, ar){
             fabricCanvas.remove(value);
        });
        //fabricCanvas.remove(lines[lineCounter - 1]);
        roof = makeRoofForLine(roofPoints);
        fabricCanvas.add(roof);
        fabricCanvas.renderAll();
        isPolygon = false;
    } else {
      drawingMode = "line"; // roof type
      disableDrawingMode();
    }
});


$(document).on("click" ,"[data-shapes]", function(e) {
	var _this = $(this);
	 $("[data-shapes]").removeClass('active');
	 _this.addClass('active');
	var shapes = _this.attr('data-shapes');
	if(shapes == "triangle"){
		drawingMode = 'triangle';
		erasingMode = false;
		isPolygon = false;
		disableDrawingMode();
	}
	if(shapes == "rectangle"){
		drawingMode = 'rectangle';
		erasingMode = false;
		isPolygon = false;
		disableDrawingMode();
	}
	if(shapes == "circle"){
		drawingMode = 'circle';
		erasingMode = false;
		isPolygon = false;
		disableDrawingMode();
	}
	if(shapes == "ellipse"){
		drawingMode = 'ellipse';
		erasingMode = false;
		isPolygon = false;
		disableDrawingMode();
	}
	if(shapes == "polygon"){
		drawingMode = 'polygon';
		erasingMode = false;
		isPolygon = false;
		disableDrawingMode();
	}
});


// $(document).on("input" ,"[data-pencilcolor]", function(e) {
// 	if(fabricCanvas.getActiveObject()){
// 		fabricCanvas.getActiveObject().set('stroke', $(this).val());
// 	}
// 	fabricCanvas.freeDrawingBrush.color = $(this).val();
// 	fabricCanvas.renderAll();
// });


$(document).on("input", "[data-canvascolor]", function(){
	var _this = $(this);
	var coloring = _this.attr("data-canvascolor");
	if(coloring == 'stroke'){
		strokeColor = _this.val();
		fabricCanvas.freeDrawingBrush.color = strokeColor;
		if(fabricCanvas.getActiveObject()){
			fabricCanvas.getActiveObject().set("fill", strokeColor);
		}
	}
	if(coloring == 'fill'){
		fillColor = _this.val();
		// fabricCanvas.freeDrawingBrush.color = fillColor;
		if(fabricCanvas.getActiveObject()){
			fabricCanvas.getActiveObject().set("backgroundColor", fillColor);
		}
	}
	fabricCanvas.renderAll();
});


$(document).on('click' ,"#canvasSaveBtn", function(e) {
	disableDrawingMode();
	isPolygon = false;
    var link = document.createElement('a');
    link.href = fabricCanvas.toDataURL();
    link.download = 'canvas_image.jpg';
    link.click();
});


$(document).on('click' ,"#canvasPoint", function(e) {
    drawingMode = 'point';
    fabricCanvas.isDrawingMode = false;
});


$(document).on('click' ,"#canvasExitFullScreen", function(e) {
	canvasToggleFullScreen(false);
});


$(document).on('click' ,"#canvasPan", function(e) {
    drawingMode = 'pan';
    erasingMode = false;
    isPolygon = false;
    disableDrawingMode();
   /* for(var i=0;i<fabricCanvas.getObjects().length;i++){
    	fabricCanvas.getObjects()[i].lockMovementX = false;
    	fabricCanvas.getObjects()[i].lockMovementY = false;
    }*/
});
function zoomIn() {
	zoomLevel = fabricCanvas.getZoom() * 1.1;
    fabricCanvas.setZoom(zoomLevel);
    fabricCanvas.renderAll();
}

function zoomOut() {
	zoomLevel = fabricCanvas.getZoom() * 0.9
    fabricCanvas.setZoom(zoomLevel);
    fabricCanvas.renderAll();
}
function canvasProtractor(){
	//$(document).ready(function(){
	$('.ionCanvasProtracter').rotatable().draggable();
	//});
}

function resetZoom() {
	zoomLevel = 1;
    fabricCanvas.setZoom(1);
    fabricCanvas.renderAll();
}
function  disableDrawingMode(){
	fabricCanvas.isDrawingMode = false;
	//  fabricCanvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
    fabricCanvas.isDrawingMode = false;
}

  /*  fabric.Image.fromURL('mani.jpg',function(img){
      img.set({
        left:0,
        right:0,
        width:fabricCanvas.width,
        height:fabricCanvas.height,
        selectable:false,
        evented:false
      });
      fabricCanvas.setBackgroundImage(img,fabricCanvas.renderAll.bind(canvas));
    });*/
    
function stopDragging(element) {
	if(drawingMode !='drag' && drawingMode != element.subType){
		element.lockMovementX = true;
		element.lockMovementY = true;
     }else{
    	element.lockMovementX = false;
        element.lockMovementY = false;
     }
}

function onMoving(e) {
  //  if (!timeoutTriggered) {
    //  setTimeout(function() {
        stopDragging(e.target);
      //}, 500);
      timeoutTriggered = true;
    //}
}



/**
 * Push the current state into the undo stack and then capture the current state
 */
function saveUndoRedoCanvas() {
	// clear the redo stack
	redo = [];
	$('[data-toptoolname="redo"]').prop('disabled', true);
	// initial call won't have a state
	if (state) {
		undo.push(state);
		$('[data-toptoolname="undo"]').prop('disabled', false);
	}
	state = JSON.stringify(fabricCanvas);
}

/**
 * Save the current state in the redo stack, reset to a state in the undo stack, and enable the buttons accordingly.
 * Or, do the opposite (redo vs. undo)
 * @param playStack which stack to get the last state from and to then render the canvas as
 * @param saveStack which stack to push current state into
 * @param buttonsOn jQuery selector. Enable these buttons.
 * @param buttonsOff jQuery selector. Disable these buttons.
 */
function replay(playStack, saveStack, buttonsOn, buttonsOff) {
	saveStack.push(state);
	state = playStack.pop();
	var on = $(buttonsOn);
	var off = $(buttonsOff);
	// turn both buttons off for the moment to prevent rapid clicking
	on.prop('disabled', true);
	off.prop('disabled', true);
	fabricCanvas.clear();
	fabricCanvas.loadFromJSON(state, function() {
		fabricCanvas.renderAll();
		// now turn the buttons back on if applicable
		on.prop('disabled', false);
		if (playStack.length) {
			off.prop('disabled', false);
		}
	});
}

function setStartingPoint(options) {
	var offset = $('#drawingArea').offset();
	x = options.e.pageX - offset.left;
	x -= fabricCanvas.viewportTransform[4];
	x = x/zoomLevel;
	//x = options.e.clientX - offset.left;
	y = options.e.pageY - offset.top;
	y -= fabricCanvas.viewportTransform[5];
	y = y/zoomLevel;
	//y = options.e.clientY - offset.top;
}

function makeRoof(roofPoints) {
	var left = findLeftPaddingForRoof(roofPoints);
	var top = findTopPaddingForRoof(roofPoints);
	if(isPolygon)
		roofPoints.push(new Point(roofPoints[0].x,roofPoints[0].y))
	var roof = new fabric.Polyline(roofPoints, {
		//fill : 'rgba(0,0,0,0)',
		strokeWidth: strokeWidth,
		fill : fillColor,
		stroke : strokeColor
	});
	/*roof.set({
		left : left,
		top : top,
	});*/
	return roof;
}

function makeRoofForLine(roofPoints) {
	//console.log(roofPoints);
	var left = findLeftPaddingForRoof(roofPoints);
	var top = findTopPaddingForRoof(roofPoints);
	var roof = null;
	if($('[data-lines="arrow"]').is(":checked")){
		roof = new LineWithArrow(roofPoints, {
			//fill : 'rgba(0,0,0,0)',
			strokeWidth: strokeWidth,
			fill : fillColor,
			stroke : strokeColor,
			strokeDashArray: [strokeDashArrayValue, strokeDashArrayValue]
		});
	}else{
		roof = new fabric.Line(roofPoints, {
			//fill : 'rgba(0,0,0,0)',
			strokeWidth: strokeWidth,
			fill : fillColor,
			stroke : strokeColor,
			strokeDashArray: [strokeDashArrayValue, strokeDashArrayValue]
		});
	}
	/*roof.set({
		left : left,
		top : top,
	});*/
	return roof;
}

function findTopPaddingForRoof(roofPoints) {
	var result = 999999;
	for (var f = 0; f < lineCounter; f++) {
		if (roofPoints[f].y < result) {
			result = roofPoints[f].y;
		}
	}
	return Math.abs(result);
}

function findLeftPaddingForRoof(roofPoints) {
	var result = 999999;
	for (var i = 0; i < lineCounter; i++) {
		if (roofPoints[i].x < result) {
			result = roofPoints[i].x;
		}
	}
	return Math.abs(result);
}
function Point(x, y) {
	this.x = x;
	this.y = y;
}
function erasingMode(){
	const obj = new fabric.Rect({ erasable: false });
	  //  change
	  obj.set('erasable', true);

	  //  make all objects non erasable by default
	  fabric.Object.prototype.erasable = false;
	  //  handling group `erasable` config
	  //  bad - set all groups to be `deep` by default (not suggested)
	  fabric.Group.prototype.erasable = 'deep';
	  //  good - set directly
	  const group = new fabric.Group([], { erasable: 'deep' });

	  //  remove childObj from the group, eraser will be propagated to it
	  group.removeWithUpdate(childObj);
	  let propagatedEraser = childObj.eraser;

	  //  remove childObj from the group, disabling eraser propagation
	  group.erasable = 'deep';
	  group.removeWithUpdate(childObj);
	  group.erasable = true;

	  //  setting a non-group object's `erasable` property, both have the same effect
	  obj.set('erasable', true);
	  obj.set('erasable', 'deep');
	  let myEraser = obj.eraser;
	  //  remove eraser from object
	  delete obj.eraser;
	  //  mark as dirty so object gets invalidated in the rendering process
	  obj.dirty = true;
	  eraserBrush.preparePattern();
	  eraserBrush._render();
}
function addCrossPoint(x, y) {
	var size = 3.5;
	var color = strokeColor;
	fabricCanvas.selection = false;
    var line1 = new fabric.Line([x - size, y - size, x + size, y + size], {
      stroke: strokeColor,
      strokeWidth: 3.5,
      selectable: false,
      strokeDashArray: [strokeDashArrayValue, strokeDashArrayValue],
    });
    var line2 = new fabric.Line([x - size, y + size, x + size, y - size], {
      stroke: strokeColor,
      strokeWidth: 3.5,
      selectable: false,
      strokeDashArray: [strokeDashArrayValue, strokeDashArrayValue],
    });
    fabricCanvas.add(line1, line2);
    fabricCanvas.renderAll();
}


$(document).on('change', '[data-lines]', function(){
	var line_name = $(this).attr('data-lines');
	if(line_name == 'straight'){
		strokeDashArrayValue = 0;
	}
	else if(line_name == 'dotted'){
		strokeDashArrayValue = 5;
	}
	else if(line_name == 'dashed'){
		strokeDashArrayValue = 10;
	}
	else {
		strokeDashArrayValue = 0;
	}
});


$(document).on("change", "[data-textproperty]", function(){
	var text_property = $(this).attr("data-textproperty");
	if($('[data-textproperty="italic"]').is(":checked") && $('[data-textproperty="bold"]').is(":checked")){
		fontStyle = 'italic bold';
	}
	else if($('[data-textproperty="italic"]').is(":checked")){
		fontStyle = 'italic';
	}
	else if($('[data-textproperty="bold"]').is(":checked")){
		fontStyle = 'bold';
	}
	else{
		fontStyle = 'normal';
	}
	if(fabricCanvas.getActiveObject()){
		fabricCanvas.getActiveObject().fontStyle = fontStyle;
	}
	fabricCanvas.renderAll();
});

$(document).on("change", "[data-fontstyle]", function(){
	var _this = $(this);
	var font_property = _this.attr("data-fontstyle");
	if(font_property == "family"){
		fabricCanvas.getActiveObject().fontFamily = _this.val();
	}
	if(font_property == "size"){
		fabricCanvas.getActiveObject().fontSize = _this.val();
	}
	fabricCanvas.renderAll();
});


$(document).on("input", "#canvas_filltransparent", function(){
	if($(this).is(":checked")){
		fillColor = "transparent";
	}else{
		fillColor = $('[data-canvascolor="fill"]').val();
	}
});


// function updateTransparency(){
// 	if($("#fillTransparent").is(":checked")){
// 		fillColor="transparent";
// 	}else{
// 		fillColor = $('[data-canvascolor="fill"]').val();
// 	}
// }
function addArrowToLine(startX,startY,endX,endY){
	//console.log(startX,startY,endX,endY);
	var angle = Math.atan(endY - startY,endX-startX);
	var arrow = new fabric.Triangle({
		left:endX,
		top:endY,
		originX:'center',
		originY:'center',
		width:15,
		height:15,
		fill:strokeColor,
		angle:angle * 180/Math.pi + 90,
		selectable:false
	});
	fabricCanvas.add(arrow);
	fabricCanvas.renderAll();
}



$(document).on("change", "[data-textalign]", function(){
	if($('[data-textalign="left"]').is(":checked")){
		fabricCanvas.getActiveObject().textAlign = "left";
	}
	else if($('[data-textalign="center"]').is(":checked")){
		fabricCanvas.getActiveObject().textAlign = "center";
	}
	else if($('[data-textalign="right"]').is(":checked")){
		fabricCanvas.getActiveObject().textAlign = "right";
	}
	fabricCanvas.renderAll();
});

function canvasToggleFullScreen(elem){
	if(isFullScreenMode){
		normalWidth = fabricCanvas.getWidth();
		normalHeight = fabricCanvas.getHeight();
		$('.canvas-wrapper').addClass('canvas-fullscreen');
		elem.attr('data-info', 'Exit Full Screen');
		var width = $('.canvas-wrapper').width() -$('.canvas-aside-tools').outerWidth();
		var height = $('.canvas-wrapper').height() -$('.canvas-top-tools').outerHeight();
		$('.canvas-main-area').css({ width: width, height: height});
		fabricCanvas.setDimensions({width:Math.max(normalWidth,width),height:Math.max(normalHeight,height)});
	}else{
		$('.canvas-wrapper').removeClass('canvas-fullscreen');
		elem.attr('data-info', 'Full Screen');
		fabricCanvas.setDimensions({
			width: normalWidth,
			height: normalHeight
		});
		$('.canvas-main-area').css({
			width: normalWidth,
			height: normalHeight
		});
	}
	fabricCanvas.calcOffset();
	fabricCanvas.renderAll();
}

function canvasRuler(){
	/* Enable ruler with all the options and their default values */
	$('.canvasRulerDiv').rotatable().draggable();
}
function retrieveImage(){
	canvasClear=false;
	var drawing = document.getElementById('canvas');
	var context = drawing.getContext('2d');
	var img = new Image();
    img.src = "r.jpg";
    img.onload = function (e)
    {
        context.drawImage(img, 0, 0);
    };
}

function saveCanvasContentData(){
	/*if(protractor!=null)
		fabricCanvas.remove(protractor);
	if(ruler!=null)
		fabricCanvas.remove(ruler);*/
	var indexes = [];
	fabricCanvas.getObjects().forEach(function(value,index){
		if(mathToolTypes[value.subType])
			indexes.push(value);
	});
	console.log(indexes);
	indexes.forEach(function(value,index){
		fabricCanvas.remove(value);
	});
	 /*try{
     	fabricCanvas.setBackgroundColor('');
     }catch(e){
     	
     }*/
	indexes = [];
	fabricCanvas.renderAll();
	var drawing = document.getElementsByClassName('drawingArea'+mockVar.curQuesBean.quesId)[0];
	var returnString="";
	
	if(mockVar.storeCandResponse==0 && drawing != undefined){
		fabricCanvas.setWidth((window.innerWidth-50));
		fabricCanvas.setHeight((window.innerHeight - 50));
		canvasDataForMock[mockVar.curQuesBean.quesId]=fabricCanvas.toDataURL();
		canvasDataForMock[mockVar.curQuesBean.quesId+"_JsonData"] = fabricCanvas.toJSON();
		fabricCanvas.setWidth($('.canvas-main-area').width());
		fabricCanvas.setHeight($('.canvas-main-area').height());
		if(fabricCanvas.getObjects().length>0){
            returnString="Drawing Saved";
        }
	}
	else if(drawing != undefined &&  mockVar.storeCandResponse==1){
		var URL="/IBACC/MockAssessmentAction.do?action=saveDrawing";
		var paramsvalue = {};
		fabricCanvas.setWidth((window.innerWidth-50));
		fabricCanvas.setHeight((window.innerHeight - 50));
		paramsvalue["assessmentId"]=mockVar.mockId;
		paramsvalue["orgId"]=mockVar.orgId;
		paramsvalue["candMasterId"]=mockVar.candMasterId;
		paramsvalue["attemptId"]=mockVar.attemptId;
		paramsvalue["imageData"]=fabricCanvas.toDataURL();
		paramsvalue["imageJsonData"]=JSON.stringify(fabricCanvas.toJSON());
		paramsvalue["quesId"]=mockVar.curQuesBean.quesId;
		fabricCanvas.setWidth($('.canvas-main-area').width());
		fabricCanvas.setHeight($('.canvas-main-area').height());
		//added newly 1926786
		var oldVpt = fabricCanvas.viewportTransform.slice();

		// Reset zoom + pan
		fabricCanvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
		fabricCanvas.renderAll();

		//paramsvalue["imageData"] = fabricCanvas.toDataURL({ left: 20,top: 20, width: originalImageWidth,height: originalImageHeight});
		/*paramsvalue["imageData"] = fabricCanvas.toDataURL();
		paramsvalue["imageJsonData"] = JSON.stringify(fabricCanvas.toJSON());

		// Restore candidate view
		fabricCanvas.setViewportTransform(oldVpt);
		fabricCanvas.renderAll();*/
		// Reset zoom + pan
		fabricCanvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
		fabricCanvas.renderAll();

		var maxX = 0;
		var maxY = 0;

		fabricCanvas.getObjects().forEach(function(obj) {

		    // Ignore helper tools if required
		    if (obj.subType === "protractor" || obj.subType === "ruler") {
		        return;
		    }

		    var rect = obj.getBoundingRect(true);

		    maxX = Math.max(maxX, rect.left + rect.width);
		    maxY = Math.max(maxY, rect.top + rect.height);
		});

		// Small padding
		maxX += 20;
		maxY += 20;

		paramsvalue["imageData"] = fabricCanvas.toDataURL({
		    left: 0,
		    top: 0,
		    width: maxX,
		    height: maxY
		});

		paramsvalue["imageJsonData"] = JSON.stringify(fabricCanvas.toJSON());

		// Restore candidate view
		fabricCanvas.setViewportTransform(oldVpt);
		fabricCanvas.renderAll();

		// added newly changes ends.
		if(paramsvalue["imageData"]!="" && !canvasClear){
			if(fabricCanvas.getObjects().length > 0){
                let count=0;
                fabricCanvas.getObjects().forEach(function(value,index){
            		if(fabricCanvas.getObjects()[index].type=='image'){
                        count++;
                    }
            	});    
            if(count!=fabricCanvas.getObjects().length){
		jQuery.ajax({
					url: URL,
					async: false,
					type: 'POST',
					data: paramsvalue,
					//dataType: 'json',
					success: function(data) {
						returnString="Drawing Saved";
					}
					,error : function(){
						returnString="";
					}
				});
	            }}}else{
			returnString="";
		}
	}
	/*if(protractor!=null)
		fabricCanvas.add(protractor);
	if(ruler!=null)
		fabricCanvas.add(ruler);
	fabricCanvas.renderAll();*/
	return returnString;
}

function retrieveDrawingData(){
	if(mockVar.storeCandResponse==1){
		var URL="/IBACC/MockAssessmentAction.do?action=retrieveDrawing";
		var paramsvalue = {};
		paramsvalue["assessmentId"]=mockVar.mockId;
		paramsvalue["orgId"]=mockVar.orgId;
		paramsvalue["candMasterId"]=mockVar.candMasterId;
		paramsvalue["attemptId"]=mockVar.attemptId;
		paramsvalue["quesId"]=mockVar.curQuesBean.quesId;
		paramsvalue["canvasType"]="fabric";
		jQuery.ajax({
			url: URL,
			async: false,
			type: 'POST',
			data: paramsvalue,
			dataType: 'json',
			success: function(data) {
				if(data!=null && data.imageJsonData!=null && data.imageJsonData!=''){
					canvasClear=false;
					removeBackgroundImage();
					/*if(backgroundImageForCanvas!=null)
						fabricCanvas.remove(backgroundImageForCanvas);*/
					fabricCanvas.loadFromJSON(
						    JSON.parse(data.imageJsonData),
						    function() {

						        var questionObj = null;

						        fabricCanvas.getObjects().forEach(function(obj){
						            if(obj.subType === "question"){
						                questionObj = obj;
						            }
						        });

						        if(questionObj){
						            setFabricDimensions(questionObj.getScaledWidth(),questionObj.getScaledHeight(),true);
						        } else {
						            setFabricDimensions(0, 0,true);
						        }
						        fabricCanvas.renderAll();
						        state = JSON.stringify(fabricCanvas);
						    }
						);
					state = JSON.stringify(fabricCanvas);
					try{
						if(canvasBGColor!='' && fabricCanvas.backgroundColor==''){
							fabricCanvas.setBackgroundColor(canvasBGColor);
							fabricCanvas.renderAll();
						}
					}catch(e){

					}
				}
				else if(data!=null && data.imageData!=null && data.imageData!=''){
					canvasClear=false;
					var drawing = document.getElementsByClassName('drawingArea'+mockVar.curQuesBean.quesId)[0];
					var context = drawing.getContext('2d');
					var img = new Image();
					img.src = data.imageData;
					img.onload = function (e)
					{
						context.drawImage(img, 0, 0);
					};
					
				}
			}
			,error : function(){
				
			}
		});
	}
	else{
		canvasClear=false;
		var drawing = document.getElementsByClassName('drawingArea'+mockVar.curQuesBean.quesId)[0];
		var context = drawing.getContext('2d');
		if(canvasDataForMock[mockVar.curQuesBean.quesId+"_JsonData"]!=undefined){
			fabricCanvas.loadFromJSON(canvasDataForMock[mockVar.curQuesBean.quesId+"_JsonData"]);
		}
		else{
			var img = new Image();
	        img.src = canvasDataForMock[mockVar.curQuesBean.quesId];
	        img.onload = function (e){
	            context.drawImage(img, 0, 0);
	        };
		}
	}
}
function removeBackgroundImage(){
	if(backgroundImageForCanvas!=null)
		fabricCanvas.remove(backgroundImageForCanvas);
	var objectsToRemove = [];
	fabricCanvas.getObjects().forEach(function(i){
		if(i.subType!="question") 
			i.bringToFront();
		else{
			objectsToRemove.push(i);
		}
	});
	objectsToRemove.forEach(function(i){
		fabricCanvas.remove(i);
	});
	fabricCanvas.renderAll();

}
function initializeCanvasData(){
	roof = null;
	roofPoints = [];
	lines = [];
	lineCounter = 0;
	mousePressed = false;
	isTextAreaDeselected = false;
	x = 0;
	y = 0;
	fabricCanvas = null;
	drawingMode = 'pencil';
	erasingMode = false;
	strokeWidth = 5;
	strokeColor = 'black';
	fillColor = 'transparent';
	fontSize = 18;
	eraserBrush = null;
	backgroundImageData = '';
	backgroundImg = '';
	backgroundOimg = '';
	isPolygon = false;
	isLineDrawing = false;
	isFullScreenMode = false;
	strokeDashArrayValue = 0;
	fontFamily = 'sans-serif';
	fontStyle = 'normal';
	lineWithArrow = null;
	isProtractorAndRulerInitiated = false;
	state = null;
	undo = [];
	redo = [];
	startXPositionRect = null;
	startYPositionRect = null;
}

function clearCanvasContent(){
	canvasClear=true;
	isPolygon = false;
	fabricCanvas.remove(fabricCanvas.getActiveObject());
	var arr = fabricCanvas.getObjects();
	for(var i=0;i<arr.length;i++){
		if(arr[i].subType!="question")
			fabricCanvas.remove(arr[i]);
	}
	saveUndoRedoCanvas();
}

function addProtractorToCanvas(){
	if(protractor!=null) {
		fabricCanvas.remove(protractor);
		if(!$("#protractorDrag").is(":checked")){
			protractor.selectable = false;
	    	//fabricCanvas.discardActiveObject();
	    }
		else{
	    	protractor.selectable = true;
	    }
		if(!protractorSelected)
			fabricCanvas.add(protractor);
		protractorSelected = !protractorSelected;
	}
	else {
		fabric.Image.fromURL('images/protractor.svg', function(img) {
			//backgroundImageData = data;
			backgroundImg = img;
			var oImg = img.set({
				left: 200,
				top: 280,
				angle: 00,
				border: '#000',
				stroke: '#F0F0F0', //<-- set this
				// strokeWidth: 40, //<-- set this
				width: 350,
				height: 190,
				subType:"protractor",
				erasable: false,
				// selectable:false
			});
		     /* img.set({
		    	  originX:'center',
		    	  originY:'center'
		      });*/
		      //fabricCanvas.add(img);
			img.setControlVisible('ml',false);
			img.setControlVisible('mb',false);
			img.setControlVisible('mr',false);
			img.setControlVisible('mt',false);
			img.setControlVisible('tl',false);
			img.setControlVisible('tr',false);
			img.setControlVisible('bl',false);
			img.setControlVisible('br',false);
		    backgroundOimg = oImg;
		    //fabricCanvas.setBackgroundImage(oImg,fabricCanvas.renderAll.bind(fabricCanvas));
		    protractor = img;
		    if(!$("#protractorDrag").is(":checked")){
		    	img.selectable = false;
		    	//fabricCanvas.discardActiveObject();
		    }else{
		    	img.selectable = true;
		    }
		    if(!protractorSelected){
				fabricCanvas.add(img);
				fabricCanvas.setActiveObject(img);
				fabricCanvas.getActiveObject().centeredRotation = false;
				/*fabricCanvas.getActiveObject().originX = 0.47;
				fabricCanvas.getActiveObject().originY = 0.99;*/
				//fabricCanvas.getActiveObject().originX = 0.485
				fabricCanvas.getActiveObject().originX = 0.497
				fabricCanvas.getActiveObject().originY =0.916;
				if(!$("#protractorDrag").is(":checked")){
					//fabricCanvas.getActiveObject().selectable = false;
					fabricCanvas.discardActiveObject();
				}else{
					//fabricCanvas.getActiveObject().selectable = true;
				}
		    }
		    protractorSelected = !protractorSelected;
			fabricCanvas.renderAll();
		});
	}
	/*$("#rulerDrag").prop("checked", false);*/
	enableDragForCanvas('protractor');
}

function addRulerToCanvas(){
	if(ruler!=null){
		fabricCanvas.remove(ruler);
		if(!$("#rulerDrag").is(":checked")){
			ruler.selectable = false;
	    	//fabricCanvas.discardActiveObject();
	    }else{
	    	ruler.selectable = true;
	    }
		if(!rulerSelected)
			fabricCanvas.add(ruler);
		rulerSelected = !rulerSelected;
	}
	else{
		fabric.Image.fromURL('images/ruler.svg', function(img) {
			//backgroundImageData = data;
			backgroundImg = img;
			var oImg = img.set({
				left: 130,
				top: 220,
				angle: 00,
				border: '#000',
				stroke: '#000', //<-- set this
				//  strokeWidth: 40, //<-- set this
				// strokeWidth: 1,
				width: 780,
				height: 104,
				subType:"ruler",
				erasable: false,
				
			});
			/* img.set({
				originX:'center',
				originY:'center'
			});*/
			//fabricCanvas.add(img);
			//backgroundOimg = oImg;
			//fabricCanvas.setBackgroundImage(oImg,fabricCanvas.renderAll.bind(fabricCanvas));
			img.setControlVisible('ml',false);
			img.setControlVisible('mb',false);
			img.setControlVisible('mr',false);
			img.setControlVisible('mt',false);
			img.setControlVisible('tl',false);
			img.setControlVisible('tr',false);
			img.setControlVisible('bl',false);
			img.setControlVisible('br',false);
			ruler = img;
			if(!$("#rulerDrag").is(":checked")){
				img.selectable = false;
				//fabricCanvas.discardActiveObject();
			}else{
				img.selectable = true;
			}
			if(!rulerSelected){
				fabricCanvas.add(img);
				fabricCanvas.setActiveObject(img);
				fabricCanvas.getActiveObject().centeredRotation = false;
				fabricCanvas.getActiveObject().originX = 0.01;
				fabricCanvas.getActiveObject().originY = 0;
				if(!$("#rulerDrag").is(":checked")){
					fabricCanvas.discardActiveObject();
				}
			}
			rulerSelected = !rulerSelected;
			fabricCanvas.renderAll();
		});
	}
	/*$("#protractorDrag").prop("checked", false);*/
	enableDragForCanvas('ruler');
}



/*fabric.Image.fromURL('images/question.jpg', function(imgQuestion) {
	imgQuestion.set({
		left: 20,
		top: 20,
		angle: 00,
		border: '#000',
		stroke: '#000', //<-- set this
		//  strokeWidth: 40, //<-- set this
		// strokeWidth: 1,
		width: 800,
		height: 400,
		subType: "question",
		erasable: false,
		selectable: false,
        evented: false,
		hasControls: false,
		hasBorders: false
	});
	question = imgQuestion;
	fabricCanvas.add(imgQuestion);
	fabricCanvas.sendBackwards(imgQuestion);
	fabricCanvas.setActiveObject(imgQuestion);
	fabricCanvas.getActiveObject().centeredRotation = false;
	fabricCanvas.getActiveObject().originX = 0;
	fabricCanvas.getActiveObject().originY = 0;
	fabricCanvas.discardActiveObject();
	fabricCanvas.renderAll();
});*/

// canvas.setBackgroundImage('https://......', canvas.renderAll.bind(canvas), {
//     backgroundImageOpacity: 1,
//     backgroundImageStretch: false
// });

function enableDragForCanvas(type){
	drawingMode	 = type;
    erasingMode = false;
    disableDrawingMode();
    isPolygon = false;
    for(var i=0;i<fabricCanvas.getObjects().length;i++){
    	if(fabricCanvas.getObjects()[i].subType == type){
	    	fabricCanvas.getObjects()[i].lockMovementX = false;
	    	fabricCanvas.getObjects()[i].lockMovementY = false;
    	}
    }
}

function stopSelectionOfObjects(){
	if(drawingMode!='drag' && drawingMode!='protractor' && drawingMode!='ruler'){
		for(var i=0;i<fabricCanvas.getObjects().length;i++){
		  	fabricCanvas.getObjects()[i].lockMovementX = true;
		    fabricCanvas.getObjects()[i].lockMovementY = true;
		    fabricCanvas.getObjects()[i].selectable = false;
	    }
	}
}

function onSelection(e){
	stopDragging(e.selected);
	 /*
	for(var i=0;i<fabricCanvas.getObjects().length;i++){
	  	fabricCanvas.getObjects()[i].lockMovementX = true;
	    fabricCanvas.getObjects()[i].lockMovementY = true;
	    fabricCanvas.getObjects()[i].selectable = false;
    }*/
}
var originalImageWidth = 0;
var originalImageHeight = 0;
function addBackgroundImage(imgPath){
	fabric.Image.fromURL(imgPath, function(imgQuestion) {
		/*if($(".canvas-container").width()<600){
			imgQuestion.scale(0.3);

		}
		else if($(".canvas-container").width()>600 && $(".canvas-container").width()<1000){
			imgQuestion.scale(0.5);
		}
		else
			imgQuestion.scale(0.75);*/
	//	imgQuestion.scaleToHeight($(".canvas-container").height()-100);
		//imgQuestion.scaleToWidth($(".canvas-container").width()-100);
		
		imgQuestion.set({
			left: 20,
			top: 20,
			angle: 00,
			border: '#000',
			stroke: '#000', //<-- set this
			//  strokeWidth: 40, //<-- set this
			// strokeWidth: 1,
			/*width: 800,
			height: 400,*/
			subType: "question",
			erasable: false,
			selectable: false,
	        evented: false,
			hasControls: false,
			hasBorders: false
		});
		question = imgQuestion;
		backgroundImageForCanvas = imgQuestion;
		 // Calculate fit scale
       /* var canvasW = fabricCanvas.getWidth();
        var canvasH = fabricCanvas.getHeight();

        var scale = Math.min(
            (canvasW - 40) / imgQuestion.width,
            (canvasH - 40) / imgQuestion.height
        );
        imgQuestion.scale(scale);*/
        backgroundImageForCanvas = imgQuestion;

		fabricCanvas.add(imgQuestion);
		fabricCanvas.sendToBack(imgQuestion);
		fabricCanvas.setActiveObject(imgQuestion);
		fabricCanvas.getActiveObject().centeredRotation = false;
		fabricCanvas.getActiveObject().originX = 0;
		fabricCanvas.getActiveObject().originY = 0;
		fabricCanvas.discardActiveObject();
		setFabricDimensions(imgQuestion.width,imgQuestion.height,false);
		fabricCanvas.renderAll();
		state = JSON.stringify(fabricCanvas);
	});
}
function extractCanvasBackgroundImagePath(text){
	var srcPath = "";
	try{
		if(text.indexOf('<img') != -1 ) {
			var newImageFile = new Array();
			text = text.replace(/'/g,'"');
			
			newImageFile = text.match(/(<img.+?src="(.+?)".+?>)/g);
			if(newImageFile==undefined || typeof(newImageFile)=="undefined"){
				newImageFile = text.match(/(<img.+?src=&#39;(.+?)&#39;.+?>)/g);
			}
			if(newImageFile!=undefined){
				var imageName = newImageFile[0].split('src=')[1].split('/>');
				srcPath =imageName[0].replace(/&#39;/g,'"').replace(/"/g,'').replace(/'/g,'');
				//console.log(srcPath);
				srcPath = editAudioVideoImageFilePath(imageName[0].replaceAll(/&#39;/g,'')).replace(/"/g,'').replace(/'/g,'');
				//console.log(srcPath);
				/*for (var i = 0; i < newImageFile.length; i++) {
					while (text.indexOf(newImageFile[i]) != -1) {
						
						//getFileInBlob('/'+ imageName[0], imageName[0].split('\\').pop().split('/').pop(),"","");
					}
				}*/
			}
		}else{
			srcPath = editAudioVideoImageFilePath(text.replaceAll(/&#39;/g,'')).replace(/"/g,'').replace(/'/g,'');
		}
	}catch(e){
		console.log(e);
	}
	return srcPath;
}
function setFabricDimensions(imgQuestionwidth,imgQuestionheight,isRetrieved){
var bounds = getCanvasBounds();
var maxWidth = isFullScreenMode ? $(window).width() : 985;
var maxHeight = isFullScreenMode? $(window).height() : 985;
originalImageWidth = Math.min(Math.max(bounds.width, imgQuestionwidth, fabricCanvas.width), maxWidth);
originalImageHeight = Math.min(Math.max(bounds.height, imgQuestionheight, fabricCanvas.height), maxHeight);
if(!isRetrieved){
fabricCanvas.setDimensions({  width: originalImageWidth + $('.canvas-aside-tools').outerWidth(),height: originalImageHeight + $('.canvas-top-tools').outerHeight()});
$('.canvas-wrapper').css({  width: originalImageWidth+$('.canvas-aside-tools').outerWidth()+5, height: originalImageHeight+$('.canvas-top-tools').outerHeight()+5});
}else{
	fabricCanvas.setDimensions({  width: originalImageWidth ,height: originalImageHeight });
	$('.canvas-wrapper').css({  width: originalImageWidth, height: originalImageHeight});
}
$('.canvas-main-area').css({ width: fabricCanvas.width,height: fabricCanvas.height});
}
function getCanvasBounds() {

    var maxX = 0;
    var maxY = 0;

    fabricCanvas.getObjects().forEach(function(obj){

        var rect = obj.getBoundingRect(true);

        maxX = Math.max(maxX,  rect.left + rect.width
        );

        maxY = Math.max( maxY,rect.top + rect.height);
    });

    return {
        width: Math.ceil(maxX),
        height: Math.ceil(maxY)
    };
}