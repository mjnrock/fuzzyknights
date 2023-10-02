import * as PIXI from "pixi.js";
import { v4 as uuid } from "uuid";

import { Game } from "./Game.js";

// import Chord from "@lespantsfancy/chord";
import Entity from "./entity/Entity.js";
import { World } from "./world/World.js";
import { Zone } from "./world/Zone.js";

//STUB: Example map import
import CommonDataMap from "../common/data/map/14802e55-defd-4ba4-a82f-697bc6f95c46.json";

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

export const drawTerrainTiles = ({ game, zone, parent }) => {
	for(let row = 0; row < zone.rows; row++) {
		for(let col = 0; col < zone.columns; col++) {
			const tile = zone.tiles[ row ][ col ];
			const terrain = EnumTerrainType[ tile.data ];

			const graphics = new PIXI.Graphics();

			graphics.beginFill(terrain.color, 1.0);
			graphics.drawRect(0, 0, game.config.tiles.width * game.config.scale, game.config.tiles.height * game.config.scale);
			graphics.endFill();
			graphics.x = tile.x * game.config.tiles.width * game.config.scale; // game.config.scale the position
			graphics.y = tile.y * game.config.tiles.height * game.config.scale; // game.config.scale the position

			if(parent) {
				parent.addChild(graphics);
			}
		}
	}
};

