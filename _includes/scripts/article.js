(function() {
  var SOURCES = window.TEXT_VARIABLES.sources;
  window.Lazyload.js(SOURCES.jquery, function() {
    $(function() {
      var $this ,$scroll;
      var $articleContent = $('.js-article-content');
      var hasSidebar = $('.js-page-root').hasClass('layout--page--sidebar');
      var scroll = hasSidebar ? '.js-page-main' : 'html, body';
      $scroll = $(scroll);

      $articleContent.find('.highlight').each(function() {
        $this = $(this);
        $this.attr('data-lang', $this.find('code').attr('data-lang'));
      });
      $articleContent.find('h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]').each(function() {
        $this = $(this);
        $this.append($('<a class="anchor d-print-none" aria-hidden="true"></a>').html('<i class="fas fa-anchor"></i>'));
      });
      $articleContent.on('click', '.anchor', function() {
        $scroll.scrollToAnchor('#' + $(this).parent().attr('id'), 400);
      });
      function wrapOverflowImage(img) {
        if (!img || img.closest('.image-scroll-block') || img.closest('.image-scroll-shell') || img.closest('.mathjax-block')) {
          return;
        }
        var parent = img.parentElement;
        if (!parent) {
          return;
        }
        if (img.closest('figure') || img.closest('.gallery')) {
          return;
        }
        // avoid changing inline mixed-content paragraphs
        var parentTag = parent.tagName;
        var allowMultiChildParent = parentTag === 'CENTER' || parentTag === 'DIV';
        if (parent.children.length !== 1 && !allowMultiChildParent) {
          return;
        }

        var parentWidth = parent.clientWidth || $articleContent.get(0).clientWidth;
        var imageWidth = img.getBoundingClientRect().width;
        if (!parentWidth || !imageWidth || imageWidth <= parentWidth + 1) {
          return;
        }

        var shell = document.createElement('div');
        shell.className = 'image-scroll-shell';
        var wrapper = document.createElement('div');
        wrapper.className = 'image-scroll-block';
        parent.insertBefore(shell, img);
        shell.appendChild(wrapper);
        wrapper.appendChild(img);
      }

      function processOverflowImages() {
        $articleContent.find('img:not(.emoji)').each(function() {
          var img = this;
          if (img.complete) {
            wrapOverflowImage(img);
          } else {
            img.addEventListener('load', function onLoad() {
              wrapOverflowImage(img);
            }, { once: true });
          }
        });
      }

      processOverflowImages();
      $(window).on('resize', window.throttle(processOverflowImages, 150));
    });
  });
})();
