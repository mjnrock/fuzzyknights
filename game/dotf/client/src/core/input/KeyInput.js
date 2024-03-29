import { IdentityClass } from "../../@node/Identity";

export class KeyInput extends IdentityClass {
	static LEFT = [ "ArrowLeft", "KeyA"];
	static RIGHT = [ "ArrowRight", "KeyD"];
	static UP = [ "ArrowUp", "KeyW"];
	static DOWN = [ "ArrowDown", "KeyS"];

	constructor ({ events = {}, $game, ...self } = {}) {
		super({ ...self });

		this.$game = $game;

		this.keys = new Map();

		this.events = {
			onKeyDown: [],
			onKeyUp: [],
			...events,
		};

		window.addEventListener("keydown", (e) => this.onKeyDown.call(this, e));
		window.addEventListener("keyup", (e) => this.onKeyUp.call(this, e));
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

	get hasShift() {
		return this.keys.get("ShiftLeft") || this.keys.get("ShiftRight");
	}
	get hasCtrl() {
		return this.keys.get("ControlLeft") || this.keys.get("ControlRight");
	}
	get hasAlt() {
		return this.keys.get("AltLeft") || this.keys.get("AltRight");
	}
	get hasMeta() {
		return this.keys.get("MetaLeft") || this.keys.get("MetaRight");
	}
	get metaKeys() {
		return {
			shift: this.hasShift,
			ctrl: this.hasCtrl,
			alt: this.hasAlt,
			meta: this.hasMeta,
		};
	}

	get hasLeft() {
		return KeyInput.LEFT.some((key) => this.keys.get(key));
	}
	get hasRight() {
		return KeyInput.RIGHT.some((key) => this.keys.get(key));
	}
	get hasUp() {
		return KeyInput.UP.some((key) => this.keys.get(key));
	}
	get hasDown() {
		return KeyInput.DOWN.some((key) => this.keys.get(key));
	}

	set(code, value) {
		this.keys.set(code, !!value);

		return this;
	}
	toggle(code) {
		this.keys.set(code, !this.keys.get(code));

		return this;
	}
	has(code) {
		return this.keys.get(code) ?? false;
	}

	onKeyDown(e) {
		if([ "F5", "F11", "F12" ].includes(e.code)) {
			return;
		}

		e.preventDefault();
		e.stopPropagation();

		this.keys.set(e.code, true);

		this.events.onKeyDown.forEach((fn) => fn(this, e));
	}
	onKeyUp(e) {
		if([ "F5", "F11", "F12" ].includes(e.code)) {
			return;
		}

		e.preventDefault();
		e.stopPropagation();

		this.keys.set(e.code, false);

		this.events.onKeyUp.forEach((fn) => fn(this, e));
	}
};

export default KeyInput;