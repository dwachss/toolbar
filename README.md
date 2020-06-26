# toolbar

Javascript abstraction of a toolbar, that tries to emulate the behavior of the [W3.org example](https://www.w3.org/TR/wai-aria-practices/examples/toolbar/toolbar.html). It is meant to be used with my [bililiteRange](http://github.com/dwachss/bililiteRange) [ex implementation](http:///dwachss/bililiteRange/blob/master/bililiteRange.ex.js).

It assumes a structure like

````html
<div id=toolbar></div>
<textarea id=editor></div>
````
Code:
````js
function run (command) {
  this.value = this.value + command;
}

// create a toolbar with two buttons, one that appends "foo" to the text area and one that appends "bar"
const t = new Toolbar (document.querySelector('#toolbar'), document.querySelector('#editor'), run);
t.button('foo');
t.button('bar');
````



