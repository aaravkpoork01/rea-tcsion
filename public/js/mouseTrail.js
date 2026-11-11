var trailLength = 10;
var path = "./images/cursorTrail.png";

var images = [];
var parentStorage = [];
var iframeStorage = [];

var isInsideIframe = false;
var animationStarted = false;
var iframeMouseMoved = false;
var parentMouseMoved = false;
function createStorage() {
    var storage = [];

    for (var i = 0; i < trailLength * 2; i++) {
        storage[i] = 0;
    }

    return storage;
}

function createTrailElements(targetDocument, prefix, zIndex) {
    if (!targetDocument || !targetDocument.body) {
        return;
    }

    for (var i = 0; i < trailLength; i++) {
        if (targetDocument.getElementById(prefix + i)) {
            continue;
        }

        var div = targetDocument.createElement("div");

        div.id = prefix + i;
        div.style.position = "absolute";
        div.style.zIndex = zIndex;
        div.style.height = "0";
        div.style.width = "0";
        div.style.pointerEvents = "none";
        div.style.display = "none";

        var img = targetDocument.createElement("img");

        img.src = path;
        img.className = "accessabilityTrailCls";
        img.style.pointerEvents = "none";

        div.appendChild(img);
        targetDocument.body.appendChild(div);
    }
}

function updateTrailElements(targetDocument, prefix, storage, showTrail) {
    if (!targetDocument) {
        return;
    }

    var storageIndex = 0;

    for (var i = 0; i < trailLength; i++) {
        var element = targetDocument.getElementById(prefix + i);

        if (!element) {
            storageIndex += 2;
            continue;
        }

        if (showTrail) {
            element.style.display = "block";
            element.style.top = storage[storageIndex] + "px";
            element.style.left = storage[storageIndex + 1] + "px";
        } else {
            element.style.display = "none";
        }

        storageIndex += 2;
    }
}

function shiftStorage(storage) {
    for (var i = storage.length - 1; i >= 2; i--) {
        storage[i] = storage[i - 2];
    }
}

function acessMouseTrail() {
    var iframe = document.getElementById("iframeId");
    var iframeDoc = null;

    if (iframe) {
        try {
            iframeDoc =
                iframe.contentDocument ||
                iframe.contentWindow.document;
        } catch (error) {
            iframeDoc = null;
        }
    }

    var trailEnabled =
        document.body.classList.contains("restTrailActive");

    updateTrailElements(
        document,
        "obj",
        parentStorage,
        trailEnabled &&
        !isInsideIframe &&
        parentMouseMoved
    );

    if (iframeDoc) {
        updateTrailElements(
            iframeDoc,
            "iframeObj",
            iframeStorage,
            trailEnabled &&
            isInsideIframe &&
            iframeMouseMoved
        );
    }

    if (trailEnabled) {
        if (isInsideIframe) {
            shiftStorage(iframeStorage);
        } else {
            shiftStorage(parentStorage);
        }
    }

    setTimeout(acessMouseTrail, 10);
}

function acessProcessEvent(e) {
    e = e || window.event;

    if (!e) {
        return;
    }

    if (window.event && e.clientX !== undefined) {
        var standardBody =
            document.compatMode === "CSS1Compat"
                ? document.documentElement
                : document.body;

        parentStorage[0] =
            e.clientY + standardBody.scrollTop + 12;

        parentStorage[1] =
            e.clientX + standardBody.scrollLeft + 12;
    } else {
        parentStorage[0] = e.pageY + 12;
        parentStorage[1] = e.pageX + 12;
    }
}

function attachTrailToIframe() {
    var iframe = document.getElementById("iframeId");

    if (!iframe) {
        isInsideIframe = false;
        iframeMouseMoved = false;

        setTimeout(attachTrailToIframe, 100);
        return;
    }

    
    if (!iframe._trailLoadEventAdded) {
        iframe.addEventListener("load", function () {
            isInsideIframe = false;
            iframeMouseMoved = false;
            iframeStorage = createStorage();

            setTimeout(function () {
                attachTrailToIframe();
            }, 0);
        });

        iframe._trailLoadEventAdded = true;
    }

    var iframeDoc;

    try {
        iframeDoc =
            iframe.contentDocument ||
            iframe.contentWindow.document;
    } catch (error) {
        isInsideIframe = false;
        iframeMouseMoved = false;
        iframeStorage = createStorage();
        return;
    }

    if (!iframeDoc || !iframeDoc.body) {
        setTimeout(attachTrailToIframe, 100);
        return;
    }

    createTrailElements(
        iframeDoc,
        "iframeObj",
        "999999"
    );

    
    if (!iframeDoc._trailEventsAdded) {
    	iframeDoc.addEventListener("mousemove", function (e) {
    	    var mouseY = e.pageY + 12;
    	    var mouseX = e.pageX + 12;

    	    isInsideIframe = true;

    	    if (!iframeMouseMoved) {
    	        initializeStorageAtPosition(
    	            iframeStorage,
    	            mouseY,
    	            mouseX
    	        );
    	    }

    	    iframeMouseMoved = true;

    	    iframeStorage[0] = mouseY;
    	    iframeStorage[1] = mouseX;
    	});

        iframeDoc.addEventListener("mouseenter", function () {
            isInsideIframe = true;
            iframeMouseMoved = false;
            iframeStorage = createStorage();
        });

        iframeDoc.addEventListener("mouseleave", function () {
            isInsideIframe = false;
            iframeMouseMoved = false;
            iframeStorage = createStorage();
        });

        iframeDoc._trailEventsAdded = true;
    }
}
function initializeStorageAtPosition(storage, y, x) {
    for (var i = 0; i < storage.length; i += 2) {
        storage[i] = y;
        storage[i + 1] = x;
    }
}

function initMouseTrail() {
    images = [];

    for (var i = 0; i < trailLength; i++) {
        images[i] = new Image();
        images[i].src = path;
    }

    parentStorage = createStorage();
    iframeStorage = createStorage();

    createTrailElements(
        document,
        "obj",
        "9999"
    );

    document.addEventListener("mousemove", function (e) {
        isInsideIframe = false;

        if (!parentMouseMoved) {
            var mouseY = e.pageY + 12;
            var mouseX = e.pageX + 12;

            initializeStorageAtPosition(
                parentStorage,
                mouseY,
                mouseX
            );

            parentMouseMoved = true;
        }

        acessProcessEvent(e);
    });

    window.addEventListener("blur", function () {
        
        setTimeout(function () {
            var iframe = document.getElementById("iframeId");

            if (
                !iframe ||
                document.activeElement !== iframe
            ) {
                isInsideIframe = false;
            }
        }, 0);
    });

    attachTrailToIframe();

    if (!animationStarted) {
        animationStarted = true;
        acessMouseTrail();
    }
}

if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        initMouseTrail
    );
} else {
    initMouseTrail();
}