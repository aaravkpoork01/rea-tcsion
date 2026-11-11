'use strict';
var entryId = 0;
var fromPreRequisitesPage=false;
var audioStopped=false;
var videoStopped=false;
var beepSoundReq = false;
var isDownsamplingReq = false;
var reduceNumChannels= 0;
var rateToDownsample = 8000;
var previewStartTime = null;
var previewEndTime = null;
var timeFrame=null;
function MediaStreamRecorder(mediaStream) {
    if (!mediaStream) {
        throw 'MediaStream is mandatory.';
    }

    // void start(optional long timeSlice)
    // timestamp to fire "ondataavailable"
    this.start = function(timeSlice) {
        var Recorder;

        if (typeof MediaRecorder !== 'undefined') {
            Recorder = MediaRecorderWrapper;
        } else if (IsChrome || IsOpera || IsEdge) {
            if (this.mimeType.indexOf('video') !== -1) {
                Recorder = WhammyRecorder;
            } else if (this.mimeType.indexOf('audio') !== -1) {
                Recorder = StereoAudioRecorder;
            }
            return;
        }

        // video recorder (in GIF format)
        if (this.mimeType === 'image/gif') {
            Recorder = GifRecorder;
        }

        // audio/wav is supported only via StereoAudioRecorder
        // audio/pcm (int16) is supported only via StereoAudioRecorder
        if (this.mimeType === 'audio/wav' || this.mimeType === 'audio/pcm') {
            Recorder = StereoAudioRecorder;
        }

        // allows forcing StereoAudioRecorder.js on Edge/Firefox
        if (this.recorderType) {
            Recorder = this.recorderType;
        }

        mediaRecorder = new Recorder(mediaStream);
		mediaRecorder.blobs = [];
		tempBlobArray=[];
		recordingInProgress=true;
		if(!fromPreRequisitesPage && !isVideoResponseFromGrpInstru)
		mockVar.curQuesBean.quesParam.answer='recordingStarted';
        var self = this;
        clearTimeout(flagToRemoveSetTimeOut);
		isRecording=true;
		timeRecorded=0;
		$('#recordingAlreadySaved').hide();
        mediaRecorder.ondataavailable = function(data) {
        
			if(!examinerRecordingLive){
			mediaRecorder.blobs.push(data);
			tempBlobArray.push(data);
            self.ondataavailable(data);
			//if(!fromPreRequisitesPage)
            if(typeof(sessionStorage.userdefinedcandconsole) == "undefined" || sessionStorage.userdefinedcandconsole==0 || isVideoResponseFromGrpInstru || fromPreRequisitesPage)
			previewRecording();
			}else{
			//Send Blob to server
			examinerRecordingChunk(data);
			}
			
		 };
        mediaRecorder.onstop = this.onstop;
        mediaRecorder.onStartedDrawingNonBlankFrames = this.onStartedDrawingNonBlankFrames;

        // Merge all data-types except "function"
        mediaRecorder = mergeProps(mediaRecorder, this);

        mediaRecorder.start(timeSlice);
        setTimeout(function(){
    		if(!isVideoResponseFromGrpInstru) blobSizeCheckArrayPush();},1000);
    };

    this.onStartedDrawingNonBlankFrames = function() {};
    this.clearOldRecordedFrames = function() {
        if (!mediaRecorder) {
            return;
        }

        mediaRecorder.clearOldRecordedFrames();
    };

    this.stop = function() {
    	if(mediaRecorder)
    		mediaRecorder.stop();
    };

    this.ondataavailable = function(blob) {
		if (this.disableLogs) return;
        console.log('ondataavailable..', blob);
    };

    this.onstop = function(error) {
        console.warn('stopped..', error);
    };

    this.save = function(file, fileName, typeOfMedia,queId,grpId,secId) {
    	if(mockVar.storeCandResponse == 1){
    		!isDeakin?$('#recordingUploadLoader').show():$('.savingYourResponse').show();
    	}
    	if (!file) {
            if (!mediaRecorder) {
                return true;
            }
			var bigBlob = new Blob(mediaRecorder.blobs, {
                //type: mediaRecorder.blobs[0].type || this.mimeType
				type:this.mimeType
            });
			recordingInProgress=false;
			if (bigBlob.size < 2048) {
                $('#recordingUploadLoader').hide();
                cnfPop('InfoPopup');
                $("#infoMsg2").html("Uploaded audio file size is too smaller. Please re-record and upload again");
                $('#start-recording').attr('disabled', false);
                return false;
            }
			uploadData(bigBlob,typeOfMedia,queId,0,grpId,secId);
			//$('#recordingUploadLoader').hide();
			var recordingAttemptsLeft = mockVar.curQuesBean.saReRecordCount-mockVar.curQuesBean.NumberOfRecordingsMade+1;
            if(recordingAttemptsLeft<1 && !(mockVar.curQuesBean.saAllowReRecord && mockVar.curQuesBean.saReRecordCount<1))
                $('#start-recording').attr('disabled', true).removeAttr("onclick");
            else 
    			$('#start-recording').attr('disabled', false);
			//mockVar.curQuesBean.quesParam.answer='recordingSaved';
            //ConcatenateBlobs(mediaRecorder.blobs, mediaRecorder.blobs[0].type, function(concatenatedBlob) {
                //invokeSaveAsDialog(concatenatedBlob);
            //});
            return true;
        }
       // invokeSaveAsDialog(file, fileName);
    };

    this.pause = function() {
        if (!mediaRecorder) {
            return;
        }
        mediaRecorder.pause();

        if (this.disableLogs) return;
        console.log('Paused recording.', this.mimeType || mediaRecorder.mimeType);
    };

    this.resume = function() {
        if (!mediaRecorder) {
            return;
        }
		mediaRecorder.resume();

        if (this.disableLogs) return;
        console.log('Resumed recording.', this.mimeType || mediaRecorder.mimeType);
    };

    // StereoAudioRecorder || WhammyRecorder || MediaRecorderWrapper || GifRecorder
    this.recorderType = null;

    // video/webm or audio/webm or audio/ogg or audio/wav
    this.mimeType = 'video/webm';

    // logs are enabled by default
    this.disableLogs = false;

    // Reference to "MediaRecorder.js"
    var mediaRecorder;
}

// ______________________
// MultiStreamRecorder.js

function MultiStreamRecorder(arrayOfMediaStreams, options) {
    arrayOfMediaStreams = arrayOfMediaStreams || [];

    if (arrayOfMediaStreams instanceof MediaStream) {
        arrayOfMediaStreams = [arrayOfMediaStreams];
    }

    var self = this;

    var mixer;
    var mediaRecorder;

    options = options || {
        mimeType: 'video/webm',
        video: {
            width: 360,
            height: 240
        }
    };

    if (!options.frameInterval) {
        options.frameInterval = 10;
    }

    if (!options.video) {
        options.video = {};
    }

    if (!options.video.width) {
        options.video.width = 360;
    }

    if (!options.video.height) {
        options.video.height = 240;
    }

    this.start = function(timeSlice) {
        // github/muaz-khan/MultiStreamsMixer
        mixer = new MultiStreamsMixer(arrayOfMediaStreams);

        if (getVideoTracks().length) {
            mixer.frameInterval = options.frameInterval || 10;
            mixer.width = options.video.width || 360;
            mixer.height = options.video.height || 240;
            mixer.startDrawingFrames();
        }

        if (typeof self.previewStream === 'function') {
            self.previewStream(mixer.getMixedStream());
        }

        // record using MediaRecorder API
        mediaRecorder = new MediaStreamRecorder(mixer.getMixedStream());

        for (var prop in self) {
            if (typeof self[prop] !== 'function') {
                mediaRecorder[prop] = self[prop];
            }
        }
		mediaRecorder.blobs = [];
        mediaRecorder.ondataavailable = function(blob) {
            self.ondataavailable(blob);
			mediaRecorder.blobs.push(data);
        };
		

        mediaRecorder.onstop = self.onstop;

        mediaRecorder.start(timeSlice);
    };

    function getVideoTracks() {
        var tracks = [];
        arrayOfMediaStreams.forEach(function(stream) {
            stream.getVideoTracks().forEach(function(track) {
                tracks.push(track);
            });
        });
        return tracks;
    }

    this.stop = function(callback) {
        if (!mediaRecorder) {
            return;
        }

        mediaRecorder.stop(function(blob) {
            callback(blob);
        });
    };

    this.pause = function() {
        if (mediaRecorder) {
            mediaRecorder.pause();
        }
    };

    this.resume = function() {
        if (mediaRecorder) {
            mediaRecorder.resume();
        }
    };

    this.clearRecordedData = function() {
        if (mediaRecorder) {
            mediaRecorder.clearRecordedData();
            mediaRecorder = null;
        }

        if (mixer) {
            mixer.releaseStreams();
            mixer = null;
        }
    };

    this.addStreams = this.addStream = function(streams) {
        if (!streams) {
            throw 'First parameter is required.';
        }

        if (!(streams instanceof Array)) {
            streams = [streams];
        }

        arrayOfMediaStreams.concat(streams);

        if (!mediaRecorder || !mixer) {
            return;
        }

        mixer.appendStreams(streams);
    };

    this.resetVideoStreams = function(streams) {
        if (!mixer) {
            return;
        }

        if (streams && !(streams instanceof Array)) {
            streams = [streams];
        }

        mixer.resetVideoStreams(streams);
    };

    this.ondataavailable = function(blob) {
        if (self.disableLogs) {
            return;
        }

        console.log('ondataavailable', blob);
    };

    this.onstop = function() {};

    // for debugging
    this.name = 'MultiStreamRecorder';
    this.toString = function() {
        return this.name;
    };
}

if (typeof MediaStreamRecorder !== 'undefined') {
    MediaStreamRecorder.MultiStreamRecorder = MultiStreamRecorder;
}

// Last time updated: 2017-08-31 2:56:12 AM UTC

// ________________________
// MultiStreamsMixer v1.0.2

// Open-Sourced: https://github.com/muaz-khan/MultiStreamsMixer

// --------------------------------------------------
// Muaz Khan     - www.MuazKhan.com
// MIT License   - www.WebRTC-Experiment.com/licence
// --------------------------------------------------

function MultiStreamsMixer(arrayOfMediaStreams) {

    // requires: chrome://flags/#enable-experimental-web-platform-features

    var videos = [];
    var isStopDrawingFrames = false;

    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    canvas.style = 'opacity:0;position:absolute;z-index:-1;top: -100000000;left:-1000000000; margin-top:-1000000000;margin-left:-1000000000;';
    (document.body || document.documentElement).appendChild(canvas);

    this.disableLogs = false;
    this.frameInterval = 10;

    this.width = 360;
    this.height = 240;

    // use gain node to prevent echo
    this.useGainNode = true;

    var self = this;

    // _____________________________
    // Cross-Browser-Declarations.js

    // WebAudio API representer
    var AudioContext = window.AudioContext;

    if (typeof AudioContext === 'undefined') {
        if (typeof webkitAudioContext !== 'undefined') {
            /*global AudioContext:true */
            AudioContext = webkitAudioContext;
        }

        if (typeof mozAudioContext !== 'undefined') {
            /*global AudioContext:true */
            AudioContext = mozAudioContext;
        }
    }

    /*jshint -W079 */
    var URL = window.URL;

    if (typeof URL === 'undefined' && typeof webkitURL !== 'undefined') {
        /*global URL:true */
        URL = webkitURL;
    }

    if (typeof navigator !== 'undefined' && typeof navigator.getUserMedia === 'undefined') { // maybe window.navigator?
        if (typeof navigator.webkitGetUserMedia !== 'undefined') {
            navigator.getUserMedia = navigator.webkitGetUserMedia;
        }

        if (typeof navigator.mozGetUserMedia !== 'undefined') {
            navigator.getUserMedia = navigator.mozGetUserMedia;
        }
        
        if(typeof navigator.mediaDevices !=='undefined' && typeof navigator.mediaDevices.getUserMedia !== 'undefined'){
        navigator.getUserMedia = navigator.mediaDevices.getUserMedia;
        }
    }

    var MediaStream = window.MediaStream;

    if (typeof MediaStream === 'undefined' && typeof webkitMediaStream !== 'undefined') {
        MediaStream = webkitMediaStream;
    }

    /*global MediaStream:true */
    if (typeof MediaStream !== 'undefined') {
        if (!('getVideoTracks' in MediaStream.prototype)) {
            MediaStream.prototype.getVideoTracks = function() {
                if (!this.getTracks) {
                    return [];
                }

                var tracks = [];
                this.getTracks.forEach(function(track) {
                    if (track.kind.toString().indexOf('video') !== -1) {
                        tracks.push(track);
                    }
                });
                return tracks;
            };

            MediaStream.prototype.getAudioTracks = function() {
                if (!this.getTracks) {
                    return [];
                }

                var tracks = [];
                this.getTracks.forEach(function(track) {
                    if (track.kind.toString().indexOf('audio') !== -1) {
                        tracks.push(track);
                    }
                });
                return tracks;
            };
        }

        // override "stop" method for all browsers
        if (typeof MediaStream.prototype.stop === 'undefined') {
            MediaStream.prototype.stop = function() {
                this.getTracks().forEach(function(track) {
                    track.stop();
                });
            };
        }
    }

    var Storage = {};

    if (typeof AudioContext !== 'undefined') {
        Storage.AudioContext = AudioContext;
    } else if (typeof webkitAudioContext !== 'undefined') {
        Storage.AudioContext = webkitAudioContext;
    }

    this.startDrawingFrames = function() {
        drawVideosToCanvas();
    };

    function drawVideosToCanvas() {
        if (isStopDrawingFrames) {
            return;
        }

        var videosLength = videos.length;

        var fullcanvas = false;
        var remaining = [];
        videos.forEach(function(video) {
            if (!video.stream) {
                video.stream = {};
            }

            if (video.stream.fullcanvas) {
                fullcanvas = video;
            } else {
                remaining.push(video);
            }
        });

        if (fullcanvas) {
            canvas.width = fullcanvas.stream.width;
            canvas.height = fullcanvas.stream.height;
        } else if (remaining.length) {
            canvas.width = videosLength > 1 ? remaining[0].width * 2 : remaining[0].width;
            canvas.height = videosLength > 2 ? remaining[0].height * 2 : remaining[0].height;
        } else {
            canvas.width = self.width || 360;
            canvas.height = self.height || 240;
        }

        if (fullcanvas && fullcanvas instanceof HTMLVideoElement) {
            drawImage(fullcanvas);
        }

        remaining.forEach(function(video, idx) {
            drawImage(video, idx);
        });

        setTimeout(drawVideosToCanvas, self.frameInterval);
    }

    function drawImage(video, idx) {
        if (isStopDrawingFrames) {
            return;
        }

        var x = 0;
        var y = 0;
        var width = video.width;
        var height = video.height;

        if (idx === 1) {
            x = video.width;
        }

        if (idx === 2) {
            y = video.height;
        }

        if (idx === 3) {
            x = video.width;
            y = video.height;
        }

        if (typeof video.stream.left !== 'undefined') {
            x = video.stream.left;
        }

        if (typeof video.stream.top !== 'undefined') {
            y = video.stream.top;
        }

        if (typeof video.stream.width !== 'undefined') {
            width = video.stream.width;
        }

        if (typeof video.stream.height !== 'undefined') {
            height = video.stream.height;
        }

        context.drawImage(video, x, y, width, height);

        if (typeof video.stream.onRender === 'function') {
            video.stream.onRender(context, x, y, width, height, idx);
        }
    }

    function getMixedStream() {
        isStopDrawingFrames = false;
        var mixedVideoStream = getMixedVideoStream();

        var mixedAudioStream = getMixedAudioStream();
        if (mixedAudioStream) {
            mixedAudioStream.getAudioTracks().forEach(function(track) {
                mixedVideoStream.addTrack(track);
            });
        }

        var fullcanvas;
        arrayOfMediaStreams.forEach(function(stream) {
            if (stream.fullcanvas) {
                fullcanvas = true;
            }
        });

        return mixedVideoStream;
    }

    function getMixedVideoStream() {
        resetVideoStreams();

        var capturedStream;

        if ('captureStream' in canvas) {
            capturedStream = canvas.captureStream();
        } else if ('mozCaptureStream' in canvas) {
            capturedStream = canvas.mozCaptureStream();
        } else if (!self.disableLogs) {
            console.error('Upgrade to latest Chrome or otherwise enable this flag: chrome://flags/#enable-experimental-web-platform-features');
        }

        var videoStream = new MediaStream();

        capturedStream.getVideoTracks().forEach(function(track) {
            videoStream.addTrack(track);
        });

        canvas.stream = videoStream;

        return videoStream;
    }

    function getMixedAudioStream() {
        // via: @pehrsons
        if (!Storage.AudioContextConstructor) {
            Storage.AudioContextConstructor = new Storage.AudioContext();
        }

        self.audioContext = Storage.AudioContextConstructor;

        self.audioSources = [];

        if (self.useGainNode === true) {
            self.gainNode = self.audioContext.createGain();
            self.gainNode.connect(self.audioContext.destination);
            self.gainNode.gain.value = 0; // don't hear self
        }

        var audioTracksLength = 0;
        arrayOfMediaStreams.forEach(function(stream) {
            if (!stream.getAudioTracks().length) {
                return;
            }

            audioTracksLength++;

            var audioSource = self.audioContext.createMediaStreamSource(stream);

            if (self.useGainNode === true) {
                audioSource.connect(self.gainNode);
            }

            self.audioSources.push(audioSource);
        });

        if (!audioTracksLength) {
            return;
        }

        self.audioDestination = self.audioContext.createMediaStreamDestination();
        self.audioSources.forEach(function(audioSource) {
            audioSource.connect(self.audioDestination);
        });
        return self.audioDestination.stream;
    }

    function getVideo(stream) {
        var video = document.createElement('video');

        if ('srcObject' in video) {
            video.srcObject = stream;
        } else {
            video.src = URL.createObjectURL(stream);
        }

        video.muted = true;
        video.volume = 0;

        video.width = stream.width || self.width || 360;
        video.height = stream.height || self.height || 240;

        video.play();

        return video;
    }

    this.appendStreams = function(streams) {
        if (!streams) {
            throw 'First parameter is required.';
        }

        if (!(streams instanceof Array)) {
            streams = [streams];
        }

        arrayOfMediaStreams.concat(streams);

        streams.forEach(function(stream) {
            if (stream.getVideoTracks().length) {
                var video = getVideo(stream);
                video.stream = stream;
                videos.push(video);
            }

            if (stream.getAudioTracks().length && self.audioContext) {
                var audioSource = self.audioContext.createMediaStreamSource(stream);
                audioSource.connect(self.audioDestination);
                self.audioSources.push(audioSource);
            }
        });
    };

    this.releaseStreams = function() {
        videos = [];
        isStopDrawingFrames = true;

        if (self.gainNode) {
            self.gainNode.disconnect();
            self.gainNode = null;
        }

        if (self.audioSources.length) {
            self.audioSources.forEach(function(source) {
                source.disconnect();
            });
            self.audioSources = [];
        }

        if (self.audioDestination) {
            self.audioDestination.disconnect();
            self.audioDestination = null;
        }

        self.audioContext = null;

        context.clearRect(0, 0, canvas.width, canvas.height);

        if (canvas.stream) {
            canvas.stream.stop();
            canvas.stream = null;
        }
    };

    this.resetVideoStreams = function(streams) {
        if (streams && !(streams instanceof Array)) {
            streams = [streams];
        }

        resetVideoStreams(streams);
    };

    function resetVideoStreams(streams) {
        videos = [];
        streams = streams || arrayOfMediaStreams;

        // via: @adrian-ber
        streams.forEach(function(stream) {
            if (!stream.getVideoTracks().length) {
                return;
            }

            var video = getVideo(stream);
            video.stream = stream;
            videos.push(video);
        });
    }

    // for debugging
    this.name = 'MultiStreamsMixer';
    this.toString = function() {
        return this.name;
    };

    this.getMixedStream = getMixedStream;

}

