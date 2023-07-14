import Matter from "matter-js";
import * as PIXI from "pixi.js";
import React, { useEffect, useRef } from "react";

export function Sandbox() {
	const gameContainer = useRef(null);

	useEffect(() => {
		if(!gameContainer.current) return;

		const app = new PIXI.Application({ backgroundColor: 0x555555, autoResize: true, resolution: window.devicePixelRatio });
		gameContainer.current.appendChild(app.view);
		app.view.addEventListener('contextmenu', (e) => e.preventDefault());
		app.renderer.resize(window.innerWidth, window.innerHeight);

		const engine = Matter.Engine.create({ gravity: { x: 0, y: 0 } });

		// add the mouse
		let mouse = Matter.Mouse.create(app.view);
		let mouseConstraint = Matter.MouseConstraint.create(engine, {
			mouse: mouse,
			constraint: {
				stiffness: 0.2,
				render: {
					visible: false
				}
			}
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
			ADD_BALL: (x, y) => {
				const ball = Matter.Bodies.circle(x, y, 50, { restitution: 0.8 });
				Matter.World.add(engine.world, ball);
				state.balls.push(ball);
				state.renderRequired = true;
			},
			ADD_SPRING: (ballA, ballB) => {
				const spring = Matter.Constraint.create({
					bodyA: ballA,
					bodyB: ballB,
					stiffness: 0.2, // even more 'springy'
					damping: 0.1, // some damping
					render: { visible: true }
				});
				state.springs.push(spring);
				Matter.World.add(engine.world, spring);
				state.renderRequired = true;
			},

			DELETE_SPRING: (spring) => {
				Matter.World.remove(engine.world, spring);
				state.springs = state.springs.filter(s => s !== spring);
				state.renderRequired = true;
			},
		};

		const dispatch = (action, ...args) => {
			actions[ action ](...args);
		};

		app.view.addEventListener("mousedown", (e) => {
			if(e.altKey) {
				const clickedBall = state.balls.find(ball => Matter.Vertices.contains(ball.vertices, {
					x: ((e.clientX - app.view.getBoundingClientRect().left) - app.stage.position.x) / scale,
					y: ((e.clientY - app.view.getBoundingClientRect().top) - app.stage.position.y) / scale
				}));
				if(clickedBall) {
					state.selectedBall = clickedBall;
				}
				e.preventDefault();
			}
		});

		app.view.addEventListener("mouseup", (e) => {
			if(e.altKey) {
				const clickedBall = state.balls.find(ball => Matter.Vertices.contains(ball.vertices, {
					x: ((e.clientX - app.view.getBoundingClientRect().left) - app.stage.position.x) / scale,
					y: ((e.clientY - app.view.getBoundingClientRect().top) - app.stage.position.y) / scale
				}));
				if(state.selectedBall && clickedBall && state.selectedBall !== clickedBall) {
					dispatch('ADD_SPRING', state.selectedBall, clickedBall);
					state.selectedBall = null;
				}
				e.preventDefault();
			} else if(e.ctrlKey && e.button === 0) {
				dispatch('ADD_BALL', ((e.clientX - app.view.getBoundingClientRect().left) - app.stage.position.x) / scale, ((e.clientY - app.view.getBoundingClientRect().top) - app.stage.position.y) / scale);
				e.preventDefault();
			}
		});

		app.view.addEventListener("mousemove", (e) => {
			mouse.position.x = (e.clientX - app.view.getBoundingClientRect().left) / scale;
			mouse.position.y = (e.clientY - app.view.getBoundingClientRect().top) / scale;
		});

		app.view.addEventListener("contextmenu", (e) => {
			if(e.ctrlKey) {
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
					dispatch('DELETE_SPRING', clickedSpring);
				}

				e.preventDefault();
			} else {
				e.preventDefault();
			}
		});


		app.view.addEventListener("wheel", (e) => {
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
		});


		app.ticker.add(() => {
			if(state.renderRequired) {
				// Remove all previous graphics
				app.stage.removeChildren();

				// Add new graphics
				for(let ball of state.balls) {
					const ballGraphic = new PIXI.Graphics();
					ballGraphic.beginFill(0xBBBBBB);
					ballGraphic.drawCircle(ball.position.x, ball.position.y, ball.circleRadius);
					ballGraphic.endFill();
					app.stage.addChild(ballGraphic);
				}

				for(let spring of state.springs) {
					const springGraphic = new PIXI.Graphics();
					springGraphic.lineStyle(4, 0xffd900, 1);
					springGraphic.moveTo(spring.bodyA.position.x, spring.bodyA.position.y);
					springGraphic.lineTo(spring.bodyB.position.x, spring.bodyB.position.y);
					springGraphic.closePath();
					app.stage.addChild(springGraphic);
				}

				state.renderRequired = false;
			}
		});

		Matter.Events.on(engine, 'afterUpdate', function () {
			// Reposition balls if they leave the viewport and invert their velocity
			for(let ball of state.balls) {
				if(ball.position.x < 0 || ball.position.x > app.renderer.width / scale) {
					Matter.Body.setPosition(ball, { x: Math.min(Math.max(ball.position.x, 0), app.renderer.width / scale), y: ball.position.y });
					Matter.Body.setVelocity(ball, { x: -ball.velocity.x, y: ball.velocity.y });
				}
				if(ball.position.y < 0 || ball.position.y > app.renderer.height / scale) {
					Matter.Body.setPosition(ball, { x: ball.position.x, y: Math.min(Math.max(ball.position.y, 0), app.renderer.height / scale) });
					Matter.Body.setVelocity(ball, { x: ball.velocity.x, y: -ball.velocity.y });
				}
			}
			state.renderRequired = true;
		});

		Matter.Engine.run(engine);

		const resizeHandler = () => {
			app.renderer.resize(window.innerWidth, window.innerHeight);
		};

		window.addEventListener('resize', resizeHandler);

		return () => {
			window.removeEventListener('resize', resizeHandler);
			app.destroy(true, { children: true, texture: true, baseTexture: true });
			Matter.Engine.clear(engine);
			Matter.Mouse.clearSourceEvents(mouse); // clear mouse events
		};
	}, []);

	return <div ref={ gameContainer } style={ { width: '100%', height: '100%', position: 'fixed', top: '0', left: '0' } } />;
}

export default Sandbox;