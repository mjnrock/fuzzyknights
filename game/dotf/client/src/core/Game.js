import Node from "../@node/Node";

import { GameLoop } from "./GameLoop.js";

export class Game extends Node {
	constructor ({ loop = {}, ...self } = {}) {
		super({ ...self });

		this.loop = new GameLoop({
			...loop,

			/* Abstract this out to a method of the Game class */
			onTick: this.tick.bind(this),
		});
	}

	tick({ dt, ip, startTime, lastTime, fps }) { }
	render() { }
};

export default Game;