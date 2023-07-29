import * as PIXI from "pixi.js";
import { v4 as uuid } from "uuid";

const KEYCODES = {
	W: "KeyW",
	A: "KeyA",
	S: "KeyS",
	D: "KeyD",
};

// Define the initial state
const initialState = {
	entities: {
		player: {
			id: "player",
			physics: {
				x: 0,
				y: 0,
				vx: 0,
				vy: 0,
			},
		},
	},
	keysPressed: {},
};

// Define your actions
const actions = {
	updateEntityPhysics: (state, { delta }) => {
		let updatedEntities = { ...state.entities };

		for(let entityId in state.entities) {
			const entity = updatedEntities[ entityId ];

			if(state.keysPressed[ KEYCODES.W ]) entity.physics.vy = -1;
			else if(state.keysPressed[ KEYCODES.S ]) entity.physics.vy = 1;
			else entity.physics.vy = 0;

			if(state.keysPressed[ KEYCODES.A ]) entity.physics.vx = -1;
			else if(state.keysPressed[ KEYCODES.D ]) entity.physics.vx = 1;
			else entity.physics.vx = 0;

			entity.physics.x += entity.physics.vx * delta;
			entity.physics.y += entity.physics.vy * delta;
		}

		return { ...state, entities: updatedEntities };
	},
	handleKeyDown: (state, { code }) => {
		let updatedKeysPressed = { ...state.keysPressed, [ code ]: true };
		return { ...state, keysPressed: updatedKeysPressed };
	},
	handleKeyUp: (state, { code }) => {
		let updatedKeysPressed = { ...state.keysPressed, [ code ]: false };
		return { ...state, keysPressed: updatedKeysPressed };
	},
};

// Your reducer function
function reducer(state, action) {
	if(actions[ action.type ]) {
		return actions[ action.type ](state, action.payload);
	}

	return state;
}

// Main function
export async function main() {
	// create a fullscreen pixi application that resizes automatically
	const app = new PIXI.Application({
		resizeTo: window,
		resolution: window.devicePixelRatio,
	});

	// add the canvas that pixi automatically created for you to the HTML document
	document.body.appendChild(app.view);

	// initialize your state
	let state = initialState;

	// Create a circle to represent the player
	const playerGraphics = new PIXI.Graphics();
	app.stage.addChild(playerGraphics);

	// start the game loop
	app.ticker.add(delta => {
		// here we could call actions that update the state based on the game logic
		state = reducer(state, { type: "updateEntityPhysics", payload: { delta } });

		// Render the state
		render(app, state, playerGraphics);
	});

	// Event listener for keydown event
	window.addEventListener("keydown", e => {
		state = reducer(state, { type: "handleKeyDown", payload: { code: e.code } });
	});

	// Event listener for keyup event
	window.addEventListener("keyup", e => {
		state = reducer(state, { type: "handleKeyUp", payload: { code: e.code } });
	});

	// return the pixi application
	return app;
};

// Render function
function render(app, state, playerGraphics) {
	// Clear the player graphics
	playerGraphics.clear();

	// Draw the player
	const player = state.entities.player;
	playerGraphics.lineStyle(0);
	playerGraphics.beginFill(0xffff0b, 1);
	playerGraphics.drawCircle(player.physics.x, player.physics.y, 50);
	playerGraphics.endFill();
}

export default main;