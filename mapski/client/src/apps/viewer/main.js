import * as PIXI from "pixi.js";
import { Node } from "../../lib/Node";
import Base64 from "../../util/Base64";

import { TerrainDict } from "./data/TerrainMap.js";

import FS_SavedMap from "./data/maps/cave.json";
import { BsFolder2Open } from "react-icons/bs";

export const Reducers = {
	menubar: {},
	terrain: {
		set: (state, data) => {
			return {
				...data
			};
		},
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
		set: (state, data) => {
			return {
				...data
			};
		},
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
			const next = data || {
				...state,
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

			const { width, height } = State?.viewport?.state?.canvas;
			next.app.renderer.resize(width, height);
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
		merge: (state, data) => {
			const next = {
				...data,
			};

			if(next.w < 1) next.w = 0;
			if(next.h < 1) next.h = 0;
			if(next.w > State.map.state.cols) next.w = State.map.state.cols;
			if(next.h > State.map.state.rows) next.h = State.map.state.rows;

			if(next.x < 0) next.x = 0;
			if(next.y < 0) next.y = 0;
			if(next.x > State.map.state.cols) next.x = State.map.state.cols;
			if(next.y > State.map.state.rows) next.y = State.map.state.rows;

			if(next.zoom < 0.1) next.zoom = 0.1;
			if(next.zoom > 5) next.zoom = 5;

			return {
				...state,
				...next,
			};
		},
		center: (state, data) => {
			return {
				...state,
				x: State?.map?.state?.cols / 2 || 0,
				y: State?.map?.state?.rows / 2 || 0,
			};
		},
		move: (state, data) => {
			const { x, y } = data;

			let nx = ~~(state.x + (x * state.xStep));
			let ny = ~~(state.y + (y * state.yStep));

			if(nx < 0) nx = 0;
			if(ny < 0) ny = 0;
			if(nx > State.map.state.cols) nx = State.map.state.cols;
			if(ny > State.map.state.rows) ny = State.map.state.rows;

			return {
				...state,
				x: nx,
				y: ny,
			};
		},
		zoom: (state, data) => {
			let delta = Math.sign(data.zoom) * state.zoomStep;

			// scale the zoom step by the current zoom if state.zoom is >= 1.5
			if(state.zoom >= 1) {
				delta *= 2 * state.zoom;
			}

			let nextZoom = Math.min(Math.max(Math.round((state.zoom + delta) * 100) / 100, 0.1), 5);

			return {
				...state,
				zoom: nextZoom,
			};
		},
		tick(state, data) {
			const { subject } = state;
			const { dt } = data;	// dt = delta time (ms)

			const next = {
				...state,
			};

			// iterate over the sprites and update their positions
			for(let key in State?.pixi?.state?.sprites) {
				// based on the viewport's x, y, w, h, zoom, only render those sprites that are visible -- and scale them appropriately to the zoom
				const sprite = State?.pixi?.state?.sprites[ key ];
				const [ x, y ] = key.split(",").map((v) => parseInt(v));
				const { tw, th } = State?.map?.state;
				const { x: vx, y: vy, w, h, zoom } = next;

				// if the sprite is within the viewport (+/- 1/2 of the .w and .h) then render it
				if(x >= vx - w / 2 && x <= vx + w / 2 && y >= vy - h / 2 && y <= vy + h / 2) {
					sprite.visible = true;
					sprite.x = (x - vx + w / 2) * tw * zoom;
					sprite.y = (y - vy + h / 2) * th * zoom;

					//  if the viewport is smaller than the canvas, center the sprites
					if(w < State?.viewport?.state?.canvas?.width) {
						sprite.x += (State?.viewport?.state?.canvas?.width - w * tw * zoom) / 2;
					}
					if(h < State?.viewport?.state?.canvas?.height) {
						sprite.y += (State?.viewport?.state?.canvas?.height - h * th * zoom) / 2;
					}

					sprite.width = tw * zoom;
					sprite.height = th * zoom;
				} else {
					sprite.visible = false;
				}
			}

			State?.pixi?.state?.renderer?.render(State?.pixi?.state?.stage);

			return next;
		},
	},
};

export const State = Node.CreateMany({
	menubar: {
		state: {
			menu: [
				{
					name: "File",
					command: "File",
					submenu: [
						{
							name: "Load",
							command: "file/load",
							icon: BsFolder2Open,
							// shortcut: "Ctrl+O",
						},
					],
				},
			],
		},
		reducers: Reducers.menubar,
	},
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
			set: (state, data) => {
				State.pixi.dispatchAsync("load", {
					app: State.pixi.state.app,
					stage: new PIXI.Container(),
					assets: {},
					sprites: {},
				});
			},
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
				transparent: true,
				resolution: window.devicePixelRatio || 1,
				autoResize: true,
				backgroundColor: "#DDD",
			}),
			stage: new PIXI.Container(),
			assets: {},
			sprites: {},
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
				width: 640,		//px
				height: 640,	//px
			},
			w: 20,	// px
			h: 20,	// px
			x: 0,	// px
			y: 0,	// px
			zoom: 1.00,	// 1 = 100%
			xStep: 1,	// tile
			yStep: 1,	// tile
			zoomStep: 0.03,	// 0.03 = 3%
			subject: (state) => {
				return {
					...state,
				};
			},	// (state, dt)=> [x,y,w,h,zoom]
		},
		reducers: Reducers.viewport,
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