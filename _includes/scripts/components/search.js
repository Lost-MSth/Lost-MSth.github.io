
(function () {
  var SOURCES = window.TEXT_VARIABLES.sources;
  window.Lazyload.js(SOURCES.jquery, function() {
    // search panel
    var search = (window.search || (window.search = {}));
    var useDefaultSearchBox = window.useDefaultSearchBox === undefined ?
      true : window.useDefaultSearchBox;

    var $searchModal = $('.js-page-search-modal');
    var $searchToggle = $('.js-search-toggle');
    var searchModal = $searchModal.modal({ onChange: handleModalChange, hideWhenWindowScroll: true });
    var modalVisible = false;
    search.searchModal = searchModal;

    var $searchBox = null;
    var $searchInput = null;
    var $searchClear = null;

    function getModalVisible() {
      return modalVisible;
    }
    search.getModalVisible = getModalVisible;

    function ensureSearchReady(callback) {
      if (search.ensureReady) {
        search.ensureReady(callback);
      } else {
        callback && callback();
      }
    }

    function handleModalChange(visible) {
      modalVisible = visible;
      if (visible) {
        ensureSearchReady(function() {
          if (useDefaultSearchBox && $searchInput && $searchInput[0]) {
            var currentVal = $searchInput.val();
            if (currentVal && typeof currentVal === 'string') {
              $searchBox && $searchBox.addClass('not-empty');
              search.onInputNotEmpty && search.onInputNotEmpty(currentVal);
            }
          }
        });
        search.onShow && search.onShow();
        useDefaultSearchBox && $searchInput && $searchInput[0] && $searchInput[0].focus();
      } else {
        search.onHide && search.onHide();
        useDefaultSearchBox && $searchInput && $searchInput[0] && $searchInput[0].blur();
        setTimeout(function() {
          useDefaultSearchBox && $searchInput && $searchBox && ($searchInput.val(''), $searchBox.removeClass('not-empty'));
          search.clear && search.clear();
          window.pageAsideAffix && window.pageAsideAffix.refresh();
        }, 400);
      }
    }

    $searchToggle.on('click', function() {
      modalVisible ? searchModal.hide() : searchModal.show();
    });

    // Char Code: 83 S, 191 /
    $(window).on('keyup', function(e) {
      if (!modalVisible && !window.isFormElement(e.target || e.srcElement) && (e.which === 83 || e.which === 191)) {
        searchModal.show();
      } else if (modalVisible && e.which === 27) {
        searchModal.hide();
      }
    });

    if (useDefaultSearchBox) {
      $searchBox = $('.js-search-box');
      $searchInput = $searchBox.children('input');
      $searchClear = $searchBox.children('.js-icon-clear');
      search.getSearchInput = function() {
        return $searchInput.get(0);
      };
      search.getVal = function() {
        return $searchInput.val();
      };
      search.setVal = function(val) {
        $searchInput.val(val);
      };

      $searchInput.on('focus', function() {
        $(this).addClass('focus');
      });
      $searchInput.on('blur', function() {
        $(this).removeClass('focus');
      });
      $searchInput.on('input', window.throttle(function() {
        var val = $(this).val();
        if (val === '' || typeof val !== 'string') {
          search.clear && search.clear();
          $searchBox.removeClass('not-empty');
        } else {
          $searchBox.addClass('not-empty');
          ensureSearchReady(function() {
            var latestVal = $searchInput.val();
            if (latestVal === '' || typeof latestVal !== 'string') {
              search.clear && search.clear();
              $searchBox.removeClass('not-empty');
            } else {
              search.onInputNotEmpty && search.onInputNotEmpty(latestVal);
            }
          });
        }
      }, 250));
      $searchClear.on('click', function() {
        $searchInput.val('');
        $searchBox.removeClass('not-empty');
        search.clear && search.clear();
      });
    }
  });
})();