// _____________________________
// Cross-Browser-Declarations.js

var browserFakeUserAgent = 'Fake/5.0 (FakeOS) AppleWebKit/123 (KHTML, like Gecko) Fake/12.3.4567.89 Fake/123.45';

(function(that) {
    if (typeof window !== 'undefined') {
        return;
    }

    if (typeof window === 'undefined' && typeof global !== 'undefined') {
        global.navigator = {
            userAgent: browserFakeUserAgent,
            getUserMedia: function() {}
        };

        /*global window:true */
        that.window = global;
    } else if (typeof window === 'undefined') {
        // window = this;
    }

    if (typeof document === 'undefined') {
        /*global document:true */
        that.document = {};

        document.createElement = document.captureStream = document.mozCaptureStream = function() {
            return {};
        };
    }

    if (typeof location === 'undefined') {
        /*global location:true */
        that.location = {
            protocol: 'file:',
            href: '',
            hash: ''
        };
    }

    if (typeof screen === 'undefined') {
        /*global screen:true */
        that.screen = {
            width: 0,
            height: 0
        };
    }
})(typeof global !== 'undefined' ? global : window);

// WebAudio API representer
var AudioContext = window.AudioContext;

if (typeof AudioContext === 'undefined') {
    if (typeof webkitAudioContext !== 'undefined') {
        /*global AudioContext:true */
        AudioContext = webkitAudioContext;
    }

    if (typeof mozAudioContext !== 'undefined') {
        /*global AudioContext:true */
        AudioContext = mozAudioContext;
    }
}

if (typeof window === 'undefined') {
    /*jshint -W020 */
    window = {};
}

// WebAudio API representer
var AudioContext = window.AudioContext;

if (typeof AudioContext === 'undefined') {
    if (typeof webkitAudioContext !== 'undefined') {
        /*global AudioContext:true */
        AudioContext = webkitAudioContext;
    }

    if (typeof mozAudioContext !== 'undefined') {
        /*global AudioContext:true */
        AudioContext = mozAudioContext;
    }
}

/*jshint -W079 */
var URL = window.URL;

if (typeof URL === 'undefined' && typeof webkitURL !== 'undefined') {
    /*global URL:true */
    URL = webkitURL;
}

if (typeof navigator !== 'undefined') {
    if (typeof navigator.webkitGetUserMedia !== 'undefined') {
        navigator.getUserMedia = navigator.webkitGetUserMedia;
    }

    if (typeof navigator.mozGetUserMedia !== 'undefined') {
        navigator.getUserMedia = navigator.mozGetUserMedia;
    }
    if(typeof navigator.mediaDevices !=='undefined' && typeof navigator.mediaDevices.getUserMedia !== 'undefined'){
        navigator.getUserMedia = navigator.mediaDevices.getUserMedia;
     }
} else {
    navigator = {
        getUserMedia: function() {},
        userAgent: browserFakeUserAgent
    };
}

var IsEdge = navigator.userAgent.indexOf('Edge') !== -1 && (!!navigator.msSaveBlob || !!navigator.msSaveOrOpenBlob);

var IsOpera = false;
if (typeof opera !== 'undefined' && navigator.userAgent && navigator.userAgent.indexOf('OPR/') !== -1) {
    IsOpera = true;
}
var IsChrome = !IsEdge && !IsEdge && !!navigator.webkitGetUserMedia;

var MediaStream = window.MediaStream;

if (typeof MediaStream === 'undefined' && typeof webkitMediaStream !== 'undefined') {
    MediaStream = webkitMediaStream;
}

/*global MediaStream:true */
if (typeof MediaStream !== 'undefined') {
    if (!('getVideoTracks' in MediaStream.prototype)) {
        MediaStream.prototype.getVideoTracks = function() {
            if (!this.getTracks) {
                return [];
            }

            var tracks = [];
            this.getTracks.forEach(function(track) {
                if (track.kind.toString().indexOf('video') !== -1) {
                    tracks.push(track);
                }
            });
            return tracks;
        };

        MediaStream.prototype.getAudioTracks = function() {
            if (!this.getTracks) {
                return [];
            }

            var tracks = [];
            this.getTracks.forEach(function(track) {
                if (track.kind.toString().indexOf('audio') !== -1) {
                    tracks.push(track);
                }
            });
            return tracks;
        };
    }

    if (!('stop' in MediaStream.prototype)) {
        MediaStream.prototype.stop = function() {
            this.getAudioTracks().forEach(function(track) {
                if (!!track.stop) {
                    track.stop();
                }
            });

            this.getVideoTracks().forEach(function(track) {
                if (!!track.stop) {
                    track.stop();
                }
            });
        };
    }
}

if (typeof location !== 'undefined') {
    if (location.href.indexOf('file:') === 0) {
        console.error('Please load this HTML file on HTTP or HTTPS.');
    }
}

// Merge all other data-types except "function"

function mergeProps(mergein, mergeto) {
    for (var t in mergeto) {
        if (typeof mergeto[t] !== 'function') {
            mergein[t] = mergeto[t];
        }
    }
    return mergein;
}

// "dropFirstFrame" has been added by Graham Roth
// https://github.com/gsroth

function dropFirstFrame(arr) {
    arr.shift();
    return arr;
}

/**
 * @param {Blob} file - File or Blob object. This parameter is required.
 * @param {string} fileName - Optional file name e.g. "Recorded-Video.webm"
 * @example
 * invokeSaveAsDialog(blob or file, [optional] fileName);
 * @see {@link https://github.com/muaz-khan/RecordRTC|RecordRTC Source Code}
 */
function invokeSaveAsDialog(file, fileName) {
    if (!file) {
        throw 'Blob object is required.';
    }

    if (!file.type) {
        try {
            file.type = 'video/webm';
        } catch (e) {}
    }

    var fileExtension = (file.type || 'video/webm').split('/')[1];

    if (fileName && fileName.indexOf('.') !== -1) {
        var splitted = fileName.split('.');
        fileName = splitted[0];
        fileExtension = splitted[1];
    }

    var fileFullName = (fileName || (Math.round(Math.random() * 9999999999) + 888888888)) + '.' + fileExtension;

    if (typeof navigator.msSaveOrOpenBlob !== 'undefined') {
        return navigator.msSaveOrOpenBlob(file, fileFullName);
    } else if (typeof navigator.msSaveBlob !== 'undefined') {
        return navigator.msSaveBlob(file, fileFullName);
    }

    var hyperlink = document.createElement('a');
    hyperlink.href = URL.createObjectURL(file);
    hyperlink.target = '_blank';
    hyperlink.download = fileFullName;

    if (!!navigator.mozGetUserMedia) {
        hyperlink.onclick = function() {
            (document.body || document.documentElement).removeChild(hyperlink);
        };
        (document.body || document.documentElement).appendChild(hyperlink);
    }

    var evt = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true
    });

    hyperlink.dispatchEvent(evt);

    if (!navigator.mozGetUserMedia) {
        URL.revokeObjectURL(hyperlink.href);
    }
}

function bytesToSize(bytes) {
    var k = 1000;
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) {
        return '0 Bytes';
    }
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(k)), 10);
    return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
}

// ______________ (used to handle stuff like http://goo.gl/xmE5eg) issue #129
// ObjectStore.js
var ObjectStore = {
    AudioContext: AudioContext
};

function isMediaRecorderCompatible() {
    var isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
    var isChrome = !!window.chrome && !isOpera;
    var isFirefox = typeof window.InstallTrigger !== 'undefined';

    if (isFirefox) {
        return true;
    }

    if (!isChrome) {
        return false;
    }

    var nVer = navigator.appVersion;
    var nAgt = navigator.userAgent;
    var fullVersion = '' + parseFloat(navigator.appVersion);
    var majorVersion = parseInt(navigator.appVersion, 10);
    var nameOffset, verOffset, ix;

    if (isChrome) {
        verOffset = nAgt.indexOf('Chrome');
        fullVersion = nAgt.substring(verOffset + 7);
    }

    // trim the fullVersion string at semicolon/space if present
    if ((ix = fullVersion.indexOf(';')) !== -1) {
        fullVersion = fullVersion.substring(0, ix);
    }

    if ((ix = fullVersion.indexOf(' ')) !== -1) {
        fullVersion = fullVersion.substring(0, ix);
    }

    majorVersion = parseInt('' + fullVersion, 10);

    if (isNaN(majorVersion)) {
        fullVersion = '' + parseFloat(navigator.appVersion);
        majorVersion = parseInt(navigator.appVersion, 10);
    }

    return majorVersion >= 49;
}

// ==================
// MediaRecorder.js

/**
 * Implementation of https://dvcs.w3.org/hg/dap/raw-file/default/media-stream-capture/MediaRecorder.html
 * The MediaRecorder accepts a mediaStream as input source passed from UA. When recorder starts,
 * a MediaEncoder will be created and accept the mediaStream as input source.
 * Encoder will get the raw data by track data changes, encode it by selected MIME Type, then store the encoded in EncodedBufferCache object.
 * The encoded data will be extracted on every timeslice passed from Start function call or by RequestData function.
 * Thread model:
 * When the recorder starts, it creates a "Media Encoder" thread to read data from MediaEncoder object and store buffer in EncodedBufferCache object.
 * Also extract the encoded data and create blobs on every timeslice passed from start function or RequestData function called by UA.
 */

function MediaRecorderWrapper(mediaStream) {
    var self = this;

    /**
     * This method records MediaStream.
     * @method
     * @memberof MediaStreamRecorder
     * @example
     * recorder.start(5000);
     */
    this.start = function(timeSlice, __disableLogs) {
        this.timeSlice = timeSlice || 5000;

        if (!self.mimeType) {
            self.mimeType = 'video/webm';
        }

        if (self.mimeType.indexOf('audio') !== -1) {
            if (mediaStream.getVideoTracks().length && mediaStream.getAudioTracks().length) {
                var stream;
                if (!!navigator.mozGetUserMedia) {
                    stream = new MediaStream();
                    stream.addTrack(mediaStream.getAudioTracks()[0]);
                } else {
                    // webkitMediaStream
                    stream = new MediaStream(mediaStream.getAudioTracks());
                }
                mediaStream = stream;
            }
        }

        if (self.mimeType.indexOf('audio') !== -1) {
            self.mimeType = IsChrome ? 'audio/webm' : 'audio/ogg';
        }

        self.dontFireOnDataAvailableEvent = false;

        var recorderHints = {
            mimeType: self.mimeType,
			videoBitsPerSecond : 800000
        };

        if (!self.disableLogs && !__disableLogs) {
            console.log('Passing following params over MediaRecorder API.', recorderHints);
        }

        if (mediaRecorder) {
            // mandatory to make sure Firefox doesn't fails to record streams 3-4 times without reloading the page.
            mediaRecorder = null;
        }

        if (IsChrome && !isMediaRecorderCompatible()) {
            // to support video-only recording on stable
            recorderHints = 'video/vp8';
        }

        // http://dxr.mozilla.org/mozilla-central/source/content/media/MediaRecorder.cpp
        // https://wiki.mozilla.org/Gecko:MediaRecorder
        // https://dvcs.w3.org/hg/dap/raw-file/default/media-stream-capture/MediaRecorder.html

        // starting a recording session; which will initiate "Reading Thread"
        // "Reading Thread" are used to prevent main-thread blocking scenarios
        try {
            mediaRecorder = new MediaRecorder(mediaStream, recorderHints);
			} catch (e) {
            // if someone passed NON_supported mimeType
            // or if Firefox on Android
            mediaRecorder = new MediaRecorder(mediaStream);
			}

        if ('canRecordMimeType' in mediaRecorder && mediaRecorder.canRecordMimeType(self.mimeType) === false) {
            if (!self.disableLogs) {
                console.warn('MediaRecorder API seems unable to record mimeType:', self.mimeType);
            }
        }

        // i.e. stop recording when <video> is paused by the user; and auto restart recording 
        // when video is resumed. E.g. yourStream.getVideoTracks()[0].muted = true; // it will auto-stop recording.
        if (self.ignoreMutedMedia === true) {
            mediaRecorder.ignoreMutedMedia = true;
        }

        var firedOnDataAvailableOnce = false;

        // Dispatching OnDataAvailable Handler
        mediaRecorder.ondataavailable = function(e) {
            // how to fix FF-corrupt-webm issues?
            // should we leave this?          e.data.size < 26800
            if (!e.data || !e.data.size /*|| e.data.size < 26800*/ || firedOnDataAvailableOnce) {
                return;
            }

            firedOnDataAvailableOnce = true;

           /* var blob = self.getNativeBlob ? e.data : new Blob([e.data], {
                type: self.mimeType || 'video/webm'
            });*/
            var blob = self.getNativeBlob ? e.data : new Blob([e.data], {
                type: (e.data && e.data.type) ? e.data.type : (self.mimeType || 'video/webm')
            });

            self.ondataavailable(blob);

            // self.dontFireOnDataAvailableEvent = true;

            if (!!mediaRecorder && mediaRecorder.state === 'recording') {
                mediaRecorder.stop();
            }
            mediaRecorder = null;

            if (self.dontFireOnDataAvailableEvent) {
                return;
            }

            // record next interval
            self.start(timeSlice, '__disableLogs');
        };

        mediaRecorder.onerror = function(error) {
            if (!self.disableLogs) {
                if (error.name === 'InvalidState') {
                    console.error('The MediaRecorder is not in a state in which the proposed operation is allowed to be executed.');
                } else if (error.name === 'OutOfMemory') {
                    console.error('The UA has exhaused the available memory. User agents SHOULD provide as much additional information as possible in the message attribute.');
                } else if (error.name === 'IllegalStreamModification') {
                    console.error('A modification to the stream has occurred that makes it impossible to continue recording. An example would be the addition of a Track while recording is occurring. User agents SHOULD provide as much additional information as possible in the message attribute.');
                } else if (error.name === 'OtherRecordingError') {
                    console.error('Used for an fatal error other than those listed above. User agents SHOULD provide as much additional information as possible in the message attribute.');
                } else if (error.name === 'GenericError') {
                    console.error('The UA cannot provide the codec or recording option that has been requested.', error);
                } else {
                    console.error('MediaRecorder Error', error);
                }
            }

            // When the stream is "ended" set recording to 'inactive' 
            // and stop gathering data. Callers should not rely on 
            // exactness of the timeSlice value, especially 
            // if the timeSlice value is small. Callers should 
            // consider timeSlice as a minimum value

            if (!!mediaRecorder && mediaRecorder.state !== 'inactive' && mediaRecorder.state !== 'stopped') {
                mediaRecorder.stop();
            }
        };

        // void start(optional long mTimeSlice)
        // The interval of passing encoded data from EncodedBufferCache to onDataAvailable
        // handler. "mTimeSlice < 0" means Session object does not push encoded data to
        // onDataAvailable, instead, it passive wait the client side pull encoded data
        // by calling requestData API.
        try {
            mediaRecorder.start(3.6e+6);
        } catch (e) {
            mediaRecorder = null;
        }

        setTimeout(function() {
            if (!mediaRecorder) {
                return;
            }

            if (mediaRecorder.state === 'recording') {
                // "stop" method auto invokes "requestData"!
                //
                if(examinerRecordingLive)
                mediaRecorder.requestData();
				// mediaRecorder.stop();
            }
        }, timeSlice);
		

        // Start recording. If timeSlice has been provided, mediaRecorder will
        // raise a dataavailable event containing the Blob of collected data on every timeSlice milliseconds.
        // If timeSlice isn't provided, UA should call the RequestData to obtain the Blob data, also set the mTimeSlice to zero.
    };

    /**
     * This method stops recording MediaStream.
     * @param {function} callback - Callback function, that is used to pass recorded blob back to the callee.
     * @method
     * @memberof MediaStreamRecorder
     * @example
     * recorder.stop(function(blob) {
     *     video.src = URL.createObjectURL(blob);
     * });
     */
    this.stop = function(callback) {
        if (!mediaRecorder) {
            return;
        }

        // mediaRecorder.state === 'recording' means that media recorder is associated with "session"
        // mediaRecorder.state === 'stopped' means that media recorder is detached from the "session" ... in this case; "session" will also be deleted.

        if (mediaRecorder.state === 'recording') {
            // "stop" method auto invokes "requestData"!
			mediaRecorder.requestData();
			clearTimeout(flagToRemoveSetTimeOut);
			isRecording=false;
			timeRecorded=0;
			if(!fromPreRequisitesPage && !isVideoResponseFromGrpInstru)
			mockVar.curQuesBean.quesParam.answer='recordingStopped';
			setTimeout(function() {
                self.dontFireOnDataAvailableEvent = true;
                if (!!mediaRecorder && mediaRecorder.state === 'recording') {
                    mediaRecorder.stop();
                }
                mediaRecorder = null;
                self.onstop();
            }, 2000);
        }
    };

    /**
     * This method pauses the recording process.
     * @method
     * @memberof MediaStreamRecorder
     * @example
     * recorder.pause();
     */
    this.pause = function() {
        if (!mediaRecorder) {
            return;
        }

        if (mediaRecorder.state === 'recording') {
            mediaRecorder.pause();
        }

        this.dontFireOnDataAvailableEvent = true;
    };

    /**
     * The recorded blobs are passed over this event.
     * @event
     * @memberof MediaStreamRecorder
     * @example
     * recorder.ondataavailable = function(data) {};
     */
    this.ondataavailable = function(blob) {
        console.log('recorded-blob', blob);
    };

    /**
     * This method resumes the recording process.
     * @method
     * @memberof MediaStreamRecorder
     * @example
     * recorder.resume();
     */
    this.resume = function() {
        /*if (this.dontFireOnDataAvailableEvent) {
			this.dontFireOnDataAvailableEvent = false;

            var disableLogs = self.disableLogs;
            self.disableLogs = true;
            this.start(this.timeslice || 5000);
            self.disableLogs = disableLogs;
            return;
        }
		*/if (!mediaRecorder) {
            return;
        }
		if (mediaRecorder.state === 'paused') {
			mediaRecorder.resume();
        }
    };

    /**
     * This method resets currently recorded data.
     * @method
     * @memberof MediaStreamRecorder
     * @example
     * recorder.clearRecordedData();
     */
    this.clearRecordedData = function() {
        if (!mediaRecorder) {
            return;
        }

        this.pause();

        this.dontFireOnDataAvailableEvent = true;
        this.stop();
    };

    this.onstop = function() {};

    // Reference to "MediaRecorder" object
    var mediaRecorder;

    function isMediaStreamActive() {
        if ('active' in mediaStream) {
            if (!mediaStream.active) {
                return false;
            }
        } else if ('ended' in mediaStream) { // old hack
            if (mediaStream.ended) {
                return false;
            }
        }
        return true;
    }

    // this method checks if media stream is stopped
    // or any track is ended.
    (function looper() {
        if (!mediaRecorder) {
            return;
        }

        if (isMediaStreamActive() === false) {
            self.stop();
            return;
        }

        setTimeout(looper, 1000); // check every second
    })();
}

