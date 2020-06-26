# toolbar

Javascript abstraction of a toolbar, that tries to emulate the behavior of the [W3.org example](https://www.w3.org/TR/wai-aria-practices/examples/toolbar/toolbar.html). It is meant to be used with my [bililiteRange](http://github.com/dwachss/bililiteRange) [ex implementation](http:///dwachss/bililiteRange/blob/master/bililiteRange.ex.js).

## Files

toolbar.js: the code. No dependencies, but assumes a modern browser (tested on Edge (the Chromium version), Chrome and Firefox).
[toolbar.html](http://dwachss.github.io/toolbar/toolbar.html): simple demo.

## Usage

It assumes a page structure like

````html
<div id=toolbar></div>
<textarea id=editor></div>
````
Code:
````js
function run (command) {
  this.value += command;
}

// create a toolbar with two buttons, one that appends "foo" to the text area and one that appends "bar"
const t = new Toolbar (document.querySelector('#toolbar'), document.querySelector('#editor'), run);
t.button('foo');
t.button('bar');
````

## Code

### Constructor

````js
const t = new Toolbar (container: Element, target: Element, func: Function [, label: string]);
````

`container` is the HTML element that will be turned into a toolbar. `target` is the element that the toolbar will affect. Each toolbar has only one 
function that is called for each button on the toolbar; it takes one argument that is set to the `data-command` attribute of the actual button clicked, and `this` is set to `target`.

The `aria-label` attribute of `container` is set to the `label` argument, if present. `container.role` is set to `toolbar`. `keyup` listeners are set on `container` for the left and right arrow keys, to move between buttons when the toolbar is focused with the tab key. Letters (A-Z, case insensitive) activate the buttons ("A" clicks the first button, "B" the second, etc.) The Escape key returns the focus to `target`. `tabindex` is set with the [roving tabindex method](https://www.w3.org/TR/wai-aria-practices/#kbd_roving_tabindex) so it is possible to tab into and out of the toolbar.

The `contextmenu` event is captured on `target`, when that event is triggered by the Menu key (right clicking remains unaffected) to focus on the first toolbar that was defined on `container`. So when in the `container`, hitting the Menu key then "A" clicks the first button.

### `button` method

````js
t.button(name: string, command: string, title: string);
````

Appends a new `button` element, as `<button name=${name} class=${name} data-command=${command} title=${title} tabindex=-1></button>`. If `command` is undefined, it is set to `name`. If `title` is undefined it is omitted. (The tabindex is set to `0` when the button is clicked, which marks it as active when the user tabs into the toolbar). Clicking the button runs `func(command)` as described above.

### `togglebutton` method

````js
t.togglebutton(name: string, command: string, title: string);
````

Creates a button exactly like `button` but adds a `click` listener that toggles the `aria-pressed` attribute between `true` and `false` (note that the standard uses those words, rather than toggling the attribute itself).

### `element` method

````js
t.element(el: Element or string);
````

Simply appends `el` (as the element or as HTML) to the end of the toolbar. To have the element respond to arrow keys and tabs correctly, make sure it has `tabindex=-1`. `t.element('<br>`) is a convenient way to have the toolbar span two lines.

### `buttons` method

````js
t.buttons(buttons: array of arrays);
````

Convenience method to append a number of buttons. Calls `t.button` with each element of `buttons` as the argument array:
````js
buttons.forEach(button => this.button(...button));
````

