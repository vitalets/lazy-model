/**
 * lazy-model directive
 * 
 * AngularJS directive that works like `ng-model` but saves changes 
 * only when form is submitted (otherwise changes are canceled)
 */

angular.module('lazyModel', [])

// lazy-model
.directive('lazyModel', ['$compile', '$timeout', 
  function($compile, $timeout) {
  return {
    restrict: 'A',
    priority: 500,
    terminal: true,
    require: ['lazyModel', '^form', '?^lazySubmit'],
    scope: true,
    controller: ['$scope', '$element', '$attrs', '$parse',
    function($scope, $element, $attrs, $parse) {
      if ($attrs.lazyModel === '') {
        throw '`lazy-model` should have a value.';
      }

      // getter and setter for original model
      var ngModelGet = $parse($attrs.lazyModel);
      var ngModelSet = ngModelGet.assign;  

      this.accept = function() {
        ngModelSet($scope.$parent, $scope.buffer);
      };

      this.cancel = function() {
        $scope.buffer = ngModelGet($scope.$parent);
      };

      // init scope.buffer with value from original model
      this.cancel();
    }],
    compile: function compile(elem, attr) {
        // set ng-model to buffer in directive scope (nested)
        elem.attr('ng-model', 'buffer');
        // remove lazy-model attribute to exclude recursion
        elem.removeAttr("lazy-model");
        // store compiled fn
        var compiled = $compile(elem); 
        return {
          pre: function(scope, elem) {
            // compile element with ng-model directive poining to `scope.buffer`   
            compiled(scope);
          },
          post: function postLink(scope, elem, attr, ctrls) {
            var lazyModelCtrl = ctrls[0];

            // if we have `lazy-submit` directive in <form>, 
            // we just add lazy-model to collection and don't attach hooks
            if (ctrls.length === 3) {
              var lazySubmitCtrl = ctrls[2];
              lazySubmitCtrl.$addControl(lazyModelCtrl);
              return;
            }

            // bind form submit to write back final value from buffer
            var form = elem.parent();
            while(form[0].tagName !== 'FORM') {
              form = form.parent();
            }
            var formCtrl = form.controller('form');
            form.bind('submit', function() {
              // this submit handler must be called LAST after all other `submit` handlers
              // to get final value of formCtrl.$valid. The only way - is to call it in
              // the next tick via $timeout
              $timeout(function() {
                if (formCtrl.$valid) {
                  // form valid - save new value
                  lazyModelCtrl.accept();
                } 
              });
            });
            form.bind('reset', function(e) {
              e.preventDefault();
              $timeout(function() {
                // cancel changes
                lazyModelCtrl.cancel();
              });
            });
          }
        };  
     }
  };
}])

// lazy-submit
.directive('lazySubmit', ['$timeout', 
  function($timeout) {
    return {
      restrict: 'A',
      require: ['lazySubmit', 'form'],
      controller: ['$element', '$attrs', '$scope', '$parse',
      function($element, $attrs, $scope, $parse) {
        // store all detected lazy-models
        var controls = [];

        this.$addControl = function(control) {
          controls.push(control);
        };

        this.$removeControl = function(control) {
          for(var i = controls.length; i--;) {
            if (controls[i] === control) {
              controls.splice(i, 1);
            }
          }
        };

        var finalSubmit = $attrs.lazySubmit ? $parse($attrs.lazySubmit) : angular.noop;

        // accept changes in all lazy-models
        this.$submit = function() {
          for (var i=0; i<controls.length; i++) {
            controls[i].accept();
          }
          // call final hook
          finalSubmit($scope);
        };

        // cancel changes in all lazy-models
        this.$reset = function() {
          for (var i=0; i<controls.length; i++) {
            controls[i].cancel();
          }
        };
      }],
      link: function link(scope, elem, attr, ctrls) {
        elem.bind('submit', function() {
          // this submit handler must be called LAST after all other `submit` handlers
          // to get final value of formCtrl.$valid. The only way - is to call it in
          // the next tick via $timeout
          $timeout(function() {
            if (ctrls[1].$valid) {
              // form valid - save new values
              ctrls[0].$submit();
            } 
          });
        });
        elem.bind('reset', function(e) {
          e.preventDefault();
          $timeout(function() {
            ctrls[0].$reset();
          });
        });
      }
    };
}]);