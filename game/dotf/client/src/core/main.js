import * as PIXI from "pixi.js";
import { v4 as uuid } from "uuid";

export const EnumModelType = {
	CIRCLE: "CIRCLE",
	RECTANGLE: "RECTANGLE",
};

export const EnumEntityState = {
	IDLE: "IDLE",
	MOVING: "MOVING",
};

export const Map = {
	terrain: {
		GRASS: { type: "GRASS", color: "#00ff00" },
	},
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
};

export async function main() {
	function gameLoop(app, delta) {
		// update the entities
		for(const id in Map.entities) {
			const entity = Map.entities[ id ];
			const graphics = entities.getChildAt(parseInt(id) - 1);

			// calculate the new position of the entity and set it
			entity.physics.x += entity.physics.vx * delta;
			entity.physics.y += entity.physics.vy * delta;
			graphics.x = entity.physics.x * Map.tw;
			graphics.y = entity.physics.y * Map.th;

			// // Get mouse position
			// const mousePosition = app.renderer.plugins.interaction.mouse.global;

			// // Calculate angle to mouse and set it
			// const dx = mousePosition.x - graphics.x;
			// const dy = mousePosition.y - graphics.y;
			// entity.physics.theta = Math.atan2(dy, dx);
		}
	}

	function renderLoop(app) {
		// iterate through entities and draw the line towards the mouse
		for(const id in Map.entities) {
			const entity = Map.entities[ id ];
			const graphics = entities.getChildAt(parseInt(id) - 1);

			// clear previous line
			graphics.clear();

			// redraw entity
			graphics.beginFill(0xff0000);
			switch(entity.model.type) {
				case EnumModelType.CIRCLE:
					graphics.drawCircle(0, 0, entity.model.radius);
					break;
				case EnumModelType.RECTANGLE:
					graphics.drawRect(entity.model.ox, entity.model.oy, entity.model.width, entity.model.height);
					break;
				default:
					break;
			}
			graphics.endFill();

			// draw the line from entity to mouse
			graphics.lineStyle(2, 0x0000FF, 1);
			graphics.moveTo(0, 0);
			graphics.lineTo(
				Math.cos(entity.physics.theta) * 20,
				Math.sin(entity.physics.theta) * 20
			);
		}

		requestAnimationFrame(renderLoop);
	}

	// create a fullscreen pixi application that resizes automatically
	const app = new PIXI.Application({
		resizeTo: window,
		resolution: window.devicePixelRatio,
	});

	app.stage.on("mousemove", e => {
		// update entity's theta position so that it faces the mouse
		const entity = Map.entities[ "1" ];
		const graphics = entities.getChildAt(0);

		// Calculate angle to mouse and set it
		const dx = e.x - graphics.x;
		const dy = e.y - graphics.y;
		entity.physics.theta = Math.atan2(dy, dx);
	});
    app.stage.eventMode = "dynamic";

	// add the canvas that pixi automatically created for you to the HTML document
	document.body.appendChild(app.view);

	// draw the map, using green Pixi Graphics objects of .tw and .th size at tx and ty positions
	const map = new PIXI.Container();
	for(let row = 0; row < Map.rows; row++) {
		for(let col = 0; col < Map.cols; col++) {
			const tile = Map.tiles[ row ][ col ];
			const terrain = Map.terrain[ tile.data ];
			const graphics = new PIXI.Graphics();
			graphics.beginFill(terrain.color);
			graphics.drawRect(0, 0, Map.tw, Map.th);
			graphics.endFill();
			graphics.x = tile.x * Map.tw;
			graphics.y = tile.y * Map.th;
			map.addChild(graphics);
		}
	}

	// draw the entities, using red Pixi Graphics objects of .tw and .th size at tx and ty positions
	const entities = new PIXI.Container();
	for(const id in Map.entities) {
		const entity = Map.entities[ id ];
		const graphics = new PIXI.Graphics();

		graphics.beginFill(0xff0000);
		switch(entity.model.type) {
			case EnumModelType.CIRCLE:
				graphics.drawCircle((entity.physics.x + entity.model.ox) * Map.tw, (entity.physics.y + entity.model.oy) * Map.th, entity.model.radius);
				break;
			case EnumModelType.RECTANGLE:
				graphics.drawRect((entity.physics.x + entity.model.ox) * Map.tw, (entity.physics.y + entity.model.oy) * Map.th, entity.model.width, entity.model.height);
				break;
			default:
				break;
		}
		graphics.endFill();

		graphics.x = (entity.physics.x + entity.model.ox) * Map.tw;
		graphics.y = (entity.physics.y + entity.model.oy) * Map.th;

		entities.addChild(graphics);
	}

	// add the map and entities to the stage
	app.stage.addChild(map);
	app.stage.addChild(entities);

	// start the game loop
	app.ticker.add(delta => gameLoop(app, delta));

	// start the render loop
	renderLoop(app);

	// Create an object to store the state of the pressed keys
	const keysPressed = {};
	const speed = 0.05;

	// Function to update the entity physics based on the keys pressed
	function updateEntityPhysics() {
		const entity = Map.entities[ "1" ];
		entity.physics.vx = (keysPressed[ "ArrowLeft" ] || keysPressed[ "KeyA" ]) ? -speed : (keysPressed[ "ArrowRight" ] || keysPressed[ "KeyD" ]) ? speed : 0;
		entity.physics.vy = (keysPressed[ "ArrowUp" ] || keysPressed[ "KeyW" ]) ? -speed : (keysPressed[ "ArrowDown" ] || keysPressed[ "KeyS" ]) ? speed : 0;
	}

	// Event listener for keydown event
	window.addEventListener("keydown", e => {
		keysPressed[ e.code ] = true;
		updateEntityPhysics();
	});

	// Event listener for keyup event
	window.addEventListener("keyup", e => {
		keysPressed[ e.code ] = false;
		updateEntityPhysics();
	});

	// return the pixi application
	return app;
};

export default main;