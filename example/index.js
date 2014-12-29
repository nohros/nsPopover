angular
  .module('nsPopoverExample', ['nsPopover'])

  .controller('MainCtrl', function($scope) {
    $scope.items = [{
      name: "Action"
    }, {
      name: "Another action"
    }, {
      name: "Something else here"
    }];

    $scope.shouldDisplayPopover = function() {
      return $scope.displayPopover;
    }
  })

  .directive('viewportWidth', function() {
    return {
      link: function(scope, elm, attrs) {
        function getViewport() {
          var e = window, a = 'inner';
          if (!('innerWidth' in window)) {
            a = 'client';
            e = document.documentElement || document.body;
          }
          return {
            width : e[a + 'Width'] ,
            height : e[a + 'Height']
          };
        }

        elm.css('maxWidth', getViewport().width + 'px');
      }
    };
  });