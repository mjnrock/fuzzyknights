import * as PIXI from "pixi.js";
import { v4 as uuid } from "uuid";

import { Game } from "./Game.js";

import Entity from "./entity/Entity.js";
import Components from "./entity/components/package.js";


import { Realm } from "./world/Realm.js";
import { EntityManager } from "./entity/EntityManager.js";
import { Zone } from "./world/Zone.js";
console.log(new Realm());
console.log(new EntityManager());
console.log(new Zone());

export const EnumModelType = {
	CIRCLE: "CIRCLE",
	RECTANGLE: "RECTANGLE",
};

export const EnumEntityState = {
	IDLE: "IDLE",
	MOVING: "MOVING",
};

export const EnumTerrainType = {
	GRASS: { type: "GRASS", color: "#66cc66" },
	WATER: { type: "WATER", color: "#33ccff" },
	SAND: { type: "SAND", color: "#ffcc66" },
	DIRT: { type: "DIRT", color: "#996633" },
	SNOW: { type: "SNOW", color: "#ffffff" },
	ROCK: { type: "ROCK", color: "#999999" },
};

export async function main() {
	const game = new Game({
		$run: true,
		$init: (game) => {
			const pixi = game.renderer.app;

			//STUB: START FPS COUNTER
			const fpsText = new PIXI.Text("FPS: 0", { fill: 0xffffff });
			fpsText.x = 10;
			fpsText.y = 10;
			pixi.stage.addChild(fpsText);

			let i = 0,
				size = 500;
			const fpsWindow = [];
			pixi.ticker.add((delta) => {
				fpsWindow[ i ] = delta;
				++i;
				if(i >= size) i = 0;

				const avgDeltaInMilliseconds = fpsWindow.reduce((a, b) => a + b, 0) / size;
				const avgFPS = 1000 / avgDeltaInMilliseconds;
				fpsText.text = `FPS: ${ Math.round(avgFPS / 100) }`;

				// bring fpsText to the front
				pixi.stage.removeChild(fpsText);
				pixi.stage.addChild(fpsText);
			});
			//STUB: END FPS COUNTER
		},

		/* Config */
		config: {
			scale: 1.0,
			tiles: {
				width: 32,
				height: 32,
			},
		},
		/* Game Loop */
		loop: {
			start: true,
			fps: 30,
			onStart() {
				this.$game.renderer.app.ticker.start();
			},
			onStop() {
				this.$game.renderer.app.ticker.stop();
			},
		},
		/* Assets */
		assets: {},
		/* Input */
		input: {},
		/* Realm */
		realm: {},

		/* Players */
		players: {
			player: {
				observer: {},
				entity: new Entity({
					id: uuid(),
					tags: [],
					type: Entity.EnumType.CREATURE,

					...Components.Generators.DemoEntity({
						physics: {
							x: 3,
							y: 3,
							speed: 1.7,
						},
					}),
				}),
			},
		},
	});
	//#endregion

	console.log(game)
	console.log(game.players.player.entity);
	
	//STUB: Draw the player
	game.renderer.stage.addChild(game.players.player.entity.state.render.sprite);	
	const graphics = game.players.player.entity.state.render.sprite;
	graphics.beginFill("#fff", 1.0);
	graphics.drawRect(0, 0, game.config.tiles.width * game.config.scale, game.config.tiles.height * game.config.scale);
	graphics.endFill();
	graphics.x = game.players.player.entity.state.physics.x * game.config.tiles.width * game.config.scale; // game.config.scale the position
	graphics.y = game.players.player.entity.state.physics.y * game.config.tiles.height * game.config.scale; // game.config.scale the position

	return {
		game,
		nodes: game.$nodes,
	};
};

export default main;