import * as PIXI from "pixi.js";
import { IdentityClass } from "../../@node/Identity";

export class Pixi extends IdentityClass {
	constructor ({ pixi, stage, onDraw, $game, ...self } = {}) {
		super({ ...self });

		this.$game = $game;

		this.app = new PIXI.Application({
			hello: "world",

			backgroundColor: 0x000000,
			resizeTo: window,
			antialias: true,
			preserveDrawingBuffer: true,
			...pixi,
		});
		this.stage = stage ?? new PIXI.Container();

		this.app.stage = this.stage;		
		this.app.ticker.add((delta) => onDraw(delta / 1000));
	}

	get size() {
		return {
			width: this.app.renderer.width,
			height: this.app.renderer.height,
		};
	}

	register(container) {
		this.app.stage.addChild(container);

		return this;
	}
	unregister(container) {
		this.app.stage.removeChild(container);

		return this;
	}
};

export default Pixi;