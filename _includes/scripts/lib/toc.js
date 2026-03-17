(function() {
  var SOURCES = window.TEXT_VARIABLES.sources;
  window.Lazyload.js(SOURCES.jquery, function() {
    function toc(options) {
      var $root = this, $window = $(window), $scrollTarget, $scroller,
        $tocUl = $('<ul class="toc toc--ellipsis"></ul>'), $tocLi, $headings,
        $activeLast, $activeCur, $container,
        selectors = 'h1,h2,h3', container = 'body', scrollTarget = window, scroller = 'html, body', disabled = false,
        headingsPos, scrolling = false, hasRendered = false, hasInit = false, ticking = false,
        raf = window.requestAnimationFrame || function(cb) { return setTimeout(cb, 16); };

      function setOptions(options) {
        var _options = options || {};
        _options.selectors && (selectors = _options.selectors);
        _options.container && (container = _options.container);
        _options.scrollTarget && (scrollTarget = _options.scrollTarget);
        _options.scroller && (scroller = _options.scroller);
        _options.disabled !== undefined && (disabled = _options.disabled);
        $container = $(container);
        $headings = $container.find(selectors).filter('[id]');
        $scrollTarget = $(scrollTarget);
        $scroller = $(scroller);
      }
      function calc() {
        headingsPos = [];
        $headings.each(function() {
          headingsPos.push(Math.floor($(this).position().top));
        });
      }
      function keepActiveItemInView() {
        if (!$activeCur || !$activeCur[0] || !$root || !$root[0]) {
          return;
        }
        var root = $root[0];
        var active = $activeCur[0];
        var padding = 24;
        var itemTop = active.offsetTop;
        var itemBottom = itemTop + active.offsetHeight;
        var viewTop = root.scrollTop;
        var viewBottom = viewTop + root.clientHeight;

        if (itemTop < viewTop + padding) {
          root.scrollTop = Math.max(0, itemTop - padding);
        } else if (itemBottom > viewBottom - padding) {
          root.scrollTop = Math.max(0, itemBottom - root.clientHeight + padding);
        }
      }
      function setState(element) {
        var scrollTop = $scrollTarget.scrollTop(), i;
        if (disabled || !headingsPos || headingsPos.length < 1) { return; }
        if (element) {
          $activeCur = element;
        } else {
          $activeCur = null;
          for (i = 0; i < headingsPos.length; i++) {
            if (scrollTop >= headingsPos[i]) {
              $activeCur = $tocLi.eq(i);
            } else {
              $activeCur || ($activeCur = $tocLi.eq(i));
              break;
            }
          }
        }
        if (!$activeCur || !$activeCur[0]) {
          return;
        }
        $activeLast && $activeLast.removeClass('active');
        ($activeLast = $activeCur).addClass('active');
        keepActiveItemInView();
      }
      function render() {
        if (!hasRendered) {
          $root.append($tocUl);
          $tocUl.on('click', 'a', function(e) {
            e.preventDefault();
            var $this = $(this);
            scrolling = true;
            setState($this.parent());
            $scroller.scrollToAnchor($this.attr('href'), 400, function() {
              scrolling = false;
              requestSetState();
            });
          });
          hasRendered = true;
        }

        $tocUl.empty();
        $headings.each(function() {
          var $this = $(this);
          $tocUl.append($('<li></li>').addClass('toc-' + $this.prop('tagName').toLowerCase())
            .append($('<a></a>').text($this.text()).attr('href', '#' + $this.prop('id'))));
        });
        $tocLi = $tocUl.children('li');
      }

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

      var throttledRefresh = window.throttle(function() {
        if (disabled) {
          return;
        }
        render();
        calc();
        setState();
      }, 120);

      function bindMediaLoadRefresh() {
        var containerNode = $container && $container[0];
        if (!containerNode || !containerNode.querySelectorAll) {
          return;
        }
        var media = containerNode.querySelectorAll('img,iframe,video');
        for (var i = 0; i < media.length; i++) {
          var node = media[i];
          if (node.getAttribute('data-toc-bound') === 'true') {
            continue;
          }
          node.setAttribute('data-toc-bound', 'true');
          node.addEventListener('load', throttledRefresh);
        }
      }

      function init() {
        if (!hasInit) {
          render();
          calc();
          setState();
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
        }
      };
    }
    $.fn.toc = toc;
  });
})();
