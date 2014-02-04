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
  });