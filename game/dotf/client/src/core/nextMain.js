//STUB: Example map import
import CommonDataMap from "../common/data/map/14802e55-defd-4ba4-a82f-697bc6f95c46.json";

import { v4 as uuid } from "uuid";
import * as PIXI from "pixi.js";

import { Game } from "./Game.js";

import Entity from "./entity/Entity.js";
import Components from "./entity/components/package.js";


import { Realm } from "./world/Realm.js";
import { EntityManager } from "./entity/EntityManager.js";
import { Zone } from "./world/Zone.js";
import { Factory } from "./world/package.js";
import Observer from "./viewport/Observer";
import { View } from "./viewport/View";

export const EnumShape = {
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

//TODO: Create a few test Entities to ensure .tick and .draw are working properly
const stubEntities = [
	new Entity({ type: Entity.EnumType.CREATURE, ...Components.Generators.DemoEntity({ physics: { x: 8, y: 8, speed: 3.7 } }) }),
	new Entity({ type: Entity.EnumType.CREATURE, ...Components.Generators.DemoEntity({ physics: { x: 16, y: 16, speed: 3.7 } }) }),
	new Entity({ type: Entity.EnumType.CREATURE, ...Components.Generators.DemoEntity({ physics: { x: 24, y: 24, speed: 3.7 } }) }),
];

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


			game.viewport.current.prepend(new View({
				observer: game.players.player.observer,
			}));

			//STUB: START FPS COUNTER
			const pixi = game.renderer.app;
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
				observer: new Observer({
					zone: null,
					position: {
						x: 0,
						y: 0,
					},
					shape: {
						type: EnumShape.RECTANGLE,
						width: 16,	// +/- 8
						height: 16,	// +/- 8
					},
					subject: () => ({
						x: game.players.player.entity.state.physics.x,
						y: game.players.player.entity.state.physics.y,
					}),
				}),
				entity: new Entity({
					type: Entity.EnumType.CREATURE,

					...Components.Generators.DemoEntity({
						physics: {
							x: 8,
							y: 8,
							speed: 3.7,
						},
					}),
				}),
			},
		},

		viewport: {},
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