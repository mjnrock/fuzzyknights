//STUB: Example map import
import CommonDataMap from "../common/data/map/14802e55-defd-4ba4-a82f-697bc6f95c46.json";

import * as PIXI from "pixi.js";
import { v4 as uuid } from "uuid";

import { Game } from "./Game.js";

import Entity from "./entity/Entity.js";
import Components from "./entity/components/package.js";


import { Realm } from "./world/Realm.js";
import { EntityManager } from "./entity/EntityManager.js";
import { Zone } from "./world/Zone.js";
import { Factory } from "./world/package.js";

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
			//STUB: Create a generic Zone from a Mapski map
			game.realm.claim(Factory.genericWorlds([
				[
					{
						terrain: CommonDataMap?.terrain?.terrains,
						tiles: CommonDataMap?.map?.tiles,
						entities: [],
					},
				]
			]));


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
				observer: {
					zone: null,
					position: {
						x: 0,
						y: 0,
					},
					shape: {
						type: EnumModelType.RECTANGLE,
						width: 16,	// +/- 8
						height: 16,	// +/- 8
					},
					subject: () => ({
						x: game.players.player.entity.state.physics.x,
						y: game.players.player.entity.state.physics.y,
					}),
				},
				entity: new Entity({
					type: Entity.EnumType.CREATURE,

					...Components.Generators.DemoEntity({
						physics: {
							x: 3,
							y: 3,
							speed: 3.7,
						},
					}),

					tick({ observer, game, dt, ip, startTime, lastTime, fps }) { },
					draw({ observer, game, dt, now }) {
						const graphics = this.state.render.sprite;
						const entity = this.state;

						/* If the entity is within the observer's view, render it */
						graphics.visible = true;

						// clear previous line
						graphics.clear();

						graphics.x = entity.physics.x * game.config.tiles.width * game.config.scale;
						graphics.y = entity.physics.y * game.config.tiles.height * game.config.scale;

						// redraw entity
						graphics.beginFill("#FFF", 1.0);

						switch(entity.model.type) {
							case EnumModelType.CIRCLE:
								graphics.drawCircle(entity.model.ox * game.config.scale, entity.model.oy * game.config.scale, entity.model.radius * game.config.scale);
								break;
							case EnumModelType.RECTANGLE:
								graphics.drawRect(entity.model.ox * game.config.scale, entity.model.oy * game.config.scale, entity.model.width * game.config.scale, entity.model.height * game.config.scale);
								graphics.rotation = entity.physics.theta;
								break;
							default:
								break;
						}
						graphics.endFill();
					},
				}),
			},
		},

		tick({ dt, ip, startTime, lastTime, fps }) {
			const obj = {
				game: this,
				dt,
				ip,
				startTime,
				lastTime,
				fps,
			};

			this.input.tick(obj);
			this.realm.tick(obj);
		},
		draw({ dt, ip, now }) {
			const obj = {
				game: this,
				dt,
				ip,
				now,
			};

			this.realm.draw(obj);
		},
	});
	//#endregion

	const demoZone = game.realm.worlds[ 0 ].zones[ 0 ];
	demoZone.register(game.players.player.entity);
	game.renderer.stage.addChild(demoZone.stage);
	game.players.player.observer.zone = demoZone;

	return {
		game,
		nodes: game.$nodes,
	};
};

export default main;