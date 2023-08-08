import { IdentityClass } from "../../@node/Identity";

export class MouseInput extends IdentityClass {
	static LEFT = e => e.button === 0;
	static RIGHT = e => e.button === 2;
	static MIDDLE = e => e.button === 1;

	constructor ({ events = {}, $game, ...self } = {}) {
		super({ ...self });

		this.$game = $game;

		this.buttons = new Map();
		this.cursor = [ null, null ];

		this.events = {
			onMouseDown: [],
			onMouseUp: [],
			onMouseMove: [],
			onClick: [],
			onContextMenu: [],
			...events,
		};

		this.$game.renderer.app.view.addEventListener("mousedown", (e) => this.onMouseDown.call(this, e));
		this.$game.renderer.app.view.addEventListener("mouseup", (e) => this.onMouseUp.call(this, e));
		this.$game.renderer.app.view.addEventListener("mousemove", (e) => this.onMouseMove.call(this, e));
		this.$game.renderer.app.view.addEventListener("click", (e) => this.onClick.call(this, e));
		this.$game.renderer.app.view.addEventListener("contextmenu", (e) => this.onContextMenu.call(this, e));
	}

	addEventListener(type, fn) {
		if(!this.events[ type ]) {
			throw new Error(`Unknown event type: ${ type }`);
		}

		this.events[ type ].push(fn);

		return this;
	}
	addEventListeners(eventObj) {
		for(const [ type, fn ] of Object.entries(eventObj)) {
			this.addEventListener(type, fn);
		}

		return this;
	}
	removeEventListener(type, fn) {
		if(!this.events[ type ]) {
			throw new Error(`Unknown event type: ${ type }`);
		}

		const index = this.events[ type ].indexOf(fn);

		if(index === -1) {
			throw new Error(`Unknown event listener: ${ fn }`);
		}

		this.events[ type ].splice(index, 1);

		return this;
	}
	removeEventListeners(eventObj) {
		for(const [ type, fn ] of Object.entries(eventObj)) {
			this.removeEventListener(type, fn);
		}

		return this;
	}

	get x() {
		return this.cursor[ 0 ];
	}
	get y() {
		return this.cursor[ 1 ];
	}

	get hasLeft() {
		return this.buttons.get("left");
	}
	get hasMiddle() {
		return this.buttons.get("middle");
	}
	get hasRight() {
		return this.buttons.get("right");
	}

	set(button, value) {
		this.buttons.set(button, !!value);
	}
	toggle(button) {
		this.buttons.set(button, !this.buttons.get(button));
	}
	has(button) {
		return this.buttons.get(button) ?? false;
	}

	calculateMousePosition(e) {
		// Calculate the canvas offsets
		const canvasOffsetX = this.$game.renderer.app.view.offsetLeft;
		const canvasOffsetY = this.$game.renderer.app.view.offsetTop;

		// Calculate the mouse position relative to the canvas
		const mouseX = (e.pageX - canvasOffsetX);
		const mouseY = (e.pageY - canvasOffsetY);

		this.cursor = [ mouseX, mouseY ];
	}

	onMouseDown(e) {
		e.preventDefault();
		e.stopPropagation();

		this.calculateMousePosition(e);
		this.buttons.set(e.button, true);

		this.events.onMouseDown.forEach((fn) => fn(this, e));
	}
	onMouseUp(e) {
		e.preventDefault();
		e.stopPropagation();

		this.calculateMousePosition(e);
		this.buttons.set(e.button, false);

		this.events.onMouseUp.forEach((fn) => fn(this, e));
	}
	onMouseMove(e) {
		e.preventDefault();
		e.stopPropagation();

		this.calculateMousePosition(e);

		this.events.onMouseMove.forEach((fn) => fn(this, e));
	}
	onClick(e) {
		e.preventDefault();
		e.stopPropagation();

		this.calculateMousePosition(e);

		this.events.onClick.forEach((fn) => fn(this, e));
	}
	onContextMenu(e) {
		e.preventDefault();
		e.stopPropagation();

		this.calculateMousePosition(e);

		this.events.onContextMenu.forEach((fn) => fn(this, e));
	}
};

export default MouseInput;