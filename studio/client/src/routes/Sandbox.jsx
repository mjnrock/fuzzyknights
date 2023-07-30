import Chord from "@lespantsfancy/chord";
import Matter from "matter-js";
import * as PIXI from "pixi.js";
import React, { useEffect, useRef } from "react";

import { Reducers, Nodes } from "../apps/structski/main";

/* Recurse id,type,value objects ("node")*/
const recurse = (node, keyPath) => {
	const nodes = [];

	if([ "id", "type", "value" ].every(key => key in node)) {
		if(node.type === "group") {
			nodes.push([ keyPath, null, "group" ]);
			for(let key in node.value) {
				const newNodes = recurse(node.value[ key ], key);

				nodes.push(...newNodes);
			}
		} else {
			nodes.push([ keyPath, node.value, node.type ]);
		}
	} else {
		for(let key in node) {
			const newNodes = recurse(node[ key ], key);

			nodes.push(...newNodes);
		}
	}

	return nodes;
};

export function Sandbox() {
	const { state: pixiData, dispatch: pixiDispatch } = Chord.Node.React.useNode(Nodes.pixi);
	const { state: contextData, dispatch: contextDispatch } = Chord.Node.React.useNode(Nodes.context);
	const gameContainer = useRef(null);

	useEffect(() => {
		if(!gameContainer.current) return;

		//TODO: Use the Node for the pixi app
		const app = new PIXI.Application({ backgroundColor: 0x555555, autoResize: true, resolution: window.devicePixelRatio });
		gameContainer.current.appendChild(app.view);
		app.view.addEventListener("contextmenu", (e) => e.preventDefault());
		app.renderer.resize(window.innerWidth, window.innerHeight);

		const engine = Matter.Engine.create({
			velocityIterations: 0,
			positionIterations: 1,
			gravity: { x: 0, y: 0 },
		});

		// add the mouse
		let mouse = Matter.Mouse.create(app.view);
		let mouseConstraint = Matter.MouseConstraint.create(engine, {
			// create a mouse constraint that doesn't affect velocity, only position
			constraint: {
				render: { visible: false },
				stiffness: 1,
				damping: 1,
			},
			mouse: mouse,
		});

		// add the mouseConstraint to the world
		Matter.World.add(engine.world, mouseConstraint);

		let scale = 1;
		const state = {
			balls: [],
			springs: [],
			selectedBall: null,
			renderRequired: false,
		};

		const actions = {
			ADD_BALL: (x, y, { key, value, type } = {}) => {
				const ball = Matter.Bodies.circle(x, y, 50, { restitution: 0, render: { visible: true } });

				// create and store graphics for ball
				const ballGraphic = new PIXI.Graphics();

				if(type === "group") {
					ballGraphic.beginFill(0xBBBBBB);
				} else if(type === "str") {
					ballGraphic.beginFill(0xC24F4F);
				} else if(type === "int32") {
					ballGraphic.beginFill(0x4FA5C2);
				} else {
					ballGraphic.beginFill(Math.random() * 0xFFFFFF);
				}
				ballGraphic.drawCircle(0, 0, ball.circleRadius);
				ballGraphic.endFill();

				ball.render.graphic = ballGraphic;
				app.stage.addChild(ballGraphic);

				Matter.World.add(engine.world, ball);
				state.balls.push(ball);
				state.renderRequired = true;
			},
			ADD_SPRING: (ballA, ballB) => {
				const spring = Matter.Constraint.create({
					bodyA: ballA,
					bodyB: ballB,
					stiffness: 1,
					damping: 1,
					render: { visible: true }
				});

				// create and store graphics for spring
				const springGraphic = new PIXI.Graphics();
				console.log(ballA.render.graphic.tint, ballB.render.graphic.tint)
				console.log(ballA.render.graphic.tint.toString(16), ballB.render.graphic.tint.toString(16))
				if(ballA.render.graphic.tint === ballB.render.graphic.tint) {
					springGraphic.lineStyle(4, ballA.render.graphic.tint.toString(16), 1);
				} else {
					springGraphic.lineStyle(4, 0xffd900, 1);
				}

				springGraphic.moveTo(0, 0);
				springGraphic.lineTo(1, 1);
				springGraphic.closePath();

				spring.render.graphic = springGraphic;
				app.stage.addChild(springGraphic);

				state.springs.push(spring);
				Matter.World.add(engine.world, spring);
				state.renderRequired = true;
			},
			DELETE_SPRING: (spring) => {
				app.stage.removeChild(spring.render.graphic);  // remove spring graphic
				Matter.World.remove(engine.world, spring);
				state.springs = state.springs.filter(s => s !== spring);
				state.renderRequired = true;
			},
			DELETE_BALL: (ball) => {
				app.stage.removeChild(ball.render.graphic);  // remove ball graphic
				Matter.World.remove(engine.world, ball);
				state.balls = state.balls.filter(b => b !== ball);
				state.renderRequired = true;
			},
		};

		const dispatch = (action, ...args) => {
			actions[ action ](...args);
		};

		for(const [ key, value, type ] of recurse(contextData.data)) {
			dispatch("ADD_BALL", Math.random() * app.renderer.width / scale, Math.random() * app.renderer.height / scale, { key, value, type });
		}

		const listeners = {
			mousedown: (e) => {
				if(e.button === 2) {
					const clickedBall = state.balls.find(ball => Matter.Vertices.contains(ball.vertices, {
						x: ((e.clientX - app.view.getBoundingClientRect().left) - app.stage.position.x) / scale,
						y: ((e.clientY - app.view.getBoundingClientRect().top) - app.stage.position.y) / scale
					}));
					if(clickedBall) {
						state.selectedBall = clickedBall;
					}
					e.preventDefault();
				}
			},
			mouseup: (e) => {
				if(e.ctrlKey && e.button === 2) {
					const clickedBall = state.balls.find(ball => Matter.Vertices.contains(ball.vertices, {
						x: ((e.clientX - app.view.getBoundingClientRect().left) - app.stage.position.x) / scale,
						y: ((e.clientY - app.view.getBoundingClientRect().top) - app.stage.position.y) / scale
					}));
					if(state.selectedBall && clickedBall && state.selectedBall !== clickedBall) {
						dispatch("ADD_SPRING", state.selectedBall, clickedBall);
						state.selectedBall = null;
					}
					e.preventDefault();
				} else if(e.ctrlKey && e.button === 0) {
					dispatch("ADD_BALL", ((e.clientX - app.view.getBoundingClientRect().left) - app.stage.position.x) / scale, ((e.clientY - app.view.getBoundingClientRect().top) - app.stage.position.y) / scale);
					e.preventDefault();
				} else if(e.altKey && e.button === 0) {
					const clickedBall = state.balls.find(ball => Matter.Vertices.contains(ball.vertices, {
						x: ((e.clientX - app.view.getBoundingClientRect().left) - app.stage.position.x) / scale,
						y: ((e.clientY - app.view.getBoundingClientRect().top) - app.stage.position.y) / scale
					}));
					if(clickedBall) {
						dispatch("DELETE_BALL", clickedBall);
					}
					e.preventDefault();
				} else if(e.button === 2) {
					state.selectedBall = null;
					e.preventDefault();
				}
			},
			mousemove: (e) => {
				mouse.position.x = (e.clientX - app.view.getBoundingClientRect().left) / scale;
				mouse.position.y = (e.clientY - app.view.getBoundingClientRect().top) / scale;
			},
			contextmenu: (e) => {
				if(e.altKey) {
					const clickedPoint = {
						x: ((e.clientX - app.view.getBoundingClientRect().left) - app.stage.position.x) / scale,
						y: ((e.clientY - app.view.getBoundingClientRect().top) - app.stage.position.y) / scale
					};

					const clickedSpring = state.springs.find(spring => {
						const distanceToA = Matter.Vector.magnitude(Matter.Vector.sub(clickedPoint, spring.bodyA.position));
						const distanceToB = Matter.Vector.magnitude(Matter.Vector.sub(clickedPoint, spring.bodyB.position));
						const springLength = Matter.Vector.magnitude(Matter.Vector.sub(spring.bodyA.position, spring.bodyB.position));

						return distanceToA + distanceToB <= springLength + 1;
					});

					if(clickedSpring) {
						dispatch("DELETE_SPRING", clickedSpring);
					}

					e.preventDefault();
				} else {
					e.preventDefault();
				}
			},
			wheel: (e) => {
				const delta = -Math.sign(e.deltaY);
				scale += delta * 0.1;
				scale = Math.min(Math.max(scale, 0.1), 2);
				app.stage.scale.set(scale, scale);

				// scale the mouse to match the scale of the canvas
				mouse.scale = {
					x: 1 / scale,
					y: 1 / scale
				};

				e.preventDefault();
			},
		};

		for(let key in listeners) {
			app.view.addEventListener(key, listeners[ key ]);
		}

		// create and add an fps text object
		const fpsLog = [];
		const fpsText = new PIXI.Text("FPS: 0", { fontFamily: "Arial", fontSize: 24, fill: 0xffffff, align: "center" });
		app.stage.addChild(fpsText);

		app.ticker.add(() => {
			if(state.renderRequired) {
				// Update graphics
				for(let ball of state.balls) {
					ball.render.graphic.position.set(ball.position.x, ball.position.y);
				}

				for(let spring of state.springs) {
					spring.render.graphic.clear();
					spring.render.graphic.lineStyle(4, 0xffd900, 1);
					spring.render.graphic.moveTo(spring.bodyA.position.x, spring.bodyA.position.y);
					spring.render.graphic.lineTo(spring.bodyB.position.x, spring.bodyB.position.y);
				}

				state.renderRequired = false;
			}

			fpsLog.push(app.ticker.FPS);
			// update the text with the new fps averaging the fpsLog
			fpsText.text = `FPS: ${ Math.round(fpsLog.reduce((a, b) => a + b, 0) / fpsLog.length) }`;

			if(fpsLog.length > 250) {
				fpsLog.shift();
			}
		});

		Matter.Events.on(engine, "afterUpdate", function () {
			// Reposition balls if they leave the viewport and invert their velocity
			for(let ball of state.balls) {
				if(ball.position.x < 0 || ball.position.x > app.renderer.width / scale) {
					Matter.Body.setPosition(ball, { x: Math.min(Math.max(ball.position.x, 0), app.renderer.width / scale), y: ball.position.y });
					// Matter.Body.setVelocity(ball, { x: -ball.velocity.x, y: ball.velocity.y });
				}
				if(ball.position.y < 0 || ball.position.y > app.renderer.height / scale) {
					Matter.Body.setPosition(ball, { x: ball.position.x, y: Math.min(Math.max(ball.position.y, 0), app.renderer.height / scale) });
					// Matter.Body.setVelocity(ball, { x: ball.velocity.x, y: -ball.velocity.y });
				}
			}
			state.renderRequired = true;
		});

		Matter.Runner.run(engine);

		const resizeHandler = () => {
			app.renderer.resize(window.innerWidth, window.innerHeight);
		};

		window.addEventListener("resize", resizeHandler);

		return () => {
			window.removeEventListener("resize", resizeHandler);
			app.destroy(true, { children: true, texture: true, baseTexture: true });
			Matter.Engine.clear(engine);
			Matter.Mouse.clearSourceEvents(mouse); // clear mouse events
			Matter.World.clear(engine.world, false);
		};
	}, []);

	return <div ref={ gameContainer } style={ { width: "100%", height: "100%", position: "fixed", top: "0", left: "0" } } />;
}

export default Sandbox;