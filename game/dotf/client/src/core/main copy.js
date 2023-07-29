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
			let updatedKeyMask = state.input.keyMask;
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
			return { ...state, input: { ...state.input, keyMask: updatedKeyMask } };
		},
		handleKeyUp: (state, { code }) => {
			let updatedKeyMask = state.input.keyMask;
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
			return { ...state, input: { ...state.input, keyMask: updatedKeyMask } };
		},
	},
};
export const Actions = {
	handleKeyDown: (state, { code }) => {
		let updatedKeyMask = state.input.keyMask;
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
		return { ...state, input: { ...state.input, keyMask: updatedKeyMask } };
	},
	handleKeyUp: (state, { code }) => {
		let updatedKeyMask = state.input.keyMask;
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
		return { ...state, input: { ...state.input, keyMask: updatedKeyMask } };
	},
};

export let State = {
	entities: {
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
	},
	terrain: {
		GRASS: { type: "GRASS", color: "#00ff00" },
	},
	map: {
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
	},
	input: {
		keyMask: 0,
	},
};

export const Nodes = Chord.Node.Node.CreateMany({
	entities: {
		state: State.entities,
	},
	terrain: {
		state: State.terrain,
	},
	map: {
		state: State.map,
	},
	input: {
		state: State.input,
		reducers: Reducers.input,
	},
});

function reducer(state, action) {
	if(Actions[ action.type ]) {
		return Actions[ action.type ](state, action.payload);
	}

	return state;
};

export async function main() {
	const scale = 3.0;
	const speed = 0.1;

	function gameLoop(app, delta) {
		// update the entities
		for(const id in State.entities) {
			const entity = State.entities[ id ];
			const graphics = entities.getChildAt(parseInt(id) - 1);

			// calculate the new position of the entity and set it
			entity.physics.x += entity.physics.vx * delta;
			entity.physics.y += entity.physics.vy * delta;
			graphics.x = entity.physics.x * State.map.tw;
			graphics.y = entity.physics.y * State.map.th;
		}

		// update player
		const player = State.entities[ "1" ];

		if(State.input.keyMask & 0x01) player.physics.vy = -speed;
		else if(State.input.keyMask & 0x04) player.physics.vy = speed;
		else player.physics.vy = 0;

		if(State.input.keyMask & 0x02) player.physics.vx = -speed;
		else if(State.input.keyMask & 0x08) player.physics.vx = speed;
		else player.physics.vx = 0;

		player.physics.x += player.physics.vx * delta;
		player.physics.y += player.physics.vy * delta;
	}

	function renderLoop(app) {
		// iterate through entities and draw the line towards the mouse
		for(const id in State.entities) {
			const entity = State.entities[ id ];
			const graphics = entities.getChildAt(parseInt(id) - 1);

			// clear previous line
			graphics.clear();

			// redraw entity
			graphics.beginFill(0xff0000);
			switch(entity.model.type) {
				case EnumModelType.CIRCLE:
					graphics.drawCircle(0, 0, entity.model.radius * scale);
					break;
				case EnumModelType.RECTANGLE:
					graphics.drawRect(entity.model.ox * scale, entity.model.oy * scale, entity.model.width * scale, entity.model.height * scale);
					break;
				default:
					break;
			}
			graphics.endFill();

			// draw the line from entity to mouse
			graphics.lineStyle(2, 0x0000FF, 1);
			graphics.moveTo(0, 0);
			graphics.lineTo(
				Math.cos(entity.physics.theta) * 20 * scale,
				Math.sin(entity.physics.theta) * 20 * scale
			);
		}

		requestAnimationFrame(renderLoop);
	}

	// create a fullscreen pixi application that resizes automatically
	const app = new PIXI.Application({
		resizeTo: window,
		resolution: window.devicePixelRatio,
	});

	// add the canvas that pixi automatically created for you to the HTML document
	document.body.appendChild(app.view);

	// get the mouse position on the stage
	app.stage.on("mousemove", e => {
		// update entity's theta position so that it faces the mouse
		const entity = State.entities[ "1" ];
		const graphics = entities.getChildAt(0);

		// Calculate angle to mouse and set it
		const dx = e.x - graphics.x;
		const dy = e.y - graphics.y;
		entity.physics.theta = Math.atan2(dy, dx);
	});
	app.stage.eventMode = "dynamic";


	// draw the map, using green Pixi Graphics objects of .tw and .th size at tx and ty positions
	const map = new PIXI.Container();
	for(let row = 0; row < State.map.rows; row++) {
		for(let col = 0; col < State.map.cols; col++) {
			const tile = State.map.tiles[ row ][ col ];
			const terrain = State.terrain[ tile.data ];
			const graphics = new PIXI.Graphics();
			graphics.beginFill(terrain.color);
			graphics.drawRect(0, 0, State.map.tw * scale, State.map.th * scale); // Scale the dimensions
			graphics.endFill();
			graphics.x = tile.x * State.map.tw * scale; // Scale the position
			graphics.y = tile.y * State.map.th * scale; // Scale the position
			map.addChild(graphics);
		}
	}

	// seed the entities container with graphics objects
	const entities = new PIXI.Container();
	for(const id in State.entities) {
		const graphics = new PIXI.Graphics();
		entities.addChild(graphics);
	}

	// add the map and entities to the stage
	app.stage.addChild(map);
	app.stage.addChild(entities);

	// start the game loop
	app.ticker.add(delta => gameLoop(app, delta));

	// start the render loop
	renderLoop(app);

	// Event listener for keydown event
	window.addEventListener("keydown", e => {
		State = reducer(State, { type: "handleKeyDown", payload: { code: e.code } });
	});

	// Event listener for keyup event
	window.addEventListener("keyup", e => {
		State = reducer(State, { type: "handleKeyUp", payload: { code: e.code } });
	});

	// return the pixi application
	return app;
};

export default main;