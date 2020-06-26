
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

Toolbar.prototype = {
	button(name, command = name, title) {
		let button = this._container.querySelector(`button[name=${JSON.stringify(name)}]`);
		if (!button){
			this._container.insertAdjacentHTML('beforeend', '<button>');
			button = this._container.lastChild;
		}
		button.setAttribute('name', name);
		button.classList.add(name.trim());
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
	togglebutton(){
		this.button(...arguments).addEventListener('click', 
		 evt => evt.target.ariaPressed = evt.target.ariaPressed == 'true' ? 'false' : 'true');
	},
	buttons (buttons){
		buttons.forEach(button => this.button(...button));
	},
	element (el) {
		if (el.nodeType){
			this._container.appendChild(el);
		}else{
			this._container.insertAdjacentHTML('beforeend', el);
		}
	}
};