if (typeof MediaStreamRecorder !== 'undefined') {
    MediaStreamRecorder.MediaRecorderWrapper = MediaRecorderWrapper;
}

// ======================
// StereoAudioRecorder.js

function StereoAudioRecorder(mediaStream) {
    // void start(optional long timeSlice)
    // timestamp to fire "ondataavailable"
    this.start = function(timeSlice) {
        timeSlice = timeSlice || 1000;

        mediaRecorder = new StereoAudioRecorderHelper(mediaStream, this);

        mediaRecorder.record();
       
        setTimeout(function() {
            if (!mediaRecorder) {
                return;
            }

            if (mediaRecorder.state === 'recording') {
                // "stop" method auto invokes "requestData"!
                //
                if(examinerRecordingLive)
                mediaRecorder.requestData();
				// mediaRecorder.stop();
            }
        }, timeSlice);
    };

    this.stop = function() {
	    if (!mediaRecorder) {
	        return;
	    }
	
	    // mediaRecorder.state === 'recording' means that media recorder is associated with "session"
	    // mediaRecorder.state === 'stopped' means that media recorder is detached from the "session" ... in this case; "session" will also be deleted.
	
	    if (mediaRecorder.state === 'recording') {
	        // "stop" method auto invokes "requestData"!
			mediaRecorder.requestData();
			clearTimeout(flagToRemoveSetTimeOut);
			isRecording=false;
			timeRecorded=0;
			if(!fromPreRequisitesPage && !isVideoResponseFromGrpInstru)
			mockVar.curQuesBean.quesParam.answer='recordingStopped';
			setTimeout(function() {
	            self.dontFireOnDataAvailableEvent = true;
	            if (!!mediaRecorder && mediaRecorder.state === 'recording') {
	                mediaRecorder.stop();
	            }
	            mediaRecorder = null;
	            self.onstop();
	        }, 2000);
	    }
    };

    this.pause = function() {
        if (!mediaRecorder) {
             return;
         }

         if (mediaRecorder.state === 'recording') {
             mediaRecorder.pause();
         }
     };

     this.resume = function() {
         if (!mediaRecorder) {
             return;
         }
 		if (mediaRecorder.state === 'paused') {
 			mediaRecorder.resume();
         }
     };

    this.ondataavailable = function(blob) {console.log(blob +"wav");mediaRecorder.blobs.push(data);};
    this.onstop = function() {};

    // Reference to "StereoAudioRecorder" object
    var mediaRecorder;
    var timeout;
}

if (typeof MediaStreamRecorder !== 'undefined') {
    MediaStreamRecorder.StereoAudioRecorder = StereoAudioRecorder;
}

// ============================
// StereoAudioRecorderHelper.js

// source code from: http://typedarray.org/wp-content/projects/WebAudioRecorder/script.js

