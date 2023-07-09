import * as PIXI from "pixi.js";
import { Node } from "../../lib/Node";

import { TerrainDict } from "./data/TerrainMap.js";

import DATA from "./data/maps/3f9b9c61-91dd-4fed-b22c-abf90163fd1c.json";
import Base64 from "../../util/Base64";

console.log(DATA);

export const Reducers = {
	terrain: {
		/**
		 * Load the terrain map enum data
		 */
		load: (state, data) => {
			return {
				...state,
				...data,
			};
		},
	},
	map: {
		/**
		 * Load the map schema data and convert it into terrain data
		 */
		load: (state, data) => {
			const { rows, columns, tw, th, tiles } = data;
			let next = {
				...state,
				rows,
				columns,
				tw,
				th,
				tiles,
			};

			console.log(next)

			// Convert tile data (from editor.map) intto terrain data
			for(let y = 0; y < rows; y++) {
				next.tiles[ y ] = next.tiles[ y ] || [];
				for(let x = 0; x < columns; x++) {
					const tile = tiles[ y ][ x ];
					const { data } = tile;

					next.tiles[ y ][ x ] = State?.terrain?.state?.[ data ];	// Terrain data for that type (type, texture, etc.)
				}
			}

			return next;
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
				if(texture.startsWith("#")) {
					const canvas = document.createElement('canvas');
					canvas.width = 1;
					canvas.height = 1;
					const context = canvas.getContext('2d');
					context.fillStyle = texture;
					context.fillRect(0, 0, 1, 1);
					next.assets[ key ] = PIXI.Texture.from(canvas);
				} else {
					next.assets[ key ] = PIXI.Texture.from(await Base64.Decode(texture));
				}
			}

			// Populating stage and sprites
			let y = 0;
			for(let yObj of State?.map?.state?.tiles) {
				for(const x in yObj) {
					const currentTile = yObj[ x ];
					// Create a sprite with the appropriate texture
					let sprite = new PIXI.Sprite(next.assets[ currentTile.type ]);

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
				y++;
			}

			next.app.stage = next.stage;

			console.log(next);

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

console.log(State)

State.map.dispatch("load", DATA.map);
State.pixi.dispatchAsync("load");
State.viewport.dispatch("tick", { subject: State.viewport.state.subject, dt: 0 });

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