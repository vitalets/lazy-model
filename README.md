lazy-model
==========

AngularJS directive that works like `ng-model` but saves changes only when form is submitted and cancel changes otherwise.

###Why this is needed?
AngularJS 2-way binding is awesome! When you change model - all views are updating instantly.  
But when dealing with forms I often need more transactional way: input something and confirm changes or reject to previous state. Official way to do it - is create copy of model, link it with form and write changes back to original model when form is submitted (see http://docs.angularjs.org/guide/forms).  
Being lazy programmer, I decided to put all that stuff into **lazy-model** directive.

###Usage
````html
<form ng-submit="formVisible=false" ng-show="formVisible">
  <input type="text" lazy-model="user.name">
  <button type="submit">save</button>
  <button type="reset" ng-click="formVisible=false">cancel</button>
</form>
````
In controller you just define model:
````js
app.controller('Ctrl', function($scope) {
  $scope.user = {
      name: 'vitalets'
  }; 
});
````

###Live Demo
http://jsfiddle.net/8btk5/5/

Don't forget to include module dependency
````js
var app = angular.module("app", ["lazyModel"]);
````