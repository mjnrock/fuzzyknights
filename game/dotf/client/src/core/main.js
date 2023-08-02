import * as PIXI from "pixi.js";
import { v4 as uuid } from "uuid";

import { Game } from "./Game.js";

// import Chord from "@lespantsfancy/chord";
import Node from "../@node/Node";

export const EnumModelType = {
	CIRCLE: "CIRCLE",
	RECTANGLE: "RECTANGLE",
};

export const EnumEntityState = {
	IDLE: "IDLE",
	MOVING: "MOVING",
};

export let State = ({ $game }) => ({
	entities: (entities = {}) => ({
		player: {
			$id: uuid(),
			$tags: [],

			physics: {
				x: 0,
				y: 0,
				theta: 0,

				vx: 0,
				vy: 0,
				vtheta: 0,

				speed: 4.20,
			},
			render: {
				sprite: new PIXI.Sprite(),
			},
			state: {
				current: EnumEntityState.IDLE,
				default: EnumEntityState.IDLE,
			},
			model: {
				type: EnumModelType.CIRCLE,
				radius: 10,	//px
				ox: 0,	//px
				oy: 0,	//px
			},
		},
		...entities,
	}),
	terrain: (terrain = {}) => ({
		GRASS: { type: "GRASS", color: "#66cc66" },
		WATER: { type: "WATER", color: "#33ccff" },
		...terrain,
	}),
	map: (map = {}) => ({
		rows: 15,
		cols: 15,
		tw: 32,
		th: 32,
		tiles: [],
		...map,
	}),
});

export const Reducers = ({ $game }) => ({
	entities: {
		add: (state, entity) => {
			return {
				...state,
				[ entity.$id ]: entity,
			};
		},
		remove: (state, entity) => {
			let next = { ...state };
			delete next[ entity.$id ];

			return next;
		},
	},
});

export const Effects = ({ $game }) => ({
	entities: {
		add: (node, entity) => {
			$game.pixi.register(entity.render.sprite);
		},
		remove: (node, entity) => {
			$game.pixi.unregister(entity.render.sprite);
		},
	},
});

export const Nodes = ({ $game }) => Node.CreateMany({
	entities: {
		state: State({ $game }).entities(),
		reducers: Reducers({ $game }).entities,
		effects: Effects({ $game }).entities,
	},
	terrain: {
		state: State({ $game }).terrain(),
	},
	map: {
		state: State({ $game }).map(),

		events: {
			init: [
				(node) => {
					const dropDice = (sides = 2) => {
						const roll = ~~(Math.random() * sides);

						if(roll === 0) {
							return "GRASS";
						} else if(roll === 1) {
							return "WATER";
						}
					};

					// generate the map
					for(let row = 0; row < node.state.rows; row++) {
						node.state.tiles[ row ] = [];
						for(let col = 0; col < node.state.cols; col++) {
							node.state.tiles[ row ][ col ] = {
								x: col,
								y: row,
								data: dropDice(),
							};
						}
					}
				},
			],
		},
	},
});

