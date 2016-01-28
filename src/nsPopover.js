(function(window, angular, undefined){
  'use strict';

  var $el = angular.element;
  var globalId = 0;
  var isDef = angular.isDefined;
  var module = angular.module('nsPopover', []);

  module.provider('nsPopover', function () {
    var defaults = {
      angularEvent: null,
      container: 'body',
      hideOnButtonClick: true,
      hideOnInsideClick: false,
      hideOnOutsideClick: true,
      mouseRelative: '',
      onClose: angular.noop,
      onOpen: angular.noop,
      placement: 'bottom|left',
      plain: 'false',
      popupDelay: 0,
      restrictBounds: false,
      scopeEvent: null,
      template: '',
      theme: 'ns-popover-list-theme',
      timeout: 1.5,
      trigger: 'click',
      triggerPrevent: true,
    };

    this.setDefaults = function(newDefaults) {
      angular.extend(defaults, newDefaults);
    };

    this.$get = function () {
      return {
        getDefaults: function () {
          return defaults;
        }
      };
    };
  });

  module.directive('nsPopover', [
    'nsPopover',
    '$rootScope',
    '$timeout',
    '$templateCache',
    '$q',
    '$http',
    '$compile',
    '$document',
    '$parse',
    function(
      nsPopover,
      $rootScope,
      $timeout,
      $templateCache,
      $q,
      $http,
      $compile,
      $document,
      $parse
    ) {
      return {
        restrict: 'A',
        scope: true,
        link: function(scope, elm, attrs) {
          var $container;
          var $popover;
          var $triangle;
          var align_;
          var defaults = nsPopover.getDefaults();
          var displayer_;
          var hider_;
          var match;
          var options = {
            angularEvent: attrs.nsPopoverAngularEvent || defaults.angularEvent,
            container: attrs.nsPopoverContainer || defaults.container,
            group: attrs.nsPopoverGroup,
            hideOnButtonClick: toBoolean(attrs.nsPopoverHideOnButtonClick || defaults.hideOnButtonClick),
            hideOnInsideClick: toBoolean(attrs.nsPopoverHideOnInsideClick || defaults.hideOnInsideClick),
            hideOnOutsideClick: toBoolean(attrs.nsPopoverHideOnOutsideClick || defaults.hideOnOutsideClick),
            mouseRelative: attrs.nsPopoverMouseRelative,
            onClose: $parse(attrs.nsPopoverOnClose) || defaults.onClose,
            onOpen: $parse(attrs.nsPopoverOnOpen) || defaults.onOpen,
            placement: attrs.nsPopoverPlacement || defaults.placement,
            plain: toBoolean(attrs.nsPopoverPlain || defaults.plain),
            popupDelay: attrs.nsPopoverPopupDelay || defaults.popupDelay,
            restrictBounds: Boolean(attrs.nsPopoverRestrictBounds) || defaults.restrictBounds,
            scopeEvent: attrs.nsPopoverScopeEvent || defaults.scopeEvent,
            template: attrs.nsPopoverTemplate || defaults.template,
            theme: attrs.nsPopoverTheme || defaults.theme,
            timeout: attrs.nsPopoverTimeout || defaults.timeout,
            trigger: attrs.nsPopoverTrigger || defaults.trigger,
            triggerPrevent: attrs.nsPopoverTriggerPrevent || defaults.triggerPrevent,
          };
          var placement_;
          var unregisterActivePopoverListeners;
          var unregisterDisplayMethod;

          if (options.mouseRelative) {
            options.mouseRelativeX = options.mouseRelative.indexOf('x') !== -1;
            options.mouseRelativeY = options.mouseRelative.indexOf('y') !== -1;
          }

          function addEventListeners() {
            function cancel() {
              hider_.cancel();
            }

            function hide() {
              hider_.hide(options.timeout);
            }

            elm
              .on('mouseout', hide)
              .on('mouseover', cancel)
            ;

            $popover
              .on('mouseout', hide)
              .on('mouseover', cancel)
            ;

            unregisterActivePopoverListeners = function() {
              elm
                .off('mouseout', hide)
                .off('mouseover', cancel)
              ;

              $popover
                .off('mouseout', hide)
                .off('mouseover', cancel)
              ;
            }
          }

          /**
           * Adjust a rect accordingly to the given x and y mouse positions.
           *
           * @param rect {ClientRect} The rect to be adjusted.
           */
          function adjustRect(rect, adjustX, adjustY, ev) {
            // if pageX or pageY is defined we need to lock the popover to the given
            // x and y position.
            // clone the rect, so we can manipulate its properties.
            var localRect = {
              bottom: rect.bottom,
              height: rect.height,
              left: rect.left,
              right: rect.right,
              top: rect.top,
              width: rect.width
            };

            if (adjustX) {
              localRect.left = ev.pageX;
              localRect.right = ev.pageX;
              localRect.width = 0;
            }

            if (adjustY) {
              localRect.top = ev.pageY;
              localRect.bottom = ev.pageY;
              localRect.height = 0;
            }

            return localRect;
          }

          function buttonClickHandler() {
            if ($popover.isOpen) {
              scope.hidePopover();
            }
          }

          function display(e) {
            if (
              angular.isObject(e) &&
              false !== options.triggerPrevent
            ) {
              e.preventDefault();
            }

            hider_.cancel();
            displayer_.display(options.popupDelay, e);
          }

          function getBoundingClientRect(elm) {
            var w = window;
            var doc = document.documentElement || document.body.parentNode || document.body;
            var x = (isDef(w.pageXOffset)) ? w.pageXOffset : doc.scrollLeft;
            var y = (isDef(w.pageYOffset)) ? w.pageYOffset : doc.scrollTop;
            var rect = elm.getBoundingClientRect();

            // ClientRect class is immutable, so we need to return a modified copy
            // of it when the window has been scrolled.
            if (x || y) {
              return {
                bottom:rect.bottom+y,
                left:rect.left + x,
                right:rect.right + x,
                top:rect.top + y,
                height:rect.height,
                width:rect.width
              };
            }
            return rect;
          }

          function insideClickHandler() {
            if ($popover.isOpen) {
              scope.hidePopover();
            }
          }

          /**
           * Load the given template in the cache if it is not already loaded.
           *
           * @param template The URI of the template to be loaded.
           * @returns {String} A promise that the template will be loaded.
           * @remarks If the template is null or undefined a empty string will be returned.
           */
          function loadTemplate(template, plain) {
            if (!template) {
              return '';
            }

            if (angular.isString(template) && plain) {
              return template;
            }

            return $templateCache.get(template) || $http.get(template, { cache : true });
          }

          /**
           * Move the popover to the |placement| position of the object located on the |rect|.
           *
           * @param popover {Object} The popover object to be moved.
           * @param placement {String} The relative position to move the popover - top | bottom | left | right.
           * @param align {String} The way the popover should be aligned - center | left | right.
           * @param rect {ClientRect} The ClientRect of the object to move the popover around.
           * @param triangle {Object} The element that contains the popover's triangle. This can be null.
           */
          function move(popover, placement, align, rect, triangle) {
            var containerRect;
            var popoverRect = getBoundingClientRect(popover[0]);
            var popoverRight;
            var top, left;

            var positionX = function() {
              if (align === 'center') {
                return Math.round(rect.left + rect.width/2 - popoverRect.width/2);
              } else if(align === 'right') {
                return rect.right - popoverRect.width;
              }
              return rect.left;
            };

            var positionY = function() {
              if (align === 'center') {
                return Math.round(rect.top + rect.height/2 - popoverRect.height/2);
              } else if(align === 'bottom') {
                return rect.bottom - popoverRect.height;
              }
              return rect.top;
            };

            if (placement === 'top') {
              top = rect.top - popoverRect.height;
              left = positionX();
            } else if (placement === 'right') {
              top = positionY();
              left = rect.right;
            } else if (placement === 'bottom') {
              top = rect.bottom;
              left = positionX();
            } else if (placement === 'left') {
              top = positionY();
              left = rect.left - popoverRect.width;
            }

            // Rescrict the popover to the bounds of the container
            if (true === options.restrictBounds) {
              containerRect = getBoundingClientRect($container[0]);

              // The left should be below the left of the container.
              left = Math.max(containerRect.left, left);

              // Prevent the left from causing the right to go outside
              // the conatiner.
              popoverRight = left + popoverRect.width;
              if (popoverRight > containerRect.width) {
                left = left - (popoverRight - containerRect.width);
              }
            }

            popover
              .css('top', top.toString() + 'px')
              .css('left', left.toString() + 'px');

            if (triangle && triangle.length) {
              if (placement === 'top' || placement === 'bottom') {
                left = rect.left + rect.width / 2 - left;
                triangle.css('left', left.toString() + 'px');
              } else {
                top = rect.top + rect.height / 2 - top;
                triangle.css('top', top.toString()  + 'px');
              }
            }
          }

          function outsideClickHandler(e) {
            function isInPopover(el) {
              if (el.id === id) {
                return true;
              }

              var parent = angular.element(el).parent()[0];

              if (!parent) {
                return false;
              }

              if (parent.id === id) {
                return true;
              }
              else {
                return isInPopover(parent);
              }
            }

            if ($popover.isOpen && e.target !== elm[0]) {
              var id = $popover[0].id;

              if (!isInPopover(e.target)) {
                scope.hidePopover();
              }
            }
          }

          function removeEventListeners() {
            unregisterActivePopoverListeners();
          }

          function toBoolean(value) {
            if (value && value.length !== 0) {
              var v = ("" + value).toLowerCase();
              value = (v == 'true');
            } else {
              value = false;
            }
            return value;
          }

          /**
           * Responsible for displaying of popover.
           * @type {Object}
           */
          displayer_ = {
            id_: undefined,

            /**
             * Set the display property of the popover to 'block' after |delay| milliseconds.
             *
             * @param delay {Number}  The time (in seconds) to wait before set the display property.
             * @param e {Event}  The event which caused the popover to be shown.
             */
            display: function(delay, e) {
              // Disable popover if ns-popover value is false
              if ($parse(attrs.nsPopover)(scope) === false) {
                return;
              }

              $timeout.cancel(displayer_.id_);

              if (!isDef(delay)) {
                delay = 0;
              }

              // hide any popovers being displayed
              if (options.group) {
                $rootScope.$broadcast('ns:popover:hide', options.group);
              }

              displayer_.id_ = $timeout(function() {
                if (true === $popover.isOpen) {
                  return;
                }

                $popover.isOpen = true;
                $popover.css('display', 'block');

                // position the popover accordingly to the defined placement around the
                // |elm|.
                var elmRect = getBoundingClientRect(elm[0]);

                // If the mouse-relative options is specified we need to adjust the
                // element client rect to the current mouse coordinates.
                if (options.mouseRelative) {
                  elmRect = adjustRect(elmRect, options.mouseRelativeX, options.mouseRelativeY, e);
                }

                move($popover, placement_, align_, elmRect, $triangle);
                addEventListeners();

                // Hide the popover without delay on the popover click events.
                if (true === options.hideOnInsideClick) {
                  $popover.on('click', insideClickHandler);
                }

                // Hide the popover without delay on outside click events.
                if (true === options.hideOnOutsideClick) {
                  $document.on('click', outsideClickHandler);
                }

                // Hide the popover without delay on the button click events.
                if (true === options.hideOnButtonClick) {
                  elm.on('click', buttonClickHandler);
                }

                // Call the open callback
                options.onOpen(scope);
              }, delay*1000);
            },

            cancel: function() {
              $timeout.cancel(displayer_.id_);
            }
          };

          /**
           * Responsible for hiding of popover.
           * @type {Object}
           */
          hider_ = {
            id_: undefined,

            /**
             * Set the display property of the popover to 'none' after |delay| milliseconds.
             *
             * @param delay {Number}  The time (in seconds) to wait before set the display property.
             */
            hide: function(delay) {
              $timeout.cancel(hider_.id_);

              // do not hide if -1 is passed in.
              if(delay !== "-1") {
                // delay the hiding operation for 1.5s by default.
                if (!isDef(delay)) {
                  delay = 1.5;
                }

                hider_.id_ = $timeout(function() {
                  $popover.off('click', insideClickHandler);
                  $document.off('click', outsideClickHandler);
                  elm.off('click', buttonClickHandler);
                  $popover.isOpen = false;
                  displayer_.cancel();
                  $popover.css('display', 'none');
                  removeEventListeners();

                  // Call the close callback
                  options.onClose(scope);
                }, delay*1000);
              }
            },

            cancel: function() {
              $timeout.cancel(hider_.id_);
            }
          };

          // Set the container to the passed selector. If the container element
          // was not found, use the body as the container.
          $container = $document.find(options.container);
          if (!$container.length) {
            $container = $document.find('body');
          }

          // Parse the desired placement and alignment values.
          match = options
            .placement
            .match(/^(top|bottom|left|right)$|((top|bottom)\|(center|left|right)+)|((left|right)\|(center|top|bottom)+)/)
          ;
          if (!match) {
            throw new Error(
              '"' + options.placement + '" is not a valid placement or has ' +
              'an invalid combination of placements.'
            );
          }
          placement_ = match[6] || match[3] || match[1];
          align_ = match[7] || match[4] || match[2] || 'center';

          // Create the popover element and add it to the cached list of all
          // popovers.
          globalId += 1;
          $popover = $el('<div id="nspopover-' + globalId +'"></div>')
            .addClass('ns-popover-' + placement_ + '-placement')
            .addClass('ns-popover-' + align_ + '-align')
            .css('position', 'absolute')
            .css('display', 'none')
          ;

          // Allow closing the popover programatically.
          scope.hidePopover = function() {
            hider_.hide(0);
          };

          // Hide popovers that are associated with the passed group.
          scope.$on('ns:popover:hide', function(ev, group) {
            if (options.group === group) {
                scope.hidePopover();
            }
          });

          // Clean up after yourself.
          scope.$on('$destroy', function() {
            $popover.remove();
            unregisterDisplayMethod();
          });

          // Display the popover when a message is broadcasted on the
          // $rootScope if `angular-event` was given.
          if (angular.isString(options.angularEvent)) {
            unregisterDisplayMethod = $rootScope.$on(
              options.angularEvent,
              display
            );

          // Display the popover when a message is broadcasted on the
          // scope if `scope-event` was given.
          } else if (angular.isString(options.scopeEvent)) {
            unregisterDisplayMethod = scope.$on(
              options.scopeEvent,
              display
            )

          // Otherwise just display the popover whenever the event that was
          // passed to the `trigger` attribute occurs on the element.
          } else {
            elm.on(options.trigger, display);
            unregisterDisplayMethod = function() {
              elm.off(options.trigger, display);
            }
          }

          // Load the template and compile the popover.
          $q
            .when(loadTemplate(options.template, options.plain))
            .then(function(template) {
              if (angular.isObject(template)) {
                template = angular.isString(template.data) ?
                  template.data : ''
                ;
              }

              // Set the popover element HTML.
              $popover.html(template);

              // Add the "theme" class to the element.
              if (options.theme) {
                $popover.addClass(options.theme);
              }

              // Compile the element.
              $compile($popover)(scope);

              // Cache the triangle element (works in ie8+).
              $triangle = $el(
                $popover[0].querySelectorAll('.triangle')
              );

              // Append it to the DOM
              $container.append($popover);
            })
          ;
        }
      };
    }
  ]);
})(window, window.angular);
