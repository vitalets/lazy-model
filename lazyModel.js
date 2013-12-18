/**
 * lazy-model directive
 * 
 * AngularJS directive that works like `ng-model` but saves changes 
 * only when form is submitted (otherwise changes are canceled)
 */

angular.module('lazyModel', [])
.directive('lazyModel', ['$parse', '$compile', function($parse, $compile) {
  return {
    restrict: 'A',  
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
        return function postLink(scope, elem, attr) {
          // initialize buffer value as copy of original model 
          scope.buffer = ngModelGet(scope.$parent);
          // compile element with ng-model directive poining to buffer value   
          $compile(elem)(scope);
          // bind form submit to write back final value from buffer
          var form = elem.parent();
          while(form[0].tagName !== 'FORM') {
            form = form.parent();
          }
          form.bind('submit', function() {
            scope.$apply(function() {
                ngModelSet(scope.$parent, scope.buffer);
            });
         });
         form.bind('reset', function(e) {
            e.preventDefault();
            scope.$apply(function() {
                scope.buffer = ngModelGet(scope.$parent);
            });
         });
        };  
     }
  };
}]);