/*!
 Hype ScrollMagic Plugin Debug v1.0.0
 Forked from official Scroll Magic Repository (version 2.0.8) by Jan Paepke - e-mail@janpaepke.de,
 copyright (c) 2024 , Max Ziebell (https://maxziebell.de). MIT license and GPL
*/

/*
 * Version-History
 * 1.0.0 Initial release under MIT license and GPL
 */

if ("HypeScrollMagicPluginDebug" in window === false) window['HypeScrollMagicPluginDebug'] = (function () {
    "use strict";

    if (!window.ScrollMagic) {
        console.error("ScrollMagic is not available.");
        return;
    }

    // plugin settings
    var
        FONT_SIZE = "11px",
        ZINDEX = "9999",
        EDGE_OFFSET = 10;

    // overall vars
    var
        _util = ScrollMagic._util,
        _autoindex = 0;

    ScrollMagic.Scene.extend(function () {
        var
            Scene = this,
            _indicator;

        Scene.addIndicators = function (options) {
            if (!_indicator) {
                var
                    DEFAULT_OPTIONS = {
                        name: "",
                        indent: 0,
                        parent: undefined,
                        colorStart: "green",
                        colorEnd: "red",
                        colorTrigger: "blue",
                    };

                options = _util.extend({}, DEFAULT_OPTIONS, options);

                _autoindex++;
                _indicator = new Indicator(Scene, options);

                Scene.on("add.plugin_addIndicators", _indicator.add);
                Scene.on("remove.plugin_addIndicators", _indicator.remove);
                Scene.on("destroy.plugin_addIndicators", Scene.removeIndicators);
                Scene.on("progress.plugin_addIndicators", function (e) {
                    if (_indicator) {
                        _indicator.updateTriggerVisibility(e.progress);
                    }
                });

                // it the scene already has a controller we can start right away.
                if (Scene.controller()) {
                    _indicator.add();
                }
            }
            return Scene;
        };

        /**
         * Removes visual indicators from a ScrollMagic.Scene.
         * @memberof! debug.addIndicators#
         *
         * @example
         * // remove previously added indicators
         * scene.removeIndicators()
         *
         */
        Scene.removeIndicators = function () {
            if (_indicator) {
                _indicator.remove();
                this.off("*.plugin_addIndicators");
                _indicator = undefined;
            }
            return Scene;
        };

    });

    ScrollMagic.Controller.addOption("addIndicators", false);
    // extend Controller
    ScrollMagic.Controller.extend(function () {
        var
            Controller = this,
            _info = Controller.info(),
            _container = _info.container,
            _isDocument = _info.isDocument,
            _vertical = _info.vertical,
            _indicators = { // container for all indicators and methods
                groups: []
            };

        // add indicators container
        this._indicators = _indicators;

        // event handler for when associated bounds markers need to be repositioned
        var handleBoundsPositionChange = function () {

            _indicators.updateBoundsPositions();
        };

        // event handler for when associated trigger groups need to be repositioned
        var handleTriggerPositionChange = function () {
            _indicators.updateTriggerGroupPositions();
        };

        _container.addEventListener("resize", handleTriggerPositionChange);
        if (!_isDocument) {
            window.addEventListener("resize", handleTriggerPositionChange);
            window.addEventListener("scroll", handleTriggerPositionChange);
        }
        // update all related bounds containers
        _container.addEventListener("resize", handleBoundsPositionChange);
        _container.addEventListener("scroll", handleBoundsPositionChange);

        
        this._indicators.updateBoundsPositions = function (specificIndicator) {
            var // constant for all bounds
                groups = specificIndicator ? [_util.extend({}, specificIndicator.triggerGroup, {
                    members: [specificIndicator]
                })] : // create a group with only one element
                _indicators.groups, // use all
                g = groups.length,
                css = {},
                paramPos = _vertical ? "left" : "top",
                paramDimension = _vertical ? "width" : "height",
                /* position */
                edge = _vertical ?
                    /*
                    _util.get.scrollLeft(_container) + _util.get.width(_container) - EDGE_OFFSET :
                    _util.get.scrollTop(_container) + _util.get.height(_container) - EDGE_OFFSET,
                    */
                    _util.get.scrollLeft(_container) + 30 + EDGE_OFFSET :
                    _util.get.scrollTop(_container) + 20 + EDGE_OFFSET,
                b, triggerSize, group;
            while (g--) { // group loop
                group = groups[g];
                triggerSize = _util.get[paramDimension](group.element.firstChild);
                css[paramPos] = edge + triggerSize;
                _util.css(group.members[0].bounds, css);
            
            }
        };

        // updates the positions of all trigger groups attached to a controller or a specific one, if provided
        this._indicators.updateTriggerGroupPositions = function (specificGroup) {
            var // constant vars
                groups = specificGroup ? [specificGroup] : _indicators.groups,
                i = groups.length,
                container = _isDocument ? document.body : _container,
                containerOffset = _isDocument ? {
                    top: 0,
                    left: 0
                } : _util.get.offset(container, true),
                /* position */
                edge = _vertical ?
                /*
                _util.get.width(_container) - EDGE_OFFSET :
                _util.get.height(_container) - EDGE_OFFSET,
                */
                EDGE_OFFSET:
                EDGE_OFFSET + 10,

                paramDimension = _vertical ? "width" : "height",
                paramTransform = _vertical ? "Y" : "X";
            var // changing vars
                group,
                elem,
                pos,
                elemSize,
                transform;
            while (i--) {
                group = groups[i];
                elem = group.element;
                pos = group.triggerHook * Controller.info("size");
                elemSize = _util.get[paramDimension](elem.firstChild.firstChild);
                transform = pos > elemSize ? "translate" + paramTransform + "(-100%)" : "";

                _util.css(elem, {
                    top: containerOffset.top + (_vertical ? pos : edge - group.members[0].options.indent),
                    left: containerOffset.left + (_vertical ? edge - group.members[0].options.indent : pos)
                });
                _util.css(elem.firstChild.firstChild, {
                    "transform": transform
                });
            }
        };

        // updates the label for the group to contain the name, if it only has one member
        this._indicators.updateTriggerGroupLabel = function (group) {
            var
                groupNames = group.members[0].options.name,
                // all names as , separated string
                text = "trigger" + " " + groupNames,
                elem = group.element.firstChild.firstChild,
                doUpdate = elem.textContent !== text;
            if (doUpdate) {
                elem.textContent = text;
                if (_vertical) { // bounds position is dependent on text length, so update
                    _indicators.updateBoundsPositions();
                }
            }
        };

        // add indicators if global option is set
        this.addScene = function (newScene) {

            if (this._options.addIndicators && newScene instanceof ScrollMagic.Scene && newScene.controller() === Controller) {
                newScene.addIndicators();
            }
            // call original destroy method
            this.$super.addScene.apply(this, arguments);
        };

        // remove all previously set listeners on destroy
        this.destroy = function () {
            _container.removeEventListener("resize", handleTriggerPositionChange);
            if (!_isDocument) {
                window.removeEventListener("resize", handleTriggerPositionChange);
                window.removeEventListener("scroll", handleTriggerPositionChange);
            }
            _container.removeEventListener("resize", handleBoundsPositionChange);
            _container.removeEventListener("scroll", handleBoundsPositionChange);
            // call original destroy method
            this.$super.destroy.apply(this, arguments);
        };
        return Controller;

    });

    /*
     * ----------------------------------------------------------------
     * Internal class for the construction of Indicators
     * ----------------------------------------------------------------
     */
    var Indicator = function (Scene, options) {
        var
            Indicator = this,
            _elemBounds = TPL.bounds(),
            _elemStart = TPL.start(options.colorStart),
            _elemEnd = TPL.end(options.colorEnd),
            _boundsContainer = options.parent && _util.get.elements(options.parent)[0],
            _vertical,
            _ctrl;

        options.name = options.name || _autoindex;

        // prepare bounds elements
        _elemStart.firstChild.textContent += " " + options.name;
        _elemEnd.textContent += " " + options.name;
        _elemBounds.appendChild(_elemStart);
        _elemBounds.appendChild(_elemEnd);

        // set public variables
        Indicator.options = options;
        Indicator.bounds = _elemBounds;
        // will be set later
        Indicator.triggerGroup = undefined;

        this.updateTriggerVisibility = function (progress, instant) {

            // Update the opacity of bounds elements
            if (this.bounds) {
                const opacity = (progress < 1) ? 1 : 0;
                const delay = opacity == 0 ? "1s" : "0s";
                this.bounds.style.transition = instant ? "none" : "opacity 0.2s " + delay;
                this.bounds.style.opacity = opacity;
            }

            // Check if the trigger group exists and has an element
            if (this.triggerGroup && this.triggerGroup.element) {
                const opacity = progress === 0 || progress === 1 ? 0 : 1;
                const delay = opacity === 0 ? "1s" : "0s";
                this.triggerGroup.element.style.transition = instant ? "none" : "opacity 0.2s " + delay;
                this.triggerGroup.element.style.opacity = opacity;
            }
        };

        // add indicators to DOM
        this.add = function () {
            _ctrl = Scene.controller();
            _vertical = _ctrl.info("vertical");

            var isDocument = _ctrl.info("isDocument");

            if (!_boundsContainer) {
                // no parent supplied or doesnt exist
                _boundsContainer = isDocument ? document.body : _ctrl.info("container"); // check if window/document (then use body)
            }
            if (!isDocument && _util.css(_boundsContainer, "position") === 'static') {
                // position mode needed for correct positioning of indicators
                _util.css(_boundsContainer, {
                    position: "relative"
                });
            }

            // add listeners for updates
            Scene.on("change.plugin_addIndicators", handleTriggerParamsChange);
            Scene.on("shift.plugin_addIndicators", handleBoundsParamsChange);

            // updates trigger & bounds (will add elements if needed)
            addTriggerGroup();
            updateBounds();
            // determine progress
            this.updateTriggerVisibility(Scene.progress(), true);

            setTimeout(function () { // do after all execution is finished otherwise sometimes size calculations are off
                _ctrl._indicators.updateBoundsPositions(Indicator);
            }, 0);

        };

        // remove indicators from DOM
        this.remove = function () {
            if (Indicator.triggerGroup) { // if not set there's nothing to remove
                Scene.off("change.plugin_addIndicators", handleTriggerParamsChange);
                Scene.off("shift.plugin_addIndicators", handleBoundsParamsChange);
                removeTriggerGroup();
                removeBounds();
            }
        };

        /*
         * ----------------------------------------------------------------
         * internal Event Handlers
         * ----------------------------------------------------------------
         */

        // event handler for when bounds params change
        var handleBoundsParamsChange = function () {
            updateBounds();
        };

        // event handler for when trigger params change
        var handleTriggerParamsChange = function (e) {
            if (e.what === "triggerHook") {
                addTriggerGroup();
            }
        };

        /*
         * ----------------------------------------------------------------
         * Bounds (start / stop) management
         * ----------------------------------------------------------------
         */

        // adds an new bounds elements to the array and to the DOM
        var addBounds = function () {
            var v = _ctrl.info("vertical");
            // apply stuff we didn't know before...
            _util.css(_elemStart.firstChild, {
                "border-bottom-width": v ? 1 : 0,
                "border-right-width": v ? 0 : 1,
                "bottom": v ? -1 : options.indent,
                "right": v ? options.indent : -1,
                "padding": v ? "0 8px" : "2px 4px",
            });
            _util.css(_elemEnd, {
                "border-top-width": v ? 1 : 0,
                "border-left-width": v ? 0 : 1,
                "top": v ? "100%" : "",
                "right": v ? options.indent : "",
                "bottom": v ? "" : options.indent,
                "left": v ? "" : "100%",
                "padding": v ? "0 8px" : "2px 4px"
            });
            // append
            _boundsContainer.appendChild(_elemBounds);
        };

        // remove bounds from list and DOM
        var removeBounds = function () {
            _elemBounds.parentNode.removeChild(_elemBounds);
        };

        // update the start and end positions of the scene
        var updateBounds = function () {
            if (_elemBounds.parentNode !== _boundsContainer) {
                addBounds(); // Add Bounds elements (start/end)
            }
            var css = {};
            css[_vertical ? "top" : "left"] = Scene.triggerPosition();
            css[_vertical ? "height" : "width"] = Scene.duration();
            _util.css(_elemBounds, css);
            _util.css(_elemEnd, {
                display: Scene.duration() > 0 ? "" : "none"
            });
        };

        /*
         * ----------------------------------------------------------------
         * trigger and trigger group management
         * ----------------------------------------------------------------
         */

        // adds an new trigger group to the array and to the DOM
        var addTriggerGroup = function () {
            var triggerElem = TPL.trigger(options.colorTrigger); // new trigger element
            var css = {};
            css[_vertical ? "left" : "bottom"] = 0;
            css[_vertical ? "border-top-width" : "border-left-width"] = 1;
            _util.css(triggerElem.firstChild, css);
            _util.css(triggerElem.firstChild.firstChild, {
                padding: _vertical ? "0 8px 3px 8px" : "3px 4px",
            });
            document.body.appendChild(triggerElem); // directly add to body
            var newGroup = {
                triggerHook: Scene.triggerHook(),
                element: triggerElem,
                members: [Indicator]
            };
            _ctrl._indicators.groups.push(newGroup);
            Indicator.triggerGroup = newGroup;
            // update right away
            _ctrl._indicators.updateTriggerGroupLabel(newGroup);
            _ctrl._indicators.updateTriggerGroupPositions(newGroup);
        };

        var removeTriggerGroup = function () {
            _ctrl._indicators.groups.splice(_ctrl._indicators.groups.indexOf(Indicator.triggerGroup), 1);
            Indicator.triggerGroup.element.parentNode.removeChild(Indicator.triggerGroup.element);
            Indicator.triggerGroup = undefined;
        };
    };

    /*
     * ----------------------------------------------------------------
     * Templates for the indicators
     * ----------------------------------------------------------------
     */
    var TPL = {
        start: function (color) {
            // inner element (for bottom offset -1, while keeping top position 0)
            var inner = document.createElement("div");
            inner.textContent = "start";
            _util.css(inner, {
                position: "absolute",
                overflow: "visible",
                "border-width": 0,
                "border-style": "solid",
                color: color,
                "border-color": color
            });
            var e = document.createElement('div');
            // wrapper
            _util.css(e, {
                position: "absolute",
                overflow: "visible",
                width: 0,
                height: 0
            });
            e.appendChild(inner);
            return e;
        },
        end: function (color) {
            var e = document.createElement('div');
            e.textContent = "end";
            _util.css(e, {
                position: "absolute",
                overflow: "visible",
                "border-width": 0,
                "border-style": "solid",
                color: color,
                "border-color": color
            });
            return e;
        },
        bounds: function () {
            var e = document.createElement('div');
            _util.css(e, {
                position: "absolute",
                overflow: "visible",
                "white-space": "nowrap",
                "pointer-events": "none",
                "font-size": FONT_SIZE,
                "font-family": "sans-serif",
            });
            e.style.zIndex = ZINDEX;
            return e;
        },
        trigger: function (color) {
            // inner to be above or below line but keep position
            var inner = document.createElement('div');
            inner.textContent = "trigger";
            _util.css(inner, {
                position: "relative",
            });
            // inner wrapper for right: 0 and main element has no size
            var w = document.createElement('div');
            _util.css(w, {
                position: "absolute",
                overflow: "visible",
                "border-width": 0,
                "border-style": "solid",
                color: color,
                "border-color": color
            });
            w.appendChild(inner);
            // wrapper
            var e = document.createElement('div');
            _util.css(e, {
                position: "fixed",
                overflow: "visible",
                "white-space": "nowrap",
                "pointer-events": "none",
                "font-size": FONT_SIZE,
                "font-family": "sans-serif",
            });
            e.style.zIndex = ZINDEX;
            e.appendChild(w);
            return e;
        },
    };

    return {
        version: "1.0.0"
    };

})();
