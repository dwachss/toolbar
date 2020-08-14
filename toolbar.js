function Toolbar (container, target, func, label){
	this._container = container;
	this._func = func.bind(target);
	container.setAttribute('role', 'toolbar');
	if (label) container.setAttribute('aria-label', label);
	// use ARIA (https://www.w3.org/TR/wai-aria-practices/examples/toolbar/toolbar.html ) to
	// tie the toolbar to the target
	let id = target.getAttribute('id');
	if (!id) {
		id = 'toolbar-target-'+Math.random().toString(36).slice(2); // random enough string
		target.setAttribute('id', id);
	}
	let otherToolbar = document.querySelector(`[aria-controls=${id}]`);
	container.setAttribute('aria-controls', id);
	// only have one toolbar capturing the context menu
	if (!otherToolbar){
		target.addEventListener('contextmenu', evt => {
			if (evt.button == 0){ // ony capture the menu key, not the right-click
				if ( container.children.length == 0 ) return;
				container.querySelector('[tabindex="0"]').focus();
				evt.preventDefault();
				return false;
			}
		});
		container.classList.add('capturing-menu');
	}
	container.addEventListener('keyup', evt => {
		if (evt.key == 'Escape') target.focus();
		if (/^Key[A-Z]$/.test(evt.code)){
			const index = evt.code.charCodeAt(3) - 'A'.charCodeAt(0) + 1;
			const button = container.querySelector(`button:nth-of-type(${index})`);
			if (button) {
				button.dispatchEvent (new MouseEvent('click'));
				button.classList.add('highlight');
				setTimeout( ()=> button.classList.remove('highlight'), 400);
			}
		}
		// https://www.w3.org/TR/wai-aria-practices/#kbd_roving_tabindex
		let focusedButton = container.querySelector('[tabindex="0"]');
		if (!focusedButton) return;
		let tabbables = container.querySelectorAll('[tabindex]');
		let i = [].indexOf.call(tabbables, focusedButton);
		if (evt.key == 'ArrowRight') {
			++i;
			if (i >= tabbables.length ) i = 0; // ahould be at least one element, the focused one
			focusedButton.setAttribute ('tabindex', -1);
			tabbables[i].setAttribute ('tabindex', 0);
			tabbables[i].focus();
		}
		if (evt.key == 'ArrowLeft') {
			--i;
			if (i < 0 ) i = tabbables.length - 1; // ahould be at least one element, the focused one
			focusedButton.setAttribute ('tabindex', -1);
			tabbables[i].setAttribute ('tabindex', 0);
			tabbables[i].focus();
		}
	});
}

Toolbar.for = function(el){
	const id = el.getAttribute('id');
	if (!id) return null;
	return document.querySelector(`[aria-controls=${id}]`);
}

Toolbar.toggleAttribute = function (el, attr, states){
	if (/^style\./.test(attr)){
		attr = attr.slice(6).replace (/-[a-z]/g, x => x.toUpperCase() ); // make sure it's camel case
		el.style[attr] = window.getComputedStyle(el)[attr] == states[0] ? states[1] : states[0];
	}else{
		el.setAttribute(attr, el.getAttribute(attr) == states[0] ? states[1] : states[0]);
	}
};

Toolbar.prototype = {
	button(name, command = name, title) {
		let button = this._container.querySelector(`button[name=${JSON.stringify(name)}]`);
		if (!button){
			this._container.insertAdjacentHTML('beforeend', '<button>');
			button = this._container.lastChild;
		}
		button.setAttribute('name', name);
		button.classList.add(name.replace(/\s/g,''));
		if (title) button.setAttribute('title', title);
		button.setAttribute('data-command', command);
		let focusedButton = this._container.querySelector('[tabindex="0"]');
		button.setAttribute('tabindex', focusedButton ? -1 : 0 ); // roving tab index. https://www.w3.org/TR/wai-aria-practices/#kbd_roving_tabindex
		button.addEventListener ('click', evt => {
			this._container.querySelector('[tabindex="0"]').setAttribute('tabindex', -1);
			button.setAttribute ('tabindex', 0);
			this._func(button.getAttribute('data-command'));
		});
		return button;
	},
	toggleButton(){
		const button = this.button(...arguments);
		button.addEventListener('click', 
			evt => Toolbar.toggleAttribute (evt.target, 'aria-pressed', ['true', 'false'])
		);
		return button;
	},
	observerButton (name, command = name, attr, title){
		return this.observerElement (this.button(name, command, title), attr);
	},
	buttons (buttons){
		return buttons.forEach(button => this.button(...button));
	},
	element (el) {
		if (el.nodeType){
			this._container.appendChild(el);
		}else{
			this._container.insertAdjacentHTML('beforeend', el);
			el = this._container.lastChild;
		}
		return el;
	},
	observerElement (el, attr){
		el = this.element(el);
		let styleRE = undefined;
		if (/^style\./.test(attr)){
			// keeping track of what needs camel case and what needs snake case is hard!
			attr = attr.slice(6).replace (/-[a-z]/g, x => x.toUpperCase() );
			// the existence of styleRE is a flag that we are looking for styles.
			styleRE = new RegExp (`${attr.replace (/[A-Z]/g, x => '-' + x.toLowerCase() )}:\\s*([^;]+)\\s*;`);
		}
		const observer = new MutationObserver( mutations => {
			mutations.forEach ( mutation => {
				let newValue = mutation.target.getAttribute(attr);
				if (styleRE) newValue = mutation.target.style[attr];
				let oldValue = mutation.oldValue;
				if (styleRE) {
					oldValue = styleRE.exec(mutation.oldValue);
					if (oldValue) oldValue = oldValue[1];
				}
				// if we are observing 'style', then *any* change to inline styles will trigger this.
				// we only want to do anything if *our* CSS property changed.
				if (newValue == oldValue) return;
				el.classList.remove (oldValue);
				if (newValue) el.classList.add (newValue.replace(/\s/g,''));
			});
		});
		observer.observe (
			document.querySelector(`#${this._container.getAttribute('aria-controls')}`),
			{ attribute: true, attributeOldValue: true, attributeFilter: [ styleRE ? 'style' : attr ] }		
		);
		return el;
	}
};
