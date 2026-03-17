(function() {
  var SOURCES = window.TEXT_VARIABLES.sources;
  window.Lazyload.js(SOURCES.jquery, function() {
    function affix(options) {
      var $root = this, $window = $(window), $scrollTarget, $scroll,
        offsetBottom = 0, scrollTarget = window, scroll = window.document, disabled = false, isOverallScroller = true,
        rootTop, rootLeft, rootHeight, scrollBottom, rootBottomTop,
        hasInit = false, curState, ticking = false,
        raf = window.requestAnimationFrame || function(cb) { return setTimeout(cb, 16); };

      function setOptions(options) {
        var _options = options || {};
        _options.offsetBottom !== undefined && (offsetBottom = _options.offsetBottom);
        _options.scrollTarget && (scrollTarget = _options.scrollTarget);
        _options.scroll && (scroll = _options.scroll);
        _options.disabled !== undefined && (disabled = _options.disabled);
        $scrollTarget = $(scrollTarget);
        isOverallScroller = window.isOverallScroller($scrollTarget[0]);
        $scroll = $(scroll);
      }
      function preCalc() {
        top();
        rootHeight = $root.outerHeight();
        rootTop = $root.offset().top + (isOverallScroller ? 0 :  $scrollTarget.scrollTop());
        rootLeft = $root.offset().left;
      }
      function calc(needPreCalc) {
        needPreCalc && preCalc();
        scrollBottom = $scroll.outerHeight() - offsetBottom - rootHeight;
        rootBottomTop = scrollBottom - rootTop;
      }
      function top() {
        if (curState !== 'top') {
          $root.removeClass('fixed').css({
            left: 0,
            top: 0
          });
          curState = 'top';
        }
      }
      function fixed() {
        if (curState !== 'fixed') {
          $root.addClass('fixed').css({
            left: rootLeft + 'px',
            top: 0
          });
          curState = 'fixed';
        }
      }
      function bottom() {
        if (curState !== 'bottom') {
          $root.removeClass('fixed').css({
            left: 0,
            top: rootBottomTop + 'px'
          });
          curState = 'bottom';
        }
      }
      function setState() {
        var scrollTop = $scrollTarget.scrollTop();
        if (scrollTop >= rootTop && scrollTop <= scrollBottom) {
          fixed();
        } else if (scrollTop < rootTop) {
          top();
        } else {
          bottom();
        }
      }
      function runCalcAndState(needPreCalc) {
        calc(needPreCalc);
        setState();
      }

      var throttledRefresh = window.throttle(function() {
        if (!disabled) {
          runCalcAndState(true);
        }
      }, 120);

      function requestSetState() {
        if (disabled || ticking) {
          return;
        }
        ticking = true;
        raf(function() {
          setState();
          ticking = false;
        });
      }

      function bindMediaLoadRefresh() {
        var container = $scroll && $scroll[0];
        if (!container || !container.querySelectorAll) {
          return;
        }
        var media = container.querySelectorAll('img,iframe,video');
        for (var i = 0; i < media.length; i++) {
          var node = media[i];
          if (node.getAttribute('data-affix-bound') === 'true') {
            continue;
          }
          node.setAttribute('data-affix-bound', 'true');
          node.addEventListener('load', throttledRefresh);
        }
      }

      function init() {
        if (!hasInit) {
          runCalcAndState(true);
          bindMediaLoadRefresh();
          $scrollTarget.on('scroll', requestSetState);
          $window.on('resize', throttledRefresh);
          window.pageLoad.then(function() {
            bindMediaLoadRefresh();
            throttledRefresh();
          });
          hasInit = true;
        } else {
          throttledRefresh();
        }
      }

      setOptions(options);
      if (!disabled) {
        init();
      }
      $window.on('resize', window.throttle(function() {
        if (!disabled) {
          init();
        }
      }, 200));
      return {
        setOptions: function(options) {
          setOptions(options);
          if (!disabled) {
            init();
            throttledRefresh();
          }
        },
        refresh: function() {
          if (!disabled) {
            runCalcAndState(true);
          }
        }
      };
    }
    $.fn.affix = affix;
  });
})();