function StereoAudioRecorderHelper(mediaStream, root) {

    // variables    
    var deviceSampleRate = 44100; // range: 22050 to 96000

    if (!ObjectStore.AudioContextConstructor) {
        ObjectStore.AudioContextConstructor = new ObjectStore.AudioContext();
    }

    // check device sample rate
    deviceSampleRate = ObjectStore.AudioContextConstructor.sampleRate;

    var leftchannel = [];
    var rightchannel = [];
    var scriptprocessornode;
    var recording = false;
    var recordingLength = 0;
    var volume;
    var audioInput;
    var sampleRate = root.sampleRate || deviceSampleRate;
    var state = "";
    var mimeType = root.mimeType || 'audio/wav';
    var isPCM = mimeType.indexOf('audio/pcm') > -1;

    var context;

    var numChannels = root.audioChannels || 1;
    if(reduceNumChannels>0)
    	numChannels = reduceNumChannels;
    this.record = function() {
        recording = true;
        this.state = "recording";
        // reset the buffers for the new recording
        leftchannel.length = rightchannel.length = 0;
        recordingLength = 0;
    };

    this.requestData = function() {
        if (isPaused) {
            return;
        }

        if (recordingLength === 0) {
            requestDataInvoked = false;
            return;
        }

        requestDataInvoked = true;
        // clone stuff
        var internalLeftChannel = leftchannel.slice(0);
        var internalRightChannel = rightchannel.slice(0);
        var internalRecordingLength = recordingLength;

        // reset the buffers for the new recording
        leftchannel.length = rightchannel.length = [];
        recordingLength = 0;
        requestDataInvoked = false;

        // we flat the left and right channels down
        var leftBuffer = mergeBuffers(internalLeftChannel, internalRecordingLength);

        var interleaved = leftBuffer;

        // we interleave both channels together
        if (numChannels === 2) {
            var rightBuffer = mergeBuffers(internalRightChannel, internalRecordingLength); // bug fixed via #70,#71
            interleaved = interleave(leftBuffer, rightBuffer);
        }

        if (isPCM) {
            // our final binary blob
            var blob = new Blob([convertoFloat32ToInt16(interleaved)], {
                type: 'audio/pcm'
            });

            console.debug('audio recorded blob size:', bytesToSize(blob.size));
            root.ondataavailable(blob);
            return;
        }

        // we create our wav file
        if(isDownsamplingReq){
        	interleaved = downsampleBuffer(interleaved,rateToDownsample, deviceSampleRate);
        	sampleRate = rateToDownsample;
        }
        var buffer = new ArrayBuffer(44 + interleaved.length * 2);
        var view = new DataView(buffer);

        // RIFF chunk descriptor
        writeUTFBytes(view, 0, 'RIFF');

        // -8 (via #97)
        view.setUint32(4, 44 + interleaved.length * 2 - 8, true);

        writeUTFBytes(view, 8, 'WAVE');
        // FMT sub-chunk
        writeUTFBytes(view, 12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        // stereo (2 channels)
        view.setUint16(22, numChannels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * numChannels * 2, true); // numChannels * 2 (via #71)
        view.setUint16(32, numChannels * 2, true);
        view.setUint16(34, 16, true);
        // data sub-chunk
        writeUTFBytes(view, 36, 'data');
        view.setUint32(40, interleaved.length * 2, true);

        // write the PCM samples
        var lng = interleaved.length;
        var index = 44;
        var volume = 1;
        for (var i = 0; i < lng; i++) {
            view.setInt16(index, interleaved[i] * (0x7FFF * volume), true);
            index += 2;
        }

        // our final binary blob
        var blob = new Blob([view], {
            type: 'audio/wav'
        });

        console.debug('audio recorded blob size:', bytesToSize(blob.size));

        root.ondataavailable(blob);
    };
    this.stop = function() {
        // we stop recording
        recording = false;
        this.requestData();

        audioInput.disconnect();
        this.onstop();
    };

    function interleave(leftChannel, rightChannel) {
        var length = leftChannel.length + rightChannel.length;
        var result = new Float32Array(length);

        var inputIndex = 0;

        for (var index = 0; index < length;) {
            result[index++] = leftChannel[inputIndex];
            result[index++] = rightChannel[inputIndex];
            inputIndex++;
        }
        return result;
    }

    function mergeBuffers(channelBuffer, recordingLength) {
        var result = new Float32Array(recordingLength);
        var offset = 0;
        var lng = channelBuffer.length;
        for (var i = 0; i < lng; i++) {
            var buffer = channelBuffer[i];
            result.set(buffer, offset);
            offset += buffer.length;
        }
        return result;
    }

    function writeUTFBytes(view, offset, string) {
        var lng = string.length;
        for (var i = 0; i < lng; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    }

    function convertoFloat32ToInt16(buffer) {
        var l = buffer.length;
        var buf = new Int16Array(l)

        while (l--) {
            buf[l] = buffer[l] * 0xFFFF; //convert to 16 bit
        }
        return buf.buffer
    }

    // creates the audio context
    var context = ObjectStore.AudioContextConstructor;

    // creates a gain node
    ObjectStore.VolumeGainNode = context.createGain();

    var volume = ObjectStore.VolumeGainNode;

    // creates an audio node from the microphone incoming stream
    ObjectStore.AudioInput = context.createMediaStreamSource(mediaStream);

    // creates an audio node from the microphone incoming stream
    var audioInput = ObjectStore.AudioInput;

    // connect the stream to the gain node
    audioInput.connect(volume);

    /* From the spec: This value controls how frequently the audioprocess event is
    dispatched and how many sample-frames need to be processed each call.
    Lower values for buffer size will result in a lower (better) latency.
    Higher values will be necessary to avoid audio breakup and glitches 
    Legal values are 256, 512, 1024, 2048, 4096, 8192, and 16384.*/
    var bufferSize = root.bufferSize || 2048;
    if (root.bufferSize === 0) {
        bufferSize = 0;
    }

    if (context.createJavaScriptNode) {
        scriptprocessornode = context.createJavaScriptNode(bufferSize, numChannels, numChannels);
    } else if (context.createScriptProcessor) {
        scriptprocessornode = context.createScriptProcessor(bufferSize, numChannels, numChannels);
    } else {
        throw 'WebAudio API has no support on this browser.';
    }

    bufferSize = scriptprocessornode.bufferSize;

    console.debug('using audio buffer-size:', bufferSize);

    var requestDataInvoked = false;

    // sometimes "scriptprocessornode" disconnects from he destination-node
    // and there is no exception thrown in this case.
    // and obviously no further "ondataavailable" events will be emitted.
    // below global-scope variable is added to debug such unexpected but "rare" cases.
    window.scriptprocessornode = scriptprocessornode;

    if (numChannels === 1) {
        console.debug('All right-channels are skipped.');
    }

    var isPaused = false;

    this.pause = function() {
        isPaused = true;
        this.state = "paused";
    };

    this.resume = function() {
        isPaused = false;
    };

    this.onstop = function() {};

    // http://webaudio.github.io/web-audio-api/#the-scriptprocessornode-interface
    scriptprocessornode.onaudioprocess = function(e) {
        if (!recording || requestDataInvoked || isPaused) {
            return;
        }

        var left = e.inputBuffer.getChannelData(0);
        leftchannel.push(new Float32Array(left));

        if (numChannels === 2) {
            var right = e.inputBuffer.getChannelData(1);
            rightchannel.push(new Float32Array(right));
        }
        recordingLength += bufferSize;
    };

    volume.connect(scriptprocessornode);
    scriptprocessornode.connect(context.destination);
}

if (typeof MediaStreamRecorder !== 'undefined') {
    MediaStreamRecorder.StereoAudioRecorderHelper = StereoAudioRecorderHelper;
}

// ===================
// WhammyRecorder.js

function WhammyRecorder(mediaStream) {
    // void start(optional long timeSlice)
    // timestamp to fire "ondataavailable"
    this.start = function(timeSlice) {
        timeSlice = timeSlice || 1000;

        mediaRecorder = new WhammyRecorderHelper(mediaStream, this);

        for (var prop in this) {
            if (typeof this[prop] !== 'function') {
                mediaRecorder[prop] = this[prop];
            }
        }

        mediaRecorder.record();

       setTimeout(function() {
            if (!mediaRecorder) {
                return;
            }

            if (mediaRecorder.state === 'recording') {
                // "stop" method auto invokes "requestData"!
                //
                if(examinerRecordingLive)
                mediaRecorder.requestData();
				// mediaRecorder.stop();
            }
        }, timeSlice);
    };

    this.stop = function() {
        if (!mediaRecorder) {
            return;
        }

        // mediaRecorder.state === 'recording' means that media recorder is associated with "session"
        // mediaRecorder.state === 'stopped' means that media recorder is detached from the "session" ... in this case; "session" will also be deleted.

        if (mediaRecorder.state === 'recording') {
            // "stop" method auto invokes "requestData"!
			mediaRecorder.requestData();
			clearTimeout(flagToRemoveSetTimeOut);
			isRecording=false;
			timeRecorded=0;
			if(!fromPreRequisitesPage && !isVideoResponseFromGrpInstru)
			mockVar.curQuesBean.quesParam.answer='recordingStopped';
			setTimeout(function() {
                self.dontFireOnDataAvailableEvent = true;
                if (!!mediaRecorder && mediaRecorder.state === 'recording') {
                    mediaRecorder.stop();
                }
                mediaRecorder = null;
                self.onstop();
            }, 2000);
        }
    };

    this.onstop = function() {};

    this.clearOldRecordedFrames = function() {
        if (mediaRecorder) {
            mediaRecorder.clearOldRecordedFrames();
        }
    };

    this.pause = function() {
       if (!mediaRecorder) {
            return;
        }

        if (mediaRecorder.state === 'recording') {
            mediaRecorder.pause();
        }
    };

    this.resume = function() {
        if (!mediaRecorder) {
            return;
        }
		if (mediaRecorder.state === 'paused') {
			mediaRecorder.resume();
        }
    };

    this.ondataavailable = function() {};

    // Reference to "WhammyRecorder" object
    var mediaRecorder;
    var timeout;
}

if (typeof MediaStreamRecorder !== 'undefined') {
    MediaStreamRecorder.WhammyRecorder = WhammyRecorder;
}

// ==========================
// WhammyRecorderHelper.js

function WhammyRecorderHelper(mediaStream, root) {
    this.record = function(timeSlice) {
        if (!this.width) {
            this.width = 320;
        }
        if (!this.height) {
            this.height = 240;
        }

        if (this.video && this.video instanceof HTMLVideoElement) {
            if (!this.width) {
                this.width = video.videoWidth || video.clientWidth || 320;
            }
            if (!this.height) {
                this.height = video.videoHeight || video.clientHeight || 240;
            }
        }

        if (!this.video) {
            this.video = {
                width: this.width,
                height: this.height
            };
        }

        if (!this.canvas || !this.canvas.width || !this.canvas.height) {
            this.canvas = {
                width: this.width,
                height: this.height
            };
        }

        canvas.width = this.canvas.width;
        canvas.height = this.canvas.height;

        // setting defaults
        if (this.video && this.video instanceof HTMLVideoElement) {
            this.isHTMLObject = true;
            video = this.video.cloneNode();
        } else {
            video = document.createElement('video');
            //video.src = URL.createObjectURL(mediaStream);
			if("srcObject" in video)
			video.srcObject = mediaStream;
			else
			video.src= URL.createObjectURL(mediaStream);
            video.width = this.video.width;
            video.height = this.video.height;
        }

        video.muted = true;
        video.play();

        lastTime = new Date().getTime();
        whammy = new Whammy.Video(root.speed, root.quality);

        console.log('canvas resolutions', canvas.width, '*', canvas.height);
        console.log('video width/height', video.width || canvas.width, '*', video.height || canvas.height);

        drawFrames();
    };

    this.clearOldRecordedFrames = function() {
        whammy.frames = [];
    };

    var requestDataInvoked = false;
    this.requestData = function() {
        if (isPaused) {
            return;
        }

        if (!whammy.frames.length) {
            requestDataInvoked = false;
            return;
        }

        requestDataInvoked = true;
        // clone stuff
        var internalFrames = whammy.frames.slice(0);

        // reset the frames for the new recording

        whammy.frames = dropBlackFrames(internalFrames, -1);

        whammy.compile(function(whammyBlob) {
            root.ondataavailable(whammyBlob);
            console.debug('video recorded blob size:', bytesToSize(whammyBlob.size));
        });

        whammy.frames = [];

        requestDataInvoked = false;
    };

    var isOnStartedDrawingNonBlankFramesInvoked = false;

    function drawFrames() {
        if (isPaused) {
            lastTime = new Date().getTime();
            setTimeout(drawFrames, 500);
            return;
        }

        if (isStopDrawing) {
            return;
        }

        if (requestDataInvoked) {
            return setTimeout(drawFrames, 100);
        }

        var duration = new Date().getTime() - lastTime;
        if (!duration) {
            return drawFrames();
        }

        // via webrtc-experiment#206, by Jack i.e. @Seymourr
        lastTime = new Date().getTime();

        if (!self.isHTMLObject && video.paused) {
            video.play(); // Android
        }

        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        if (!isStopDrawing) {
            whammy.frames.push({
                duration: duration,
                image: canvas.toDataURL('image/webp')
            });
        }

        if (!isOnStartedDrawingNonBlankFramesInvoked && !isBlankFrame(whammy.frames[whammy.frames.length - 1])) {
            isOnStartedDrawingNonBlankFramesInvoked = true;
            root.onStartedDrawingNonBlankFrames();
        }

        setTimeout(drawFrames, 10);
    }

    var isStopDrawing = false;

    this.stop = function() {
        isStopDrawing = true;
        this.requestData();
        this.onstop();
    };

    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');

    var video;
    var lastTime;
    var whammy;

    var self = this;

    function isBlankFrame(frame, _pixTolerance, _frameTolerance) {
        var localCanvas = document.createElement('canvas');
        localCanvas.width = canvas.width;
        localCanvas.height = canvas.height;
        var context2d = localCanvas.getContext('2d');

        var sampleColor = {
            r: 0,
            g: 0,
            b: 0
        };
        var maxColorDifference = Math.sqrt(
            Math.pow(255, 2) +
            Math.pow(255, 2) +
            Math.pow(255, 2)
        );
        var pixTolerance = _pixTolerance && _pixTolerance >= 0 && _pixTolerance <= 1 ? _pixTolerance : 0;
        var frameTolerance = _frameTolerance && _frameTolerance >= 0 && _frameTolerance <= 1 ? _frameTolerance : 0;

        var matchPixCount, endPixCheck, maxPixCount;

        var image = new Image();
        image.src = frame.image;
        context2d.drawImage(image, 0, 0, canvas.width, canvas.height);
        var imageData = context2d.getImageData(0, 0, canvas.width, canvas.height);
        matchPixCount = 0;
        endPixCheck = imageData.data.length;
        maxPixCount = imageData.data.length / 4;

        for (var pix = 0; pix < endPixCheck; pix += 4) {
            var currentColor = {
                r: imageData.data[pix],
                g: imageData.data[pix + 1],
                b: imageData.data[pix + 2]
            };
            var colorDifference = Math.sqrt(
                Math.pow(currentColor.r - sampleColor.r, 2) +
                Math.pow(currentColor.g - sampleColor.g, 2) +
                Math.pow(currentColor.b - sampleColor.b, 2)
            );
            // difference in color it is difference in color vectors (r1,g1,b1) <=> (r2,g2,b2)
            if (colorDifference <= maxColorDifference * pixTolerance) {
                matchPixCount++;
            }
        }

        if (maxPixCount - matchPixCount <= maxPixCount * frameTolerance) {
            return false;
        } else {
            return true;
        }
    }

    function dropBlackFrames(_frames, _framesToCheck, _pixTolerance, _frameTolerance) {
        var localCanvas = document.createElement('canvas');
        localCanvas.width = canvas.width;
        localCanvas.height = canvas.height;
        var context2d = localCanvas.getContext('2d');
        var resultFrames = [];

        var checkUntilNotBlack = _framesToCheck === -1;
        var endCheckFrame = (_framesToCheck && _framesToCheck > 0 && _framesToCheck <= _frames.length) ?
            _framesToCheck : _frames.length;
        var sampleColor = {
            r: 0,
            g: 0,
            b: 0
        };
        var maxColorDifference = Math.sqrt(
            Math.pow(255, 2) +
            Math.pow(255, 2) +
            Math.pow(255, 2)
        );
        var pixTolerance = _pixTolerance && _pixTolerance >= 0 && _pixTolerance <= 1 ? _pixTolerance : 0;
        var frameTolerance = _frameTolerance && _frameTolerance >= 0 && _frameTolerance <= 1 ? _frameTolerance : 0;
        var doNotCheckNext = false;

        for (var f = 0; f < endCheckFrame; f++) {
            var matchPixCount, endPixCheck, maxPixCount;

            if (!doNotCheckNext) {
                var image = new Image();
                image.src = _frames[f].image;
                context2d.drawImage(image, 0, 0, canvas.width, canvas.height);
                var imageData = context2d.getImageData(0, 0, canvas.width, canvas.height);
                matchPixCount = 0;
                endPixCheck = imageData.data.length;
                maxPixCount = imageData.data.length / 4;

                for (var pix = 0; pix < endPixCheck; pix += 4) {
                    var currentColor = {
                        r: imageData.data[pix],
                        g: imageData.data[pix + 1],
                        b: imageData.data[pix + 2]
                    };
                    var colorDifference = Math.sqrt(
                        Math.pow(currentColor.r - sampleColor.r, 2) +
                        Math.pow(currentColor.g - sampleColor.g, 2) +
                        Math.pow(currentColor.b - sampleColor.b, 2)
                    );
                    // difference in color it is difference in color vectors (r1,g1,b1) <=> (r2,g2,b2)
                    if (colorDifference <= maxColorDifference * pixTolerance) {
                        matchPixCount++;
                    }
                }
            }

            if (!doNotCheckNext && maxPixCount - matchPixCount <= maxPixCount * frameTolerance) {
                // console.log('removed black frame : ' + f + ' ; frame duration ' + _frames[f].duration);
            } else {
                // console.log('frame is passed : ' + f);
                if (checkUntilNotBlack) {
                    doNotCheckNext = true;
                }
                resultFrames.push(_frames[f]);
            }
        }

        resultFrames = resultFrames.concat(_frames.slice(endCheckFrame));

        if (resultFrames.length <= 0) {
            // at least one last frame should be available for next manipulation
            // if total duration of all frames will be < 1000 than ffmpeg doesn't work well...
            resultFrames.push(_frames[_frames.length - 1]);
        }

        return resultFrames;
    }

    var isPaused = false;

    this.pause = function() {
        isPaused = true;
    };

    this.resume = function() {
        isPaused = false;
    };

    this.onstop = function() {};
}

if (typeof MediaStreamRecorder !== 'undefined') {
    MediaStreamRecorder.WhammyRecorderHelper = WhammyRecorderHelper;
}

// --------------
// GifRecorder.js

function GifRecorder(mediaStream) {
    if (typeof GIFEncoder === 'undefined') {
        throw 'Please link: https://cdn.webrtc-experiment.com/gif-recorder.js';
    }

    // void start(optional long timeSlice)
    // timestamp to fire "ondataavailable"
    this.start = function(timeSlice) {
        timeSlice = timeSlice || 1000;

        var imageWidth = this.videoWidth || 320;
        var imageHeight = this.videoHeight || 240;

        canvas.width = video.width = imageWidth;
        canvas.height = video.height = imageHeight;

        // external library to record as GIF images
        gifEncoder = new GIFEncoder();

        // void setRepeat(int iter)
        // Sets the number of times the set of GIF frames should be played.
        // Default is 1; 0 means play indefinitely.
        gifEncoder.setRepeat(0);

        // void setFrameRate(Number fps)
        // Sets frame rate in frames per second.
        // Equivalent to setDelay(1000/fps).
        // Using "setDelay" instead of "setFrameRate"
        gifEncoder.setDelay(this.frameRate || this.speed || 200);

        // void setQuality(int quality)
        // Sets quality of color quantization (conversion of images to the
        // maximum 256 colors allowed by the GIF specification).
        // Lower values (minimum = 1) produce better colors,
        // but slow processing significantly. 10 is the default,
        // and produces good color mapping at reasonable speeds.
        // Values greater than 20 do not yield significant improvements in speed.
        gifEncoder.setQuality(this.quality || 1);

        // Boolean start()
        // This writes the GIF Header and returns false if it fails.
        gifEncoder.start();

        startTime = Date.now();

        function drawVideoFrame(time) {
            if (isPaused) {
                setTimeout(drawVideoFrame, 500, time);
                return;
            }

            lastAnimationFrame = requestAnimationFrame(drawVideoFrame);

            if (typeof lastFrameTime === undefined) {
                lastFrameTime = time;
            }

            // ~10 fps
            if (time - lastFrameTime < 90) {
                return;
            }

            if (video.paused) {
                video.play(); // Android
            }

            context.drawImage(video, 0, 0, imageWidth, imageHeight);

            gifEncoder.addFrame(context);

            // console.log('Recording...' + Math.round((Date.now() - startTime) / 1000) + 's');
            // console.log("fps: ", 1000 / (time - lastFrameTime));

            lastFrameTime = time;
        }

        lastAnimationFrame = requestAnimationFrame(drawVideoFrame);

        timeout = setTimeout(doneRecording, timeSlice);
    };

    function doneRecording() {
        endTime = Date.now();

        var gifBlob = new Blob([new Uint8Array(gifEncoder.stream().bin)], {
            type: 'image/gif'
        });
        self.ondataavailable(gifBlob);

        // todo: find a way to clear old recorded blobs
        gifEncoder.stream().bin = [];
    }

    this.stop = function() {
        if (lastAnimationFrame) {
            cancelAnimationFrame(lastAnimationFrame);
            clearTimeout(timeout);
            doneRecording();
            this.onstop();
        }
    };

    this.onstop = function() {};

    var isPaused = false;

    this.pause = function() {
        isPaused = true;
    };

    this.resume = function() {
        isPaused = false;
    };

    this.ondataavailable = function() {};
    this.onstop = function() {};

    // Reference to itself
    var self = this;

    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');

    var video = document.createElement('video');
    video.muted = true;
    video.autoplay = true;
    //video.src = URL.createObjectURL(mediaStream);
   if("srcObject" in video)
	video.srcObject = mediaStream;
	else
	video.src= URL.createObjectURL(mediaStream);
    video.play();

    var lastAnimationFrame = null;
    var startTime, endTime, lastFrameTime;

    var gifEncoder;
    var timeout;
}

if (typeof MediaStreamRecorder !== 'undefined') {
    MediaStreamRecorder.GifRecorder = GifRecorder;
}

// https://github.com/antimatter15/whammy/blob/master/LICENSE
// _________
// Whammy.js

// todo: Firefox now supports webp for webm containers!
// their MediaRecorder implementation works well!
// should we provide an option to record via Whammy.js or MediaRecorder API is a better solution?

/**
 * Whammy is a standalone class used by {@link RecordRTC} to bring video recording in Chrome. It is written by {@link https://github.com/antimatter15|antimatter15}
 * @summary A real time javascript webm encoder based on a canvas hack.
 * @typedef Whammy
 * @class
 * @example
 * var recorder = new Whammy().Video(15);
 * recorder.add(context || canvas || dataURL);
 * var output = recorder.compile();
 */

var Whammy = (function() {
    // a more abstract-ish API

    function WhammyVideo(duration, quality) {
        this.frames = [];
        if (!duration) {
            duration = 1;
        }
        this.duration = 1000 / duration;
        this.quality = quality || 0.8;
    }

    /**
     * Pass Canvas or Context or image/webp(string) to {@link Whammy} encoder.
     * @method
     * @memberof Whammy
     * @example
     * recorder = new Whammy().Video(0.8, 100);
     * recorder.add(canvas || context || 'image/webp');
     * @param {string} frame - Canvas || Context || image/webp
     * @param {number} duration - Stick a duration (in milliseconds)
     */
    WhammyVideo.prototype.add = function(frame, duration) {
        if ('canvas' in frame) { //CanvasRenderingContext2D
            frame = frame.canvas;
        }

        if ('toDataURL' in frame) {
            frame = frame.toDataURL('image/webp', this.quality);
        }

        if (!(/^data:image\/webp;base64,/ig).test(frame)) {
            throw 'Input must be formatted properly as a base64 encoded DataURI of type image/webp';
        }
        this.frames.push({
            image: frame,
            duration: duration || this.duration
        });
    };

    function processInWebWorker(_function) {
        var blob = URL.createObjectURL(new Blob([_function.toString(),
            'this.onmessage =  function (e) {' + _function.name + '(e.data);}'
        ], {
            type: 'application/javascript'
        }));

        var worker = new Worker(blob);
        URL.revokeObjectURL(blob);
        return worker;
    }

    function whammyInWebWorker(frames) {
        function ArrayToWebM(frames) {
            var info = checkFrames(frames);
            if (!info) {
                return [];
            }

            var clusterMaxDuration = 30000;

            var EBML = [{
                'id': 0x1a45dfa3, // EBML
                'data': [{
                    'data': 1,
                    'id': 0x4286 // EBMLVersion
                }, {
                    'data': 1,
                    'id': 0x42f7 // EBMLReadVersion
                }, {
                    'data': 4,
                    'id': 0x42f2 // EBMLMaxIDLength
                }, {
                    'data': 8,
                    'id': 0x42f3 // EBMLMaxSizeLength
                }, {
                    'data': 'webm',
                    'id': 0x4282 // DocType
                }, {
                    'data': 2,
                    'id': 0x4287 // DocTypeVersion
                }, {
                    'data': 2,
                    'id': 0x4285 // DocTypeReadVersion
                }]
            }, {
                'id': 0x18538067, // Segment
                'data': [{
                    'id': 0x1549a966, // Info
                    'data': [{
                        'data': 1e6, //do things in millisecs (num of nanosecs for duration scale)
                        'id': 0x2ad7b1 // TimecodeScale
                    }, {
                        'data': 'whammy',
                        'id': 0x4d80 // MuxingApp
                    }, {
                        'data': 'whammy',
                        'id': 0x5741 // WritingApp
                    }, {
                        'data': doubleToString(info.duration),
                        'id': 0x4489 // Duration
                    }]
                }, {
                    'id': 0x1654ae6b, // Tracks
                    'data': [{
                        'id': 0xae, // TrackEntry
                        'data': [{
                            'data': 1,
                            'id': 0xd7 // TrackNumber
                        }, {
                            'data': 1,
                            'id': 0x73c5 // TrackUID
                        }, {
                            'data': 0,
                            'id': 0x9c // FlagLacing
                        }, {
                            'data': 'und',
                            'id': 0x22b59c // Language
                        }, {
                            'data': 'V_VP8',
                            'id': 0x86 // CodecID
                        }, {
                            'data': 'VP8',
                            'id': 0x258688 // CodecName
                        }, {
                            'data': 1,
                            'id': 0x83 // TrackType
                        }, {
                            'id': 0xe0, // Video
                            'data': [{
                                'data': info.width,
                                'id': 0xb0 // PixelWidth
                            }, {
                                'data': info.height,
                                'id': 0xba // PixelHeight
                            }]
                        }]
                    }]
                }]
            }];

            //Generate clusters (max duration)
            var frameNumber = 0;
            var clusterTimecode = 0;
            while (frameNumber < frames.length) {

                var clusterFrames = [];
                var clusterDuration = 0;
                do {
                    clusterFrames.push(frames[frameNumber]);
                    clusterDuration += frames[frameNumber].duration;
                    frameNumber++;
                } while (frameNumber < frames.length && clusterDuration < clusterMaxDuration);

                var clusterCounter = 0;
                var cluster = {
                    'id': 0x1f43b675, // Cluster
                    'data': getClusterData(clusterTimecode, clusterCounter, clusterFrames)
                }; //Add cluster to segment
                EBML[1].data.push(cluster);
                clusterTimecode += clusterDuration;
            }

            return generateEBML(EBML);
        }

        function getClusterData(clusterTimecode, clusterCounter, clusterFrames) {
            return [{
                'data': clusterTimecode,
                'id': 0xe7 // Timecode
            }].concat(clusterFrames.map(function(webp) {
                var block = makeSimpleBlock({
                    discardable: 0,
                    frame: webp.data.slice(4),
                    invisible: 0,
                    keyframe: 1,
                    lacing: 0,
                    trackNum: 1,
                    timecode: Math.round(clusterCounter)
                });
                clusterCounter += webp.duration;
                return {
                    data: block,
                    id: 0xa3
                };
            }));
        }

        // sums the lengths of all the frames and gets the duration

        function checkFrames(frames) {
            if (!frames[0]) {
                postMessage({
                    error: 'Something went wrong. Maybe WebP format is not supported in the current browser.'
                });
                return;
            }

            var width = frames[0].width,
                height = frames[0].height,
                duration = frames[0].duration;

            for (var i = 1; i < frames.length; i++) {
                duration += frames[i].duration;
            }
            return {
                duration: duration,
                width: width,
                height: height
            };
        }

        function numToBuffer(num) {
            var parts = [];
            while (num > 0) {
                parts.push(num & 0xff);
                num = num >> 8;
            }
            return new Uint8Array(parts.reverse());
        }

        function strToBuffer(str) {
            return new Uint8Array(str.split('').map(function(e) {
                return e.charCodeAt(0);
            }));
        }

        function bitsToBuffer(bits) {
            var data = [];
            var pad = (bits.length % 8) ? (new Array(1 + 8 - (bits.length % 8))).join('0') : '';
            bits = pad + bits;
            for (var i = 0; i < bits.length; i += 8) {
                data.push(parseInt(bits.substr(i, 8), 2));
            }
            return new Uint8Array(data);
        }

        function generateEBML(json) {
            var ebml = [];
            for (var i = 0; i < json.length; i++) {
                var data = json[i].data;

                if (typeof data === 'object') {
                    data = generateEBML(data);
                }

                if (typeof data === 'number') {
                    data = bitsToBuffer(data.toString(2));
                }

                if (typeof data === 'string') {
                    data = strToBuffer(data);
                }

                var len = data.size || data.byteLength || data.length;
                var zeroes = Math.ceil(Math.ceil(Math.log(len) / Math.log(2)) / 8);
                var sizeToString = len.toString(2);
                var padded = (new Array((zeroes * 7 + 7 + 1) - sizeToString.length)).join('0') + sizeToString;
                var size = (new Array(zeroes)).join('0') + '1' + padded;

                ebml.push(numToBuffer(json[i].id));
                ebml.push(bitsToBuffer(size));
                ebml.push(data);
            }

            return new Blob(ebml, {
                type: 'video/webm'
            });
        }

        function toBinStrOld(bits) {
            var data = '';
            var pad = (bits.length % 8) ? (new Array(1 + 8 - (bits.length % 8))).join('0') : '';
            bits = pad + bits;
            for (var i = 0; i < bits.length; i += 8) {
                data += String.fromCharCode(parseInt(bits.substr(i, 8), 2));
            }
            return data;
        }

        function makeSimpleBlock(data) {
            var flags = 0;

            if (data.keyframe) {
                flags |= 128;
            }

            if (data.invisible) {
                flags |= 8;
            }

            if (data.lacing) {
                flags |= (data.lacing << 1);
            }

            if (data.discardable) {
                flags |= 1;
            }

            if (data.trackNum > 127) {
                throw 'TrackNumber > 127 not supported';
            }

            var out = [data.trackNum | 0x80, data.timecode >> 8, data.timecode & 0xff, flags].map(function(e) {
                return String.fromCharCode(e);
            }).join('') + data.frame;

            return out;
        }

        function parseWebP(riff) {
            var VP8 = riff.RIFF[0].WEBP[0];

            var frameStart = VP8.indexOf('\x9d\x01\x2a'); // A VP8 keyframe starts with the 0x9d012a header
            for (var i = 0, c = []; i < 4; i++) {
                c[i] = VP8.charCodeAt(frameStart + 3 + i);
            }

            var width, height, tmp;

            //the code below is literally copied verbatim from the bitstream spec
            tmp = (c[1] << 8) | c[0];
            width = tmp & 0x3FFF;
            tmp = (c[3] << 8) | c[2];
            height = tmp & 0x3FFF;
            return {
                width: width,
                height: height,
                data: VP8,
                riff: riff
            };
        }

        function getStrLength(string, offset) {
            return parseInt(string.substr(offset + 4, 4).split('').map(function(i) {
                var unpadded = i.charCodeAt(0).toString(2);
                return (new Array(8 - unpadded.length + 1)).join('0') + unpadded;
            }).join(''), 2);
        }

        function parseRIFF(string) {
            var offset = 0;
            var chunks = {};

            while (offset < string.length) {
                var id = string.substr(offset, 4);
                var len = getStrLength(string, offset);
                var data = string.substr(offset + 4 + 4, len);
                offset += 4 + 4 + len;
                chunks[id] = chunks[id] || [];

                if (id === 'RIFF' || id === 'LIST') {
                    chunks[id].push(parseRIFF(data));
                } else {
                    chunks[id].push(data);
                }
            }
            return chunks;
        }

        function doubleToString(num) {
            return [].slice.call(
                new Uint8Array((new Float64Array([num])).buffer), 0).map(function(e) {
                return String.fromCharCode(e);
            }).reverse().join('');
        }

        var webm = new ArrayToWebM(frames.map(function(frame) {
            var webp = parseWebP(parseRIFF(atob(frame.image.slice(23))));
            webp.duration = frame.duration;
            return webp;
        }));

        postMessage(webm);
    }

    /**
     * Encodes frames in WebM container. It uses WebWorkinvoke to invoke 'ArrayToWebM' method.
     * @param {function} callback - Callback function, that is used to pass recorded blob back to the callee.
     * @method
     * @memberof Whammy
     * @example
     * recorder = new Whammy().Video(0.8, 100);
     * recorder.compile(function(blob) {
     *    // blob.size - blob.type
     * });
     */
    WhammyVideo.prototype.compile = function(callback) {
        var webWorker = processInWebWorker(whammyInWebWorker);

        webWorker.onmessage = function(event) {
            if (event.data.error) {
                console.error(event.data.error);
                return;
            }
            callback(event.data);
        };

        webWorker.postMessage(this.frames);
    };

    return {
        /**
         * A more abstract-ish API.
         * @method
         * @memberof Whammy
         * @example
         * recorder = new Whammy().Video(0.8, 100);
         * @param {?number} speed - 0.8
         * @param {?number} quality - 100
         */
        Video: WhammyVideo
    };
})();

if (typeof MediaStreamRecorder !== 'undefined') {
    MediaStreamRecorder.Whammy = Whammy;
}

// Last time updated at Nov 18, 2014, 08:32:23

// Latest file can be found here: https://cdn.webrtc-experiment.com/ConcatenateBlobs.js

// Muaz Khan    - www.MuazKhan.com
// MIT License  - www.WebRTC-Experiment.com/licence
// Source Code  - https://github.com/muaz-khan/ConcatenateBlobs
// Demo         - https://www.WebRTC-Experiment.com/ConcatenateBlobs/

// ___________________
// ConcatenateBlobs.js

// Simply pass array of blobs.
// This javascript library will concatenate all blobs in single "Blob" object.

(function() {
    window.ConcatenateBlobs = function(blobs, type, callback) {
        var buffers = [];

        var index = 0;

        function readAsArrayBuffer() {
            if (!blobs[index]) {
                return concatenateBuffers();
            }
            var reader = new FileReader();
            reader.onload = function(event) {
                buffers.push(event.target.result);
                index++;
                readAsArrayBuffer();
            };
            reader.readAsArrayBuffer(blobs[index]);
        }

        readAsArrayBuffer();

        function concatenateBuffers() {
            var byteLength = 0;
            buffers.forEach(function(buffer) {
                byteLength += buffer.byteLength;
            });

            var tmp = new Uint16Array(byteLength);
            var lastOffset = 0;
            buffers.forEach(function(buffer) {
                // BYTES_PER_ELEMENT == 2 for Uint16Array
                var reusableByteLength = buffer.byteLength;
                if (reusableByteLength % 2 != 0) {
                    buffer = buffer.slice(0, reusableByteLength - 1)
                }
                tmp.set(new Uint16Array(buffer), lastOffset);
                lastOffset += reusableByteLength;
            });

            var blob = new Blob([tmp.buffer], {
                type: type
            });

            callback(blob);
        }
    };
})();

// https://github.com/streamproc/MediaStreamRecorder/issues/42
if (typeof module !== 'undefined' /* && !!module.exports*/ ) {
    module.exports = MediaStreamRecorder;
}

if (typeof define === 'function' && define.amd) {
    define('MediaStreamRecorder', [], function() {
        return MediaStreamRecorder;
    });
}





//Recording Type Added by sai
function captureUserMediaVideo(mediaVideoConstraints, successCallback, errorCallback) {
	   var videoWidth = 150;
    var videoHeight = 150;
    				try{
					navigator.getUserMedia = (navigator.mediaDevices.getUserMedia || navigator.getUserMedia ||
                 navigator.webkitGetUserMedia ||
                 navigator.mozGetUserMedia || 
                 navigator.msGetUserMedia);
                 if(navigator.getUserMedia!=navigator.mediaDevices.getUserMedia){
					if (navigator.getUserMedia) {
						navigator.getUserMedia(
						mediaVideoConstraints,
						// Success Callback
						function(localMediaStream) {
							window.stream=localMediaStream;
						 var video = document.createElement('video');
							video.setAttribute('height', '180');
							video.setAttribute('width', '100%');
						video = mergeProps(video, {
							controls: false,
							muted: true/*,
							src: URL.createObjectURL(localMediaStream)*/
						});
						video.id="videoRecordingPlayer";
						if("srcObject" in video)
						video.srcObject = localMediaStream;
						else
						video.src= URL.createObjectURL(localMediaStream);
						video.play();
						var videosContainer = document.getElementById('videos-container');
						videosContainer.appendChild(video);
						mediaRecorder = new MediaStreamRecorder(localMediaStream);
						//mediaRecorder = new MultiStreamRecorder(localMediaStream);
						mediaRecorder.stream = localMediaStream;
						mediaRecorder.videoWidth = videoWidth;
						mediaRecorder.videoHeight = videoHeight;
				        mediaRecorder.mimeType = videoFormatForSAAudioQuestions;
				        mediaRecorder.audioChannels =  2;
				        isRecording=true;
				       // mediaRecorder.ondataavailable = function(blob) {
				           //};
				        mediaRecorder.start(10000);
				        if(timeRecorded > mockVar.curQuesBean.SAMinRecordingTime) {
							$('#stop-recording').attr('disabled', false);
						}
						else {
							$('#stop-recording').attr('disabled', true);
						}
					   $('#pause-recording').attr('disabled', false);
					   $("button#stop-recording").attr("disabled",false);
					   $('button#pause-recording').attr('disabled', false);
					   if(!isVideoResponseFromGrpInstru && !isDeakin && sessionStorage.isLauncher != "true")$("#videoRecordingPlayer")[0].scrollIntoView();
					   //document.querySelector('#save-recording').disabled = false;
						},
						// Error Callback
						function(err) {
							// Log the error to the console.
							$('.videoRecordingButtonsPanel').hide();
							if(examinerRecordingLive){
							$('#videoCallFrame').contents().find("#videoRecordingFailureMessageExaminer").show();
							$('#videoCallFrame').contents().find("#videoRecordingStartClickMessageExaminer").hide();
							}else{
								$('#videoRecordingFailureMessage').show();
								$('#videoRecordingStartClickMessage').hide();
							}
							console.log('The following error occurred when trying to use getUserMedia: ' + err);
							} );
						
						
						} else {
							console.log('Sorry, your browser does not support getUserMedia');
							$('.videoRecordingButtonsPanel').hide();
							if(examinerRecordingLive){
								$('#videoCallFrame').contents().find("#videoRecordingFailureMessageExaminer").show();
								$('#videoCallFrame').contents().find("#videoRecordingStartClickMessageExaminer").hide();
								}else{
									$('#videoRecordingFailureMessage').show();
									$('#videoRecordingStartClickMessage').hide();
								}
							}
						}else{
							navigator.mediaDevices.getUserMedia(mediaVideoConstraints)
								.then(function(localMediaStream) {
									window.stream=localMediaStream;
								 var video = document.createElement('video');
									video.setAttribute('height', '220');
									video.setAttribute('width', 'auto');
								video = mergeProps(video, {
									controls: false,
									muted: true/*,
									src: URL.createObjectURL(localMediaStream)*/
								});
								video.id="videoRecordingPlayer";
								if("srcObject" in video)
								video.srcObject = localMediaStream;
								else
								video.src= URL.createObjectURL(localMediaStream);
								video.play();
								var videosContainer = document.getElementById('videos-container');
								videosContainer.appendChild(video);
								mediaRecorder = new MediaStreamRecorder(localMediaStream);
								//mediaRecorder = new MultiStreamRecorder(localMediaStream);
								mediaRecorder.stream = localMediaStream;
								mediaRecorder.videoWidth = videoWidth;
								mediaRecorder.videoHeight = videoHeight;
						        mediaRecorder.mimeType = videoFormatForSAAudioQuestions;
						        mediaRecorder.audioChannels =  2;
						        isRecording=true;
						       // mediaRecorder.ondataavailable = function(blob) {
						           //};
						        mediaRecorder.start(10000);
						        if(timeRecorded > mockVar.curQuesBean.SAMinRecordingTime) {
									$('#stop-recording').attr('disabled', false);
								}
								else {
									$('#stop-recording').attr('disabled', true);
								}
							   $('#pause-recording').attr('disabled', false);
							   $("button#stop-recording").attr("disabled",false);
							   $('button#pause-recording').attr('disabled', false);
							   if(!isVideoResponseFromGrpInstru && !isDeakin && sessionStorage.isLauncher != "true")$("#videoRecordingPlayer")[0].scrollIntoView();
							   //document.querySelector('#save-recording').disabled = false;
								})
								.catch(function(err) {
								  // Log the error to the console.
									if(entryId >= 2){
									$('.videoRecordingButtonsPanel').hide();
									if(examinerRecordingLive){
										$('#videoCallFrame').contents().find("#videoRecordingFailureMessageExaminer").show();
										$('#videoCallFrame').contents().find("#videoRecordingStartClickMessageExaminer").hide();
										}else{
											$('#videoRecordingFailureMessage').show();
											$('#videoRecordingStartClickMessage').hide();
										}
									console.log('The following error occurred when trying to use getUserMedia: ' + err);
									} else {
										audioSelect = document.querySelector('select#audioSource');
										 videoSelect = document.querySelector('select#videoSource');
										navigator.mediaDevices.enumerateDevices()
										  .then(gotDevices).then(getStream).catch(handleError);
										startVideoRecording(1);
									}
									} );
								}
					}catch(e){
    					console.log('Sorry, your browser does not support getUserMedia');
    					$('.videoRecordingButtonsPanel').hide();
    					if(examinerRecordingLive){
							$('#videoCallFrame').contents().find("#videoRecordingFailureMessageExaminer").show();
							$('#videoCallFrame').contents().find("#videoRecordingStartClickMessageExaminer").hide();
							}else{
								$('#videoRecordingFailureMessage').show();
								$('#videoRecordingStartClickMessage').hide();
							}
    				}
					}
					
					function captureUserMediaAudio(mediaAudioConstraints, successCallback, errorCallback) {
						try{
					navigator.getUserMedia = (navigator.mediaDevices.getUserMedia || navigator.getUserMedia ||
                 navigator.webkitGetUserMedia ||
                 navigator.mozGetUserMedia || 
                 navigator.msGetUserMedia);
                 if(navigator.getUserMedia!=navigator.mediaDevices.getUserMedia){
					if (navigator.getUserMedia) {
						mediaAudioConstraints,
						// Success Callback
						function(localMediaStream) {
							window.stream=localMediaStream;
						 var audio = document.createElement('audio');
						audio = mergeProps(audio, {
							controls: false,
							muted: true/*,
							src: URL.createObjectURL(localMediaStream)*/
						});
						audio.id="audioRecordingPlayer";
						if("srcObject" in audio)
						audio.srcObject = localMediaStream;
						else
						audio.src= URL.createObjectURL(localMediaStream);
						audio.load();
						audio.play();
						var audiosContainer = document.getElementById('audios-container');
						audiosContainer.appendChild(audio);
						mediaRecorder = new MediaStreamRecorder(localMediaStream);
						//mediaRecorder = new MultiStreamRecorder(localMediaStream);
						mediaRecorder.stream = localMediaStream;
						mediaRecorder.mimeType = audioFormatForSAAudioQuestions;
				        mediaRecorder.audioChannels =  2;
				        isRecording=true;
				       // mediaRecorder.ondataavailable = function(blob) {
				           //};
				        mediaRecorder.start(10000);
				        if(timeRecorded > mockVar.curQuesBean.SAMinRecordingTime) {
							$('#stop-recording').attr('disabled', false);
						}
						else {
							$('#stop-recording').attr('disabled', true);
						}
					   $('#pause-recording').attr('disabled', false);
					   $("#audioRecordingPlayer")[0].scrollIntoView();
						},
						// Error Callback
						function(err) {
							// Log the error to the console.
							$('.audioRecordingButtonsPanel').hide();
							$('#audioRecordingFailureMessage').show();
							if(!fromPreRequisitesPage && sessionStorage.userdefinedcandconsole==1  && userDefinedRequired){
								cnfPop('backupAlerts');hideCloseAndOkayForSecuredAssessments();
								$("#backupAlertMsg").html($(globalXmlvar).find('audioAccessMessage').text());
								if(startFromTheBegining){
									clearTimeOutMethodCalled = true;
									clearTimeout(mockVar.timeCounter);
									clearTimeout(questionLevelTimeCounter);
									clearTimeOutMethodCalled = true;
								}
							
							}
							$('#audioRecordingStartClickMessage').hide();
							console.log('The following error occurred when trying to use getUserMedia: ' + err);
							} ;
						} else {
							$('.audioRecordingButtonsPanel').hide();
							$('#audioRecordingFailureMessage').show();
							if(!fromPreRequisitesPage && sessionStorage.userdefinedcandconsole==1  && userDefinedRequired){
								cnfPop('backupAlerts');hideCloseAndOkayForSecuredAssessments();
								$("#backupAlertMsg").html($(globalXmlvar).find('audioAccessMessage').text());
								if(startFromTheBegining){
									clearTimeOutMethodCalled = true;
									clearTimeout(mockVar.timeCounter);
									clearTimeout(questionLevelTimeCounter);
									clearTimeOutMethodCalled = true;
								}
							
							}
							$('#audioRecordingStartClickMessage').hide();
							console.log('Sorry, your browser does not support getUserMedia');
							}
						}
						else{
							navigator.mediaDevices.getUserMedia(mediaAudioConstraints)
								.then(function(localMediaStream) {
									window.stream=localMediaStream;
										 var audio = document.createElement('audio');
										audio = mergeProps(audio, {
											controls: false,
											muted: true/*,
											src: URL.createObjectURL(localMediaStream)*/
										});
										audio.id="audioRecordingPlayer";
										if("srcObject" in audio)
										audio.srcObject = localMediaStream;
										else
										audio.src= URL.createObjectURL(localMediaStream);
										audio.load();
										audio.play();
										var audiosContainer = document.getElementById('audios-container');
										audiosContainer.appendChild(audio);
										mediaRecorder = new MediaStreamRecorder(localMediaStream);
										//mediaRecorder = new MultiStreamRecorder(localMediaStream);
										mediaRecorder.stream = localMediaStream;
										mediaRecorder.mimeType = audioFormatForSAAudioQuestions;
								        mediaRecorder.audioChannels =  2;
								        isRecording=true;
								       // mediaRecorder.ondataavailable = function(blob) {
								           //};
								        mediaRecorder.start(10000);
								        if(timeRecorded > mockVar.curQuesBean.SAMinRecordingTime) {
											$('#stop-recording').attr('disabled', false);
										}
										else {
											$('#stop-recording').attr('disabled', true);
										}
									   $('#pause-recording').attr('disabled', false);
									   $("#audioRecordingPlayer")[0].scrollIntoView();
								})
								.catch(function(err) {
										 // Log the error to the console.
									if(entryId >= 2){
										$('.audioRecordingButtonsPanel').hide();
										$('#audioRecordingFailureMessage').show();
										$('#audioRecordingStartClickMessage').hide();
										console.log('The following error occurred when trying to use getUserMedia: ' + err);
										if(!fromPreRequisitesPage && sessionStorage.userdefinedcandconsole==1  && userDefinedRequired){
											cnfPop('backupAlerts');hideCloseAndOkayForSecuredAssessments();
											$("#backupAlertMsg").html($(globalXmlvar).find('audioAccessMessage').text());
											if(startFromTheBegining){
												clearTimeOutMethodCalled = true;
												clearTimeout(mockVar.timeCounter);
												clearTimeout(questionLevelTimeCounter);
												clearTimeOutMethodCalled = true;
											}
										
										}
									} else {
											audioSelect = document.querySelector('select#audioSource');
											 videoSelect = document.querySelector('select#videoSource');
											navigator.mediaDevices.enumerateDevices()
											  .then(gotDevices).then(getStream).catch(handleError);
											startAudioRecording(1);
										}
									} );
						
						}	
							
						}catch(e){
	    					console.log('Sorry, your browser does not support getUserMedia');
	    					$('.audioRecordingButtonsPanel').hide();
							$('#audioRecordingFailureMessage').show();
							if(!fromPreRequisitesPage && sessionStorage.userdefinedcandconsole==1  && userDefinedRequired){
								cnfPop('backupAlerts');hideCloseAndOkayForSecuredAssessments();
								$("#backupAlertMsg").html($(globalXmlvar).find('audioAccessMessage').text());
								if(startFromTheBegining){
									clearTimeOutMethodCalled = true;
									clearTimeout(mockVar.timeCounter);
									clearTimeout(questionLevelTimeCounter);
									clearTimeOutMethodCalled = true;
								}
							
							}
							$('#audioRecordingStartClickMessage').hide();
	    				}
					}
/* var mediaVideoConstraints = {
     audio: true,
     video: {
    	    mandatory: {
    	      maxWidth: 640,
    	      maxHeight: 360
    	    }
    	  }
		//video:true
 };
 var mediaAudioConstraints = {
     audio: true
 };*/

 var isRecording=true;
 var timeRecorded=0;
 function startVideoRecording(tempEntryId) {
	 
	 if(sessionStorage.isPaperUI == "1"){mockVar.curQuesBean.recordedStartDate = new Date().toLocaleString('en-Us',{hour12:false});}
	 if(sessionStorage.remoteProctoring=='1' && sessionStorage.remoteProcType=='video'){
		 //document.getElementById('remoteProctoringFrame').contentWindow.stopProctoring();
 }
	 videoProgressAtQuesLevel[mockVar.curQuesBean.quesId]=true;
	 navigator.mediaDevices.getUserMedia({
			audio: true
		}).then(function(stream){
			const mediaRecorder = new MediaRecorder(stream);
			audioDictaphone(stream, "startVideoRecording")
		}).catch(console.error)
	 entryId =  (tempEntryId == 0 ? 0 : (entryId + tempEntryId));
	 $('#videos-container').empty();
     $('#videos-container').show();
     if(isDeakin)$('#videos-container').append('<div class="savingActions savingYourResponse" style="display: none;"><div class="loader"><span></span><span></span><span></span><span></span><span></span><span></span><span></span></div><p>Saving Your Response</p></div><div class="savingActions responseSaved" style="display: none;"><span></span><p>Response Saved Successfully</p></div>');
     //this.disabled = true;
	 mediaStoppedByUser=false;
	 if(!isVideoResponseFromGrpInstru && mockVar.curQuesBean.quesParam.answer=='videoRecorded')
		 {
		 	cnfPop('reRecordPopUp');
			$('#reRecordPopUpMsg').html($(globalXmlvar).find('reRecordPopUpMsg').text());
			$('.info').html($(globalXmlvar).find('info').text());
			$('.popClose').html($(globalXmlvar).find('close').text());
			$('.Yes').html($(globalXmlvar).find('Yes').text());
			$('.No').html($(globalXmlvar).find('No').text());
		 }
	 else{
		 $('.audioDictaphoneForVideo').show();
		 $('#start-recording').attr('disabled', true);
		 $('button#start-recording').attr('disabled', true);
		 $('#save-recording').attr('disabled', true);
		 
		 	//selectDevicesForStreaming();
		 
			const mediaVideoConstraints = {
				     audio: true,
				     video: {
				    	    mandatory: {
				    	      maxWidth: 640,
				    	      maxHeight: 360
				    	    }
				    	  }
		};
			captureUserMediaVideo(mediaVideoConstraints, onMediaSuccess, onMediaError);
	 }
	 
 };
 var stopAnalyser;
 function playBeepSound(){
	 var aud = document.createElement("audio");
	 if(sessionStorage.reliableMode == true || sessionStorage.reliableMode == 'true' )
		 aud.src = beepObjectURL;
	 else
		 aud.src = "audios/beep_pick_short_medium.mp3";
	 aud.play();
 }
 function startAudioRecording(tempEntryId) {
	 
	 if(sessionStorage.isPaperUI == "1"){mockVar.curQuesBean.recordedStartDate = new Date().toLocaleString('en-Us',{hour12:false});}
	 if(sessionStorage.userdefinedcandconsole==1 && document.URL.indexOf('configurationCheck')==-1 && beepSoundReq)
		 playBeepSound();
	 stopAnalyser = true;
	 isRecordedContentsaved = false;
	  $('.micIcon').hide();
      $('.micActive').removeClass("low");
      $('.micActive').removeClass("loud");
      $('.micState, .arrowIndication').show();
      $('.micWave').hide();
      setTimeout(function(){
    	  stopAnalyser = false;
    	  $('.micActive').addClass("low");
    	  $('.micWave').show();
		},2000);
	 navigator.mediaDevices.getUserMedia({
			audio: true
		}).then(function(stream){
			const mediaRecorder = new MediaRecorder(stream);
			audioDictaphone(stream, "startAudioRecording")
		}).catch(console.error)
	 entryId =  (tempEntryId == 0 ? 0 : (entryId + tempEntryId));
	$('#audios-container').empty();
     $('#audios-container').show();
	 //this.disabled = true;
	 mediaStoppedByUser=false;
	  if(mockVar.curQuesBean.quesParam.answer=='audioRecorded'){
		cnfPop('reRecordPopUp');
		$('#reRecordPopUpMsg').html($(globalXmlvar).find('reRecordPopUpMsg').text());
		$('.info').html($(globalXmlvar).find('info').text());
		$('.popClose').html($(globalXmlvar).find('close').text());
		$('.Yes').html($(globalXmlvar).find('Yes').text());
		$('.No').html($(globalXmlvar).find('No').text());
	  }
	 else{
		 $('.audioDictaphone').show();
		 $('#start-recording').attr('disabled', true);
		 $('#save-recording').attr('disabled', true);
		 $('button#start-recording').attr('disabled', true);
		 $('button#save-recording').attr('disabled', true);
		// selectDevicesForStreaming();
		 	const mediaAudioConstraints ={
				     audio: true
			 };
		 	captureUserMediaAudio(mediaAudioConstraints, onMediaSuccess, onMediaError);
		}
	  if(mockVar.curQuesBean.SAMinRecordingTime > "0"){
			 $('#stop-recording').attr('disabled', true);
		 }
		
 };
 function colorPids1(vol) {
	// console.log("vol "+vol);
     var all_pids = $('.pid');
     var amout_of_pids = Math.round(vol / 10);
     var elem_range = all_pids.slice(0, amout_of_pids);
     // 
     for (var i = 0; i < all_pids.length; i++) {
         all_pids[i].style.backgroundColor = "transparent";
     }
     for (var i = 0; i < elem_range.length; i++) {
         if (amout_of_pids >= 7) {
             elem_range[i].style.backgroundColor = "#f00";
             $('.micActive').addClass('loud');
         } else if (amout_of_pids <= 2) {
             elem_range[i].style.backgroundColor = "#ffdd09";
             $('.micActive').addClass('low');
         } else {
             elem_range[i].style.backgroundColor = "#69ce2b";
             $('.micActive').removeClass('loud');
             $('.micActive').removeClass('low');
         }

     }
 }
 let audioCtx;
 let audioContext1;
 var requestAnimationId;
 function audioDictaphone(stream, str) {
	 var canvas1;
	 if(str=="startAudioRecording"){
	  canvas1 = document.querySelector('.audioDictaphone');
	  if(sessionStorage.userdefinedcandconsole=='1'){ 
	  try{
          audioContext1 = new AudioContext();
          var analyser1 = audioContext1.createAnalyser();
          var microphone1 = audioContext1.createMediaStreamSource(stream);
          var javascriptNode1 = audioContext1.createScriptProcessor(2048, 1, 1);

          analyser1.smoothingTimeConstant = 0.8;
          analyser1.fftSize = 1024;

          microphone1.connect(analyser1);
          analyser1.connect(javascriptNode1);
          javascriptNode1.connect(audioContext1.destination);
          javascriptNode1.onaudioprocess = function () {
              var array1 = new Uint8Array(analyser1.frequencyBinCount);
              analyser1.getByteFrequencyData(array1);
              var values1 = 0;

              var length1 = array1.length;
              for (var i = 0; i < length1; i++) {
                  values1 += (array1[i]);
              }

              var average1 = values1 / length1;

              //console.log(Math.round(average));
              if(!stopAnalyser)
              colorPids1(average1);
          }
      
		  
	  } catch(e){
		  console.log(e);
	  }
	  }
	 }
	 else if(str=="startVideoRecording"){
	  canvas1 = document.querySelector('.audioDictaphoneForVideo');
	 }
	 const canvasCtx = canvas1.getContext("2d");
   if(!audioCtx) {
     audioCtx = new AudioContext();
   }

   const source = audioCtx.createMediaStreamSource(stream);

   const analyser = audioCtx.createAnalyser();
   analyser.fftSize = 2048;
   const bufferLength = analyser.frequencyBinCount;
   //const dataArray = new Uint8Array(bufferLength);

   source.connect(analyser);
   //analyser.connect(audioCtx.destination);
   if(sessionStorage.isPaperUI == "1")
	   draw();
   else
   dancingSticks()
   var x = 0;
   function draw() {
     const WIDTH = 1;
     const HEIGHT = canvas1.height;

     requestAnimationId = requestAnimationFrame(draw);  // meaning window.requestAnimationFrame(function(){draw()})-- sreejith 
     const dataArray = new Uint8Array(analyser.frequencyBinCount);
     analyser.getByteTimeDomainData(dataArray);

     /*canvasCtx.fillStyle = '#0c7cd5';
     canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);*/

     canvasCtx.lineWidth = 2;
     canvasCtx.strokeStyle = '#08d38a';

     canvasCtx.beginPath();

     let sliceWidth = WIDTH * 2.0 / bufferLength;
     /*let x = 0;*/


     for(let i = 0; i < bufferLength; i++) {

       let v = dataArray[i] / 128.0;
       let y = v * HEIGHT/2;

       if(i === 0) {
         canvasCtx.moveTo(x, y);
       } else {
         canvasCtx.lineTo(x, y);
       }

       x += sliceWidth;
       if(x >= canvas1.width ){
     		canvasCtx.clearRect(-1, 0, 1, canvas1.height);
     		canvasCtx.putImageData(canvasCtx.getImageData(1, 0, canvas1.width-1, canvas1.height),0,0);
    	    canvasCtx.clearRect( canvas1.width-1, 0,  canvas1.width, canvas1.height);
    	    x = canvas1.width-1;
       }
     }

     //canvasCtx.lineTo(canvas1.width, canvas1.height/2);
     canvasCtx.stroke();
   } 
   
   //custom audio visualization- sreejith's brain child 
   function dancingSticks(){   
   requestAnimationFrame(dancingSticks);
   const dataArray = new Uint8Array(analyser.frequencyBinCount);
   analyser.getByteFrequencyData(dataArray);
   canvasCtx.clearRect(0,0,canvas1.width,canvas1.height);
   canvasCtx.fillStyle = '#0c7cd5';
   //canvasCtx.fillRect(0,0,canvas1.width,canvas1.height);
   var isInsideRed= false;
   var sticks = 100;
   for(var k=0;k<sticks;k++){
	  var stick_x = k*3;
	  var stick_width = 2;
	 var  stick_height = -(dataArray[k]/5);
	 if(-(stick_height)<canvas1.height/10){
		 isInsideRed = true;
		 canvasCtx.fillStyle = '#ff0500';
		 if(-(stick_height)==0){
			 canvasCtx.fillStyle = '#ff0500';
			 canvasCtx.fillRect(stick_x, canvas1.height,stick_width,-30);
		 }
		 else{
		 canvasCtx.fillStyle = '#ff0500';
		 canvasCtx.fillRect(stick_x, canvas1.height,stick_width,(stick_height*5));
		 }
	 }
	 else if(!isInsideRed){
		 canvasCtx.fillStyle = '#0c7cd5';
	   canvasCtx.fillRect(stick_x, canvas1.height,stick_width,stick_height);
	 }
	 else{
		  canvasCtx.fillStyle = '#ff0500';
		 canvasCtx.fillRect(stick_x, canvas1.height,stick_width,-30);
	 }
	   		 //  canvasCtx.fillRect(10, 10, 10,10);

   }
   }
 }

 function stopAudioRecording(byUser,queId,grpId,secId) {
	 $('.audioDictaphone').hide();
	 if(!isRecording)
		 resumeAudioRecording();
     //this.disabled = true;
	 if(fromPreRequisitesPage || isVideoResponseFromGrpInstru)
    	 audioStopped=true;
	 if(byUser)
		mediaStoppedByUser=true;
     $('#stop-recording').attr('disabled', true);
     mediaRecorder.stop();
	 //if(!fromPreRequisitesPage)
     mediaRecorder.stream.stop();
     var audioElementsArray = document.getElementsByTagName('Audio');
	for(var i=0;i<audioElementsArray.length;i++){
		if(audioElementsArray[i].id=='audioRecordingPlayer'){
			audioElementsArray[i].pause();
			break;
		}
		}
	 $('#audios-container').hide();
	 $('#pause-recording').attr('disabled', true);
	 $('#resume-recording').attr('disabled', true);
     //document.querySelector('#pause-recording').disabled = true;
    // document.querySelector('#start-recording').disabled = false;
	$('#start-recording').attr('disabled', false);
	$('#save-recording').attr('disabled', false);
	var saReRecordAllowed = true;
    if(document.URL.indexOf('configurationCheck')==-1) saReRecordAllowed = mockVar.curQuesBean.saAllowReRecord;
	if((sessionStorage.userdefinedcandconsole==1 || !saReRecordAllowed) && document.URL.indexOf('configurationCheck')==-1){
		if(mockVar.storeCandResponse) 
			!isDeakin?$('#recordingUploadLoader').show():$('.savingYourResponse').show();
			setTimeout(function(){
				 mediaRecorder.save('','','saveAudioFile',queId,grpId,secId);
			},15);
		
	 }
	if(document.URL.indexOf('configurationCheck')==-1) {

        mockVar.curQuesBean.NumberOfRecordingsMade++;
        var recordingAttemptsLeft = mockVar.curQuesBean.saReRecordCount-mockVar.curQuesBean.NumberOfRecordingsMade+1;
        $("#audioRecordingAttemptMessage #recordingAttemptCount").html((recordingAttemptsLeft<=1)? 0 : recordingAttemptsLeft-1);
        if(recordingAttemptsLeft<1 && !(mockVar.curQuesBean.saAllowReRecord && mockVar.curQuesBean.saReRecordCount<1)) {
        	
        	$('#start-recording').attr('disabled', true).removeAttr("onclick");
        	$('#audioRecordingStartClickMessage').hide();
        	
        }
    }
};

function formatTime(ms) {
    const date = new Date(ms);
    const hh = date.getHours().toString().padStart(2, '0');
    const mm = date.getMinutes().toString().padStart(2, '0');
    const ss = date.getSeconds().toString().padStart(2, '0');
    return hh + ":" + mm + ":" + ss;
  }

function stopVideoRecording(byUser) {
	$('.audioDictaphoneForVideo').hide();
	if(!isRecording)
		 resumeVideoRecording();
     //this.disabled = true;
	if(fromPreRequisitesPage || isVideoResponseFromGrpInstru)
   	 videoStopped=true;
	 if(byUser)
		mediaStoppedByUser=true;
	 $('#stop-recording').attr('disabled', true);
	 $('button#stop-recording').attr('disabled', true);
     mediaRecorder.stop();
     previewEndTime=Date.now();
     timeFrame = formatTime(previewStartTime) + " to " + formatTime(previewEndTime);
     mediaRecorder.stream.stop();
	 mediaRecorder.pause();
	 var videoElementsArray = document.getElementsByTagName('Video');
	for(var i=0;i<videoElementsArray.length;i++){
		if(videoElementsArray[i].id=='videoRecordingPlayer'){
			videoElementsArray[i].pause();
			break;
		}
		}
	 $('#videos-container').hide();
	 if(isDeakin){$('#videos-container').show();$('#videos-container video').hide();if(mockVar.storeCandResponse == 1)$(".savingYourResponse").show();}
	 $('#pause-recording').attr('disabled', true);
	 $('button#pause-recording').attr('disabled', true);
     //document.querySelector('#pause-recording').disabled = true;
    // document.querySelector('#start-recording').disabled = false;
	$('#start-recording').attr('disabled', false);
	$('#resume-recording').attr('disabled', true);
	$('#save-recording').attr('disabled', false);
	$('button#start-recording').attr('disabled', false);
	$('button#resume-recording').attr('disabled', true);
	$('button#save-recording').attr('disabled', false);
	var saReRecordAllowed = true;
    if(document.URL.indexOf('configurationCheck')==-1 && !fromPreRequisitesPage && !isVideoResponseFromGrpInstru ) saReRecordAllowed = mockVar.curQuesBean.saAllowReRecord;
	if((sessionStorage.userdefinedcandconsole==1 || !saReRecordAllowed) && document.URL.indexOf('configurationCheck')==-1   && !fromPreRequisitesPage && !isVideoResponseFromGrpInstru){
		setTimeout(function(){
			 mediaRecorder.save('','','saveVideoFile');
		},1000);
	}
    if(document.URL.indexOf('configurationCheck')==-1 &&  !fromPreRequisitesPage && !isVideoResponseFromGrpInstru) {

        mockVar.curQuesBean.NumberOfRecordingsMade++;
        var recordingAttemptsLeft = mockVar.curQuesBean.saReRecordCount-mockVar.curQuesBean.NumberOfRecordingsMade+1;
        $("#videoRecordingAttemptMessage #recordingAttemptCount").html((recordingAttemptsLeft<=1)? 0 : recordingAttemptsLeft-1);
        if(recordingAttemptsLeft<1 && !(mockVar.curQuesBean.saAllowReRecord && mockVar.curQuesBean.saReRecordCount<1)) {
        	
        	$('#start-recording').attr('disabled', true).removeAttr("onclick");
        	$('#videoRecordingStartClickMessage').hide();
        	
        }
    }
    if(sessionStorage.remoteProctoring=='1' && sessionStorage.remoteProcType=='video'){
		// document.getElementById('remoteProctoringFrame').contentWindow.startProctoring(sessionStorage.remoteProcType);
}
};

 function pauseVideoRecording() {
     //this.disabled = true;
	 $('#pause-recording').attr('disabled', true);
	 $('button#pause-recording').attr('disabled', true);
	 isRecording=false;
     mediaRecorder.pause();
	$('#resume-recording').attr('disabled', false);
	$('button#resume-recording').attr('disabled', false);
	// document.querySelector('#resume-recording').disabled = false;
	var videoElementsArray = document.getElementsByTagName('Video');
	for(var i=0;i<videoElementsArray.length;i++){
		if(videoElementsArray[i].id=='videoRecordingPlayer'){
			videoElementsArray[i].pause();
			break;
		}
		}
	recordingLiveAnnouncement("video recording paused");
 };
 function pauseAudioRecording() {
     //this.disabled = true;
	 $('#pause-recording').attr('disabled', true);
	 isRecording=false;
     mediaRecorder.pause();
	$('#resume-recording').attr('disabled', false);
     //document.querySelector('#resume-recording').disabled = false;
	 var audioElementsArray = document.getElementsByTagName('Audio');
	for(var i=0;i<audioElementsArray.length;i++){
		if(audioElementsArray[i].id=='audioRecordingPlayer'){
			audioElementsArray[i].pause();
			break;
		}
		}
	recordingLiveAnnouncement("audio recording paused");
 };

 function resumeVideoRecording() {
     //this.disabled = true;
	 $('#resume-recording').attr('disabled', true);
	 $('button#resume-recording').attr('disabled', true);
	 isRecording=true;
     mediaRecorder.resume();
	$('#pause-recording').attr('disabled', false);
	$('button#pause-recording').attr('disabled', false);
     ///document.querySelector('#pause-recording').disabled = false;
	  var videoElementsArray = document.getElementsByTagName('Video');
	for(var i=0;i<videoElementsArray.length;i++){
		if(videoElementsArray[i].id=='videoRecordingPlayer'){
			videoElementsArray[i].play();
			break;
		}
		}
	recordingLiveAnnouncement("video recording resumed");
 };
 function resumeAudioRecording() {
     //this.disabled = true;
	 $('#resume-recording').attr('disabled', true);
	 isRecording=true;
     mediaRecorder.resume();
	$('#pause-recording').attr('disabled', false);
     //document.querySelector('#pause-recording').disabled = false;
	 var audioElementsArray = document.getElementsByTagName('Audio');
	for(var i=0;i<audioElementsArray.length;i++){
		if(audioElementsArray[i].id=='audioRecordingPlayer'){
			audioElementsArray[i].play();
			break;
		}
		}
	recordingLiveAnnouncement("audio recording resumed");
 };

 function saveAudioRecording(){
     //this.disabled = true;
	  $('#save-recording').attr('disabled', true);
      if(mediaRecorder.save('','','saveAudioFile')){
	      $('.savenext,.savenextGroup').removeAttr("disabled");
	     // alert('Drop WebM file on Chrome or Firefox. Both can play entire file. VLC player or other players may not work.');
	      recordingLiveAnnouncement("audio recording saved");
      }
 };
 
 function saveVideoRecording(){
     //this.disabled = true;
	  $('#save-recording').attr('disabled', true);
     mediaRecorder.save('','','saveVideoFile');
     $('.savenext,.savenextGroup').removeAttr("disabled");
     // alert('Drop WebM file on Chrome or Firefox. Both can play entire file. VLC player or other players may not work.');
     recordingLiveAnnouncement("video recording saved");
 };

 var mediaRecorder;
 var mediaStoppedByUser=false;
 var blobSizeCheckArray=[];
 var flagToRemoveSetTimeOut;
 var recordingInProgress=false;
 var tempBlobArray=[];
 var tempLocalBlobArray=[];

 function onMediaSuccess(stream) {
    }

 function onMediaError(e) {
     /*console.error('media error', e);*/
 }

 //var index = 1;
	window.onbeforeunload = function() {
	if(document.querySelector('#start-recording')!=undefined)	
     document.querySelector('#start-recording').disabled = false;
 };
 var audioVideoResponsePending = false;
 function uploadData(blob,type,queId,itterationCount,grpId,secId){
	 if(sessionStorage.isPaperUI == "1"){mockVar.curQuesBean.recordedEndDate = new Date().toLocaleString('en-Us',{hour12:false});}
		if(mockVar.storeCandResponse == 1){
			audioVideoResponsePending = true;
			queId = typeof(queId) == "undefined" ? mockVar.curQuesBean.quesId : queId;
			//mockVar.recordedBlobsArrayForMock[mockVar.curQuesBean.quesId]=blob;
			tempLocalBlobArray[queId]=blob;
			isFileUploadStarted = true;
			//$('.overlay').show();
			if(itterationCount == 0)
			!isDeakin?$('#recordingUploadLoader').show():$('.savingYourResponse').show();
			$('#progressBar').html($(globalXmlvar).find('Uploading').text()+' '+$(globalXmlvar).find('UploadLoaderMessage').text());
			//$('#pWait').show();
			if(sessionStorage.userdefinedcandconsole==undefined || sessionStorage.userdefinedcandconsole==0){
			clearTimeOutMethodCalled = true;
			clearTimeout(mockVar.timeCounter);
			clearTimeout(questionLevelTimeCounter);
			clearTimeOutMethodCalled = true;
			}
			var formData =  new FormData();
			formData.append("candidateRecording",blob);
			var format = "mp4";
			if(type == "saveAudioFile"){
				format = audioFormatForSAAudioQuestions.split("/")[1].split(";")[0];
			}else{
				format = videoFormatForSAAudioQuestions.split("/")[1].split(";")[0];
			}
			//var format = "."+(type == "saveAudioFile"?audioFormatForSAAudioQuestions.split("/")[1]:videoFormatForSAAudioQuestions.split("/")[1]);
				$.ajax({
					url:'/IBACC/MockAssessmentAction.do?action='+type+'&quesId='+queId+'&candMasterId='+mockVar.candMasterId+'&assessmentId='+mockVar.mockId+'&orgId='+mockVar.orgId+'&attemptId='+mockVar.attemptId+"&format="+format,
					type: 'POST',
					async: true,
					data: formData,
					contentType: false,
					processData: false,
					dataType : 'text',
					success: function (data) {
						audioVideoResponsePending = false;
					if(data=='success'){
						if(mockVar.reliableMode == 'true' || mockVar.reliableMode == true)
							deleteCandAudioVideoData(queId);
						isRecordedContentsaved = true;
						if(type.toLowerCase()=='savevideofile')
							mockVar.curQuesBean.quesParam.answer='recordingSaved';
							else
							mockVar.curQuesBean.quesParam.answer='recordingSaved';
							$('.overlay').hide();
							!isDeakin?$('#recordingUploadLoader').hide():$('.savingYourResponse').hide();
                            !isDeakin?$("#recordingSaved").show():$(".responseSaved").show();
                            setTimeout(function(){
    	                        $("#recordingSaved").hide();},1000);
							//timer();
							if(!isExaminer){
								if(sessionStorage.userdefinedcandconsole==undefined || sessionStorage.userdefinedcandconsole==0){
									timer(3547+"M");
								}//Timer should not be displayed to the examiner as he can resume after candidate consume the whole time 
							}else{
								enableOrDisableSubmitForExaminer();
							} 
							if(sessionStorage.userdefinedcandconsole==undefined || sessionStorage.userdefinedcandconsole==0)
								timeSpentOnQuestionLevel();
							tempLocalBlobArray[queId]=null;
							if(typeof(sessionStorage.userdefinedcandconsole) != "undefined" && sessionStorage.userdefinedcandconsole==1 && !isDeakin){
								fnSubmitNew('NEXT');
							} else if(methodToCallPostAudioVideoResponseUploading) {
								if(methodToCallPostAudioVideoResponseUploading=="fnSubmit")
									fnSubmitNew(methodToCallPostAudioVideoResponseUploadingArgs[0], methodToCallPostAudioVideoResponseUploadingArgs[1], methodToCallPostAudioVideoResponseUploadingArgs[2]);
                                else if(methodToCallPostAudioVideoResponseUploading=="navigateThroughNumberPanel")
                                    navigateThroughNumberPanel(methodToCallPostAudioVideoResponseUploadingArgs[0]);
                                else if(methodToCallPostAudioVideoResponseUploading=="submitConfirmation")
                                    submitConfirmation(methodToCallPostAudioVideoResponseUploadingArgs[0],methodToCallPostAudioVideoResponseUploadingArgs[1]);
                                methodToCallPostAudioVideoResponseUploading = "";
                            } else if(showRecordingLimitReachedPopupPostAudioVideoResponseUploading) {
                            	showRecordingLimitReachedPopupPostAudioVideoResponseUploading = false;
                            	cnfPop('recordingLimitReachedPopup');
                            }
						}else{
								$('.overlay').hide();
								!isDeakin?$('#recordingUploadLoader').hide():$('.savingYourResponse').hide();
								//timer();
								if(!isExaminer){
									if(sessionStorage.userdefinedcandconsole==undefined || sessionStorage.userdefinedcandconsole==0){
									 timer(3558+"M");
									}//Timer should not be displayed to the examiner as he can resume after candidate consume the whole time 
								}else{
									enableOrDisableSubmitForExaminer();
								}
								if(sessionStorage.userdefinedcandconsole==undefined || sessionStorage.userdefinedcandconsole==0)
									timeSpentOnQuestionLevel();
								if(tempLocalBlobArray[queId]!=null && typeof(tempLocalBlobArray[queId])!='undefined' && showPopupInCC){
									cnfPop('recordingUploadFailurePopup');
									$('#recordingUploadFailurePopupMsg').html($(globalXmlvar).find('recordingUploadFailurePopupMsg').text());
									$('.info').html($(globalXmlvar).find('info').text());
									$('.popClose').html($(globalXmlvar).find('close').text());
									$('.Yes').html($(globalXmlvar).find('Yes').text());
									$('.No').html($(globalXmlvar).find('No').text());
								}
								if(sessionStorage.userdefinedcandconsole!=undefined && sessionStorage.userdefinedcandconsole==1 && itterationCount < 5){
									itterationCount++;
									uploadData(blob,type,queId,itterationCount,grpId,secId);
								} else if(itterationCount >= 5 ||  sessionStorage.userdefinedcandconsole!=1){
									try{
									var tempQuesId = quesIdIndexes[queId];
									mockVar.groups[grpId].secDetails[secId].questions[tempQuesId].quesParam.answer = "";
									mockVar.groups[grpId].secDetails[secId].questions[tempQuesId].selectedOptIdsList = "";
										mockVar.groups[grpId].secDetails[secId].questions[tempQuesId].selectedAnswerList = "";
									}catch(e){}
									if(methodToCallPostAudioVideoResponseUploading) {
										if(methodToCallPostAudioVideoResponseUploading=="fnSubmit")
											fnSubmitNew(methodToCallPostAudioVideoResponseUploadingArgs[0], methodToCallPostAudioVideoResponseUploadingArgs[1], methodToCallPostAudioVideoResponseUploadingArgs[2]);
		                                else if(methodToCallPostAudioVideoResponseUploading=="navigateThroughNumberPanel")
		                                    navigateThroughNumberPanel(methodToCallPostAudioVideoResponseUploadingArgs[0]);
		                                else if(methodToCallPostAudioVideoResponseUploading=="submitConfirmation")
		                                    submitConfirmation(methodToCallPostAudioVideoResponseUploadingArgs[0],methodToCallPostAudioVideoResponseUploadingArgs[1]);
		                                methodToCallPostAudioVideoResponseUploading = "";
		                            } else fnSubmitNew('NEXT');
								}
								if(sessionStorage.userdefinedcandconsole==undefined || sessionStorage.userdefinedcandconsole==0)
								mockVar.curQuesBean.quesParam.answer='';
							}
					},
					error : function(e){
						if(mockVar.reliableMode == 'true' || mockVar.reliableMode == true){
							if(sessionStorage.userdefinedcandconsole!=undefined && sessionStorage.userdefinedcandconsole==1 && itterationCount < 5){
								itterationCount++;
								uploadData(blob,type,queId,itterationCount,grpId,secId);
							} else if(itterationCount >= 5 ||  sessionStorage.userdefinedcandconsole!=1){
								try{
									var AuditJsonObject = new Object();
									AuditJsonObject.ActionName = "Recording API Status";
									AuditJsonObject.ActionDesc = "Failed : "+JSON.stringify(e);
									try{
										AuditJsonObject.ActionDesc += " :: "+blob.size;
									}catch(e){
										console.log(e);
									}
									AuditJsonObject.GroupId = "NA";
									AuditJsonObject.SectionId = "NA";
									AuditJsonObject.QuestionId = "NA";
									AuditJsonObject.SelectedOptionId = "NA";
									AuditJsonObject.OptionSequence = "NA";
									AuditJsonObject.candidateName = sessionStorage.isOfflinePaper=='1' ? sessionStorage.username : $.cookie("username");
									AuditJsonObject.loginId = sessionStorage.isOfflinePaper=='1' ? sessionStorage.username : $.cookie("loginId");
									var currentDate = new Date();
									AuditJsonObject.Time = currentDate.yyyymmddHHmmss();
									AuditJsonObject.mockVarLoginId = parent.mockVar.loginId;
									parent.AuditJson.push(AuditJsonObject);
								}catch(e){
									console.log(e);
								}
								StoreCandAudioVideoData(blob,type,queId,itterationCount,grpId,secId);
							}
						}
						else{
						audioVideoResponsePending = false;
						$('.overlay').hide();
						!isDeakin?$('#recordingUploadLoader').hide():$('.savingYourResponse').hide();
						//timer();
						if(!isExaminer){
							if(sessionStorage.userdefinedcandconsole==undefined || sessionStorage.userdefinedcandconsole==0){
								timer(3579+"M");
							}//Timer should not be displayed to the examiner as he can resume after candidate consume the whole time 
						}else{
							enableOrDisableSubmitForExaminer();
						} 
						if(sessionStorage.userdefinedcandconsole==undefined || sessionStorage.userdefinedcandconsole==0)
							timeSpentOnQuestionLevel();
						if(tempLocalBlobArray[queId]!=null && typeof(tempLocalBlobArray[queId])!='undefined' && showPopupInCC){
							cnfPop('recordingUploadFailurePopup');
							$('#recordingUploadFailurePopupMsg').html($(globalXmlvar).find('recordingUploadFailurePopupMsg').text());
							$('.info').html($(globalXmlvar).find('info').text());
							$('.popClose').html($(globalXmlvar).find('close').text());
							$('.Yes').html($(globalXmlvar).find('Yes').text());
							$('.No').html($(globalXmlvar).find('No').text());
								}
						if(sessionStorage.userdefinedcandconsole!=undefined && sessionStorage.userdefinedcandconsole==1 && itterationCount < 5){
							itterationCount++;
							uploadData(blob,type,queId,itterationCount,grpId,secId);
						} else if(itterationCount >= 5 ||  sessionStorage.userdefinedcandconsole!=1){
							try{
							var tempQuesId = quesIdIndexes[queId];
							mockVar.groups[grpId].secDetails[secId].questions[tempQuesId].quesParam.answer = "";
							mockVar.groups[grpId].secDetails[secId].questions[tempQuesId].selectedOptIdsList = "";
							mockVar.groups[grpId].secDetails[secId].questions[tempQuesId].selectedAnswerList = "";
							}catch(e){}
							try{
								var AuditJsonObject = new Object();
								AuditJsonObject.ActionName = "Recording API Status";
								AuditJsonObject.ActionDesc = "Failed : "+JSON.stringify(e);
								try{
									AuditJsonObject.ActionDesc += " :: "+blob.size;
								}catch(e){
									console.log(e);
								}
								AuditJsonObject.GroupId = "NA";
								AuditJsonObject.SectionId = "NA";
								AuditJsonObject.QuestionId = "NA";
								AuditJsonObject.SelectedOptionId = "NA";
								AuditJsonObject.OptionSequence = "NA";
								AuditJsonObject.candidateName = sessionStorage.isOfflinePaper=='1' ? sessionStorage.username : $.cookie("username");
								AuditJsonObject.loginId = sessionStorage.isOfflinePaper=='1' ? sessionStorage.username : $.cookie("loginId");
								var currentDate = new Date();
								AuditJsonObject.Time = currentDate.yyyymmddHHmmss();
								AuditJsonObject.mockVarLoginId = parent.mockVar.loginId;
								parent.AuditJson.push(AuditJsonObject);
							}catch(e){
								console.log(e);
							}
							if(methodToCallPostAudioVideoResponseUploading) {
								if(methodToCallPostAudioVideoResponseUploading=="fnSubmit")
									fnSubmitNew(methodToCallPostAudioVideoResponseUploadingArgs[0], methodToCallPostAudioVideoResponseUploadingArgs[1], methodToCallPostAudioVideoResponseUploadingArgs[2]);
                                else if(methodToCallPostAudioVideoResponseUploading=="navigateThroughNumberPanel")
                                    navigateThroughNumberPanel(methodToCallPostAudioVideoResponseUploadingArgs[0]);
                                else if(methodToCallPostAudioVideoResponseUploading=="submitConfirmation")
                                    submitConfirmation(methodToCallPostAudioVideoResponseUploadingArgs[0],methodToCallPostAudioVideoResponseUploadingArgs[1]);
                                methodToCallPostAudioVideoResponseUploading = "";
                            } else fnSubmitNew('NEXT');
						}
						if(sessionStorage.userdefinedcandconsole==undefined || sessionStorage.userdefinedcandconsole==0)
								mockVar.curQuesBean.quesParam.answer='';
					}}
				});
				
			}else{
				if(sessionStorage.isPaperUI == "1")mockVar.curQuesBean.blobData = blob;
				if(type.toLowerCase()=='savevideofile')
					mockVar.curQuesBean.quesParam.answer='recordingSaved';
					else
					mockVar.curQuesBean.quesParam.answer='recordingSaved';
				if(clearTimeOutMethodCalled)
				    timer();
				if(typeof(sessionStorage.userdefinedcandconsole) != "undefined" && sessionStorage.userdefinedcandconsole==1 && !isDeakin){
					$('.overlay').hide();
					!isDeakin?$('#recordingUploadLoader').hide():$('.savingYourResponse').hide();
                    !isDeakin?$("#recordingSaved").show():$(".responseSaved").show();
                    setTimeout(function(){
                        $("#recordingSaved").hide();},1000);
					fnSubmitNew('NEXT');
				}else if(methodToCallPostAudioVideoResponseUploading) {
					 if(methodToCallPostAudioVideoResponseUploading=="fnSubmit")
					     fnSubmitNew(methodToCallPostAudioVideoResponseUploadingArgs[0], methodToCallPostAudioVideoResponseUploadingArgs[1], methodToCallPostAudioVideoResponseUploadingArgs[2]);
                     else if(methodToCallPostAudioVideoResponseUploading=="navigateThroughNumberPanel")
                         navigateThroughNumberPanel(methodToCallPostAudioVideoResponseUploadingArgs[0]);
                     else if(methodToCallPostAudioVideoResponseUploading=="submitConfirmation")
                         submitConfirmation(methodToCallPostAudioVideoResponseUploadingArgs[0],methodToCallPostAudioVideoResponseUploadingArgs[1]);
                     methodToCallPostAudioVideoResponseUploading = "";
                 } else if(showRecordingLimitReachedPopupPostAudioVideoResponseUploading) {
                 	showRecordingLimitReachedPopupPostAudioVideoResponseUploading = false;
                 	cnfPop('recordingLimitReachedPopup');
                 }


			}
		
	}

function blobSizeCheckArrayPush(){
	/*if(mockVar.curQuesBean.keyboardType == "AudioFile"){
				var audioElementsArray = document.getElementsByTagName('Audio');
		for(var i=0;i<audioElementsArray.length;i++){
		if(audioElementsArray[i].id=='audioRecordingPlayer'){
			timeRecorded=audioElementsArray[i].currentTime;
			break;
		}
		}
			}
			if(mockVar.curQuesBean.keyboardType == "VideoFile"){
				var videoElementsArray = document.getElementsByTagName('Video');
		for(var i=0;i<videoElementsArray.length;i++){
		if(videoElementsArray[i].id=='videoRecordingPlayer'){
			timeRecorded=videoElementsArray[i].currentTime;
			break;
		}
		}
			}*/
	if(!mediaRecorder || mediaRecorder.stream.active == false){
		if(!fromPreRequisitesPage && sessionStorage.userdefinedcandconsole==1  && userDefinedRequired){
			cnfPop('backupAlerts');hideCloseAndOkayForSecuredAssessments();
			$("#backupAlertMsg").html($(globalXmlvar).find('audioAccessMessage').text());
			if(startFromTheBegining){
				clearTimeOutMethodCalled = true;
				clearTimeout(mockVar.timeCounter);
				clearTimeout(questionLevelTimeCounter);
				clearTimeOutMethodCalled = true;
			}
		
		}
	}
	if(isRecording){
	timeRecorded=timeRecorded+1;
	try{(isDeakin || sessionStorage.isPaperUI == "1" || paperTimerReq)?circleTimerDeakin("saResp",mockVar.curQuesBean.SARecordingTime-timeRecorded,mockVar.curQuesBean.SARecordingTime):'';}catch(e){}
	try	{
		if(timeRecorded > mockVar.curQuesBean.SAMinRecordingTime) {
			$('#stop-recording').attr('disabled', false);
		}
		else {
			$('#stop-recording').attr('disabled', true);
		}
		}
	catch(e){}
	}
	$('.recordingTimer').html(convertRecordingTime(timeRecorded));
	try{
	if(timeRecorded>=0 && timeRecorded < parseFloat(mockVar.curQuesBean.SARecordingTime)){
	flagToRemoveSetTimeOut=setTimeout(function(){
	blobSizeCheckArrayPush();},1000);
	}else{
		clearTimeout(flagToRemoveSetTimeOut);
		if(!mediaStoppedByUser){
			if(mockVar.curQuesBean.keyboardType == "VideoFile"){
				//alert('Limit for recording video response crossed. Please click on save to save ur response.');
					//$("#recordingLimitReachedPopupMessage").html("Limit for recording  response crossed. Please click on save to save ur response.");
				if(showPopupInCC){
				
				if(mockVar.curQuesBean.saAllowReRecord) 
					cnfPop('recordingLimitReachedPopup');
				else if(mockVar.curQuesBean.maxTime!=0)
					showRecordingLimitReachedPopupPostAudioVideoResponseUploading = true;
				if(mockVar.curQuesBean.saAllowReRecord)
					$('#recordingLimitReachedPopupMessage').html($(globalXmlvar).find('recordingLimitReachedPopupMessage').text());
				else
					$('#recordingLimitReachedPopupMessage').html($(globalXmlvar).find('recordingLimitReachedPopupMessageForReRecordNotAllowed').text());
				$('.info').html($(globalXmlvar).find('info').text());
				$('.popClose').html($(globalXmlvar).find('close').text());
				$('.ok').html($(globalXmlvar).find('Ok').text());
				}
				stopVideoRecording(false);
				
			}else if (mockVar.curQuesBean.keyboardType == "AudioFile"){
				//alert('Limit for recording audio response is crossed. Please click on save to save ur response.');
				if(showPopupInCC){
				if(mockVar.curQuesBean.saAllowReRecord) 
					cnfPop('recordingLimitReachedPopup');
				else if(mockVar.curQuesBean.maxTime!=0)
					showRecordingLimitReachedPopupPostAudioVideoResponseUploading = true;
				if(mockVar.curQuesBean.saAllowReRecord)
					$('#recordingLimitReachedPopupMessage').html($(globalXmlvar).find('recordingLimitReachedPopupMessage').text());
				else
					$('#recordingLimitReachedPopupMessage').html($(globalXmlvar).find('recordingLimitReachedPopupMessageForReRecordNotAllowed').text());
				$('.info').html($(globalXmlvar).find('info').text());
				$('.popClose').html($(globalXmlvar).find('close').text());
				$('.ok').html($(globalXmlvar).find('Ok').text());
				}
				stopAudioRecording(false);
			}
			}
	}}catch(e){}
}
//clearTimeout(flagToRemoveSetTimeOut);

function reStartRecording(){
	$('#start-recording').attr('disabled', true);
	if(mockVar.curQuesBean.keyboardType == "VideoFile"){
		$('.audioDictaphoneForVideo').show();
		$('#videos-container').empty();
		$('#videos-container').show();
		const mediaVideoConstraints = {
			     audio: true,
			     video: {
			    	    mandatory: {
			    	      maxWidth: 640,
			    	      maxHeight: 360
			    	    }
			    	  }
	};
		captureUserMediaVideo(mediaVideoConstraints, onMediaSuccess, onMediaError);
	}else if (mockVar.curQuesBean.keyboardType == "AudioFile"){
		 $('.audioDictaphone').show();
		$('#audios-container').empty();
		$('#audios-container').show();
		const mediaAudioConstraints = {
			     audio: true
		 };
		captureUserMediaAudio(mediaAudioConstraints, onMediaSuccess, onMediaError);
	}	
}
function saveAndNextRecording(answer){
	if(mockVar.curQuesBean.keyboardType == "AudioFile")
	save('', 'NEXT',mockVar.curQuesBean.quesType);
	else if(mockVar.curQuesBean.keyboardType == "VideoFile")
	save('', 'NEXT',mockVar.curQuesBean.quesType);
}
function convertRecordingTime(time){
	 if(mockVar.timeFormat=='MM:SS'){
			flagTest='true';
			return showRecordingMin(time,flagTest)+":"+showRecordingSec(time);
			}
			if(mockVar.timeFormat=='HH:MM:SS'){
			flagTest='false';
			return showRecordingHour(time)+":"+showRecordingMin(time,flagTest)+":"+showRecordingSec(time);
			
			}
			if(mockVar.timeFormat=='HH:MM'){
			flagTest='false';
			return showRecordingHour(time)+":"+showRecordingMin(time,flagTest);
			
			}
}

function showRecordingMin(time,flagTest){
	var min = 0;
	if(flagTest=='false'){
      if(parseInt((time%3600)/60)>9){
	min =parseInt((time%3600)/60);
	}
	else
	min ="0"+parseInt((time%3600)/60);
	}
	else{
		if(parseInt(time/60)>9){
		min = parseInt(time/60);}
		else{
			min ="0"+ parseInt(time/60);
		}
	}
	return min;
	
}
function showRecordingHour(time){
	var hour = 0;
//	time = time%3600;
	if(parseInt(time/3600)>9){
	hour = parseInt(time/3600);
	}
	else
	hour = "0"+parseInt(time/3600);
	return hour;
}

function showRecordingSec(time){
	var sec="";
	if((time%60)>9)
		sec = time%60;
	else
		sec = "0"+time%60;
	return sec;	
}
function reUploadBlob(queId){
	//$('#recordingUploadLoader').show();
		
	var queIdv = typeof(queId) == "undefined" ? mockVar.curQuesBean.quesId : queId;
	mockVar.curQuesBean.quesParam.answer='recordingStopped';
	uploadData(tempLocalBlobArray[queIdv],typeof(queId) == "undefined" ? (mockVar.curQuesBean.keyboardType == "AudioFile"?"saveaudiofile" :"savevideofile") : "saveaudiofile",queId,0);
	//$('#recordingUploadLoader').hide();
}
async function previewRecording(){
	if(!fromPreRequisitesPage && !isVideoResponseFromGrpInstru){
		if(mockVar.curQuesBean.keyboardType.toLowerCase()=='videofile'){	
			var video = document.getElementById("recordedVideo");
			// sreejith: reason: to addresss: after recording is done and when we show the preview the timing is 00:00
			video.addEventListener("loadedmetadata", () => {
			   if (video.duration === Infinity || video.duration === 0) {
			       video.currentTime = 1e101; // complete last 
			       video.ontimeupdate = () => {
			           video.ontimeupdate = null;
			           video.currentTime = 0; // backto zero			          
			       };
			   } 
			}); 
			if(!isExaminer){
				var tempRecording = new Blob(tempBlobArray, {
					//type:"video/webm"
					type:videoFormatForSAAudioQuestions
				});
				/*if('srcObject' in video){
					 video.srcObject = tempRecording;
				}
				else{*/
					if (window.webkitURL) {
						video.src = decodeURIComponent(window.webkitURL.createObjectURL(tempRecording));
					  } else if (window.URL && window.URL.createObjectURL) {
						  video.src = decodeURIComponent(window.URL.createObjectURL(tempRecording));
					  }
						/*blobToDataURL(tempRecording, function (dataurl) {
		                video.src = dataurl;
		                video.play()// not needed if autoplay is set for the video element
		                });*/
				/*}*/
				
			}else if(mockVar.groups[mockVar.currentGrp].isExaminerGroup!=undefined && !mockVar.groups[mockVar.currentGrp].isExaminerGroup){
				video.src = xmlFilePath+"/recordedTypeAnswersofAssessment/"+mockVar.candMasterId+"/"+mockVar.attemptId+"/"+mockVar.curQuesBean.quesId+"/Video_"+mockVar.curQuesBean.quesId+".webm";
			}else{
				var tempRecording = new Blob(tempBlobArray, {
	                //type:"video/webm"
					type:videoFormatForSAAudioQuestions
	            });
				/*if('srcObject' in video){
					 video.srcObject = tempRecording;
				}
				else{*/
					if (window.webkitURL) {
						video.src = decodeURIComponent(window.webkitURL.createObjectURL(tempRecording));
					  } else if (window.URL && window.URL.createObjectURL) {
						  video.src = decodeURIComponent(window.URL.createObjectURL(tempRecording));
					  }
						/*blobToDataURL(tempRecording, function (dataurl) {
		                video.src = dataurl;
		                video.play()// not needed if autoplay is set for the video element
		                });*/
				/*}*/
			}
			video.setAttribute('height', '220');
			video.setAttribute('width', 'auto');
			$('#recordedVideoSpan').show();
			$("#recordedVideoSpan").insertAfter("#videoRecordingStartClickMessage");
            $('#recordingAlreadySaved').hide();
			}else{
			var audio = document.getElementById("recordedAudio");
			// sreejith
			audio.addEventListener("loadedmetadata", () => {
			   if (audio.duration === Infinity || audio.duration === 0) {
			       audio.currentTime = 1e101; 
			       audio.ontimeupdate = () => {
			           audio.ontimeupdate = null;
			           audio.currentTime = 0; 			        
			       };
			   }
			});
			if(!isExaminer){
				var tempRecording = new Blob(tempBlobArray, {
	               // type:"audio/webm"
					type:audioFormatForSAAudioQuestions
	            });
				if (window.webkitURL) {
					audio.src = decodeURIComponent(window.webkitURL.createObjectURL(tempRecording));
				  } else if (window.URL && window.URL.createObjectURL) {
					  audio.src = decodeURIComponent(window.URL.createObjectURL(tempRecording));
				  }
			}else if(mockVar.groups[mockVar.currentGrp].isExaminerGroup!=undefined && !mockVar.groups[mockVar.currentGrp].isExaminerGroup){
				audio.src = xmlFilePath+"/recordedTypeAnswersofAssessment/"+mockVar.candMasterId+"/"+mockVar.attemptId+"/"+mockVar.curQuesBean.quesId+"/Audio_"+mockVar.curQuesBean.quesId+".webm";
			}else{
				var tempRecording = new Blob(tempBlobArray, {
	                //type:"audio/webm"
					type:audioFormatForSAAudioQuestions
	            });
				if (window.webkitURL) {
					audio.src = decodeURIComponent(window.webkitURL.createObjectURL(tempRecording));
				  } else if (window.URL && window.URL.createObjectURL) {
					  audio.src = decodeURIComponent(window.URL.createObjectURL(tempRecording));
				  }
			}
			$('#recordedAudioSpan').show();
			$("#recordedAudioSpan").insertAfter("#audioRecordingAttemptMessage");
            $('#recordingAlreadySaved').hide();
			}
	}else{
		if(audioStopped){
		var audio = document.getElementById("audioPreviewDiv");
		let audioURL='';
			$('#audioRecordingDiv').hide();
			$('#audioPreviewDiv').show();
			var tempRecording = new Blob(tempBlobArray, {
                //type:"audio/webm"
				type:audioFormatForSAAudioQuestions
            });
			
			if(fromPreRequisitesPage){
				const hasVoice = await detectVoiceInVideo(tempRecording);
				if(!hasVoice){
					$('#voiceNotDetected').show();
					$('#successFullRecordingMessage').hide();
				}
			}
			
			if (window.webkitURL) {
				audioURL = decodeURIComponent(window.webkitURL.createObjectURL(tempRecording));
			  } else if (window.URL && window.URL.createObjectURL) {
				  audioURL = decodeURIComponent(window.URL.createObjectURL(tempRecording));
			  }
			  const player = videojs('audioPreviewDiv',{
			  				   aspectRatio: '16:9',
			  				   controls: true,
			  				   autoplay: false,
			  				   preload: 'auto'

			  			  });
			  			  player.src({ type: 'audio/mp3', src: audioURL });
			  			player.one('loadedmetadata', () => {
			  			  const d = player.duration();
			  			  if (d === Infinity || d === 0) {
			  			    player.currentTime(1e101);
			  			    const onTU = () => {
			  			      player.off('timeupdate', onTU);
			  			      player.currentTime(0);
			  			      player.play();
			  			    };
			  			    player.on('timeupdate', onTU);
			  			  }
			  			});
		}
		if(videoStopped){
			if(isVideoResponseFromGrpInstru){
				var video = document.getElementById("recordedVideo");
				var tempRecording = new Blob(tempBlobArray, {
					//type:"video/webm"
					type:videoFormatForSAAudioQuestions
				});
				if (window.webkitURL) {
					video.src = decodeURIComponent(window.webkitURL.createObjectURL(tempRecording));
				  } else if (window.URL && window.URL.createObjectURL) {
					  video.src = decodeURIComponent(window.URL.createObjectURL(tempRecording));
				  }
				$('#recordedVideoSpan').show();
				$('#recordingAlreadySaved').hide();
			}
			else{
			var video = document.getElementById("videoPreviewDiv");
			let videoURL='';
				$('#videoRecordingDiv').hide();
				$('#videoPreviewDiv').show();
				$('#videoPreviewDiv video').show();
				/*var tempRecording = new Blob(tempBlobArray, {
	                //type:"video/webm"
					type:videoFormatForSAAudioQuestions
	            });*/
				var actualType = (tempBlobArray.length > 0 && tempBlobArray[0].type) ? tempBlobArray[0].type : videoFormatForSAAudioQuestions;
				var tempRecording = new Blob(tempBlobArray, {
				    type: actualType
	            });
				
				if(fromPreRequisitesPage){
					const hasVoice = await detectVoiceInVideo(tempRecording);
					if(!hasVoice){
						$('#voiceNotDetected').show();
						$('#videoRecordingButton,#videoRecordingStopButton,#audioRecordingStopButton,#audioRecordingStopButton').removeAttr("disabled");
						$('#successFullRecordingMessage').hide();
					}
				}
				if (window.webkitURL) {
					videoURL = decodeURIComponent(window.webkitURL.createObjectURL(tempRecording));
				  } else if (window.URL && window.URL.createObjectURL) {
					  videoURL = decodeURIComponent(window.URL.createObjectURL(tempRecording));
				  }

				  const player = videojs('videoPreviewDiv',{
					   aspectRatio: '16:9',
					   controls: true,
					   autoplay: false,
					   preload: 'auto'

				  });
				  player.src({ type: (tempRecording && tempRecording.type) ? tempRecording.type : 'video/mp4', src: videoURL });
				  player.one('loadedmetadata', () => {
					  const d = player.duration();
					  if (d === Infinity || d === 0) {
					    player.currentTime(1e101);
					    const onTU = () => {
					      player.off('timeupdate', onTU);
					      player.currentTime(0);
					      player.play();
					    };
					    player.on('timeupdate', onTU);
					  }
					});

			}}
	}	
}
//sreejith
async function detectVoiceInVideo(videoBlob) { // applicable for both audio and video
	 const audioContext = new AudioContext();
	 const arrayBuffer = await videoBlob.arrayBuffer();
	 const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
	 const channelData = audioBuffer.getChannelData(0);
	 let hasSound = false;
	 for (let i = 0; i < channelData.length; i++) {
	   if (Math.abs(channelData[i]) > 0.01) { 
	     hasSound = true;
	     break;
	   }
	 }
	 return hasSound;
	}

function examinerRecordingChunk(recordedChunk){
		var formData =  new FormData();
		formData.append("examinerRecording",recordedChunk);
		//isFileUploadStarted = true;
		$.ajax({
			url:'/IBACC/MockAssessmentAction.do?action=examinerRecordingChunk&mockId='+mockVar.mockId+'&orgId='+mockVar.orgId+'&candMasterId='+mockVar.candMasterId+'&attemptNo='+mockVar.attemptId+'&groupName='+mockVar.groups[mockVar.currentGrp].groupId+'&timeZone='+mockVar.timeZone,
			type: 'POST',
			async: true,
			data: formData,
			contentType: false,
			processData: false,
			dataType : 'text',
			success: function (data) {
			if(data=='success'){
			
			}else{
			examinerRecordingChunk(recordedChunk);
			}
			},
			error : function(){
			}
			});
		}
function selectDevicesForStreaming(){
	
	 audioSelect = document.querySelector('select#audioSource');
	 videoSelect = document.querySelector('select#videoSource');
	navigator.mediaDevices.enumerateDevices()
	  .then(gotDevices).then(getStream).catch(handleError);
}
function getStream() {
	  if (window.stream) {
	    window.stream.getTracks().forEach(function(track) {
	      track.stop();
	    });
	  }
}

function gotDevices(deviceInfos) {
	  for (var i = 0; i !== deviceInfos.length; ++i) {
	    const deviceInfo = deviceInfos[i];
	    const option = document.createElement('option');
	    option.value = deviceInfo.deviceId;
	    if (deviceInfo.kind === 'audioinput') {
	      option.text = deviceInfo.label ||
	        'microphone ' + (audioSelect.length + 1);
	      audioSelect.appendChild(option);
	    } else if (deviceInfo.kind === 'videoinput') {
	      option.text = deviceInfo.label || 'camera ' +
	        (videoSelect.length + 1);
	      videoSelect.appendChild(option);
	    } else {
	      console.log('Found another kind of device: ', deviceInfo);
	    }
	  }
	}
function handleError(error) {
	  console.log('Error: ', error);
	}
var videoSelect;
var audioSelect;

function blobToDataURL(blob, callback){
			var a =new FileReader();
            a.onload =function(e){ callback(e.target.result);}
            a.readAsDataURL(blob);

}
function stopAudioPreview(){
	try{
    	stopAudioRecording();
		audioVideoRecorsStatus=true;
		$('#audioRecordingStopButton').attr('disabled', true);
		$('#successFullRecordingMessage').show();
		$('#successFullRecordingStartButton').show();
		$('#failureMessageDiv').hide();
		$('#ClickStop').hide();
		$('#afterRecording').show();
		//$('#audioRecordingDiv').show();
		$('#audioRecordingButton').attr('disabled', false);
		$('#audioPreviewDiv').show();
		$('#audioRecordingButton').attr('disabled', false);
		$('#audioRecordingStopButton').attr('disabled', false);
		setTimeout(function(){
			if(sessionStorage.userDefinedNum==="certificationUI" || sessionStorage.userDefinedNum==="schoolUI" || sessionStorage.userDefinedNum==="corporateUI" || sessionStorage.userDefinedNum=== 'xeroxUI')
				{
				$('#audioRecordingStopButton').css('opacity','.4');
				}
		},100);
    	}
    	catch(e){
			audioVideoRecorsStatus=false;
			$('#failureMessageDiv').show();
			$('#successFullRecordingMessage').hide();
			$('#successFullRecordingStartButton').hide();
		}
}

var isStoppingVideoRecording = false;

function resetVideoStopButton() {
    isStoppingVideoRecording = false;

    $('#videoRecordingStopButton')
        .prop('disabled', false)
        .removeAttr('disabled')
        .css({
            'opacity': '1',
            'pointer-events': 'auto'
        });
}

$(document)
    .off('click.resetStopButton', '#videoRecordingButton')
    .on('click.resetStopButton', '#videoRecordingButton', function () {

        setTimeout(function () {
            resetVideoStopButton();
        }, 100);
    });

function stopVideoPreview(){

	if (monitorTrackInterval) {
		clearInterval(monitorTrackInterval);
		monitorTrackInterval = null;
	}
	if (checkStaticInterval) {
		clearInterval(checkStaticInterval);
		checkStaticInterval = null;
	}

	if (isStoppingVideoRecording) {
	        return;
	    }

	isStoppingVideoRecording = true;
	
		$('#videoRecordingStopButton').prop('disabled', true);
		
		$('#successFullRecordingMessage').hide();
	    $('#successFullRecordingStartButton').hide();
	    $('#afterRecording').hide();
	    $('#failureMessageDiv').hide();
	
	try{
		
    	stopVideoRecording();
		audioVideoRecorsStatus=true;
		
		//$('#videoRecordingStopButton').attr('disabled', true);
		$('#successFullRecordingMessage').show();
		$('#successFullRecordingStartButton').show();
		$('#failureMessageDiv').hide();
		$('#ClickStop').hide();
		$('#afterRecording').show();
		
		setTimeout(function(){
			if(sessionStorage.userDefinedNum==="certificationUI" || sessionStorage.userDefinedNum==="schoolUI" || sessionStorage.userDefinedNum==="corporateUI" || sessionStorage.userDefinedNum=== 'xeroxUI')
				{
				$('#videoRecordingStopButton').css('opacity','.4');
				}
		},100);
    	}
    	catch(e){
			audioVideoRecorsStatus=false;
			$('#failureMessageDiv').show();
			$('#successFullRecordingMessage').hide();
			$('#successFullRecordingStartButton').hide();
			$('#afterRecording').hide();

			resetVideoStopButton();
		}
//		console.log("COUNT Stop: ",frameCount,blackFrameCount,(blackFrameCount/frameCount),identicalFrameCount);
		if(frameCount>0 && blackFrameCount/frameCount>0.8){
			$('#videoRecordingButton').removeAttr("disabled");
			$('#videoRecordingStopButton').hide();
			$('#successFullRecordingMessage').hide();
			$('#blankErrorMsg1').show();
//			alert("More than 80% of the recorded frames are blank. Please ensure your camera is working properly and start the recording again.");
		}
}
function downsampleBuffer(buffer, rate,sampleRate) {
    if (rate == sampleRate) {
        return buffer;
    }
    if (rate > sampleRate) {
        throw "downsampling rate show be smaller than original sample rate";
    }
    var sampleRateRatio = sampleRate / rate;
    var newLength = Math.round(buffer.length / sampleRateRatio);
    var result = new Float32Array(newLength);
    var offsetResult = 0;
    var offsetBuffer = 0;
    while (offsetResult < result.length) {
        var nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
         // Use average value of skipped samples
        var accum = 0, count = 0;
        for (var i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
            accum += buffer[i];
            count++;
        }
        result[offsetResult] = accum / count;
        // Or you can simply get rid of the skipped samples:
        // result[offsetResult] = buffer[nextOffsetBuffer];
        offsetResult++;
        offsetBuffer = nextOffsetBuffer;
    }
    return result;
}