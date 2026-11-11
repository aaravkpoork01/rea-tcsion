var monitorTrackInterval = null;
var checkStaticInterval = null;
var frameCount = 0;
var blackFrameCount = 0;
var isRPABlankFrame = false;
var isRPAFrozen = false;
var isScreenBlankFrame = false;
var trackState = 0;

//var checkStaticInterval = null;
function trackStream(localMediaStream,video){
	if(document.URL.includes("configurationCheck")) {
		monitorTrackState(localMediaStream);                 // Track-level
		startBlankFrameMonitor(video, localMediaStream, {    // Pixel-level
		  intervalMs: 1000,
		  consecutive: 5
		});
		checkStaticInterval=setInterval(function () {
			checkStaticVideo(video);
			}, 1000);
	}
	else{
		setTimeout(function () {
			monitorTrackState(localMediaStream);                 // Track-level
			startBlankFrameMonitor(video, localMediaStream, {    // Pixel-level
			  intervalMs: 1000,
			  consecutive: 5
			});
			checkStaticInterval=setInterval(function () {
				checkStaticVideo(video);
				}, 1000);
		 }, 10000);
	}
	

}

const tempcanvas = document.createElement("canvas");
tempcanvas.id = "canvas_"+(Date.now());
const tempctx = tempcanvas.getContext("2d");

let previousFrame = null;
let identicalFrameCount = 0;

function checkStaticVideo(video) {

    if (!video.videoWidth || !video.videoHeight) {
        return;
    }

    // Small resolution for performance
    tempcanvas.width = 160;
    tempcanvas.height = 120;

    tempctx.drawImage(video, 0, 0, tempcanvas.width, tempcanvas.height);

    const currentFrame = tempctx.getImageData(
        0,
        0,
        tempcanvas.width,
        tempcanvas.height
    ).data;

    if (!previousFrame) {
        previousFrame = new Uint8ClampedArray(currentFrame);
        return;
    }

    let changedPixels = 0;
    const totalPixels = tempcanvas.width * tempcanvas.height;

    // Compare RGB values
    for (let i = 0; i < currentFrame.length; i += 4) {

        const rDiff = Math.abs(currentFrame[i] - previousFrame[i]);
        const gDiff = Math.abs(currentFrame[i + 1] - previousFrame[i + 1]);
        const bDiff = Math.abs(currentFrame[i + 2] - previousFrame[i + 2]);

        if ((rDiff + gDiff + bDiff) > 30) {
            changedPixels++;
        }
    }

    const motionPercent = (changedPixels / totalPixels) * 100;

    // Motion detection
    const motionDetected = motionPercent > 1;

    // Frozen stream detection
    if (motionPercent < 0.1) {
        identicalFrameCount++;
    } else {
        identicalFrameCount = 0;
    }

//    console.log({
//        motionPercent: motionPercent.toFixed(2),
//        motionDetected,
//        identicalFrameCount
//    });

    // 30 consecutive checks with no changes
    if (identicalFrameCount >= 30) {
        if(document.URL.includes("RoomCapturing") || document.URL.includes("configurationCheck")){
        	if(document.URL.includes("RoomCapturing") && identicalFrameCount>=60){
        		console.warn("Possible frozen/static camera feed detected for Room Video");
        		isRPAFrozen = true;
        	}else if(document.URL.includes("configurationCheck")){
        		console.warn("Possible frozen/static camera feed detected for Preview Video");
        		window.location.href = "/OnlineAssessment/error.html?"+"EFrozen"+(($.cookie("isApp")=="true")?"isApp":"")+(($.cookie("isLauncher")=="true")?"isLauncher":"");
        	}
        }
        else{
        	console.warn("Possible frozen/static camera feed detected");
        	isRPAFrozen = true;
        }
    }

    previousFrame = new Uint8ClampedArray(currentFrame);
}

