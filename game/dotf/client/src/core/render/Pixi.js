import * as PIXI from "pixi.js";
import { IdentityClass } from "../../@node/Identity";

export class Pixi extends IdentityClass {
	constructor ({ pixi, stage, onRender, $game, ...self } = {}) {
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
		
		this.app.ticker.add((delta) => onRender(delta / 1000));
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