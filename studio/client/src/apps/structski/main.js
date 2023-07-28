import Chord from "@lespantsfancy/chord";
import { v4 as uuid } from "uuid";
import * as PIXI from "pixi.js";

export const flattenGroup = (node, keyPath = "") => {
	const results = [];
	if(node.type === "group") {
		results.push([ keyPath, node ]);
		Object.keys(node.value).forEach(key => {
			results.push(...flattenGroup(node.value[ key ], key));
		});
	} else {
		results.push([ keyPath, node ]);
	}

	return results;
};
export const flattenNodes = (node, keyPath, parent = null) => {
	const nodes = [];

	if([ "id", "type", "value" ].every(key => key in node)) {
		if(node.type === "group") {
			nodes.push([ keyPath, null, "group", parent, node ]);

			for(let key in node.value) {
				const newNodes = flattenNodes(node.value[ key ], key, keyPath);

				nodes.push(...newNodes);
			}
		} else {
			nodes.push([ keyPath, node.value, node.type, parent, node ]);
		}
	} else {
		for(let key in node) {
			const newNodes = flattenNodes(node[ key ], key);

			nodes.push(...newNodes);
		}
	}

	return nodes;
};

export const findBall = (x, y, state) => {
	// Function to check if a point is inside a ball
	const isInside = (point, ball) => {
		const dx = ball.x - point.x;
		const dy = ball.y - point.y;
		return dx * dx + dy * dy <= ball.r * ball.r;
	};

	const balls = flattenNodes(state.data);

	// We want to check child balls first, so we ignore groups
	balls.sort(([ key1, val1, type1 ], [ key2, val2, type2 ]) => type1 === "group" ? 1 : -1);

	// Function to find the selected ball
	const findSelectedBall = (nodeList, parentNode = null) => {
		for(const [ key, type, value, parent ] of nodeList) {
			if(type === "group") continue;
			const ball = { ...state.render[ key ] };

			// if a parent exists, we need to offset the ball"s position by the parent"s position
			if(parent || parentNode) {
				const parentRender = state.render[ parent || parentNode ];
				ball.x += parentRender.x;
				ball.y += parentRender.y;
			}

			if(isInside({ x, y }, ball)) {
				return key;
			}
		}

		// No child balls were clicked, check for the parent
		for(const [ key, type, value, parent ] of nodeList) {
			if(type !== "group") continue;
			const ball = { ...state.render[ key ] };

			if(isInside({ x, y }, ball)) {
				return key;
			}

			const selected = findSelectedBall(Object.values(value), key);
			if(selected) return selected;
		}

		return null;
	};

	return findSelectedBall(balls);
};



export const Reducers = {
	context: {
		pick: (state, data) => {
			const selectedBall = findBall(data.x, data.y, state);

			// Return the new state
			return { ...state, selectedBall };
		},
		select: (state, data) => {
			return {
				...state,
				selectedBall: data.key,
			};
		},
		deselect: (state, data) => {
			return {
				...state,
				selectedBall: null,
			};
		},
		move: (state, data) => {
			if(state.selectedBall !== null) {
				const next = { ...state };
				const { x, y } = data;

				let parentKey;
				for(const [ key, type, value, parent ] of flattenNodes(next.data)) {
					if(key === next.selectedBall) {
						parentKey = parent;
						break;
					}
				}

				if(!parentKey) {
					// if there"s no parent group or selectedBall is the group itself, perform move freely
					next.render[ state.selectedBall ].x = x;
					next.render[ state.selectedBall ].y = y;
				} else {
					// move relative to the parent group
					const parentRender = next.render[ parentKey ];
					const childRender = next.render[ state.selectedBall ];

					const dx = x - (childRender.x + parentRender.x);
					const dy = y - (childRender.y + parentRender.y);

					const newChildX = next.render[ state.selectedBall ].x + dx;
					const newChildY = next.render[ state.selectedBall ].y + dy;

					let newChildRadius = Math.sqrt(newChildX * newChildX + newChildY * newChildY);
					if(newChildRadius <= parentRender.r) {
						next.render[ state.selectedBall ].x = newChildX;
						next.render[ state.selectedBall ].y = newChildY;
					}

				}

				return next;
			}

			return state;
		},
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

				if(node.color === 0x0000ff) {
					circle.beginFill(0xaaaaff);
				} else if(node.color === 0x0000bb) {
					circle.beginFill(0x4444bb);
				} else if(node.color === 0xff0000) {
					circle.beginFill(0xffaaaa);
				} else {
					circle.beginFill(0xAAAAAA);
				}
				circle.drawCircle(x, y, r - 5);
				circle.endFill();

				next.stage.addChild(circle);
				next.sprites[ key ] = circle;
			}

			const nodes = flattenNodes(State?.context?.state?.data);
			nodes.sort(([ key1, val1, type1 ], [ key2, val2, type2 ]) => type1 === "group" ? -1 : 1);

			nodes.forEach(([ keyPath, value, type, parent ]) => {
				const lastKey = keyPath.split(".").pop();
				const lastNode = { ...State?.context?.state?.render[ lastKey ] };

				if(parent) {
					const parentRender = State?.context?.state?.render[ parent ];
					lastNode.x += parentRender.x;
					lastNode.y += parentRender.y;
				}

				drawNode(lastNode, lastKey);
			});

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

				if(node.color === 0x0000ff) {
					sprite.beginFill(0xaaaaff);
				} else if(node.color === 0x0000bb) {
					sprite.beginFill(0x4444bb);
				} else if(node.color === 0xff0000) {
					sprite.beginFill(0xffaaaa);
				} else {
					sprite.beginFill(0xAAAAAA);
				}

				sprite.drawCircle(node.x, node.y, node.r - 5);
				sprite.endFill();
			}

			const nodes = flattenNodes(State?.context?.state?.data);
			nodes.sort(([ key1, val1, type1 ], [ key2, val2, type2 ]) => type1 === "group" ? -1 : 1);

			nodes.forEach(([ keyPath, value, type, parent ]) => {
				const lastKey = keyPath.split(".").pop();
				const lastNode = { ...State?.context?.state?.render[ lastKey ] };

				if(parent) {
					const parentRender = State?.context?.state?.render[ parent ];
					lastNode.x += parentRender.x;
					lastNode.y += parentRender.y;
				}

				drawNode(lastNode, lastKey);
			});

			return next;
		},
	},
};

export const State = Chord.Node.Node.CreateMany({
	context: {
		state: {
			selectedBall: null, // null means no ball is currently selected
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
					x: 900,
					y: 400,
					r: 50,
					color: 0xff0000,
				},
				B: {
					x: 600,
					y: 800,
					r: 50,
					color: 0x0000ff,
				},
				C: {
					x: 550,
					y: 300,
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
					x: -25,
					y: -25,
					r: 50,
					color: 0xff0000,
				},
				F: {
					x: 25,
					y: -25,
					r: 50,
					color: 0x0000ff,
				},
				G: {
					x: 0,
					y: 25,
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