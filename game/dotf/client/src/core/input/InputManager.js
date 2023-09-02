import { IdentityClass } from "../../@node/Identity";

import KeyInput from "./KeyInput";
import MouseInput from "./MouseInput";

export class InputManager extends IdentityClass {
	constructor ({ $game, key, mouse, ...args } = {}) {
		super({ ...args });

		this.$game = $game;

		this.key = new KeyInput({ $game, key });
		this.mouse = new MouseInput({ $game, mouse });
	}

	tick({ observer, game, dt, ip, startTime, lastTime, fps }) {
		const { player: { entity } } = game.realm.current;
		const playerState = entity.state;

		if(this.key.hasUp) playerState.physics.vy = -playerState.physics.speed;
		else if(this.key.hasDown) playerState.physics.vy = playerState.physics.speed;
		else playerState.physics.vy = 0;

		if(this.key.hasLeft) playerState.physics.vx = -playerState.physics.speed;
		else if(this.key.hasRight) playerState.physics.vx = playerState.physics.speed;
		else playerState.physics.vx = 0;

		playerState.physics.x += playerState.physics.vx * dt;
		playerState.physics.y += playerState.physics.vy * dt;

		let [ mouseX, mouseY ] = this.mouse.cursor || [];

		// Calculate angle to mouse and set it
		const dx = mouseX - (playerState.physics.x * game.config.tiles.width * game.config.scale);
		const dy = mouseY - (playerState.physics.y * game.config.tiles.height * game.config.scale);

		const theta = Math.atan2(dy, dx);
		playerState.physics.theta = theta;
	}
	draw({ observer, game, dt }) { }
};

export default InputManager;