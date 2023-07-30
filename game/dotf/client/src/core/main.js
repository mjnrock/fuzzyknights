import * as PIXI from "pixi.js";
import { v4 as uuid } from "uuid";

import Chord from "@lespantsfancy/chord";

export const EnumModelType = {
	CIRCLE: "CIRCLE",
	RECTANGLE: "RECTANGLE",
};

export const EnumEntityState = {
	IDLE: "IDLE",
	MOVING: "MOVING",
};

export const Reducers = {
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
};

export let State = {
	entities: (entities = {}) => ({
		"1": {
			$id: uuid(),
			$tags: [],

			physics: {
				x: 0,
				y: 0,
				theta: 0,

				vx: 0,
				vy: 0,
				vtheta: 0,

				speed: 0.1,
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
		...terrain,
	}),
	map: (map = {}) => ({
		rows: 5,
		cols: 5,
		tw: 32,
		th: 32,
		tiles: [
			[ { x: 0, y: 0, data: "GRASS" }, { x: 1, y: 0, data: "GRASS" }, { x: 2, y: 0, data: "GRASS" }, { x: 3, y: 0, data: "GRASS" }, { x: 4, y: 0, data: "GRASS" } ],
			[ { x: 0, y: 1, data: "GRASS" }, { x: 1, y: 1, data: "GRASS" }, { x: 2, y: 1, data: "GRASS" }, { x: 3, y: 1, data: "GRASS" }, { x: 4, y: 1, data: "GRASS" } ],
			[ { x: 0, y: 2, data: "GRASS" }, { x: 1, y: 2, data: "GRASS" }, { x: 2, y: 2, data: "GRASS" }, { x: 3, y: 2, data: "GRASS" }, { x: 4, y: 2, data: "GRASS" } ],
			[ { x: 0, y: 3, data: "GRASS" }, { x: 1, y: 3, data: "GRASS" }, { x: 2, y: 3, data: "GRASS" }, { x: 3, y: 3, data: "GRASS" }, { x: 4, y: 3, data: "GRASS" } ],
			[ { x: 0, y: 4, data: "GRASS" }, { x: 1, y: 4, data: "GRASS" }, { x: 2, y: 4, data: "GRASS" }, { x: 3, y: 4, data: "GRASS" }, { x: 4, y: 4, data: "GRASS" } ],
		],
		...map,
	}),
	input: (input = {}) => ({
		keyMask: 0,
		...input,
	}),
	pixi: (pixi = {}) => ({
		scale: 3.0,
		app: new PIXI.Application({
			resizeTo: window,
			resolution: window.devicePixelRatio,
		}),
		stage: new PIXI.Container(),
	}),
};

export const Nodes = Chord.Node.Node.CreateMany({
	entities: {
		state: State.entities(),
	},
	terrain: {
		state: State.terrain(),
	},
	map: {
		state: State.map(),
	},
	input: {
		state: State.input(),
		reducers: Reducers.input,
	},
	pixi: {
		state: State.pixi(),
	},
});

export async function main() {
	function gameLoop(app, delta) {
		// update the entities
		for(const id in Nodes.entities.state) {
			const entity = Nodes.entities.state[ id ];
			const graphics = entities.getChildAt(parseInt(id) - 1);

			// calculate the new position of the entity and set it
			entity.physics.x += entity.physics.vx * delta;
			entity.physics.y += entity.physics.vy * delta;
			graphics.x = entity.physics.x * Nodes.map.state.tw;
			graphics.y = entity.physics.y * Nodes.map.state.th;
		}

		// update player
		const player = Nodes.entities.state[ "1" ];

		if(Nodes.input.state.keyMask & 0x01) player.physics.vy = -player.physics.speed;
		else if(Nodes.input.state.keyMask & 0x04) player.physics.vy = player.physics.speed;
		else player.physics.vy = 0;

		if(Nodes.input.state.keyMask & 0x02) player.physics.vx = -player.physics.speed;
		else if(Nodes.input.state.keyMask & 0x08) player.physics.vx = player.physics.speed;
		else player.physics.vx = 0;

		player.physics.x += player.physics.vx * delta;
		player.physics.y += player.physics.vy * delta;
	}

	function renderLoop(app) {
		// iterate through entities and draw the line towards the mouse
		for(const id in Nodes.entities.state) {
			const entity = Nodes.entities.state[ id ];
			const graphics = entities.getChildAt(parseInt(id) - 1);

			// clear previous line
			graphics.clear();

			// redraw entity
			graphics.beginFill(0xff0000);
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

			// draw the line from entity to mouse
			graphics.lineStyle(2, 0x0000FF, 1);
			graphics.moveTo(0, 0);
			graphics.lineTo(
				Math.cos(entity.physics.theta) * 20 * Nodes.pixi.state.scale,
				Math.sin(entity.physics.theta) * 20 * Nodes.pixi.state.scale
			);
		}

		requestAnimationFrame(renderLoop);
	}

	// create a fullscreen pixi application that resizes automatically
	const pixi = Nodes.pixi.state.app;
	// add the canvas that pixi automatically created for you to the HTML document
	document.body.appendChild(pixi.view);

	// get the mouse position on the stage
	pixi.stage.on("mousemove", e => {
		// update entity's theta position so that it faces the mouse
		const entity = Nodes.entities.state[ "1" ];
		const graphics = entities.getChildAt(0);

		// Calculate angle to mouse and set it
		const dx = e.x - graphics.x;
		const dy = e.y - graphics.y;
		entity.physics.theta = Math.atan2(dy, dx);
	});
	pixi.stage.eventMode = "dynamic";


	// draw the map, using green Pixi Graphics objects of .tw and .th size at tx and ty positions
	const map = new PIXI.Container();
	for(let row = 0; row < Nodes.map.state.rows; row++) {
		for(let col = 0; col < Nodes.map.state.cols; col++) {
			const tile = Nodes.map.state.tiles[ row ][ col ];
			const terrain = Nodes.terrain.state[ tile.data ];
			const graphics = new PIXI.Graphics();
			graphics.beginFill(terrain.color);
			graphics.drawRect(0, 0, Nodes.map.state.tw * Nodes.pixi.state.scale, Nodes.map.state.th * Nodes.pixi.state.scale); // Nodes.pixi.state.scale the dimensions
			graphics.endFill();
			graphics.x = tile.x * Nodes.map.state.tw * Nodes.pixi.state.scale; // Nodes.pixi.state.scale the position
			graphics.y = tile.y * Nodes.map.state.th * Nodes.pixi.state.scale; // Nodes.pixi.state.scale the position
			map.addChild(graphics);
		}
	}

	// seed the entities container with graphics objects
	const entities = new PIXI.Container();
	for(const id in Nodes.entities.state) {
		const graphics = new PIXI.Graphics();
		entities.addChild(graphics);
	}

	// add the map and entities to the stage
	pixi.stage.addChild(map);
	pixi.stage.addChild(entities);

	// start the game loop
	pixi.ticker.add(delta => gameLoop(pixi, delta));

	// start the render loop
	renderLoop(pixi);

	// Event listener for keydown event
	window.addEventListener("keydown", e => {
		Nodes.input.dispatch("handleKeyDown", { code: e.code });
	});

	// Event listener for keyup event
	window.addEventListener("keyup", e => {
		Nodes.input.dispatch("handleKeyUp", { code: e.code });
	});

	// return the pixi application
	return pixi;
};

export default main;