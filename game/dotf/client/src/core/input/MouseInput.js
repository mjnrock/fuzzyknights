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
			onContextMenu: [],
			...events,
		};

		this.$game.pixi.app.view.addEventListener("mousedown", (e) => this.onMouseDown.call(this, e));
		this.$game.pixi.app.view.addEventListener("mouseup", (e) => this.onMouseUp.call(this, e));
		this.$game.pixi.app.view.addEventListener("mousemove", (e) => this.onMouseMove.call(this, e));
		this.$game.pixi.app.view.addEventListener("contextmenu", (e) => this.onMouseMove.call(this, e));
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

	onMouseDown(e) {
		e.preventDefault();
		e.stopPropagation();

		this.buttons.set(e.button, true);
		this.cursor = [ e.pageX, e.pageY ];

		this.events.onMouseDown.forEach((fn) => fn(this, e));
	}
	onMouseUp(e) {
		e.preventDefault();
		e.stopPropagation();

		this.buttons.set(e.button, false);
		this.cursor = [ e.pageX, e.pageY ];

		this.events.onMouseUp.forEach((fn) => fn(this, e));
	}
	onMouseMove(e) {
		e.preventDefault();
		e.stopPropagation();

		this.cursor = [ e.pageX, e.pageY ];

		this.events.onMouseMove.forEach((fn) => fn(this, e));
	}
	onContextMenu(e) {
		e.preventDefault();
		e.stopPropagation();

		this.cursor = [ e.pageX, e.pageY ];

		this.events.onContextMenu.forEach((fn) => fn(this, e));
	}
};

export default MouseInput;