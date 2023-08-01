import Node from "../@node/Node";

import { GameLoop } from "./GameLoop.js";

export class Game extends Node {
	constructor ({ loop = {}, ...rest } = {}) {
		super({ ...rest });

		this.loop = new GameLoop({
			...loop,
			onTick: this.tick.bind(this),
		});
	}

	tick({ dt, ip, startTime, lastTime, fps }) { }
	render() { }
};

export default Game;