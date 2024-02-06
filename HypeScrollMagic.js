/*!
 * Hype ScrollMagic
 * Integrates ScrollMagic with Tumult Hype for scroll-based animations and interactions.
 * Copyright (2024) Max Ziebell, (https://maxziebell.de). MIT-license
 */

/*
 * Version-History
 * 1.0.0 Initial release
 * 1.0.1 Added method to add scroll timelines programmatically
 */

if ("HypeScrollMagic" in window === false) {
    window['HypeScrollMagic'] = (function () {
        const controllers = {};

        function getSymbolInstance(hypeDocument, element) {
            while (element && element !== document) {
                const instance = hypeDocument.getSymbolInstanceById(element.id);
                if (instance) return instance;
                element = element.parentNode;
            }
            return null;
        }

        function addScrollTimeline(hypeDocument, element, timelineName, options) {
            const sceneId = hypeDocument.currentSceneId();
            if (!controllers[sceneId]) {
                controllers[sceneId] = new ScrollMagic.Controller();
            }

			timelineName = timelineName || 'Main Timeline';
			options = options || {};
			options.reset = options.reset!=null ? options.reset : true;

            const sceneElement = document.getElementById(sceneId);
            const elementHeight = hypeDocument.getElementProperty(element, 'height');
            const cumulativeTop = element.getBoundingClientRect().top - sceneElement.getBoundingClientRect().top;

            const offset = options.offset !== undefined ? options.offset : cumulativeTop;
            const duration = options.duration !== undefined ? options.duration : elementHeight;
            const triggerHookValue = options.triggerHook !== undefined ? options.triggerHook : 0.5;
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
            }).addTo(controllers[sceneId]);
            
            // RulerHelper integration
            if (hypeDocument.addSceneMarker) {
                const markerColor = element.getAttribute('data-marker-color');
                hypeDocument.addSceneMarker(parseInt(offset, 10), `Start: ${timelineName}`, markerColor);
                if (duration > 0) {
                    hypeDocument.addSceneMarker(parseInt(offset, 10) + parseInt(duration, 10), `End: ${timelineName}`, markerColor);
                }
            }
        }

        function HypeDocumentLoad(hypeDocument, element, event) {
            hypeDocument.addScrollTimeline = function (element, timelineName, options) {
                addScrollTimeline(hypeDocument, element, timelineName, options);
            };
        }

        function HypeSceneLoad(hypeDocument, sceneElement) {
            const scrollElements = sceneElement.querySelectorAll('[data-scroll-timeline]');
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
            version: '1.0.1',
        };
    })();
}