export const summonFireball = (self, e) => {
	const { $game: game } = self;
	const [ mouseX, mouseY ] = self.cursor;

	const { zone, player: { entity: player } } = game.realm.current;

	// Calculate angle to mouse and set it
	const dx = mouseX - (player.physics.x * game.config.tiles.width * game.config.scale);
	const dy = mouseY - (player.physics.y * game.config.tiles.height * game.config.scale);

	const theta = Math.atan2(dy, dx);

	// Use the mouse position to create a new entity projection
	const entity = new Entity({
		$id: uuid(),
		$tags: [],
		type: "EFFECT",

		physics: {
			x: player.physics.x,
			y: player.physics.y,
			theta,
			vtheta: 0,
			speed: 12,
		},
		render: {
			sprite: new PIXI.Graphics(),
		},
		state: {
			current: EnumEntityState.MOVING,
			default: EnumEntityState.MOVING,
		},
		model: {
			type: EnumShape.CIRCLE,
			radius: 6,	//px
			ox: 0,	//px
			oy: 0,	//px
		},
	});

	entity.render.sprite.clear();

	// calculate a random "margin of error" to apply to the arrow (theta (radians) : variance (radians) : direction (+/-))
	const thetaError = theta + (Math.random() * 0.12) * (Math.random() < 0.5 ? -1 : 1);

	// calculate the velocity of the entity
	entity.physics.vx = Math.cos(thetaError) * entity.physics.speed;
	entity.physics.vy = Math.sin(thetaError) * entity.physics.speed;
	entity.physics.theta = thetaError;

	// Add the entity to the entities node
	//TODO: A .register should handle the stage.addChild as well
	zone.entities.collections.EFFECT.register(entity);
	game.renderer.app.stage.addChild(entity.render.sprite);

	// STUB: This will destroy the entities after 1 second, even if the Game is paused.
	setTimeout(() => {
		zone.entities.collections.EFFECT.unregister(entity);
		game.renderer.app.stage.removeChild(entity.render.sprite);
	}, 2500);
};
export const summonArrow = (self, e) => {
	const { $game: game } = self;
	const [ mouseX, mouseY ] = self.cursor;

	const { zone, player: { entity: player } } = game.realm.current;

	// Calculate angle to mouse and set it
	const dx = mouseX - (player.physics.x * game.config.tiles.width * game.config.scale);
	const dy = mouseY - (player.physics.y * game.config.tiles.height * game.config.scale);

	const theta = Math.atan2(dy, dx);

	// Use the mouse position to create a new entity projection
	const entity = new Entity({
		$id: uuid(),
		$tags: [],
		type: "EFFECT",

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
			type: EnumShape.RECTANGLE,
			width: 16,	//px
			height: 1,	//px
			ox: 0,	//px
			oy: 0,	//px
		},
	});

	entity.render.sprite.clear();

	// calculate a random "margin of error" to apply to the arrow (theta : moe/variance : direction)
	const thetaError = theta + (Math.random() * 0.17) * (Math.random() < 0.5 ? -1 : 1);

	// calculate the velocity of the entity
	entity.physics.vx = Math.cos(thetaError) * entity.physics.speed;
	entity.physics.vy = Math.sin(thetaError) * entity.physics.speed;
	entity.physics.theta = thetaError;

	// Add the entity to the entities node
	zone.entities.collections.EFFECT.register(entity);
	game.renderer.app.stage.addChild(entity.render.sprite);

	// STUB: This will destroy the entities after 1 second, even if the Game is paused.
	setTimeout(() => {
		zone.entities.collections.EFFECT.unregister(entity);
		game.renderer.app.stage.removeChild(entity.render.sprite);
	}, 1000);
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
		/* PixiJS Rendering */
		pixi: {},
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

		realm: {},

		players: {
			player: {
				observer: {},
				entity: new Entity({
					$id: uuid(),
					$tags: [],
					type: "CREATURE",

					physics: {
						x: 0,
						y: 0,
						theta: 0,

						vx: 0,
						vy: 0,
						vtheta: 0,

						speed: 1.33,
					},
					render: {
						sprite: new PIXI.Graphics(),
					},
					state: {
						current: "IDLE",
						default: "IDLE",
					},
					model: {
						type: "CIRCLE",
						radius: 10,	//px
						ox: 0,	//px
						oy: 0,	//px
					},
				}),
			},
		},

		/* Extra methods */
		tick({ dt: dts, ip, startTime, lastTime, fps }) {
			const { player: { entity: player } } = game.realm.current;

			this.realm.tick({ dt: dts, ip, startTime, lastTime, fps });

			//TODO: Move this to the appropriate Input manager's .tick() method
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
			const dx = mouseX - (player.physics.x * game.config.tiles.width * game.config.scale);
			const dy = mouseY - (player.physics.y * game.config.tiles.height * game.config.scale);

			const theta = Math.atan2(dy, dx);
			player.physics.theta = theta;
		},
		draw(delta) {
			const { player: { entity: player } } = game.realm.current;

			this.realm.draw({ dt: delta });

			const [ playerGraphics ] = player.render.sprite.children;

			// draw a triangle that follows the mouse and if "in front" of the player, draw it in front of the player
			playerGraphics.rotation = player.physics.theta;

			playerGraphics.beginFill(0x00ff00, 1.0);
			playerGraphics.drawPolygon([
				3 + player.model.radius * this.config.scale, -5 * this.config.scale,
				3 + player.model.radius * this.config.scale, 5 * this.config.scale,
				3 + (player.model.radius * this.config.scale) / 2 * this.config.scale, 0,
			]);
			playerGraphics.endFill();
		},
	});

	//#region Initialize the map
	game.realm.worlds.overworld = new World({ $realm: game.realm });
	game.realm.worlds.overworld.zones.A = new Zone({
		$world: game.realm.worlds.overworld,
		tiles: CommonDataMap.map.tiles,

		tick: function ({ observer, dt, ip, startTime, lastTime, fps }) {
			if(observer.subject) {
				/* If the observer has a subject, retrieve the x,y position from it and set accordingly */
				let { x: dx, y: dy } = observer.subject({ dt, ip, startTime, lastTime, fps });

				observer.position.x = dx;
				observer.position.y = dy;
			}

			if(observer.shape.type === EnumShape.RECTANGLE) {
				/* only update the tiles that are visible to the observer, with the observer at the center */
				const { x, y } = observer.position;
				const { width, height } = observer.shape;

				/* Calculate the edges of the bounding box of the observer's view */
				const rowStart = Math.max(0, Math.floor(y - (height / 2)));
				const rowEnd = Math.min(this.rows, Math.ceil(y + (height / 2)));
				const colStart = Math.max(0, Math.floor(x - (width / 2)));
				const colEnd = Math.min(this.columns, Math.ceil(x + (width / 2)));

				for(const entity of this.entities) {
					if(entity.physics) {
						const { x, y } = entity.physics;

						if(x >= colStart && x <= colEnd && y >= rowStart && y <= rowEnd) {
							/* If the entity is within the observer's view, tick it */
							entity.physics.x += entity.physics.vx * dt;
							entity.physics.y += entity.physics.vy * dt;

							entity.tick({ observer, dt, ip, startTime, lastTime, fps });
						}
						// else {
						// 	console.log(entity.$id)
						// 	this.entities.unregister(entity);
						// }
					}
				}
			}
		},
		draw: function ({ observer, dt }) {
			//TODO: Lock the screen to the player, with the player at the center
			if(observer.shape.type === EnumShape.RECTANGLE) {
				/* only update the tiles that are visible to the observer, with the observer at the center */
				const { x, y } = observer.position;
				const { width, height } = observer.shape;

				/* Calculate the edges of the bounding box of the observer's view */
				const rowStart = Math.max(0, Math.floor(y - (height / 2)));
				const rowEnd = Math.min(this.rows, Math.ceil(y + (height / 2)));
				const colStart = Math.max(0, Math.floor(x - (width / 2)));
				const colEnd = Math.min(this.columns, Math.ceil(x + (width / 2)));

				for(const entity of this.entities) {
					if(entity.physics) {
						const { x, y } = entity.physics;
						const graphics = entity.render.sprite;

						if(x >= colStart && x <= colEnd && y >= rowStart && y <= rowEnd) {
							/* If the entity is within the observer's view, render it */
							graphics.visible = true;

							// clear previous line
							graphics.clear();

							graphics.x = entity.physics.x * game.config.tiles.width * game.config.scale;
							graphics.y = entity.physics.y * game.config.tiles.height * game.config.scale;

							// redraw entity
							if(entity.model.radius >= 10) {
								graphics.beginFill(0xff0000, 1.0);
							} else if(entity.model.radius >= 5) {
								graphics.beginFill("#ff9900", 1.0);
							} else {
								graphics.beginFill("#86592d", 1.0);
							}

							switch(entity.model.type) {
								case EnumShape.CIRCLE:
									graphics.drawCircle(entity.model.ox * game.config.scale, entity.model.oy * game.config.scale, entity.model.radius * game.config.scale);
									break;
								case EnumShape.RECTANGLE:
									graphics.drawRect(entity.model.ox * game.config.scale, entity.model.oy * game.config.scale, entity.model.width * game.config.scale, entity.model.height * game.config.scale);
									graphics.rotation = entity.physics.theta;
									break;
								default:
									break;
							}
							graphics.endFill();

							// entity.draw({ observer, dt });
						} else {
							/* If it's not, hide it */
							graphics.visible = false;
						}
					}
				}
			}
		}
	});
	//#endregion


	//#region Initialize the input controllers
	game.input.mouse.addEventListener("onClick", summonArrow);
	game.input.mouse.addEventListener("onContextMenu", summonFireball);
	//#endregion

	//#region Initialize the terrain graphics
	const pixi = game.renderer.app;
	document.body.appendChild(pixi.view);

	const map = new PIXI.Container();
	drawTerrainTiles({ game, zone: game.realm.worlds.overworld.zones.A, parent: map });
	pixi.stage.addChild(map);
	//#endregion


	//#region Initialize the entity graphics
	game.realm.worlds.overworld.zones.A.entities.collections.CREATURE.register(game.players.player.entity, "player");
	game.players.player.observer = {
		zone: game.realm.worlds.overworld.zones.A,
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
			x: game.players.player.entity.physics.x,
			y: game.players.player.entity.physics.y,
		}),
	};

	// seed the entities container with graphics objects
	for(const entity of game.players.player.observer.zone.entities.collections.CREATURE) {
		pixi.stage.addChild(entity.render.sprite);

		//STUB: Add a child graphics object to the entity's sprite for debugging stuff (e.g. facing triangle)
		entity.render.sprite.addChild(new PIXI.Graphics());
	}
	//#endregion

	return {
		game,
		nodes: game.$nodes,
	};
};

export default main;