//function startBlankFrameMonitorRVFC(videoEl, stream, opts) {
function startBlankFrameMonitor(videoEl, stream, opts) {
  if (!('requestVideoFrameCallback' in HTMLVideoElement.prototype)) {
//	  console.log("requestVideoFrameCallback not supported");
    return null;//startBlankFrameMonitor(videoEl, stream, opts); // fallback
  }

  // Same sampling config as before
  opts = Object.assign({ sampleW: 64, sampleH: 48, blackThreshold: 16, blackFrameRatio: 0.98, consecutive: 5 }, opts || {});
  const canvas = document.createElement("canvas");
  //canvas.id = "canvas_"+(Date.now());
  canvas.width = opts.sampleW;
  canvas.height = opts.sampleH;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  let blankStreak = 0;
  blackFrameCount = 0;
  frameCount = 0;

  const loop = () => {
    try {
      if (videoEl.readyState >= 2 && videoEl.videoWidth && videoEl.videoHeight) {
    	frameCount++;
        ctx.drawImage(videoEl, 0, 0, opts.sampleW, opts.sampleH);
        const img = ctx.getImageData(0, 0, opts.sampleW, opts.sampleH).data; // [2](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/getImageData)

        let blackCount = 0, total = opts.sampleW * opts.sampleH;
        for (let i = 0; i < img.length; i += 4) {
          const r = img[i], g = img[i+1], b = img[i+2];
          if (r <= opts.blackThreshold && g <= opts.blackThreshold && b <= opts.blackThreshold) blackCount++;
        }
        const ratio = blackCount / total;
        if (ratio >= opts.blackFrameRatio) blankStreak++; else blankStreak = 0;

        if (blankStreak >= opts.consecutive) {
//        	console.log("Black frames detected");
//        	if(document.URL.includes("RoomCapturing") || document.URL.includes("configurationCheck")){
//        		window.location.href = "/OnlineAssessment/error.html?"+"EBlankFrames"+(($.cookie("isApp")=="true")?"isApp":"")+(($.cookie("isLauncher")=="true")?"isLauncher":"");
//        	}
        	if(document.URL.includes("configurationCheck"))
    		{
        		blackFrameCount++;
    		}
        	else{
        		isRPABlankFrame = true;
            }
        }
      } else {
        blankStreak = 0;
      }
    } catch (e) { blankStreak = 0; }

    videoEl.requestVideoFrameCallback(loop); // [3](https://developer.mozilla.org/en-US/docs/Web/API/HTMLVideoElement/requestVideoFrameCallback)[4](https://web.dev/articles/requestvideoframecallback-rvfc)
  };

  videoEl.requestVideoFrameCallback(loop); // [3](https://developer.mozilla.org/en-US/docs/Web/API/HTMLVideoElement/requestVideoFrameCallback)[4](https://web.dev/articles/requestvideoframecallback-rvfc)
}
//var monitorTrackInterval = null;
function monitorTrackState(stream) {
  try {
    const vTrack = stream.getVideoTracks && stream.getVideoTracks()[0];
    if (!vTrack) return;

    monitorTrackInterval = setInterval(() => {
      // enabled=false => black frames for video tracks [1](https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamTrack)
      const enabled = vTrack.enabled;
      const readyState = vTrack.readyState; // "live" / "ended" [1](https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamTrack)
      const muted = vTrack.muted;           // technical mute [1](https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamTrack)

      if (!enabled) {
//    	  console.log("Video track disabled");
    	  if(document.URL.includes("configurationCheck")){
        	  window.location.href = "/OnlineAssessment/error.html?"+"EBlankFrames"+(($.cookie("isApp")=="true")?"isApp":"")+(($.cookie("isLauncher")=="true")?"isLauncher":"");
      	  }
    	  trackState = 1; 
      } else if (readyState === "ended") {
//    	  console.log("Video track disabled");
    	  if(document.URL.includes("configurationCheck")){
      		window.location.href = "/OnlineAssessment/error.html?"+"EBlankFrames"+(($.cookie("isApp")=="true")?"isApp":"")+(($.cookie("isLauncher")=="true")?"isLauncher":"");
      	  }
    	  trackState = 2;
      } else if (muted) {
//    	  console.log("Video track disabled");
    	  if(document.URL.includes("configurationCheck")){
      		window.location.href = "/OnlineAssessment/error.html?"+"EBlankFrames"+(($.cookie("isApp")=="true")?"isApp":"")+(($.cookie("isLauncher")=="true")?"isLauncher":"");
      	  }
    	  trackState = 3;
      }
    }, 2000);
  } catch (e) {
    console.log(e);
  }
}

function startBlankFrameMonitor1(videoEl, stream, opts) {
    // Same sampling config as before
	  opts = Object.assign({ sampleW: 64, sampleH: 48, blackThreshold: 16, blackFrameRatio: 0.70, consecutive: 5 }, opts || {});
	  const canvas = document.createElement("canvas");
	  //canvas.id = "canvas_"+(Date.now());
	  canvas.width = opts.sampleW;
	  canvas.height = opts.sampleH;
	  const ctx = canvas.getContext("2d", { willReadFrequently: true });
	  let blankStreak = 0;

    const intervalId = setInterval(function () {
         try {
	      if (videoEl.readyState >= 2 && videoEl.videoWidth && videoEl.videoHeight) {
	        ctx.drawImage(videoEl, 0, 0, opts.sampleW, opts.sampleH);
	        const img = ctx.getImageData(0, 0, opts.sampleW, opts.sampleH).data; // [2](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/getImageData)

	        let blackCount = 0, total = opts.sampleW * opts.sampleH;
	        for (let i = 0; i < img.length; i += 4) {
	          const r = img[i], g = img[i+1], b = img[i+2];
	          if (r <= opts.blackThreshold && g <= opts.blackThreshold && b <= opts.blackThreshold) blackCount++;
	        }
	        const ratio = blackCount / total;
//	        console.log(blackCount,total,ratio);
	        if (ratio >= opts.blackFrameRatio){
	        	blankStreak++; 
//	        	console.log("Screen Recording Blank Frame ",blankStreak,"Detected");
	        }
	        else blankStreak = 0;

	        if (blankStreak >= opts.consecutive) {
	        	clearInterval(intervalId);	    
	        	isScreenBlankFrame = true;
	        }
	      } else {
	        blankStreak = 0;
	      }
	    } catch (e) { blankStreak = 0; }
    }, 2000); // Run every 2 second
}