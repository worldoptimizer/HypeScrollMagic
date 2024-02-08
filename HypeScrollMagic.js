/*!
 * Hype ScrollMagic v1.0.3
 * Integrates ScrollMagic with Tumult Hype for scroll-based animations and interactions.
 * Copyright (2024) Max Ziebell, (https://maxziebell.de). MIT-license
 */

/*
 * Version-History
 * 1.0.0 Initial release
 * 1.0.1 Added method to add scroll timelines programmatically
 * 1.0.2 Refactored names
 * 1.0.3 Added behavior triggers, default options and better markers
 */

 if ("HypeScrollMagic" in window === false) window['HypeScrollMagic'] = (function () {
    const controllers = {};
    const scenes = [];

    /* default options */
    let _default = {
        options: {
            triggerHook: 0.5,
            pin: false,
            reset: true,
        },
        behavior: {
            enter: true,
            leave: true,
        },
        markerColor: '#333',
        timelineName: 'Main Timeline',
        logBehavior: false,
    };

    /**
     * This function allows to override a global default by key or if a object is given as key to override all default at once
     *
     * @param {String} key This is the key to override
     * @param {String|Function|Object} value This is the value to set for the key
     */
    function setDefault(key, value){
        //allow setting all defaults
        if (typeof(key) == 'object') {
            _default = key;
            return;
        }
    
        //set specific default
        _default[key] = value;
    }
    
    /**
     * This function returns the value of a default by key or all default if no key is given
     *
     * @param {String} key This the key of the default.
     * @return Returns the current value for a default with a certain key.
     */
    function getDefault(key){
        // return all defaults if no key is given
        if (!key) return _default;
    
        // return specific default
        return _default[key];
    }
    
    /**
     * @function debounceByRequestFrame
     * @param {function} fn - the function to be debounced
     * @returns {function} - the debounced function
     */
    function debounceByRequestFrame(fn) {
        return function() {
            if (fn.timeout) return;
            var args = arguments;
            fn.timeout = requestAnimationFrame(function() {
                fn.apply(this, args);
                fn.timeout = null;
            }.bind(this));
        };
    }

    /**
     * @function getSymbolInstance
     * @param {object} hypeDocument - the current Hype document
     * @param {HTMLElement} element - the element to get the symbol instance for
     * @returns {object} - the symbol instance
     */
    function getSymbolInstance(hypeDocument, element) {
        while (element && element !== document) {
            const instance = hypeDocument.getSymbolInstanceById(element.id);
            if (instance) return instance;
            element = element.parentNode;
        }
        return null;
    }

    /**
     * @function addScrollTimeline
     * @param {object} hypeDocument - the current Hype document
     * @param {HTMLElement} element - the element to add the scroll timeline to
     * @param {string} timelineName - the name of the timeline
     * @param {object} options - the options for the timeline
     * @returns {object} - the scroll timeline
     */
    function addScrollTimeline(hypeDocument, element, timelineName, options) {
        const sceneId = hypeDocument.currentSceneId();
        if (!controllers[sceneId]) {
            controllers[sceneId] = new ScrollMagic.Controller();
        }

        timelineName = timelineName || _default.timelineName;
        options = Object.assign({}, _default.options, options);

        const sceneElement = document.getElementById(sceneId);
        const elementHeight = hypeDocument.getElementProperty(element, 'height');
        const cumulativeTop = element.getBoundingClientRect().top - sceneElement.getBoundingClientRect().top;

        const offset = options.offset !== undefined ? options.offset : cumulativeTop;
        const duration = options.duration !== undefined ? options.duration : elementHeight;
        const triggerHookValue = options.triggerHook;// !== undefined ? options.triggerHook : 0.5;
        const symbolInstance = getSymbolInstance(hypeDocument, element);
        const api = symbolInstance ? symbolInstance : hypeDocument;

        const scene = new ScrollMagic.Scene({
            triggerElement: sceneElement,
            offset: offset,
            duration: duration,
            triggerHook: triggerHookValue
        });

        if (options.pin) {
            scene.setPin(element);
        }

        if (options.reset) scene.on("add", function (event) {
            api.pauseTimelineNamed(timelineName);
            api.goToTimeInTimelineNamed(0, timelineName);
        });
        
        scene.on("progress", function (event) {
            api.goToTimeInTimelineNamed(event.progress * api.durationForTimelineNamed(timelineName), timelineName);
        })
        
        function triggerBehavior(eventType, event) {
            const eventScrollDirection = event.scrollDirection.charAt(0).toUpperCase() + event.scrollDirection.slice(1).toLowerCase();
            const behavior = timelineName + ' ' + eventType + ' ' + eventScrollDirection
            hypeDocument.triggerCustomBehaviorNamed(behavior);
            if (_default.logBehavior) console.log(behavior);
        }

        if (_default.behavior.enter) {
            scene.on("enter", function(event) {
                triggerBehavior('Enter', event);
            });
        }

        if (_default.behavior.leave) {
            scene.on("leave", function(event) {
                triggerBehavior('Leave', event);
            });
        }

        scene.addTo(controllers[sceneId]);
        
        // RulerHelper integration
        if (HypeRulerHelper) {
            scene.onResize = function() {
                const markerColor = element.getAttribute('data-marker-color') || _default.markerColor;
                hypeDocument.addSceneMarker(offset, `Start: ${timelineName}`, markerColor);
                let start = scene.triggerPosition();
                if (scene.duration() > 0) {
                    hypeDocument.addSceneMarker(offset + scene.duration(), `End: ${timelineName}`, markerColor);
                }
            };
            scene.onResize();
        }

        scenes.push(scene);
        return scene;
    }

    function HypeDocumentLoad(hypeDocument, element, event) {
        hypeDocument.addScrollTimeline = function (element, timelineName, options) {
            return addScrollTimeline(hypeDocument, element, timelineName, options);
        };
        if (HypeRulerHelper) {
            window.addEventListener('resize', debounceByRequestFrame(function() {
                scenes.forEach(function(scene) {
                    if (scene.onResize) scene.onResize();    
                });
            }));
        }
    }

    function HypeSceneLoad(hypeDocument, sceneElement) {
        const scrollElements = sceneElement.querySelectorAll('[data-scroll-timeline],[data-scroll-pin]');
        scrollElements.forEach(function (element) {
            const timelineNames = element.getAttribute('data-scroll-timeline') ? element.getAttribute('data-scroll-timeline').split(',').map(name => name.trim()) : ['Main Timeline'];
            
            const options = {
                pin: element.hasAttribute('data-scroll-pin'),
                offset: element.getAttribute('data-scroll-offset') ? parseInt(element.getAttribute('data-scroll-offset'), 10) : undefined,
                duration: element.getAttribute('data-scroll-duration') ? parseInt(element.getAttribute('data-scroll-duration'), 10) : undefined,
                triggerHook: element.getAttribute('data-scroll-trigger') ? parseFloat(element.getAttribute('data-scroll-trigger')) : undefined,
                reset: element.getAttribute('data-scroll-reset') === 'false' ? false : true
            };

            timelineNames.forEach(timelineName => {
                addScrollTimeline(hypeDocument, element, timelineName, options);
            });
        });

    }

    function HypeSceneUnload(hypeDocument, sceneElement) {
        const sceneId = sceneElement.id;
        scenes.forEach(function (scene) {
            scene.destroy(true);
        });
        scenes.length = 0;
        if (controllers[sceneId]) {
            controllers[sceneId].destroy(true);
            delete controllers[sceneId];
        }
    }

    if ("HYPE_eventListeners" in window === false) {
        window.HYPE_eventListeners = Array();
    }
    window.HYPE_eventListeners.push({"type": "HypeDocumentLoad", "callback": HypeDocumentLoad});
    window.HYPE_eventListeners.push({"type": "HypeSceneLoad", "callback": HypeSceneLoad});
    window.HYPE_eventListeners.push({"type": "HypeSceneUnload", "callback": HypeSceneUnload});

    return {
        version: '1.0.3',
        setDefault: setDefault,
        getDefault: getDefault,
    };
})();
