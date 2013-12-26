lazy-model
==========

AngularJS directive that works like `ng-model` but saves changes only when form is submitted (otherwise changes are canceled).

Usage
===
````html
<input type="text" lazy-model="user.name">
````

Libe Demo
===
http://jsfiddle.net/8btk5/5/


Don't forget to include module dependency
````js
var app = angular.module("app", ["lazyModel"]);
````