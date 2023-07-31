import * as PIXI from "pixi.js";
import { v4 as uuid } from "uuid";
import MainLoop from "mainloop.js";

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

export let State = {
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
		GRASS: { type: "GRASS", color: "#00ff00" },
		WATER: { type: "WATER", color: "#00ffff" },
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
	input: (input = {}) => ({
		keyMask: 0,
		...input,
	}),
	pixi: (pixi = {}) => ({
		scale: 2.5,
		app: new PIXI.Application({
			resizeTo: window,
		}),
		stage: new PIXI.Container(),
		...pixi,
	}),

	// WIP: This is a work-in-progress
	viewport: (viewport = {}) => ({
		layers: [],
		w: 25,	// tiles
		h: 25,	// tiles
		x: 0,	// tiles
		y: 0,	// tiles
		zoom: 1.00,	// 1 = 100%
		zoomStep: 0.03,	// 0.03 = 3%
		subject: (state) => {
			return {
				...state,
			};
		},	// (state, dt)=> [x,y,w,h,zoom]
		...viewport,
	}),
};

export const Reducers = {
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
	input: {
		handleKeyDown: (state, { code }) => {
			let updatedKeyMask = state.keyMask;
			switch(code) {
				case "KeyW":
					updatedKeyMask |= 0x01;
					break;
				case "KeyA":
					updatedKeyMask |= 0x02;
					break;
				case "KeyS":
					updatedKeyMask |= 0x04;
					break;
				case "KeyD":
					updatedKeyMask |= 0x08;
					break;
				default:
					break;
			}
			return {
				...state,
				keyMask: updatedKeyMask,
			};
		},
		handleKeyUp: (state, { code }) => {
			let updatedKeyMask = state.keyMask;
			switch(code) {
				case "KeyW":
					updatedKeyMask &= ~0x01;
					break;
				case "KeyA":
					updatedKeyMask &= ~0x02;
					break;
				case "KeyS":
					updatedKeyMask &= ~0x04;
					break;
				case "KeyD":
					updatedKeyMask &= ~0x08;
					break;
				default:
					break;
			}
			return {
				...state,
				keyMask: updatedKeyMask,
			};
		},
	},
	pixi: {
		register: (state, container) => {
			const next = { ...state };

			next.app.stage.addChild(container);

			return next;
		},
	},
	game: {
		merge: (state, data) => {
			return {
				...state,
				...data,
			};
		},
	}
};

export const Effects = {
	entities: {
		add: (node, entity) => {
			// Nodes.pixi.dispatchAsync("register", entity.render.sprite);
		},
		remove: (node, entity) => {
			Nodes.pixi.state.app.stage.removeChild(entity.render.sprite);
		},
	},
};

//STUB: Graphics pool
const graphicsPool = [];
let gpi = 0;
for(let i = 0; i < 100; i++) {
	graphicsPool.push(new PIXI.Graphics());
}

