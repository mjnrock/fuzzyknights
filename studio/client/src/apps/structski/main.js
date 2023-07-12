import { v4 as uuid } from "uuid";
import { Node } from "../../lib/Node";
import * as PIXI from "pixi.js";

export const Reducers = {
	context: {
		move: (state, data) => {
			const next = {
				...state,
			};

			const { key, x, y } = data;
			next.render[ key ].x = x;
			next.render[ key ].y = y;

			return next;
		}
	},
	pixi: {
		zoom: (state, data) => {
			const direction = Math.sign(data);
			const next = {
				...state,
			};

			next.viewport.scale += direction * 0.1;
			next.viewport.scale = Math.min(Math.max(0.1, next.viewport.scale), 5);

			return next;
		},
		load: (state, data) => {
			const next = {
				...state,
			};

			for(let key in State?.context?.state?.render) {
				const entry = State?.context?.state?.render[ key ];
				const { x, y, r, color } = entry;
				const circle = new PIXI.Graphics();
				circle.beginFill(color);
				circle.drawCircle(x, y, r);
				circle.endFill();

				circle.beginFill(color === 0xff0000 ? 0xffaaaa : 0xaaaaff);
				circle.drawCircle(x, y, r - 5);
				circle.endFill();

				next.stage.addChild(circle);
				next.sprites[ key ] = circle;
			}

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
		tick: (state, data) => {
			// iterate over the pixi.state.sprites and update their positions, based on the context.state.render
			const next = {
				...state,
			};

			// iterate over the context.state.data and update the pixi.state.sprites position, color, etc
			for(let key in State?.context?.state?.render) {
				const render = State?.context?.state?.render[ key ];
				const data = State?.context?.state?.data[ key ];
				const sprite = next.sprites[ key ];

				sprite.clear();
				sprite.beginFill(render.color);
				sprite.drawCircle(render.x, render.y, render.r);
				sprite.endFill();

				sprite.beginFill(render.color === 0xff0000 ? 0xffaaaa : 0xaaaaff);
				sprite.drawCircle(render.x, render.y, render.r - 5);
				sprite.endFill();
			}

			return next;
		},
	},
};

export const State = Node.CreateMany({
	context: {
		state: {
			data: {
				A: {
					id: uuid(),
					type: "str",
					value: "Hello",
				},
				B: {
					id: uuid(),
					type: "int32",
					value: 69,
				},
				C: {
					id: uuid(),
					type: "int32",
					value: 420,
				},
			},
			render: {
				A: {
					x: 500,
					y: 500,
					r: 50,
					color: 0xff0000,
				},
				B: {
					x: 600,
					y: 500,
					r: 50,
					color: 0x0000ff,
				},
				C: {
					x: 550,
					y: 585,
					r: 50,
					color: 0x0000ff,
				},
			}
		},
		reducers: Reducers.context,
	},
	pixi: {
		state: {
			app: new PIXI.Application({
				width: window.innerWidth,
				height: window.innerHeight,
				antialias: true,
				transparent: false,
				resolution: window.devicePixelRatio || 1,
				autoDensity: true,
				backgroundColor: 0xEEEEEE,
			}),
			stage: new PIXI.Container(),
			sprites: {},
			viewport: {
				x: 0,
				y: 0,
				scale: 1.00,
			},
		},
		reducers: Reducers.pixi,
	},
});

State.pixi.dispatch("load");
State.pixi.state.app.ticker.add((delta) => State?.pixi?.dispatch("tick"));

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