(function() {
  var SOURCES = window.TEXT_VARIABLES.sources;
  window.Lazyload.js(SOURCES.jquery, function() {
    $(function() {
      var $this, $scroll;
      var $articleContent = $('.js-article-content');
      var hasSidebar = $('.js-page-root').hasClass('layout--page--sidebar');
      var scroll = hasSidebar ? '.js-page-main' : 'html, body';
      $scroll = $(scroll);

      function copyText(text, done) {
        function fallbackCopy() {
          var textarea = document.createElement('textarea');
          textarea.value = text;
          textarea.setAttribute('readonly', '');
          textarea.style.position = 'fixed';
          textarea.style.opacity = '0';
          document.body.appendChild(textarea);
          textarea.select();
          var copied = false;
          try {
            copied = document.execCommand('copy');
          } catch (err) {
            copied = false;
          }
          document.body.removeChild(textarea);
          done(copied);
        }

        if (!text) {
          done(false);
          return;
        }

        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(text).then(function() {
            done(true);
          }).catch(function() {
            fallbackCopy();
          });
        } else {
          fallbackCopy();
        }
      }

      function setCopyButtonState(button, copied) {
        if (!button) {
          return;
        }
        var timeoutId = button.getAttribute('data-reset-timer');
        if (timeoutId) {
          clearTimeout(Number(timeoutId));
        }

        if (copied) {
          button.classList.add('is-copied');
          button.textContent = 'Copied';
        } else {
          button.classList.remove('is-copied');
          button.textContent = 'Failed';
        }

        var resetTimer = setTimeout(function() {
          button.classList.remove('is-copied');
          button.textContent = 'Copy';
          button.removeAttribute('data-reset-timer');
        }, copied ? 1400 : 900);

        button.setAttribute('data-reset-timer', String(resetTimer));
      }

      $articleContent.on('click', '.anchor', function() {
        $scroll.scrollToAnchor('#' + $(this).parent().attr('id'), 400);
      });

      $articleContent.on('click', '.js-code-copy', function(e) {
        e.preventDefault();
        e.stopPropagation();
        var button = this;
        var highlight = button.closest('.highlight');
        if (!highlight) {
          setCopyButtonState(button, false);
          return;
        }
        var codeNode = highlight.querySelector('code');
        var codeText = codeNode ? (codeNode.innerText || codeNode.textContent || '') : '';
        copyText(codeText, function(copied) {
          setCopyButtonState(button, copied);
        });
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
