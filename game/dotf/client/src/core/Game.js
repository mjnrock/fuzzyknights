import * as PIXI from "pixi.js";
import Node from "../@node/Node";

import { GameLoop } from "./GameLoop.js";
import Pixi from "./Pixi";

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

	constructor ({ nodes = {}, pixi = {}, loop = {}, $run, ...self } = {}) {
		super({ ...self, $run: false });

		this.nodes = typeof nodes === "function" ? nodes({ $game: this }) : nodes;

		this.pixi = new Pixi({
			$game: this,

			pixi,
			onRender: (...args) => this.render.call(this, ...args),
		});

		this.loop = new GameLoop({
			$game: this,

			...loop,
			onTick: (...args) => this.tick.call(this, ...args),
		});

		if($run) {
			this.init.call(this, ...(Array.isArray($run) ? $run : []));
		}

		Game.Instances.set(this.$id, this);
	}
	deconstructor() {
		Game.Instances.delete(this.$id);
	}

	tick({ dt, ip, startTime, lastTime, fps }) { }
	render() { }
};

export default Game;