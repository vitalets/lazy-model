lazy-model
==========

AngularJS directive that works like `ng-model` but accept changes only when form is submitted (otherwise changes are cancelled).

### Why this is needed?
AngularJS 2-way binding is good feature: you change model - and all views are updated instantly.  
But when dealing with forms I often need more transactional way: input something and accept changes or decline it. Official way to do it requires additional code in controller: create copy of model, link it with form and write changes back to original model when form is submitted (see http://docs.angularjs.org/guide/forms).  
Being too lazy, I tried to put all that stuff into **lazy-model** directive.

### How to use it?
1. Create form with **submit** and **reset** buttons
2. In controls use `lazy-model` instead of `ng-model`

````html
<form>
  <input type="text" lazy-model="user.name">
  <button type="submit">save</button>
  <button type="reset">cancel</button>
</form>
````

Now you can change username, but it will be saved to model only when you press **save**.   
If you press **cancel** - your changes will be declined.   
Try out demo: http://jsfiddle.net/8btk5/6/

It can be useful for **popup forms** and **modal dialogs.**  
For example, popup form: 
````html
<form ng-submit="formVisible=false" ng-show="formVisible">
  <input type="text" lazy-model="user.name">
  <button type="submit">save</button>
  <button type="reset" ng-click="formVisible=false">cancel</button>
</form>
<button ng-click="formVisible=true" ng-show="!formVisible">show form</button>
````
Live demo: http://jsfiddle.net/8btk5/7/

### How to validate?
Basically there are two ways of validation:

#### 1. On-change validation (instant)
Use normal AngularJS validation [described in docs](http://docs.angularjs.org/guide/forms).
For example, `ng-maxlength` validator:
````html
<form name="frm" ng-submit="submit()" ng-show="formVisible">
...
  <input type="text" name="username" lazy-model="user.name" ng-maxlength="10">
````
And check `form.$valid` in submit handler in controller:
````js
$scope.submit = function() {    
  if ($scope.frm.$valid) {
    $scope.formVisible = false;
  }
};
````
Live demo: http://jsfiddle.net/8btk5/8/

#### 2. On-submit validation
Alternatively, you can perform all validations inside `submit` handler and accept or decline
changes by setting validity via `$setValidity` method. Don't forget to define `name` attribute 
of form and controls.

````html
<form name="frm" ng-submit="submit()" ng-show="formVisible">
...
  <input type="text" name="username" lazy-model="user.name">
  ...
  <button type="reset" ng-click="cancel()">cancel</button>
````
In controller you should define both `submit` and `cancel` handlers:
````js
$scope.submit = function() {
  if ($scope.frm.username.$modelValue.length > 10) {
    $scope.frm.username.$setValidity('maxlength', false);  
  } else {
    $scope.frm.username.$setValidity('maxlength', true);
    $scope.formVisible = false;
  }  
};

$scope.cancel = function() {
  $scope.frm.username.$setValidity('maxlength', true);
  $scope.formVisible = false;
}

````

Live demo: http://jsfiddle.net/8btk5/10/ 

### How to send data on server?
Please note that in `ng-submit` hook original models are not updated yet.
You may use it for validation but not for sending data on server.  
To send data there is special attribute of `<form>` called `lazy-submit`. 
Inside this hook models are updated and you can freely manipulate your models.

````html
<form name="frm" lazy-submit="save()" ng-show="formVisible">
...
  <input type="text" name="username" lazy-model="user.name" ng-maxlength="10">
````

In controller:
````js
$scope.save = function() { 
  $scope.formVisible = false;
  sendToServer($scope.user);   
};
````

Live demo: http://jsfiddle.net/8btk5/12/

### How to include it in my project?
1. [Download](http://vitalets.github.io/lazy-model/lazyModel.js) and include **lazyModel.js**
2. Set module dependency:

    ````js
        var app = angular.module("app", ["lazyModel"]);
    ````
