import Node from "../@node/Node";

import { GameLoop } from "./GameLoop.js";

export class Game extends Node {
	static Instances = new Map();
	static GetInstance(id) {
		if(id) {
			return Game.Instances.get(id);
		}

		return Game.Instances.values().next().value;
	}

	constructor ({ loop = {}, ...self } = {}) {
		super({ ...self });

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