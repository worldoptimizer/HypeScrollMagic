/*!
 * Hype ScrollMagic v1.1.1
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
 * 1.0.9 Added support for percentage offset based on bounding box
 *       Added the Hype Action Event data-scroll-action as a catch-all (event.type-based settings)
 *       Fixed percentage support for duration and offset by precalculating
 * 1.1.0 Added query to make sure data-scroll-properties add scroll listeners
 *       Added query to make sure that Hype Action Event scroll actions add scroll listeners 
 *       Added more robust controller and scene management and garbage collection
 *       Added support for scene and element classes additions during scroll events
 *       Removed all dataset references from addScrollTimeline to avoid side effects
 *       Added scroll name to options to allow for more
 * 1.1.1 Fixed garbage collection error when no scroll scenes or controllers are present
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
    const scenes = {};

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
        autoProperties: true,
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
        
        const sceneId = hypeDocument.currentSceneId();
        const hasActionEvents = "HypeActionEvents" in window !== false;
        const scrollName = options.scrollName || timelineName;
        
        const controller = new ScrollMagic.Controller({
            vertical: options.horizontal? false : true,
        });

        if (!controllers[sceneId]) controllers[sceneId] = [];
        controllers[sceneId].push(controller);

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
            const viewportUnit = options.horizontal? 'vw' : 'vh';
            if (duration.endsWith(viewportUnit)) {
                duration = parseInt(duration)+'%';
            } else if (duration.endsWith('%')) {
                duration = parseFloat(duration) / 100 * elementDimension;
            } else {
                duration = parseFloat(duration);
            }
        }

        if (typeof offset === 'string') {
            if (offset.endsWith('%')) {
                offset = parseFloat(offset) / 100 * elementDimension + cumulativeOffset;
            } else {
                offset = parseFloat(offset);
            }
        }

        if (hasActionEvents) {
            const scrollCode = options.scrollCode;
            const offsetCode = options.offsetCode || scrollCode;
            const durationCode = options.durationCode || scrollCode;
            const triggerHookCode = options.triggerHookCode || scrollCode;
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
                }) ?? offset;
            }
            if (durationCode) {
                duration = hypeDocument.triggerAction('return '+durationCode, {
                    element: element,
                    scope: scope,
                    event: Object.assign(scope, {
                        type: 'duration',
                    }),
                }) ?? duration;
            }
            if (triggerHookCode) {
                triggerHook = hypeDocument.triggerAction('return '+triggerHookCode, {
                    element: element,
                    scope: scope,
                    event: Object.assign(scope, {
                        type: 'triggerHook',
                    }),
                }) ?? triggerHook;
            }
        }
        
        const scene = new ScrollMagic.Scene({
            triggerElement: sceneElement,
            offset: offset,
            duration: duration,
            triggerHook: triggerHook,
        });

          
        if (options.elementClass) {
            scene.on("enter", function (event) {
                element.classList.add(options.elementClass);
            });
            scene.on("leave", function (event) {
                element.classList.remove(options.elementClass);
            });
        }
        if (options.sceneClass) {
            scene.on("enter", function (event) {
                sceneElement.classList.add(options.sceneClass);
            }); 
            scene.on("leave", function (event) {
                sceneElement.classList.remove(options.sceneClass);
            });
        }

        if (options.hasOwnProperty('properties')){
            const varName = typeof options.properties === 'string' ? options.properties || 'scroll' : 'scroll';
            const rootElm = varName === 'scroll' ? element : document.getElementById(hypeDocument.documentId());
            rootElm.style.setProperty('--'+varName+'-duration', duration);
            rootElm.style.setProperty('--'+varName+'-offset', offset);
            rootElm.style.setProperty('--'+varName+'-trigger-hook', triggerHook);
            rootElm.style.setProperty('--'+varName+'-progress', 0);
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
            if (options.hasOwnProperty('properties')){
                const varName = typeof options.properties === 'string' ? options.properties || 'scroll' : 'scroll';
                const rootElm = varName === 'scroll' ? element : document.getElementById(hypeDocument.documentId());
                rootElm.style.setProperty('--'+varName+'-progress', event.progress);
            }

            if (timelineName) {
                const duration = api.durationForTimelineNamed(timelineName);
                if (duration !== 0) {
                    api.goToTimeInTimelineNamed(event.progress * duration, timelineName);
                }
            }

            if (hasActionEvents) {
                const scrollCode = options.scrollCode;
                const code = options.progressCode || scrollCode;
                if (code) hypeDocument.triggerAction(code, Object.assign({
                    element: element,
                    event: event,
                }));
            }
        })
        
        function triggerBehavior(eventType, event) {
            const eventScrollDirection = event.scrollDirection.charAt(0).toUpperCase() + event.scrollDirection.slice(1).toLowerCase();
            const eventName = scrollName? scrollName + ' ' : '';
            const behaviorSpecific = eventName + eventType + ' ' + eventScrollDirection
            const behaviorGeneral = eventName + eventType;
        
            hypeDocument.triggerCustomBehaviorNamed(behaviorSpecific);
            hypeDocument.triggerCustomBehaviorNamed(behaviorGeneral);

            if (_default.logBehavior) {
                console.log(behaviorGeneral);
                console.log(behaviorSpecific);
            }
        }

        function triggerAction(eventType, event) {
            if (hasActionEvents) {
                const scrollCode = options.scrollCode;
                const code = options[eventType.toLowerCase() + 'Code']  || scrollCode;
                if (code) hypeDocument.triggerAction(code, {
                    element: element,
                    event: event,
                });
            }
        }
        
        const shouldTriggerEnter = (scrollName && _default.behavior.enter);
        if (shouldTriggerEnter || options.enterCode) {
            scene.on("enter", function(event) {
                if (shouldTriggerEnter) triggerBehavior('Enter', event);
                if (options.enterCode) triggerAction('Enter', event);
            });
        }

        const shouldTriggerLeave = (scrollName && _default.behavior.leave);
        if (shouldTriggerLeave || options.leaveCode) {
            scene.on("leave", function(event) {
                if (shouldTriggerLeave) triggerBehavior('Leave', event);
                if (options.leaveCode) triggerAction('Leave', event);
            });
        }

	    scene.addTo(controller);

        if (scene.addIndicators && (_default.addIndicators || options.addIndicators)) {
            scene.addIndicators({
                name: scrollName,
                colorStart: options.indicatorColor,
                colorEnd: options.indicatorColor,
                colorTrigger: options.indicatorColor,
            });
        }

        if (!scenes[sceneId]) scenes[sceneId] = [];
        scenes[sceneId].push(scene);
        return scene;
    }

    function HypeDocumentLoad(hypeDocument, element, event) {
        hypeDocument.addScrollTimeline = function (element, timelineName, options) {
            return addScrollTimeline(hypeDocument, element, timelineName, options);
        };
    }

    function HypeSceneLoad(hypeDocument, sceneElement) {
        const hasActionEvents = "HypeActionEvents" in window !== false;
        const actionEvents = hasActionEvents ? ',[data-scroll-action],[data-scroll-progress-action],[data-scroll-enter-action],[data-scroll-leave-action]' : '';
        const scrollElements = sceneElement.querySelectorAll('[data-scroll-timeline],[data-scroll-pin],[data-scroll-properties],[data-scroll-element-class],[data-scroll-scene-class]'+actionEvents);
        scrollElements.forEach(function (element) {
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

            if (element.hasAttribute('data-scroll-name')) options.scrollName = element.getAttribute('data-scroll-name');

            if (hasActionEvents) {
                if (element.hasAttribute('data-scroll-action')) options.scrollCode = element.getAttribute('data-scroll-action');
                if (element.hasAttribute('data-scroll-offset-action')) options.offsetCode = element.getAttribute('data-scroll-offset-action');
                if (element.hasAttribute('data-scroll-duration-action')) options.durationCode = element.getAttribute('data-scroll-duration-action');
                if (element.hasAttribute('data-scroll-trigger-action')) options.triggerHookCode = element.getAttribute('data-scroll-trigger-action');
                if (element.hasAttribute('data-scroll-progress-action')) options.progressCode = element.getAttribute('data-scroll-progress-action');
                if (element.hasAttribute('data-scroll-enter-action')) options.enterCode = element.getAttribute('data-scroll-enter-action');
                if (element.hasAttribute('data-scroll-leave-action')) options.leaveCode = element.getAttribute('data-scroll-leave-action');
            }

            if (element.hasAttribute('data-scroll-element-class')) options.elementClass = element.getAttribute('data-scroll-element-class');
            if (element.hasAttribute('data-scroll-scene-class')) options.sceneClass = element.getAttribute('data-scroll-scene-class');

            if (element.hasAttribute('data-scroll-properties')) {
                const properties = element.getAttribute('data-scroll-properties');
                if (!(getDefault('autoProperties') && properties == 'false')) options.properties = properties;
            } else if (getDefault('autoProperties')) {
                options.properties = true;
            }

            if (element.getAttribute('data-indicator-color')) options.indicatorColor = element.getAttribute('data-indicator-color');
            if (element.hasAttribute('data-indicator-force')) options.addIndicators = true;
            
            timelineNames.forEach(timelineName => {
                addScrollTimeline(hypeDocument, element, timelineName, options);
            });
        });
    }

    function HypeSceneUnload(hypeDocument, element) {        
        const sceneId = element.id;

         if (!scenes[sceneId]) return;
        scenes[sceneId].forEach(scene => {
            if (scene) scene.destroy(true);
        });
        scenes[sceneId] = [];
        
        if (!controllers[sceneId]) return;
        controllers[sceneId].forEach(controller => {
            if (controller) controller.destroy(true);
        });
        controllers[sceneId] = [];
    }

    if ("HYPE_eventListeners" in window === false) {
        window.HYPE_eventListeners = Array();
    }
    window.HYPE_eventListeners.push({"type": "HypeDocumentLoad", "callback": HypeDocumentLoad});
    window.HYPE_eventListeners.push({"type": "HypeSceneLoad", "callback": HypeSceneLoad});
    window.HYPE_eventListeners.push({"type": "HypeSceneUnload", "callback": HypeSceneUnload});

    return {
        version: '1.1.1',
        setDefault: setDefault,
        getDefault: getDefault,
    };
})();
