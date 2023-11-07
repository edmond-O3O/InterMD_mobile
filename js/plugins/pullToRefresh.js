/*!
 * pulltorefreshjs v0.1.21
 * (c) Rafael Soto
 * Released under the MIT License.
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.PullToRefresh = factory());
}(this, function () { 'use strict';

  var _shared = {
    pullStartY: null,
    pullStartX: null,
    pullMoveY: null,
    pullMoveX: null,
    handlers: [],
    styleEl: null,
    events: null,
    dist: 0,
    state: 'pending',
    timeout: null,
    distResisted: 0,
    supportsPassive: false,
    supportsPointerEvents: typeof window !== 'undefined' && !!window.PointerEvent
  };

  try {
    window.addEventListener('test', null, {
      get passive() {
        // eslint-disable-line getter-return
        _shared.supportsPassive = true;
      }

    });
  } catch (e) {// do nothing
  }

  function setupDOM(handler) {
    if (!handler.ptrElement) {
      var ptr = document.createElement('div');

      if (handler.mainElement !== document.body) {
        handler.mainElement.parentNode.insertBefore(ptr, handler.mainElement);
      } else {
        document.body.insertBefore(ptr, document.body.firstChild);
      }

      ptr.classList.add(((handler.classPrefix) + "ptr"));
      ptr.innerHTML = handler.getMarkup().replace(/__PREFIX__/g, handler.classPrefix);
      handler.ptrElement = ptr;

      if (typeof handler.onInit === 'function') {
        handler.onInit(handler);
      } // Add the css styles to the style node, and then
      // insert it into the dom


      if (!_shared.styleEl) {
        _shared.styleEl = document.createElement('style');

        _shared.styleEl.setAttribute('id', 'pull-to-refresh-js-style');

        document.head.appendChild(_shared.styleEl);
      }

      _shared.styleEl.textContent = handler.getStyles().replace(/__PREFIX__/g, handler.classPrefix).replace(/\s+/g, ' ');
    }

    return handler;
  }

  function onReset(handler) {
    handler.ptrElement.classList.remove(((handler.classPrefix) + "refresh"));
    handler.ptrElement.style[handler.cssProp] = '0px';
    setTimeout(function () {
      // remove previous ptr-element from DOM
      if (handler.ptrElement && handler.ptrElement.parentNode) {
        handler.ptrElement.parentNode.removeChild(handler.ptrElement);
        handler.ptrElement = null;
      } // reset state


      _shared.state = 'pending';
    }, handler.refreshTimeout);
  }

  function update(handler) {
    var iconEl = handler.ptrElement.querySelector(("." + (handler.classPrefix) + "icon"));
    var textEl = handler.ptrElement.querySelector(("." + (handler.classPrefix) + "text"));

    if (iconEl) {
      if (_shared.state === 'releasing' || _shared.state === 'refreshing') {
        // refresh 로딩 svg
        textEl.innerHTML = handler.instructionsReleaseToRefresh;
        iconEl.innerHTML = "\n      <svg xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"30px\" height=\"30px\" viewBox=\"0 0 100 100\" preserveAspectRatio=\"xMidYMid\">\n        <rect x=\"43\" rx=\"5\" ry=\"5\" width=\"13\" height=\"30\" fill=\"#c6c6c6\" transform=\"rotate(0 50 50)\" id=\"spinnerItem1\">\n          <animate attributeName=\"opacity\" values=\"1;0\" keyTimes=\"0;1\" dur=\"1s\" begin=\"-0.875s\" repeatCount=\"indefinite\" style=\"animation-play-state: running; animation-delay: 0s;\"></animate>\n        </rect>\n        <rect x=\"43\" rx=\"5\" ry=\"5\" width=\"13\" height=\"30\" fill=\"#c6c6c6\" transform=\"rotate(45 50 50)\" id=\"spinnerItem2\">\n          <animate attributeName=\"opacity\" values=\"1;0\" keyTimes=\"0;1\" dur=\"1s\" begin=\"-0.75s\" repeatCount=\"indefinite\" style=\"animation-play-state: running; animation-delay: 0s;\"></animate>\n        </rect>\n        <rect x=\"43\" rx=\"5\" ry=\"5\" width=\"13\" height=\"30\" fill=\"#c6c6c6\" transform=\"rotate(90 50 50)\" id=\"spinnerItem3\">\n          <animate attributeName=\"opacity\" values=\"1;0\" keyTimes=\"0;1\" dur=\"1s\" begin=\"-0.625s\" repeatCount=\"indefinite\" style=\"animation-play-state: running; animation-delay: 0s;\"></animate>\n        </rect>\n        <rect x=\"43\" rx=\"5\" ry=\"5\" width=\"13\" height=\"30\" fill=\"#c6c6c6\" transform=\"rotate(135 50 50)\" id=\"spinnerItem4\">\n          <animate attributeName=\"opacity\" values=\"1;0\" keyTimes=\"0;1\" dur=\"1s\" begin=\"-0.5s\" repeatCount=\"indefinite\" style=\"animation-play-state: running; animation-delay: 0s;\"></animate>\n        </rect>\n        <rect x=\"43\" rx=\"5\" ry=\"5\" width=\"13\" height=\"30\" fill=\"#c6c6c6\" transform=\"rotate(180 50 50)\" id=\"spinnerItem5\">\n          <animate attributeName=\"opacity\" values=\"1;0\" keyTimes=\"0;1\" dur=\"1s\" begin=\"-0.375s\" repeatCount=\"indefinite\" style=\"animation-play-state: running; animation-delay: 0s;\"></animate>\n        </rect>\n        <rect x=\"43\" rx=\"5\" ry=\"5\" width=\"13\" height=\"30\" fill=\"#c6c6c6\" transform=\"rotate(225 50 50)\" id=\"spinnerItem6\">\n          <animate attributeName=\"opacity\" values=\"1;0\" keyTimes=\"0;1\" dur=\"1s\" begin=\"-0.25s\" repeatCount=\"indefinite\" style=\"animation-play-state: running; animation-delay: 0s;\"></animate>\n        </rect>\n        <rect x=\"43\" rx=\"5\" ry=\"5\" width=\"13\" height=\"30\" fill=\"#c6c6c6\" transform=\"rotate(270 50 50)\" id=\"spinnerItem7\">\n          <animate attributeName=\"opacity\" values=\"1;0\" keyTimes=\"0;1\" dur=\"1s\" begin=\"-0.125s\" repeatCount=\"indefinite\" style=\"animation-play-state: running; animation-delay: 0s;\"></animate>\n        </rect>\n        <rect x=\"43\" rx=\"5\" ry=\"5\" width=\"13\" height=\"30\" fill=\"#c6c6c6\" transform=\"rotate(315 50 50)\" id=\"spinnerItem8\">\n          <animate attributeName=\"opacity\" values=\"1;0\" keyTimes=\"0;1\" dur=\"1s\" begin=\"0s\" repeatCount=\"indefinite\" style=\"animation-play-state: running; animation-delay: 0s;\"></animate>\n        </rect>\n      </svg>\n      ";
      }

      if (_shared.state === 'pulling' || _shared.state === 'pending') {
        // 기본 svg : event.js 의 pull distance에 따라 opacity값 변화 (svgDist 참고)
        textEl.innerHTML = handler.instructionsPullToRefresh;
        iconEl.innerHTML = "\n        <svg xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"30px\" height=\"30px\" viewBox=\"0 0 100 100\" preserveAspectRatio=\"xMidYMid slice\">\n            <rect x=\"43\" rx=\"5\" ry=\"5\" width=\"13\" height=\"30\" fill=\"#c6c6c6\" transform=\"rotate(0 50 50)\" opacity=\".3\" id=\"spinnerItem1\"></rect>\n            <rect x=\"43\" rx=\"5\" ry=\"5\" width=\"13\" height=\"30\" fill=\"#c6c6c6\" transform=\"rotate(45 50 50)\" opacity=\".3\" id=\"spinnerItem2\"></rect>\n            <rect x=\"43\" rx=\"5\" ry=\"5\" width=\"13\" height=\"30\" fill=\"#c6c6c6\" transform=\"rotate(90 50 50)\" opacity=\".3\" id=\"spinnerItem3\"></rect>\n            <rect x=\"43\" rx=\"5\" ry=\"5\" width=\"13\" height=\"30\" fill=\"#c6c6c6\" transform=\"rotate(135 50 50)\" opacity=\".3\" id=\"spinnerItem4\"></rect>\n            <rect x=\"43\" rx=\"5\" ry=\"5\" width=\"13\" height=\"30\" fill=\"#c6c6c6\" transform=\"rotate(180 50 50)\" opacity=\".3\" id=\"spinnerItem5\"></rect>\n            <rect x=\"43\" rx=\"5\" ry=\"5\" width=\"13\" height=\"30\" fill=\"#c6c6c6\" transform=\"rotate(225 50 50)\" opacity=\".3\" id=\"spinnerItem6\"></rect>\n            <rect x=\"43\" rx=\"5\" ry=\"5\" width=\"13\" height=\"30\" fill=\"#c6c6c6\" transform=\"rotate(270 50 50)\" opacity=\".3\" id=\"spinnerItem7\"></rect>\n            <rect x=\"43\" rx=\"5\" ry=\"5\" width=\"13\" height=\"30\" fill=\"#c6c6c6\" transform=\"rotate(315 50 50)\" opacity=\".3\" id=\"spinnerItem8\"></rect>\n        </svg>\n      ";
      }
    }
  }

  var _ptr = {
    setupDOM: setupDOM,
    onReset: onReset,
    update: update
  };

  var _timeout;

  var screenY = function screenY(event) {
    if (_shared.pointerEventsEnabled && _shared.supportsPointerEvents) {
      return event.screenY;
    }

    return event.touches[0].screenY;
  };

  var screenX = function screenX(event) {
    if (_shared.pointerEventsEnabled && _shared.supportsPointerEvents) {
      return event.screenX;
    }

    return event.touches[0].screenX;
  };

  var _setupEvents = (function () {
    var _el;

    var isScrolling;

    function _onTouchStart(e) {
      // here, we must pick a handler first, and then append their html/css on the DOM
      var target = _shared.handlers.filter(function (h) { return h.contains(e.target); })[0];

      isScrolling = undefined;
      _shared.enable = !!target;

      if (target && _shared.state === 'pending') {
        _el = _ptr.setupDOM(target);

        if (target.shouldPullToRefresh()) {
          _shared.pullStartY = screenY(e);
          _shared.pullStartX = screenX(e);
        }

        clearTimeout(_shared.timeout);

        _ptr.update(target);
      }
    }

    function _onTouchMove(e) {
      if (!(_el && _el.ptrElement && _shared.enable)) {
        return;
      }

      if (!_shared.pullStartY) {
        if (_el.shouldPullToRefresh()) {
          _shared.pullStartY = screenY(e);
          _shared.pullStartX = screenX(e);
        }
      } else {
        _shared.pullMoveY = screenY(e);
        _shared.pullMoveX = screenX(e);
      }

      if (_shared.state === 'refreshing') {
        if (e.cancelable && _el.shouldPullToRefresh() && _shared.pullStartY < _shared.pullMoveY) {
          e.preventDefault();
        }

        return;
      }

      if (typeof isScrolling === 'undefined') {
        var touchAngle = Math.atan2(Math.abs(_shared.pullMoveY - _shared.pullStartY), Math.abs(_shared.pullMoveX - _shared.pullStartX)) * 180 / Math.PI;
        isScrolling = 90 - parseInt(touchAngle) < _el.touchAngle;
      }

      if (!isScrolling) { return; }

      if (_shared.state === 'pending') {
        _el.ptrElement.classList.add(((_el.classPrefix) + "pull"));

        _shared.state = 'pulling';

        _ptr.update(_el);
      }

      if (_shared.pullStartY && _shared.pullMoveY) {
        _shared.dist = _shared.pullMoveY - _shared.pullStartY;
      }

      _shared.distExtra = _shared.dist - _el.distIgnore;

      if (_shared.distExtra > 0) {
        if (e.cancelable) {
          e.preventDefault();
        }

        _el.ptrElement.style[_el.cssProp] = (_shared.distResisted) + "px";
        _shared.distResisted = _el.resistanceFunction(_shared.distExtra / _el.distThreshold) * Math.min(_el.distMax, _shared.distExtra); // 60 / 8

        var stayPos = 10;
        var rect = document.getElementsByTagName('rect');
        var svgDist = (_el.distThreshold - stayPos) / (rect.length + 1);

        for (var i = 0; i < rect.length; i++) {
          rect[i].setAttribute('opacity', '.3'); // 기본 opcity값

          if (Math.ceil(_shared.distResisted) > svgDist * i + stayPos) {
            rect[i].setAttribute('opacity', '1'); // touchMove 거리비례 opacity값 변경
          }
        }

        if (_shared.state === 'pulling' && _shared.distResisted > _el.distThreshold) {
          _el.ptrElement.classList.add(((_el.classPrefix) + "release"));

          _shared.state = 'releasing';

          _ptr.update(_el);
        }

        if (_shared.state === 'releasing' && _shared.distResisted < _el.distThreshold) {
          _el.ptrElement.classList.remove(((_el.classPrefix) + "release"));

          _shared.state = 'pulling';

          _ptr.update(_el);
        }
      }
    }

    function _onTouchEnd() {
      if (!(_el && _el.ptrElement && _shared.enable)) {
        return;
      } // wait 1/2 sec before unmounting...


      clearTimeout(_timeout);
      _timeout = setTimeout(function () {
        if (_el && _el.ptrElement && _shared.state === 'pending') {
          _ptr.onReset(_el);
        }
      }, 500);

      if (_shared.state === 'releasing' && _shared.distResisted > _el.distThreshold) {
        _shared.state = 'refreshing';
        _el.ptrElement.style[_el.cssProp] = (_el.distReload) + "px";

        _el.ptrElement.classList.add(((_el.classPrefix) + "refresh"));

        _shared.timeout = setTimeout(function () {
          var retval = _el.onRefresh(function () { return _ptr.onReset(_el); });

          if (retval && typeof retval.then === 'function') {
            retval.then(function () { return _ptr.onReset(_el); });
          }

          if (!retval && !_el.onRefresh.length) {
            _ptr.onReset(_el);
          }
        }, _el.refreshTimeout);
      } else {
        if (_shared.state === 'refreshing') {
          return;
        }

        _el.ptrElement.style[_el.cssProp] = '0px';
        _shared.state = 'pending';
      }

      _ptr.update(_el);

      _el.ptrElement.classList.remove(((_el.classPrefix) + "release"));

      _el.ptrElement.classList.remove(((_el.classPrefix) + "pull"));

      _shared.pullStartY = _shared.pullMoveY = null;
      _shared.pullStartX = _shared.pullMoveX = null;
      _shared.dist = _shared.distResisted = 0;
    }

    function _onScroll() {
      if (_el) {
        _el.mainElement.classList.toggle(((_el.classPrefix) + "top"), _el.shouldPullToRefresh());
      }
    }

    var _passiveSettings = _shared.supportsPassive ? {
      passive: _shared.passive || false
    } : undefined;

    if (_shared.pointerEventsEnabled && _shared.supportsPointerEvents) {
      window.addEventListener('pointerup', _onTouchEnd);
      window.addEventListener('pointerdown', _onTouchStart);
      window.addEventListener('pointermove', _onTouchMove, _passiveSettings);
    } else {
      window.addEventListener('touchend', _onTouchEnd);
      window.addEventListener('touchstart', _onTouchStart);
      window.addEventListener('touchmove', _onTouchMove, _passiveSettings);
    }

    window.addEventListener('scroll', _onScroll);
    return {
      onTouchEnd: _onTouchEnd,
      onTouchStart: _onTouchStart,
      onTouchMove: _onTouchMove,
      onScroll: _onScroll,

      destroy: function destroy() {
        if (_shared.pointerEventsEnabled && _shared.supportsPointerEvents) {
          window.removeEventListener('pointerdown', _onTouchStart);
          window.removeEventListener('pointerup', _onTouchEnd);
          window.removeEventListener('pointermove', _onTouchMove, _passiveSettings);
        } else {
          window.removeEventListener('touchstart', _onTouchStart);
          window.removeEventListener('touchend', _onTouchEnd);
          window.removeEventListener('touchmove', _onTouchMove, _passiveSettings);
        }

        window.removeEventListener('scroll', _onScroll);
      }

    };
  });

  var _ptrMarkup = "\n<div class=\"__PREFIX__box\">\n  <div class=\"__PREFIX__content\">\n    <div class=\"__PREFIX__icon\"></div>\n    <div class=\"__PREFIX__text\"></div>\n  </div>\n</div>\n";

  var _ptrStyles = "\n.__PREFIX__ptr {\n  position:relative;\n  pointer-events: none;\n  font-size: 0.85em;\n  font-weight: bold;\n  top: 0;\n  height: 0;\n  transition: height 0.3s, min-height 0.3s;\n  text-align: center;\n  width: 100%;\n  overflow: hidden;\n  display: flex;\n  align-items: flex-end;\n  align-content: stretch;\n}\n\n.__PREFIX__box {\n  padding: 10px 0 0 0;\n  flex-basis: 100%;\n  position:absolute;\n  top:0;\n  left:0;\n  width:100%;\n}\n\n.__PREFIX__pull {\n  transition: none;\n}\n\n.__PREFIX__text {\n  margin-top: .33em;\n  color: rgba(0, 0, 0, 0.3);\n}\n\n.__PREFIX__icon {\n  color: rgba(0, 0, 0, 0.3);\n  transition: transform .3s;\n}\n\n.__PREFIX__icon svg {\n  vertical-align:top;\n}\n\n/*\nWhen at the top of the page, disable vertical overscroll so passive touch\nlisteners can take over.\n*/\n.__PREFIX__top {\n  touch-action: pan-x pan-down pinch-zoom;\n}\n\n.__PREFIX__release .__PREFIX__icon {\n  transform: rotate(180deg);\n}\n";

  var _defaults = {
    distThreshold: 60,
    distMax: 80,
    distReload: 50,
    distIgnore: 30,
    touchAngle: 45,
    mainElement: 'body',
    triggerElement: 'body',
    ptrElement: '.ptr',
    classPrefix: 'ptr--',
    cssProp: 'min-height',
    instructionsPullToRefresh: '',
    instructionsReleaseToRefresh: '',
    instructionsRefreshing: 'Refreshing',
    refreshTimeout: 500,
    getMarkup: function () { return _ptrMarkup; },
    getStyles: function () { return _ptrStyles; },
    onInit: function () {},
    onRefresh: function () { return location.reload(); },
    resistanceFunction: function (t) { return Math.min(1, t / 2.5); },
    shouldPullToRefresh: function () { return !window.scrollY; }
  };

  var _methods = ['mainElement', 'ptrElement', 'triggerElement'];
  var _setupHandler = (function (options) {
    var _handler = {}; // merge options with defaults

    Object.keys(_defaults).forEach(function (key) {
      _handler[key] = options[key] || _defaults[key];
    }); // normalize timeout value, even if it is zero

    _handler.refreshTimeout = typeof options.refreshTimeout === 'number' ? options.refreshTimeout : _defaults.refreshTimeout; // normalize elements

    _methods.forEach(function (method) {
      if (typeof _handler[method] === 'string') {
        _handler[method] = document.querySelector(_handler[method]);
      }
    }); // attach events lazily


    if (!_shared.events) {
      _shared.events = _setupEvents();
    }

    _handler.contains = function (target) {
      return _handler.triggerElement.contains(target);
    };

    _handler.destroy = function () {
      // stop pending any pending callbacks
      clearTimeout(_shared.timeout); // remove handler from shared state

      var offset = _shared.handlers.indexOf(_handler);

      _shared.handlers.splice(offset, 1);
    };

    return _handler;
  });

  var index = {
    setPassiveMode: function setPassiveMode(isPassive) {
      _shared.passive = isPassive;
    },

    setPointerEventsMode: function setPointerEventsMode(isEnabled) {
      _shared.pointerEventsEnabled = isEnabled;
    },

    destroyAll: function destroyAll() {
      if (_shared.events) {
        _shared.events.destroy();

        _shared.events = null;
      }

      _shared.handlers.forEach(function (h) {
        h.destroy();
      });
    },

    init: function init(options) {
      if ( options === void 0 ) options = {};

      var handler = _setupHandler(options);

      _shared.handlers.push(handler);

      return handler;
    },

    // export utils for testing
    _: {
      setupHandler: _setupHandler,
      setupEvents: _setupEvents,
      setupDOM: _ptr.setupDOM,
      onReset: _ptr.onReset,
      update: _ptr.update
    }
  };

  return index;

}));
