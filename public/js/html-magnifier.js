(function(window) {

    function HTMLMagnifier(options) {
      const _this = this;
  
      _this.options = Object.assign({ zoom: 1.5, shape: 'square', width: 200, height: 200 }, options);
  
      const magnifierTemplate = `<div class="magnifier" style="display: none;position: fixed;overflow: hidden;background-color: white; box-shadow: rgb(0 0 0 / 76%) 1px 1px 25px; border-radius: 4px;z-index:10000; border-radius: 8px; border: 1px solid #332e2e;">
                                 <div class="magnifier-content" style="top: 0px;left: 0px;margin-left: 0px;margin-top: 0px;overflow: visible;position: absolute;display: block;transform-origin: left top;-moz-transform-origin: left top;-ms-transform-origin: left top;-webkit-transform-origin: left top;-o-transform-origin: left top;user-select: none;-moz-user-select: none;-webkit-user-select: none;padding-top: 0px"></div>
                                 <div class="magnifier-glass" style="position: absolute;top: 0px;left: 0px;width: 100%;height: 100%;opacity: 0.0;-ms-filter: alpha(opacity=0);background-color: white;cursor: move;"></div>
                               </div>`;
  
      const MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
  
      let magnifier, magnifierContent;
      let observerObj;
      let syncTimeout;
      let isVisible = false;
      let magnifierBody;
      let events = {};
  
      function setPosition(element, left, top) {
        element.style.left = `${left - 180}px`;
        element.style.top = `${top - 180}px`;
      }
  
      function setDimensions(element, width, height) {
        element.style.width = `${width}px`;
        element.style.height = `${height}px`;
      }
  
      function setupMagnifier() {
        switch(_this.options.shape) {
        case 'square':
          setDimensions(magnifier, _this.options.width, _this.options.height);
          break;
        case 'circle':
          setDimensions(magnifier, _this.options.width, _this.options.height);
          magnifier.style.borderRadius = '50%';
          break;
        }
        magnifierContent.style.WebkitTransform =
        magnifierContent.style.MozTransform =
          magnifierContent.style.OTransform =
            magnifierContent.style.MsTransform =
              magnifierContent.style.transform = `scale(${_this.options.zoom})`;
      }
  
      function isDescendant(parent, child) {
        let node = child;
        while (node != null) {
          if (node == parent) {
            return true;
          }
          node = node.parentNode;
        }
        return false;
      }
  
      function syncContent() {
        if (isVisible) {
          prepareContent();
          syncViewport();
          syncScrollBars();
        }
      }
  
      function syncContentQueued() {
        if (isVisible) {
          window.clearTimeout(syncTimeout);
          syncTimeout = window.setTimeout(syncContent, 100);
        }
      }
  
      function domChanged() {
        if (isVisible) {
          syncContentQueued();
        }
      }
  
      function unBindDOMObserver() {
        if (observerObj) {
          observerObj.disconnect();
          observerObj = null;
        }
        if (document.removeEventListener) {
          document.removeEventListener('DOMNodeInserted', domChanged, false);
          document.removeEventListener('DOMNodeRemoved', domChanged, false);
        }
      }
  
      function bindDOMObserver() {
        if (MutationObserver) {
          observerObj = new MutationObserver(function(mutations) {
            for(let i = 0; i < mutations.length; i++) {
              if (!isDescendant(magnifier, mutations[i].target)) {
                try {
                  triggerEvent('checkMutation', mutations[i]);
                  domChanged();
                  break;
                } catch (error) {
                //
                }
              }
            }
          });
          observerObj.observe(document, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: [
              'class',
              'width',
              'height',
              'style'
            ],
            attributeOldValue: true
          });
        } else
        if (document.addEventListener) {
          document.addEventListener('DOMNodeInserted', domChanged, false);
          document.addEventListener('DOMNodeRemoved', domChanged, false);
        }
      }
  
      function triggerEvent(event, data) {
        const handlers = events[event];
        if (handlers) {
          for(let i = 0; i < handlers.length; i++) {
            handlers[i].call(_this, data);
          }
        }
      }
  
      function syncViewport() {
        const x1 = magnifier.offsetLeft;
        const y1 = magnifier.offsetTop;
        const x2 = document.body.scrollLeft - 10;
        const y2 = document.body.scrollTop;
        let left;
        let top;
         if($(window).width() / 10 >  magnifier.offsetLeft) {
          left = -x1 * _this.options.zoom - x2 * _this.options.zoom + 160;
        }
        else if($(window).width() / 9 >  magnifier.offsetLeft) {
          left = -x1 * _this.options.zoom - x2 * _this.options.zoom + 136;
        }
        else if($(window).width() / 8 >  magnifier.offsetLeft) {
          left = -x1 * _this.options.zoom - x2 * _this.options.zoom + 112;
        }
        else if($(window).width() / 7 >  magnifier.offsetLeft) {
          left = -x1 * _this.options.zoom - x2 * _this.options.zoom + 64;
        }
        else if($(window).width() / 6 >  magnifier.offsetLeft) {
          left = -x1 * _this.options.zoom - x2 * _this.options.zoom + 40;
        }
        else if($(window).width() / 5 >  magnifier.offsetLeft) {
          left = -x1 * _this.options.zoom - x2 * _this.options.zoom +16 ;
        }
        else if($(window).width() / 4 >  magnifier.offsetLeft) {
          left = -x1 * _this.options.zoom - x2 * _this.options.zoom - 8;
        }
        else if($(window).width() / 3 >  magnifier.offsetLeft) {
          left = -x1 * _this.options.zoom - x2 * _this.options.zoom -32;
        }
        else if($(window).width() / 2 >  magnifier.offsetLeft) {
          left = -x1 * _this.options.zoom - x2 * _this.options.zoom -56;
        }
        else {
          left = -x1 * _this.options.zoom - x2 * _this.options.zoom - 80;
        }
        
        if($(window).height() / 4 >  magnifier.offsetTop) {
          top = -y1 * _this.options.zoom - y2 * _this.options.zoom + 180
          
        } else if($(window).height() / 3 >  magnifier.offsetTop) {
            top = -y1 * _this.options.zoom - y2 * _this.options.zoom + 158 
        }
       else if($(window).height() / 2 >  magnifier.offsetTop) {
          top = -y1 * _this.options.zoom - y2 * _this.options.zoom + 124
          
        } else if($(window).height() / 2 >  magnifier.offsetTop) {
            top = -y1 * _this.options.zoom - y2 * _this.options.zoom + 100 
        }
         else  {
            top = -y1 * _this.options.zoom - y2 * _this.options.zoom + 80 
        }
        // var ht = $(window).width() / 2 - 244;
        // if(ht == X1) {
        //   $('.magnifier-content').css('transition', 'left .1s ease');
        //   setTimeout(function() {
        //     $('.magnifier-content').css('transition', 'unset');
        //   }, 100);
        // }

        setPosition(magnifierContent, left, top);
        triggerEvent('viewPortChanged', magnifierBody);
      }
  
      function removeSelectors(container, selector) {
        const elements = container.querySelectorAll(selector);
        if (elements.length > 0) {
          for(let i = 0; i < elements.length; i++) {
            elements[i].parentNode.removeChild(elements[i]);
          }
        }
      }
      
      
  
    /*  function prepareContent() {
        magnifierContent.innerHTML = '';
        const bodyOriginal = document.body;
        const bodyCopy = bodyOriginal.cloneNode(true);
        const color = bodyOriginal.style.backgroundColor;
        if (color) {
          magnifier.css('background-color', color);
        }
        bodyCopy.style.cursor = 'auto';
        bodyCopy.style.paddingTop = '0px';
        bodyCopy.setAttribute('unselectable', 'on');
        const canvasOriginal = bodyOriginal.querySelectorAll('canvas');
        const canvasCopy = bodyCopy.querySelectorAll('canvas');
        if (canvasOriginal.length > 0) {
          if (canvasOriginal.length === canvasCopy.length) {
            for(let i = 0; i < canvasOriginal.length; i++) {
              let ctx = canvasCopy[i].getContext('2d');
              try {
                ctx.drawImage(canvasOriginal[i], 0, 0);
              } catch (error) {
              //
              }
            }
          }
        }
        removeSelectors(bodyCopy, 'script');
        removeSelectors(bodyCopy, 'audio');
        removeSelectors(bodyCopy, 'video');
        removeSelectors(bodyCopy, '.magnifier');
        
      function removeAttr() {
        const elements = bodyCopy.querySelectorAll('input[type="radio"]');
        if (elements.length > 0) {
          for(let i = 0; i < elements.length; i++) {
            elements[i].removeAttribute("name");
          }
        }
      }
      removeAttr()
        
        triggerEvent('prepareContent', bodyCopy);
        magnifierContent.appendChild(bodyCopy);
        const width = document.body.clientWidth;
        const height = document.body.clientHeight;
        setDimensions(magnifierContent, width, height);
        magnifierBody = magnifierContent.querySelector('body');
        triggerEvent('contentUpdated', magnifierBody);
      }*/
  
      function prepareContent() {
    	  magnifierContent.innerHTML = '';

    	  const bodyOriginal = document.body;
    	  const bodyCopy = bodyOriginal.cloneNode(true);

    	  const color = bodyOriginal.style.backgroundColor;
    	  if (color) {
    	    magnifier.css('background-color', color);
    	  }

    	  bodyCopy.style.cursor = 'auto';
    	  bodyCopy.style.paddingTop = '0px';
    	  bodyCopy.setAttribute('unselectable', 'on');

    	  
    	  bodyCopy.querySelectorAll('iframe').forEach(iframe => {
    	    if (iframe.id !== 'iframeId') {
    	      iframe.remove();
    	    }
    	  });

    
    	  const canvasOriginal = bodyOriginal.querySelectorAll('canvas');
    	  const canvasCopy = bodyCopy.querySelectorAll('canvas');
    	  if (canvasOriginal.length && canvasOriginal.length === canvasCopy.length) {
    	    for (let i = 0; i < canvasOriginal.length; i++) {
    	      try {
    	        canvasCopy[i].getContext('2d')
    	          .drawImage(canvasOriginal[i], 0, 0);
    	      } catch (e) {}
    	    }
    	  }

    	  
    	  removeSelectors(bodyCopy, 'script');
    	  removeSelectors(bodyCopy, 'audio');
    	  removeSelectors(bodyCopy, 'video');
    	  removeSelectors(bodyCopy, '.magnifier');

    	
    	  bodyCopy.querySelectorAll('input[type="radio"]').forEach(radio => {
    	    radio.removeAttribute('name');
    	  });

    	  triggerEvent('prepareContent', bodyCopy);

    	
    	  magnifierContent.appendChild(bodyCopy);

    	  setDimensions(
    	    magnifierContent,
    	    document.body.clientWidth,
    	    document.body.clientHeight
    	  );

    	  magnifierBody = magnifierContent.querySelector('body');
    	  magnifierBody.querySelector('#remoteProctoringDiv').style.display='none';
    	  triggerEvent('contentUpdated', magnifierBody);
    	}
      
      
      
      function initScrollBars() {
        triggerEvent('initScrollBars', magnifierBody);
      }
  
      function syncScroll(ctrl) {
        const selectors = [];
        if (ctrl.getAttribute) {
          if (ctrl.getAttribute('id')) {
            selectors.push('#' + ctrl.getAttribute('id'));
          }
          if (ctrl.className) {
            selectors.push('.' + ctrl.className.split(' ').join('.'));
          }
          for(let i = 0; i < selectors.length; i++) {
            let t = magnifierBody.querySelectorAll(selectors[i]);
            if (t.length == 1) {
              t[0].scrollTop  = ctrl.scrollTop;
              t[0].scrollLeft = ctrl.scrollLeft;
              return true;
            }
          }
        } else
        if (ctrl == document) {
          syncViewport();
        }
        return false;
      }
  
      function syncScrollBars(e) {
        if (isVisible) {
          if (e && e.target) {
            syncScroll(e.target);
          } else {
            let scrolled = [];
            let elements = document.querySelectorAll('div');
            for(let i = 0; i < elements.length; i++) {
              if (elements[i].scrollTop > 0) {
                scrolled.push(elements[i]);
              }
            }
            for(let i = 0; i < scrolled.length; i++) {
              if (!isDescendant(magnifier, scrolled[i])) {
                syncScroll(scrolled[i]);
              }
            }
          }
          triggerEvent('syncScrollBars', magnifierBody);
        }
      }
  
      function makeDraggable(ctrl, options) {
  
        const _this = this;
  
        let dragObject = null;
        let dragHandler = null;
  
        options = options || {};
        options.exclude = [ 'INPUT', 'TEXTAREA', 'SELECT', 'A', 'BUTTON' ];
  
        if (options.handler) {
          dragHandler = ctrl.querySelector(options.handler);
        } else {
          dragHandler = ctrl;
        }
  
        function setPosition(element, left, top) {
          element.style.left = `${left}px`;
          element.style.top = `${top}px`;
        }
  
        let pos_y, pos_x, ofs_x, ofs_y;
  
        ctrl.style.cursor = 'move';
  
        function downHandler(e) {
          const target = e.target || e.srcElement;
          const parent = target.parentNode;
  
          if (target && (options.exclude.indexOf(target.tagName.toUpperCase()) == -1)) {
            if (!parent || (options.exclude.indexOf(parent.tagName.toUpperCase()) == -1)) {  // img in a
              dragObject = ctrl;
  
              const pageX = e.pageX || e.touches[0].pageX;
              const pageY = e.pageY || e.touches[0].pageY;
  
              ofs_x = dragObject.getBoundingClientRect().left - dragObject.offsetLeft;
              ofs_y = dragObject.getBoundingClientRect().top  - dragObject.offsetTop;
  
              pos_x = pageX - (dragObject.getBoundingClientRect().left + document.body.scrollLeft);
              pos_y = pageY - (dragObject.getBoundingClientRect().top  + document.body.scrollTop);
  
              e.preventDefault();
            }
          }
        }
  
        /*function moveHandler(e) {
          if (dragObject !== null) {
            const pageX = e.pageX || e.touches[0].pageX;
            const pageY = e.pageY || e.touches[0].pageY;
            const left = pageX - pos_x - ofs_x - document.body.scrollLeft;
            const top  = pageY - pos_y - ofs_y  - document.body.scrollTop;
  
            setPosition(dragObject, left, top);
            if (options.ondrag) {
              options.ondrag.call(e);
            }
          }
        }*/
        function moveHandler(e) {
        if (dragObject !== null) {
            const pageX = e.pageX || e.touches[0].pageX;
            const pageY = e.pageY || e.touches[0].pageY;
            const left = pageX - pos_x - ofs_x - document.body.scrollLeft;
            const top  = pageY - pos_y - ofs_y - document.body.scrollTop;
            const magRect = dragObject.getBoundingClientRect();
            const minLeft = window.pageXOffset;
            const minTop  = window.pageYOffset;
            const maxLeft =
                window.pageXOffset + window.innerWidth - magRect.width;
            const maxTop =
                window.pageYOffset + window.innerHeight - magRect.height;
            const boundedLeft = Math.max(minLeft, Math.min(left, maxLeft));
            const boundedTop  = Math.max(minTop,  Math.min(top,  maxTop));
            setPosition(dragObject, boundedLeft, boundedTop);
            if (options.ondrag) {
                options.ondrag.call(e);
            }
        }
     }
  
        function upHandler() {
          if (dragObject !== null) {
            dragObject = null;
          }
        }
  
        dragHandler.addEventListener('mousedown', function(e) {
          downHandler(e);
        });
  
        window.addEventListener('mousemove', function(e) {
          moveHandler(e);
        });
  
        window.addEventListener('mouseup', function(e) {
          upHandler(e);
        });
  
        dragHandler.addEventListener('touchstart', function(e) {
          downHandler(e);
        });
  
        window.addEventListener('touchmove', function(e) {
          moveHandler(e);
        });
  
        window.addEventListener('touchend', function(e) {
          upHandler(e);
        });
  
        return _this;
  
      }
  
      function init() {
        const div = document.createElement('div');
        div.innerHTML = magnifierTemplate;
        magnifier = div.querySelector('.magnifier');
        document.body.appendChild(magnifier);
        magnifierContent = magnifier.querySelector('.magnifier-content');
        if (window.addEventListener) {
          window.addEventListener('resize', syncContent, false);
          window.addEventListener('scroll', syncScrollBars, true);
        }
        makeDraggable(magnifier, { ondrag: syncViewport });
      }
  
      _this.setZoom = function(value) {
        _this.options.zoom = value;
        setupMagnifier();
      };
  
      _this.setShape = function(shape, width, height) {
        _this.options.shape = shape;
        if (width) {
          _this.options.width = width;
        }
        if (height) {
          _this.options.height = height;
        }
        setupMagnifier();
      };
  
      _this.setWidth = function(value) {
        _this.options.width = value;
        setupMagnifier();
      };
  
      _this.setHeight = function(value) {
        _this.options.height = value;
        setupMagnifier();
      };
  
      _this.getZoom = function() {
        return _this.options.zoom;
      };
  
      _this.getShape = function() {
        return _this.options.shape;
      };
  
      _this.getWidth = function() {
        return _this.options.width;
      };
  
      _this.getHeight = function() {
        return _this.options.height;
      };
  
      _this.isVisible = function() {
        return isVisible;
      };
  
      _this.on = function(event, callback) {
        events[event] = events[event] || [];
        events[event].push(callback);
      };
  
      _this.syncScrollBars = function() {
        syncScrollBars();
      };
  
      _this.syncContent = function() {
        syncContentQueued();
      };
  
      _this.hide = function() {
        unBindDOMObserver();
        magnifierContent.innerHTML = '';
        magnifier.style.display = 'none';
        isVisible = false;
      };
  
      _this.show = function(event) {
        let left, top;
        if (event) {
          left = event.pageX - 20;
          top = event.pageY - 20;
        } else {
          left = 300;
          top = 300;
        }
        setupMagnifier();
        prepareContent();
        setPosition(magnifier, left, top);
        var magnifyPos = $('#magnify').offset();
      $('.magnifier').css({'top': `${magnifyPos.top + 40}px`, 'left': `${magnifyPos.left - 100}px`, 'width': '490px', 'height': '250px'})
        magnifier.style.display = '';
        syncViewport();
        syncScrollBars();
        initScrollBars();
       // bindDOMObserver();
        isVisible = true;
      };
      
  
      init();
  
      return _this;
  
    }
  
    if (typeof module !== 'undefined' && module.exports) module.exports = HTMLMagnifier; else window.HTMLMagnifier = HTMLMagnifier;
  
  })(window);
  