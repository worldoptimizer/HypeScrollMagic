/*!
 * Hype ScrollMagic v1.0.8
 * Integrates ScrollMagic with Tumult Hype for scroll-based animations and interactions.
 * Copyright (2024) Max Ziebell, (https://maxziebell.de). MIT-license
 */

/*
 * Version-History
 * 1.0.0 Initial release
 * 1.0.1 Added method to add scroll timelines programmatically
 * 1.0.2 Refactored names
 * 1.0.3 Added behavior triggers, default options and better markers
 * 1.0.4 Added horizontal support data-scroll-horizontal, better marker support
 * 1.0.5 Fixed issue with options, refactored data-marker-* to data-indicator-*
 * 1.0.6 Removed HypeRulerHelper as the debugging plugin now operates independently
 * 1.0.7 Fixed issue with horizontal and vertical controllers
 * 1.0.8 Added support duration as percentage
 *       Added support for Hype Action Events: 
 *           data-scroll-offset-action, data-scroll-duration-action, 
 *           data-scroll-trigger-action, data-scroll-progress-action, 
 *           data-scroll-enter-action, data-scroll-leave-action
 *       Added support for CSS variables to track scroll progress, duration and offset
 *       Fixed issue with indicator color being set to black
 *       Fixed issue with missing timeline name allowing pinning only
 */

 if ("HypeScrollMagic" in window === false) window['HypeScrollMagic'] = (function () {
    if (!window.ScrollMagic) {
        console.error("ScrollMagic is not available.");
        return;
    } else {
        ScrollMagic.Scene.prototype.addIndicators = null;
        ScrollMagic.Scene.prototype.removeIndicators = null;
    }
    
    const controllers = {};
    const scenes = [];

    /* default options */
    let _default = {
        options: {
            triggerHook: 0.5,
            pin: false,
            reset: true,
            indicatorColor: 'grey',
        },
        behavior: {
            enter: true,
            leave: true,
        },
        timelineName: 'Main Timeline',
        logBehavior: false,
        addIndicators: true,
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
        
        const axis = options.horizontal? '_h' : '_v';
        const sceneId = hypeDocument.currentSceneId();
        const controllerId = sceneId + axis;
        const hasActionEvents = "HypeActionEvents" in window !== false;
        
        if (!controllers[controllerId]) {
            controllers[controllerId] = new ScrollMagic.Controller({
             vertical: options.horizontal? false : true,
            });
        }

        //timelineName = timelineName || _default.timelineName;

        options = Object.assign({}, _default.options, options);

        const sceneElement = document.getElementById(sceneId);

        const elementDimension = element.getBoundingClientRect()[options.horizontal? 'width' : 'height'];
        const cumulativeOffset = options.horizontal? element.getBoundingClientRect().left - sceneElement.getBoundingClientRect().left : element.getBoundingClientRect().top - sceneElement.getBoundingClientRect().top;

        let offset = options.offset !== undefined ? options.offset : cumulativeOffset;
        let duration = options.duration !== undefined ? options.duration : elementDimension;
        let triggerHook = options.triggerHook !== undefined ? options.triggerHook : 0.5;
        const symbolInstance = getSymbolInstance(hypeDocument, element);
        const api = symbolInstance ? symbolInstance : hypeDocument;

        if (typeof duration === 'string') {
            if (!duration.endsWith('%')) {
                duration = parseInt(duration);
            }
        }

        if (typeof offset === 'string') {
            offset = parseInt(offset);
        }

        if (hasActionEvents) {
            const offsetCode = element.getAttribute('data-scroll-offset-action');
            const durationCode = element.getAttribute('data-scroll-duration-action');
            const triggerHookCode = element.getAttribute('data-scroll-trigger-action');
            const scope = {
                offset: offset,
                duration: duration,
                triggerHook: triggerHook,
            }
            if (offsetCode) {
                offset = hypeDocument.triggerAction('return '+offsetCode, {
                    element: element,
                    scope: scope,
                    event: Object.assign(scope, {
                        type: 'offset',
                    }),
                });
            }
            if (durationCode) {
                duration = hypeDocument.triggerAction('return '+durationCode, {
                    element: element,
                    scope: scope,
                    event: Object.assign(scope, {
                        type: 'duration',
                    }),
                });
            }
            if (triggerHookCode) {
                triggerHook = hypeDocument.triggerAction('return '+triggerHookCode, {
                    element: element,
                    scope: scope,
                    event: Object.assign(scope, {
                        type: 'triggerHook',
                    }),
                });
            }
        }
        
        const scene = new ScrollMagic.Scene({
            triggerElement: sceneElement,
            offset: offset,
            duration: duration,
            triggerHook: triggerHook,
        });

        if (element.hasAttribute('data-scroll-properties')) {
            const varName = element.getAttribute('data-scroll-properties');
            if (varName) {
                const hypeDocumentElem = document.getElementById(hypeDocument.documentId());
                hypeDocumentElem.style.setProperty('--'+varName+'-duration', duration);
                hypeDocumentElem.style.setProperty('--'+varName+'-offset', offset);
            } else {
                element.style.setProperty('--scroll-duration', duration);
                element.style.setProperty('--scroll-offset', offset);
            }
        }

        if (options.pin) {
            scene.setPin(element, {
                pushFollowers: false,
            });
        }

        if (timelineName && options.reset) scene.on("add", function (event) {
            api.pauseTimelineNamed(timelineName);
            api.goToTimeInTimelineNamed(0, timelineName);
        });
        
        scene.on("progress", function (event) {
            if (hasActionEvents) {
                const code = element.getAttribute('data-scroll-progress-action');
                if (code) hypeDocument.triggerAction(code, Object.assign({
                    element: element,
                    event: event,
                }));
            }

            if (element.hasAttribute('data-scroll-properties')) {
                const varName = element.getAttribute('data-scroll-properties');
                if (varName) {
                    const hypeDocumentElem = document.getElementById(hypeDocument.documentId());
                    hypeDocumentElem.style.setProperty('--'+varName+'-progress', event.progress);
                } else {
                    element.style.setProperty('--scroll-progress', event.progress);
                }
            }

            if (timelineName) {
                const duration = api.durationForTimelineNamed(timelineName);
                if (duration !== 0) {
                    api.goToTimeInTimelineNamed(event.progress * duration, timelineName);
                }
            }
        })
        
        function triggerBehaviorAndAction(eventType, event) {
            const eventScrollDirection = event.scrollDirection.charAt(0).toUpperCase() + event.scrollDirection.slice(1).toLowerCase();
            const behavior = timelineName + ' ' + eventType + ' ' + eventScrollDirection
            hypeDocument.triggerCustomBehaviorNamed(behavior);
            
            if (_default.logBehavior) console.log(behavior);
            
            if (hasActionEvents) {
                const code = element.getAttribute('data-scroll-' + eventType.toLowerCase() + '-action');
                if (code) hypeDocument.triggerAction(code, {
                    element: element,
                    event: event,
                });
            }
        }

        if (_default.behavior.enter) {
            scene.on("enter", function(event) {
                triggerBehaviorAndAction('Enter', event);
            });
        }

        if (_default.behavior.leave) {
            scene.on("leave", function(event) {
                triggerBehaviorAndAction('Leave', event);
            });
        }
        
	    scene.addTo(controllers[controllerId]);

        if (scene.addIndicators && (_default.addIndicators || options.addIndicators)) {
            scene.addIndicators({
                name: timelineName || 'only pin',
                colorStart: options.indicatorColor,
                colorEnd: options.indicatorColor,
                colorTrigger: options.indicatorColor,
            });
        }

        scenes.push(scene);
        return scene;
    }

    function HypeDocumentLoad(hypeDocument, element, event) {
        hypeDocument.addScrollTimeline = function (element, timelineName, options) {
            return addScrollTimeline(hypeDocument, element, timelineName, options);
        };
    }

    function HypeSceneLoad(hypeDocument, sceneElement) {
        const scrollElements = sceneElement.querySelectorAll('[data-scroll-timeline],[data-scroll-pin]');
        scrollElements.forEach(function (element) {
            // const timelineNames = element.getAttribute('data-scroll-timeline') ? element.getAttribute('data-scroll-timeline').split(',').map(name => name.trim()) : ['Main Timeline'];
            const timelineNames = element.hasAttribute('data-scroll-timeline') ? 
                (element.getAttribute('data-scroll-timeline') ? 
                    element.getAttribute('data-scroll-timeline').split(',').map(name => name.trim()) : 
                    [_default.timelineName]) : 
                [null];
            const options = {
                pin: element.hasAttribute('data-scroll-pin'),
                offset: element.getAttribute('data-scroll-offset') ? element.getAttribute('data-scroll-offset') : undefined,
                duration: element.getAttribute('data-scroll-duration') ? element.getAttribute('data-scroll-duration') : undefined,
                triggerHook: element.getAttribute('data-scroll-trigger') ? parseFloat(element.getAttribute('data-scroll-trigger')) : undefined,
                reset: element.getAttribute('data-scroll-reset') === 'false' ? false : true,
                horizontal: element.hasAttribute('data-scroll-horizontal'),
            };

            if (element.getAttribute('data-indicator-color')) options.indicatorColor = element.getAttribute('data-indicator-color');
            if (element.hasAttribute('data-indicator-force')) options.addIndicators = true;
    
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
        if (controllers[sceneId+'_v']) {
            controllers[sceneId+'_v'].destroy(true);
            delete controllers[sceneId+'_v'];
        }
        if (controllers[sceneId+'_h']) {
            controllers[sceneId+'_h'].destroy(true);
            delete controllers[sceneId+'_h'];
        }
    }

    if ("HYPE_eventListeners" in window === false) {
        window.HYPE_eventListeners = Array();
    }
    window.HYPE_eventListeners.push({"type": "HypeDocumentLoad", "callback": HypeDocumentLoad});
    window.HYPE_eventListeners.push({"type": "HypeSceneLoad", "callback": HypeSceneLoad});
    window.HYPE_eventListeners.push({"type": "HypeSceneUnload", "callback": HypeSceneUnload});

    return {
        version: '1.0.8',
        setDefault: setDefault,
        getDefault: getDefault,
    };
})();
