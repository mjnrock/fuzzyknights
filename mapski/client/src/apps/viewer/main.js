import * as PIXI from "pixi.js";
import { Node } from "../../lib/Node";
import Base64 from "../../util/Base64";

import { TerrainDict } from "./data/TerrainMap.js";

import FS_SavedMap from "./data/maps/TEST.json";

export const Reducers = {
	terrain: {
		/**
		 * Load the terrain map enum data
		 */
		load: async (state, data) => {
			const merge = {
				...data.terrains,
			};

			for(let key in merge) {
				const { texture } = merge[ key ];
				if(typeof texture === "string" && !texture.startsWith("#")) {
					merge[ key ].texture = await Base64.Decode(texture);
				}
			}

			return {
				...state,
				...merge,
			};
		},
	},
	map: {
		/**
		 * Load the map schema data and convert it into terrain data
		 */
		load: (state, data) => {
			return {
				...state,
				...data,
			};
		},
	},
	pixi: {
		load: async (state, data) => {
			// take the terrain data and create the baseTextures and sprites
			const terrain = State?.terrain?.state;
			const next = {
				...state,
				assets: {},
				sprites: {},  // We initialize the sprites object here
				stage: new PIXI.Container(), // assuming PIXI.Container is initialized
			};

			for(let key in terrain) {
				const { texture } = terrain[ key ];
				if(texture instanceof HTMLCanvasElement) {
					next.assets[ key ] = PIXI.Texture.from(texture);
				} else if(texture.startsWith("#")) {
					const canvas = document.createElement('canvas');
					canvas.width = 1;
					canvas.height = 1;
					const context = canvas.getContext('2d');
					context.fillStyle = texture;
					context.fillRect(0, 0, 1, 1);
					next.assets[ key ] = PIXI.Texture.from(canvas);
				}
			}

			// Populating stage and sprites
			for(let y = 0; y < State?.map?.state?.tiles.length; y++) {
				const row = State?.map?.state?.tiles[ y ];
				for(let x = 0; x < row.length; x++) {
					const currentTile = row[ x ];

					// Create a sprite with the appropriate texture
					let sprite = new PIXI.Sprite(next.assets[ currentTile.data ]);

					// Set the sprite's position
					sprite.x = x * State?.map?.state?.tw * State?.viewport?.state?.zoom;
					sprite.y = y * State?.map?.state?.th * State?.viewport?.state?.zoom;
					sprite.width = State?.map?.state?.tw * State?.viewport?.state?.zoom;
					sprite.height = State?.map?.state?.th * State?.viewport?.state?.zoom;

					// Store the sprite in the sprites object with the x, y as the key
					next.sprites[ `${ x },${ y }` ] = sprite;

					// Add the sprite to the stage
					next.stage.addChild(sprite);
				}
			}

			const { width, height } = State.viewport.state.canvas;
			//FIXME: It should use the viewport, but it currently just uses the hardcoded defaults of width and height (800, 600) -- thus, the values below demo the whole map (but that's not the goal)
			next.app.renderer.resize(
				State?.map?.state?.tw * State?.map?.state?.cols * State?.viewport?.state?.zoom,
				State?.map?.state?.th * State?.map?.state?.rows * State?.viewport?.state?.zoom
			);
			next.app.stage = next.stage;

			//STUB: START FPS COUNTER
				const fpsText = new PIXI.Text("FPS: 0", { fill: 0xffffff });
				fpsText.x = 10;
				fpsText.y = 10;
				next.stage.addChild(fpsText);

				let lastTime = 0;
				const fpsWindow = [];
				next.app.ticker.add((delta) => {
					const now = performance.now();
					const elapsedTime = now - lastTime;

					// Skip this frame if elapsed time is 0, to avoid division by zero
					if(elapsedTime === 0) return;

					const fps = 1000 / elapsedTime;
					lastTime = now;
					fpsWindow.push(fps);
					if(fpsWindow.length > 250) {
						fpsWindow.shift();
					}
					const avgFPS = fpsWindow.reduce((a, b) => a + b, 0) / fpsWindow.length;
					fpsText.text = `FPS: ${ Math.round(avgFPS) }`;
				});
			//STUB: END FPS COUNTER

			return next;
		},
	},
	viewport: {
		tick(state, data) {
			const { subject, dt } = data;	// dt = delta time (ms)
			const delta = subject(state, dt);
			const next = {
				...state,
				...delta,
				canvas: {
					width: (Math.abs(delta.x - delta.w) * State?.map?.tw) * delta.zoom,
					height: (Math.abs(delta.y - delta.h) * State?.map?.th) * delta.zoom,
				},
			};

			State?.pixi?.state?.renderer?.render(State?.pixi?.state?.stage);

			return next;
		},
	},
};

export const State = Node.CreateMany({
	terrain: {
		state: {
			...TerrainDict,
		},
		reducers: Reducers.terrain,
		effects: {
			load: (state, data) => {
				State.map.dispatch("load", FS_SavedMap.map);
			},
		},
	},
	map: {
		state: {
			rows: 25,
			cols: 25,
			tw: 32,
			th: 32,
			tiles: [],
		},
		reducers: Reducers.map,
		effects: {
			load: (state, data) => {
				State.pixi.dispatchAsync("load");
			},
		},
	},
	pixi: {
		state: {
			app: new PIXI.Application({
				width: 800,
				height: 600,
				antialias: true,
				transparent: false,
				resolution: window.devicePixelRatio || 1,
				autoResize: true,
				backgroundColor: 0x000000,
			}),
			stage: new PIXI.Container(),
			assets: {},
		},
		reducers: Reducers.pixi,
		effects: {
			load: (state, data) => {
				State.viewport.dispatch("tick", { subject: State.viewport.state.subject, dt: 0 });
			},
		},
	},
	viewport: {
		state: {
			canvas: {
				width: 800,	//px
				height: 600,	//px
			},
			x: 0,	// px
			y: 0,	// px
			w: 12,	// px
			h: 12,	// px
			zoom: 1.00,	// 1 = 100%
			subject: (state) => {
				return {
					...state,
				};
			},	// (state, dt)=> [x,y,w,h,zoom]
		},
		reducers: Reducers.viewport,
		effects: {
			tick: (state, data) => {
				// resize the pixi canvas to the viewport's canvas dictated size
				const { width, height } = state.canvas;
				State?.pixi?.state?.renderer?.resize(width, height);
			},
		}
	},
});

State.terrain.dispatchAsync("load", FS_SavedMap.terrain);

export const IMM = (module, message, ...args) => {
	const node = State[ module ];
	if(node) {
		return node.dispatch(message.type, message.data, ...args);
	}
};
export const IMS = (module) => {
	const node = State[ module ];
	if(node) {
		return node.state;
	}
};