export async function main() {
	const game = new Game({
		$nodes: Nodes,

		config: {
			scale: 2.5,
		},

		loop: {
			start: true,
			fps: 24,
			onStart() {
				this.$game.pixi.app.ticker.start();
			},
			onStop() {
				this.$game.pixi.app.ticker.stop();
			},
		},

		tick({ dt: dts, ip, startTime, lastTime, fps }) {
			// update the entities
			for(const id in this.$nodes.entities.state) {
				const entity = this.$nodes.entities.state[ id ];

				// calculate the new position of the entity and set it
				entity.physics.x += entity.physics.vx * dts;
				entity.physics.y += entity.physics.vy * dts;
			}

			// update player
			const player = this.$nodes.entities.state.player;

			if(this.input.key.hasUp) player.physics.vy = -player.physics.speed;
			else if(this.input.key.hasDown) player.physics.vy = player.physics.speed;
			else player.physics.vy = 0;

			if(this.input.key.hasLeft) player.physics.vx = -player.physics.speed;
			else if(this.input.key.hasRight) player.physics.vx = player.physics.speed;
			else player.physics.vx = 0;

			player.physics.x += player.physics.vx * dts;
			player.physics.y += player.physics.vy * dts;

			let [ mouseX, mouseY ] = this.input.mouse.cursor || [];

			// Calculate angle to mouse and set it
			const dx = mouseX - (player.physics.x * this.$nodes.map.state.tw);
			const dy = mouseY - (player.physics.y * this.$nodes.map.state.th);

			const theta = Math.atan2(dy, dx);
			player.physics.theta = theta;
		},
		render(delta) {
			//FIXME: Instead, this should manipulate the meta data on the Pixi objects, as it won't require a re-render every frame
			// iterate through entities and draw the line towards the mouse
			for(const id in this.$nodes.entities.state) {
				const entity = this.$nodes.entities.state[ id ];
				const graphics = entity.render.sprite;

				// clear previous line
				graphics.clear();

				graphics.x = entity.physics.x * this.$nodes.map.state.tw;
				graphics.y = entity.physics.y * this.$nodes.map.state.th;

				// redraw entity
				if(entity.model.radius >= 10) {
					graphics.beginFill(0xff0000, 1.0);
				} else if(entity.model.radius >= 5) {
					graphics.beginFill("#ff9900", 1.0);
				} else {
					graphics.beginFill("#86592d", 1.0);
				}

				switch(entity.model.type) {
					case EnumModelType.CIRCLE:
						graphics.drawCircle(entity.model.ox * this.config.scale, entity.model.oy * this.config.scale, entity.model.radius * this.config.scale);
						break;
					case EnumModelType.RECTANGLE:
						graphics.drawRect(entity.model.ox * this.config.scale, entity.model.oy * this.config.scale, entity.model.width * this.config.scale, entity.model.height * this.config.scale);
						graphics.rotation = entity.physics.theta;
						break;
					default:
						break;
				}
				graphics.endFill();
			}

			const player = this.$nodes.entities.state.player;
			const playerGraphics = player.render.sprite;

			// draw a triangle that follows the mouse and if "in front" of the player, draw it in front of the player
			playerGraphics.x = player.physics.x * this.$nodes.map.state.tw;
			playerGraphics.y = player.physics.y * this.$nodes.map.state.th;
			playerGraphics.rotation = player.physics.theta;

			playerGraphics.beginFill(0x00ff00, 1.0);
			playerGraphics.drawPolygon([
				3 + player.model.radius * this.config.scale, -5 * this.config.scale,
				3 + player.model.radius * this.config.scale, 5 * this.config.scale,
				3 + (player.model.radius * this.config.scale) / 2 * this.config.scale, 0,
			]);
			playerGraphics.endFill();
		},

		$run: true,
		$init: (game) => {
			const pixi = game.pixi.app;

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
	});

	//#region Initialize the map
	game.$nodes.map.init();
	//#endregion


	//#region Initialize the input controllers
	game.input.mouse.addEventListener("onContextMenu", (self, e) => {
		const [ mouseX, mouseY ] = self.cursor;

		// update entity's theta position so that it faces the mouse
		const player = game.$nodes.entities.state.player

		// Calculate angle to mouse and set it
		const dx = mouseX - (player.physics.x * game.$nodes.map.state.tw);
		const dy = mouseY - (player.physics.y * game.$nodes.map.state.th);

		const theta = Math.atan2(dy, dx);

		// Use the mouse position to create a new entity projection
		const entity = {
			$id: uuid(),
			$tags: [],
			physics: {
				x: player.physics.x,
				y: player.physics.y,
				theta,
				vtheta: 0,
				speed: 24,
			},
			render: {
				sprite: new PIXI.Graphics(),
			},
			state: {
				current: EnumEntityState.MOVING,
				default: EnumEntityState.MOVING,
			},
			model: {
				type: EnumModelType.CIRCLE,
				radius: 6,	//px
				ox: 0,	//px
				oy: 0,	//px
			},
		};

		entity.render.sprite.clear();

		// calculate a random "margin of error" to apply to the arrow (theta (radians) : variance (radians) : direction (+/-))
		const thetaError = theta + (Math.random() * 0.12) * (Math.random() < 0.5 ? -1 : 1);

		// calculate the velocity of the entity
		entity.physics.vx = Math.cos(thetaError) * entity.physics.speed;
		entity.physics.vy = Math.sin(thetaError) * entity.physics.speed;
		entity.physics.theta = thetaError;

		// Add the entity to the entities node
		game.$nodes.entities.dispatch("add", entity);

		// STUB: This will destroy the entities after 1 second, even if the Game is paused.
		setTimeout(() => {
			game.$nodes.entities.dispatch("remove", entity);
		}, 2500);
	});
	game.input.mouse.addEventListener("onClick", (self, e) => {
		const [ mouseX, mouseY ] = self.cursor;

		// update entity's theta position so that it faces the mouse
		const player = game.$nodes.entities.state.player

		// Calculate angle to mouse and set it
		const dx = mouseX - (player.physics.x * game.$nodes.map.state.tw);
		const dy = mouseY - (player.physics.y * game.$nodes.map.state.th);

		const theta = Math.atan2(dy, dx);

		// Use the mouse position to create a new entity projection
		const entity = {
			$id: uuid(),
			$tags: [],
			physics: {
				x: player.physics.x,
				y: player.physics.y,
				theta,
				vtheta: 0,
				speed: 48,
			},
			render: {
				sprite: new PIXI.Graphics(),
			},
			state: {
				current: EnumEntityState.MOVING,
				default: EnumEntityState.MOVING,
			},
			model: {
				type: EnumModelType.RECTANGLE,
				width: 16,	//px
				height: 1,	//px
				ox: 0,	//px
				oy: 0,	//px
			},
		};

		entity.render.sprite.clear();

		// calculate a random "margin of error" to apply to the arrow (theta : moe/variance : direction)
		const thetaError = theta + (Math.random() * 0.17) * (Math.random() < 0.5 ? -1 : 1);

		// calculate the velocity of the entity
		entity.physics.vx = Math.cos(thetaError) * entity.physics.speed;
		entity.physics.vy = Math.sin(thetaError) * entity.physics.speed;
		entity.physics.theta = thetaError;

		// Add the entity to the entities node
		game.$nodes.entities.dispatch("add", entity);

		// STUB: This will destroy the entities after 1 second, even if the Game is paused.
		setTimeout(() => {
			game.$nodes.entities.dispatch("remove", entity);
		}, 1000);
	});
	//#endregion

	//#region Initialize the terrain and entity graphics
	const pixi = game.pixi.app;
	document.body.appendChild(pixi.view);

	// draw the map, using green Pixi Graphics objects of .tw and .th size at tx and ty positions
	const map = new PIXI.Container();
	for(let row = 0; row < game.$nodes.map.state.rows; row++) {
		for(let col = 0; col < game.$nodes.map.state.cols; col++) {
			const tile = game.$nodes.map.state.tiles[ row ][ col ];
			const terrain = game.$nodes.terrain.state[ tile.data ];
			const graphics = new PIXI.Graphics();

			graphics.beginFill(terrain.color, 1.0);
			graphics.drawRect(0, 0, game.$nodes.map.state.tw * game.config.scale, game.$nodes.map.state.th * game.config.scale); // game.config.scale the dimensions
			graphics.endFill();
			graphics.x = tile.x * game.$nodes.map.state.tw * game.config.scale; // game.config.scale the position
			graphics.y = tile.y * game.$nodes.map.state.th * game.config.scale; // game.config.scale the position

			map.addChild(graphics);
		}
	}

	// seed the entities container with graphics objects
	const entities = new PIXI.Container();
	for(const id in game.$nodes.entities.state) {
		const graphics = new PIXI.Graphics();
		entities.addChild(graphics);

		game.$nodes.entities.state[ id ].render.sprite = graphics;
	}

	// add the map and entities to the stage
	pixi.stage.addChild(map);
	pixi.stage.addChild(entities);
	//#endregion

	return {
		game,
		nodes: game.$nodes,
	};
};

export default main;