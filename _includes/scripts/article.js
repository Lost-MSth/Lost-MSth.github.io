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

      function attachCodeCopyButtons() {
        $articleContent.find('.highlight').filter(function() {
          return $(this).parents('.highlight').length === 0;
        }).each(function() {
          var highlight = this;
          $this = $(highlight);
          $this.attr('data-lang', $this.find('code').attr('data-lang'));

          if (highlight.querySelector('.js-code-copy')) {
            return;
          }

          var button = document.createElement('button');
          button.type = 'button';
          button.className = 'code-copy-btn js-code-copy';
          button.setAttribute('aria-label', 'Copy code');
          button.textContent = 'Copy';
          highlight.appendChild(button);
        });
      }


      function markExternalLinks() {
        var root = $articleContent.get(0);
        if (!root) {
          return;
        }
        var links = root.querySelectorAll('.article__content a[href]');
        for (var i = 0; i < links.length; i++) {
          var link = links[i];
          if (link.classList.contains('external-link')) {
            continue;
          }
          if (link.classList.contains('button') || link.querySelector('img, svg, figure')) {
            continue;
          }

          var href = (link.getAttribute('href') || '').trim();
          if (!href || href.charAt(0) === '#' || href.indexOf('/') === 0 || href.indexOf('./') === 0 || href.indexOf('../') === 0) {
            continue;
          }
          if (/^(mailto:|tel:|javascript:)/i.test(href)) {
            continue;
          }

          try {
            var targetUrl = new URL(href, window.location.href);
            if (targetUrl.origin !== window.location.origin) {
              link.classList.add('external-link');
            }
          } catch (err) {
            // ignore malformed url
          }
        }
      }

      $articleContent.find('h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]').each(function() {
        $this = $(this);
        $this.append($('<a class="anchor d-print-none" aria-hidden="true"></a>').html('<i class="fas fa-anchor"></i>'));
      });

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

      attachCodeCopyButtons();
      markExternalLinks();
      processOverflowImages();
      $(window).on('resize', window.throttle(processOverflowImages, 150));
    });
  });
})();
