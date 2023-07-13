import { v4 as uuid } from "uuid";
import { Node } from "../../lib/Node";
import * as PIXI from "pixi.js";

export const flattenGroup = (node, keyPath = "") => {
	const results = [];
	if(node.type === "group") {
		results.push([ keyPath, node ]);
		Object.keys(node.value).forEach(key => {
			results.push(...flattenGroup(node.value[ key ], keyPath + "." + key));
		});
	} else {
		results.push([ keyPath, node ]);
	}

	return results;
};


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
		pan: (state, { dx, dy }) => {
			const next = {
				...state,
				viewport: {
					...state.viewport,
					x: state.viewport.x - dx / state.viewport.scale,
					y: state.viewport.y - dy / state.viewport.scale,
				},
			};

			return next;
		},
		zoom: (state, data) => {
			const direction = Math.sign(data);
			const next = {
				...state,
			};

			next.viewport.scale += direction * 0.1;
			next.viewport.scale = Math.min(Math.max(0.1, next.viewport.scale), 5);
			next.stage.scale.set(next.viewport.scale);

			return next;
		},
		load: (state, data) => {
			const next = {
				...state,
			};

			const drawNode = (node, key) => {
				const { x, y, r, color } = node;
				const circle = new PIXI.Graphics();
				circle.beginFill(color);
				circle.drawCircle(x, y, r);
				circle.endFill();

				circle.beginFill(color === 0xff0000 ? 0xffaaaa : (color === 0x0000ff ? 0xaaaaff : 0xAAAAAA));
				circle.drawCircle(x, y, r - 5);
				circle.endFill();

				next.stage.addChild(circle);
				next.sprites[ key ] = circle;
			}

			for(let key in State?.context?.state?.data) {
				const nodes = flattenGroup(State?.context?.state?.data[ key ], key);

				nodes.forEach(([ keyPath, node ]) => {
					const lastKey = keyPath.split(".").pop();
					drawNode(State?.context?.state?.render[ lastKey ], lastKey);
				});
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

			const drawNode = (node, key) => {
				const sprite = next.sprites[ key ];

				sprite.clear();
				sprite.beginFill(node.color);
				sprite.drawCircle(node.x, node.y, node.r);
				sprite.endFill();

				sprite.beginFill(node.color === 0xff0000 ? 0xffaaaa : (node.color === 0x0000ff ? 0xaaaaff : 0xAAAAAA));
				sprite.drawCircle(node.x, node.y, node.r - 5);
				sprite.endFill();
			}

			for(let key in State?.context?.state?.data) {
				const nodes = flattenGroup(State?.context?.state?.data[ key ], key);

				nodes.forEach(([ keyPath, node ]) => {
					const lastKey = keyPath.split(".").pop();
					drawNode(State?.context?.state?.render[ lastKey ], lastKey);
				});
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
				D: {
					id: uuid(),
					type: "group",
					value: {
						E: {
							id: uuid(),
							type: "str",
							value: "meow",
						},
						F: {
							id: uuid(),
							type: "int32",
							value: 510510,
						},
						G: {
							id: uuid(),
							type: "int8",
							value: 5,
						},
					},
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
				D: {
					x: 550,
					y: 530,
					r: 110,
					color: 0x111111,
				},
				E: {
					x: 700,
					y: 500,
					r: 50,
					color: 0xff0000,
				},
				F: {
					x: 400,
					y: 500,
					r: 50,
					color: 0x0000ff,
				},
				G: {
					x: 350,
					y: 585,
					r: 50,
					color: 0x0000bb,
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