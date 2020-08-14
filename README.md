# toolbar

Javascript abstraction of a toolbar, that tries to emulate the behavior of the [W3.org example](https://www.w3.org/TR/wai-aria-practices/examples/toolbar/toolbar.html). It is meant to be used with my [bililiteRange](http://github.com/dwachss/bililiteRange) [ex implementation](http:///dwachss/bililiteRange/blob/master/bililiteRange.ex.js).

## Files

toolbar.js: the code. No dependencies, but assumes a modern browser (tested on Edge (the Chromium version), Chrome and Firefox).

[toolbar.html](http://dwachss.github.io/toolbar/toolbar.html): simple demo.

[toolbar2.html](http://dwachss.github.io/toolbar/toolbar2.html): Another simple demo that includes a Hebrew onscreen keyboard and some hacks with CSS.

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

### `Toolbar.for(element: Element)` function

Returns the first toolbar that was defined for an element, or `null` if there is no such toolbar.

### `Toolbar.toggleAttribute` function

Convenience function to change and attribute or style property between two values.

````js
Toolbar.toggleAttribute (el: Element, attr: string, states: [state0: string, state1: string]);
````

If the value of the attribute `el[attr]` is `state0` then it is changed to `state1`. Otherwise, change it to `state0`. To set style properties, use `"style.property"` for `attr` (either [camelCase](https://en.wikipedia.org/wiki/Camel_case) or [kebab-case](https://en.wikipedia.org/wiki/Kebab_case) are fine).

so `Toolbar.toggleAttribute(el, 'style.display', ['block', 'none'])` will alternately show and hide the element. `Toolbar.toggleAttribute(el, 'spellcheck', ['true', 'false'])` will toggle spellchecking.

### Constructor

````js
const t = new Toolbar (container: Element, target: Element, func: Function [, label: string]);
````

`container` is the HTML element that will be turned into a toolbar. `target` is the element that the toolbar will affect. Each toolbar has only one 
function that is called for each button on the toolbar; it takes one argument that is set to the `data-command` attribute of the actual button clicked, and `this` is set to `target`.

The `aria-label` attribute of `container` is set to the `label` argument, if present. `container.role` is set to `toolbar`. `keyup` listeners are set on `container` for the left and right arrow keys, to move between buttons when the toolbar is focused with the tab key. Letters (A-Z, case insensitive) activate the buttons ("A" clicks the first button, "B" the second, etc.) The Escape key returns the focus to `target`. `tabindex` is set with the [roving tabindex method](https://www.w3.org/TR/wai-aria-practices/#kbd_roving_tabindex) so it is possible to tab into and out of the toolbar.

The `contextmenu` event is captured on `target`, when that event is triggered by the Menu key (right clicking remains unaffected) to focus on the first toolbar that was defined on `container`. So when in the `container`, hitting the Menu key then "A" clicks the first button.

The `aria-controls` attribute of `container` is set to the `id` of `target`. If `target` does not have an `id`, one is created.

### `button` method

````js
t.button(name: string, command: string, title: string);
````

Appends a new `button` element, as `<button name=${name} class=${name} data-command=${command} title=${title} tabindex=-1></button>`. (The `name` used as a class name has all spaces removed; otherwise it would be an illegal class name). If `command` is undefined, it is set to `name`. If `title` is undefined it is omitted. (The tabindex is set to `0` when the button is clicked, which marks it as active when the user tabs into the toolbar). Clicking the button runs `func(command)` as described above.

Returns the `button` element created.

### `toggleButton` method

````js
t.toggleButton(name: string, command: string, title: string);
````

Creates a button exactly like `button` but adds a `click` listener that toggles the `aria-pressed` attribute between `true` and `false` (note that the standard uses those words, rather than toggling the attribute itself).

Returns the `button` element created.

### `element` method

````js
t.element(el: Element or string);
````

Simply appends `el` (as the element or as HTML) to the end of the toolbar. To have the element respond to arrow keys and tabs correctly, make sure it has `tabindex=-1`. `t.element('<br>`) is a convenient way to have the toolbar span two lines.

Returns the element appended.

### `observerElement` method

````js
t.observerElement (el: Element or string, attr: string);
````

Appends `el` with `element` above, then sets up a [MutationObserver](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver) on the `target` element of the toolbar, responding to changes in the `attr` attribute of that element. When a change happens, the new *value* of the attribute is added as a *class* of the element. The old value is removed. Use CSS to change the appearance of the element.

For example, if your editor sets the value of the attribute `"data-write-state"` to `"dirty"` when the text has changed, `"clean"` when the new text is saved, and `"pending"` while it is being saved, then `t.observerElement('<span id=writeindicator >', 'data-write-state')` will set the class of `span#writeindicator` to `dirty`, `clean`, or `pending` as soon as the attribute changes.

Changes in styles (only inline styles, set with `element.style.property`) can be observed as well, with `style.property`. The property can be in [camelCase](https://en.wikipedia.org/wiki/Camel_case) or [kebab-case](https://en.wikipedia.org/wiki/Kebab_case). So to monitor the font family, use `t.observerElement(el, 'style.fontFamily')`. Values will have spaces removed before using them as class names.

Returns the element appended.

### `observerButton` method

````js
t.observerButton(name: string, command: string, attr: string, title: string);
````

Combines `button` and `observerElement`. Simplly returns `t.observerElement(t.button (name, command, string), attr)`.

### `buttons` method

````js
t.buttons(buttons: array of arrays);
````

Convenience method to append a number of buttons. Calls `t.button` with each element of `buttons` as the argument array:
````js
buttons.forEach(button => this.button(...button));
````

Returns an array of the `button` elements created.

## Styling

The buttons have no content; they are meant to have content added with `::before` pseudo-elements, like:
````css
[role="toolbar"] button::before {
  content: attr(name);
}
````
labels each button with its name. Since the name is also used as the class, it is easy to customize:
````css
[role="toolbar"] button.swap::before {
  content: 'Switcheroo';
}
````

or use emojis or [FontAwesome](https://fontawesome.com/) as content.

Buttons that are clicked with the letter shortcut get the `highlight` class for 400 milliseconds, and toggle buttons should indicate that they are pressed. This works:
````css
	[role="toolbar"] button.highlight, [role=toolbar] button[aria-pressed="true"] {
		background: linear-gradient(ThreeDHighlight, ThreeDHighlight, ButtonFace);
		border: 2px inset buttonface;
		border-radius: 4px;
	}
````

The toolbar that is capturing the Menu key gets a class `capturing-menu`. This allows me to make a sort of tooltip to help with the letter shortcuts:
````css
	[role="toolbar"]{
		counter-reset: buttoncounter;
	}

/* complicated selector. I want the button::after element to be a letter (the content = counter(...upper-alpha)
   and that displayed overlying the button (position: absolute, width: 100%, left: 0) but very translucent (opacity: 20%).
   But I only want them displayed on the context-menu capturing toolbar, since that's where I would want to use a keyboard-only shortcut,
   and only when the button is focused but not from the mouse: that's :focus-within:not(:active) */
	[role="toolbar"].capturing-menu:focus-within:not(:active) button::after {
		content: counter(buttoncounter, upper-alpha);
		position: absolute;
		opacity: 20%;
		z-index: 1;
		top: -0.3em;
		left: 0;
		width: 100%;
		font-size: 200%;
		font-family: sans-serif;
		font-style: normal;
		color: black;
		font-weight: bold;
	}
````
