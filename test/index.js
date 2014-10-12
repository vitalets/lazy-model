var app = angular.module("app", ["lazyModel"]);

app.controller('Ctrl', function($scope) {
  $scope.user = {
      name: 'vitalets'
  }; 
});