export const Nodes = Node.CreateMany({
	entities: {
		state: State.entities(),
		reducers: Reducers.entities,
		effects: Effects.entities,
	},
	terrain: {
		state: State.terrain(),
	},
	map: {
		state: State.map(),

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
	input: {
		state: State.input(),
		reducers: Reducers.input,
		events: {
			init: [
				(node) => {
					// Event listener for keydown event
					window.addEventListener("keydown", e => {
						Nodes.input.dispatch("handleKeyDown", { code: e.code });
					});

					// Event listener for keyup event
					window.addEventListener("keyup", e => {
						Nodes.input.dispatch("handleKeyUp", { code: e.code });
					});


					const pixi = Nodes.pixi.state.app;
					// Make the player look at the mouse as it moves
					window.addEventListener("mousemove", async e => {
						// Calculate the canvas offsets
						const canvasOffsetX = pixi.view.offsetLeft;
						const canvasOffsetY = pixi.view.offsetTop;

						// Calculate the mouse position relative to the canvas
						const mouseX = (e.pageX - canvasOffsetX);
						const mouseY = (e.pageY - canvasOffsetY);

						// update entity's theta position so that it faces the mouse
						const player = Nodes.entities.state.player;

						// Calculate angle to mouse and set it
						const dx = mouseX - (player.physics.x * Nodes.map.state.tw);
						const dy = mouseY - (player.physics.y * Nodes.map.state.th);

						player.physics.theta = Math.atan2(dy, dx);
					});
					window.addEventListener("click", async e => {
						// Calculate the canvas offsets
						const canvasOffsetX = pixi.view.offsetLeft;
						const canvasOffsetY = pixi.view.offsetTop;

						// Calculate the mouse position relative to the canvas
						const mouseX = (e.pageX - canvasOffsetX);
						const mouseY = (e.pageY - canvasOffsetY);

						// update entity's theta position so that it faces the mouse
						const player = Nodes.entities.state.player

						// Calculate angle to mouse and set it
						const dx = mouseX - (player.physics.x * Nodes.map.state.tw);
						const dy = mouseY - (player.physics.y * Nodes.map.state.th);

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
								speed: 32,
							},
							render: {
								sprite: graphicsPool[ gpi ]
							},
							state: {
								current: EnumEntityState.MOVING,
								default: EnumEntityState.MOVING,
							},
							model: {
								type: EnumModelType.CIRCLE,
								radius: 5,	//px
								ox: 0,	//px
								oy: 0,	//px
							},
						};

						entity.render.sprite.clear();

						// calculate the velocity of the entity
						entity.physics.vx = Math.cos(theta) * entity.physics.speed;
						entity.physics.vy = Math.sin(theta) * entity.physics.speed;

						//FIXME: This section proves the *gross* inefficiency of the Node dispatch system
						// Add the entity to the entities node
						// Nodes.entities.dispatchAsync("add", entity);
						Nodes.entities.state[ entity.$id ] = entity;
						Nodes.pixi.state.app.stage.addChild(entity.render.sprite);

						if(++gpi >= graphicsPool.length) gpi = 0;

						setTimeout(() => {
							// Nodes.entities.dispatchAsync("remove", entity);
							delete Nodes.entities.state[ entity.$id ];
							Nodes.pixi.state.app.stage.removeChild(entity.render.sprite);
						}, 1000);
					});
				},
			],
		},
	},
	pixi: {
		state: State.pixi(),
		reducers: Reducers.pixi,

		events: {
			init: [
				(node) => {
					const pixi = node.state.app;
					document.body.appendChild(pixi.view);

					// draw the map, using green Pixi Graphics objects of .tw and .th size at tx and ty positions
					const map = new PIXI.Container();
					for(let row = 0; row < Nodes.map.state.rows; row++) {
						for(let col = 0; col < Nodes.map.state.cols; col++) {
							const tile = Nodes.map.state.tiles[ row ][ col ];
							const terrain = Nodes.terrain.state[ tile.data ];
							const graphics = new PIXI.Graphics();

							graphics.beginFill(terrain.color);
							graphics.drawRect(0, 0, Nodes.map.state.tw * node.state.scale, Nodes.map.state.th * node.state.scale); // node.state.scale the dimensions
							graphics.endFill();
							graphics.x = tile.x * Nodes.map.state.tw * node.state.scale; // node.state.scale the position
							graphics.y = tile.y * Nodes.map.state.th * node.state.scale; // node.state.scale the position

							map.addChild(graphics);
						}
					}

					// seed the entities container with graphics objects
					const entities = new PIXI.Container();
					for(const id in Nodes.entities.state) {
						const graphics = new PIXI.Graphics();
						entities.addChild(graphics);

						Nodes.entities.state[ id ].render.sprite = graphics;
					}

					// add the map and entities to the stage
					pixi.stage.addChild(map);
					pixi.stage.addChild(entities);



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
					});
					//STUB: END FPS COUNTER
				},
			],
		},
	},
	game: {
		state: {
			fps: 30,
			renderHistory: [],
			debugFPSText: null,
		},
		reducers: Reducers.game,
		events: {
			init: [
				(node) => {
					MainLoop
						.setSimulationTimestep(1000 / 24)
						.setUpdate(delta => node.tick(delta / 1000))
						// .setDraw((ip) => node.render(ip))
						.start();

					Nodes.pixi.state.app.ticker.add((delta) => {
						node.render(delta / 1000);
					});
				},
			],
		},

		tick(dts) {
			// update the entities
			for(const id in Nodes.entities.state) {
				const entity = Nodes.entities.state[ id ];

				// calculate the new position of the entity and set it
				entity.physics.x += entity.physics.vx * dts;
				entity.physics.y += entity.physics.vy * dts;

			}

			// update player
			const player = Nodes.entities.state.player;

			if(Nodes.input.state.keyMask & 0x01) player.physics.vy = -player.physics.speed;
			else if(Nodes.input.state.keyMask & 0x04) player.physics.vy = player.physics.speed;
			else player.physics.vy = 0;

			if(Nodes.input.state.keyMask & 0x02) player.physics.vx = -player.physics.speed;
			else if(Nodes.input.state.keyMask & 0x08) player.physics.vx = player.physics.speed;
			else player.physics.vx = 0;

			player.physics.x += player.physics.vx * dts;
			player.physics.y += player.physics.vy * dts;
		},
		render(dts) {
			//FIXME: Instead, this should manipulate the meta data on the Pixi objects, as it won't require a re-render every frame
			// iterate through entities and draw the line towards the mouse
			for(const id in Nodes.entities.state) {
				const entity = Nodes.entities.state[ id ];
				const graphics = entity.render.sprite;

				// clear previous line
				graphics.clear();

				graphics.x = entity.physics.x * Nodes.map.state.tw;
				graphics.y = entity.physics.y * Nodes.map.state.th;

				// redraw entity
				if(entity.model.radius >= 10) {
					graphics.beginFill(0xff0000);
				} else {
					graphics.beginFill(0x666);
				}

				switch(entity.model.type) {
					case EnumModelType.CIRCLE:
						graphics.drawCircle(0, 0, entity.model.radius * Nodes.pixi.state.scale);
						break;
					case EnumModelType.RECTANGLE:
						graphics.drawRect(entity.model.ox * Nodes.pixi.state.scale, entity.model.oy * Nodes.pixi.state.scale, entity.model.width * Nodes.pixi.state.scale, entity.model.height * Nodes.pixi.state.scale);
						break;
					default:
						break;
				}
				graphics.endFill();
			}

			const player = Nodes.entities.state.player;
			const playerGraphics = player.render.sprite;

			playerGraphics.lineStyle(2, 0x0000FF, 1);
			playerGraphics.moveTo(0, 0);
			playerGraphics.lineTo(
				Math.cos(player.physics.theta) * 20 * Nodes.pixi.state.scale,
				Math.sin(player.physics.theta) * 20 * Nodes.pixi.state.scale
			);
		},
	},
	viewport: {
		state: State.viewport(),
	},
});

export async function main() {
	Nodes.map.init();
	Nodes.pixi.init();
	Nodes.game.init();
	Nodes.input.init();

	return Nodes;
};

export default main;