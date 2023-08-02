import { IdentityClass } from "../../@node/Identity";

export class KeyInput extends IdentityClass {
	static LEFT = e => e.code === "ArrowLeft" || e.code === "KeyA";
	static RIGHT = e => e.code === "ArrowRight" || e.code === "KeyD";
	static UP = e => e.code === "ArrowUp" || e.code === "KeyW";
	static DOWN = e => e.code === "ArrowDown" || e.code === "KeyS";

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
		e.preventDefault();
		e.stopPropagation();

		this.keys.set(e.code, true);

		this.events.onKeyDown.forEach((fn) => fn(this, e));
	}
	onKeyUp(e) {
		e.preventDefault();
		e.stopPropagation();

		this.keys.set(e.code, false);

		this.events.onKeyUp.forEach((fn) => fn(this, e));
	}
};

export default KeyInput;