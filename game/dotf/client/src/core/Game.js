import * as PIXI from "pixi.js";
import Node from "../@node/Node";

import { GameLoop } from "./GameLoop.js";

export class Game extends Node {
	static Instances = new Map();
	static GetInstance(id) {
		let game;
		if(id) {
			return Game.Instances.get(id);
		} else {
			game = Game.Instances.values().next().value;
		}

		return game;
	}

	constructor ({ pixi = {}, loop = {}, ...self } = {}) {
		super({ ...self });

		//TODO: Ready to go, just need to refactor to use it
		// this.pixi = new PIXI.Application({
		// 	hello: "world",

		// 	backgroundColor: 0x000000,
		// 	resizeTo: window,
		// 	antialias: true,
		// 	preserveDrawingBuffer: true,
		// 	...pixi,
		// });
		this.loop = new GameLoop({
			...loop,

			/* Abstract this out to a method of the Game class */
			onTick: this.tick.bind(this),
		});

		Game.Instances.set(this.$id, this);
	}
	deconstructor() {
		Game.Instances.delete(this.$id);
	}

	tick({ dt, ip, startTime, lastTime, fps }) { }
	render() { }
};

export default Game;