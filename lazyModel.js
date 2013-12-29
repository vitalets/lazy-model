/**
 * lazy-model directive
 * 
 * AngularJS directive that works like `ng-model` but saves changes 
 * only when form is submitted (otherwise changes are canceled)
 */

angular.module('lazyModel', [])
.directive('lazyModel', ['$parse', '$compile', '$timeout', 
  function($parse, $compile, $timeout) {
  return {
    restrict: 'A',
    priority: 500,
    terminal: true,
    require: '^form',
    scope: true,
    compile: function compile(elem, attr) {
        // getter and setter for original model
        var ngModelGet = $parse(attr.lazyModel);
        var ngModelSet = ngModelGet.assign;  
        // set ng-model to buffer in isolate scope
        elem.attr('ng-model', 'buffer');
        // remove lazy-model attribute to exclude recursion
        elem.removeAttr("lazy-model");
        // store compiled fn of new elem
        var compiled = $compile(elem); 
        return {
          pre: function(scope, elem) {
            // initialize buffer value as copy of original model 
            scope.buffer = ngModelGet(scope.$parent);
            // compile element with ng-model directive poining to buffer value   
            compiled(scope);
          },
          post: function postLink(scope, elem, attr) {
            // bind form submit to write back final value from buffer
            var form = elem.parent();
            while(form[0].tagName !== 'FORM') {
              form = form.parent();
            }
            var formCtrl = form.controller('form');
            form.bind('submit', function() {
              // this submit handler must be called LAST after all other handlers
              // to get final formCtrl state. The only way seems to call it in
              // the next tick via $timeout
              $timeout(function() {
                if (formCtrl.$valid) {
                  // form valid - save new value
                  ngModelSet(scope.$parent, scope.buffer);
                } 
              });
            });
            form.bind('reset', function() {
              $timeout(function() {
                  scope.buffer = ngModelGet(scope.$parent);
              });
            });
          }
        };  
     }
  };
}]);