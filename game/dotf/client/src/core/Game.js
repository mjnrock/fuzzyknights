import Chord from "@lespantsfancy/chord";
import Node from "../@node/Node";

import { GameLoop } from "./GameLoop.js";
import { Pixi } from "./render/Pixi.js";
import Input from "./input/package.js";

export class Game extends Node {
	static Instances = new Map();
	static GetInstance(id) {
		let game;
		if(id) {
			return Game.Instances.get(id);
		} else {
			game = Game.Instances.values().next().value;
		}

		return game;
	}

	constructor ({ input = {}, pixi = {}, loop = {}, assets = {}, $nodes = {}, $factory = {}, $registry = {}, $run, ...self } = {}) {
		super({ ...self, $run: false });	// Don't run the init function quite yet

		/**
		 * A common registry for all Nodes and Data with a $id property.
		 * Primarily, this is used for data/instances that are worth tracking.
		 */
		this.$registry = Chord.Node.Registry.Registry.New($registry);
		/**
		 * This contains all of the Nodes that are part of the game.
		 */
		this.$nodes = typeof $nodes === "function" ? $nodes({ $game: this }) : $nodes;

		/**
		 * The interactive assets that are loaded into the game, such as images, sounds, etc.
		 */
		//TODO: Create a ContentManager
		this.assets = {
			spritesheets: {},
			textures: {},
			cadences: {},
			sequences: {},
			...assets,
		};


		//NOTE: The instantiation order below is important

		/**
		 * The renderer is the PixiJS instance that handles the rendering of the game.
		 */
		this.renderer = new Pixi({
			$game: this,
			pixi,
			onRender: (...args) => this.render.call(this, ...args),
		});

		/**
		 * The input object contains all of the input handlers for the game,
		 * such as keyboard and mouse.
		 */
		this.input = {
			key: new Input.KeyInput({
				$game: this,
				...(input.key ?? {}),
			}),
			mouse: new Input.MouseInput({
				$game: this,
				...(input.mouse ?? {}),
			}),
		};

		/**
		 * The game loop is the main loop that handles the game's tick.
		 */
		this.loop = new GameLoop({
			$game: this,
			...loop,
			onTick: (...args) => this.tick.call(this, ...args),
		});

		if($run) {
			this.init.call(this, ...(Array.isArray($run) ? $run : []));
		}

		Game.Instances.set(this.$id, this);
	}
	deconstructor() {
		Game.Instances.delete(this.$id);
	}

	/**
	 * Allow Node(s) to be dispatched to.  If an empty array is passed,
	 * all nodes will be dispatched to.
	 */
	$dispatch(nodeUuid, action, ...args) {
		if(Array.isArray(nodeUuid)) {
			const results = [];

			if(nodeUuid.length === 0) {
				for(const key in this.$nodes) {
					results.push(this.$nodes[ key ].dispatch(action, ...args));
				}
			} else {
				for(const uuid of nodeUuid) {
					results.push(this.$nodes[ uuid ].dispatch(action, ...args));
				}
			}

			return results;
		}

		const node = this.$nodes[ nodeUuid ];

		if(node) {
			return node.dispatch(action, ...args);
		}

		return;
	}
	$emit(nodeUuid, event, ...args) {
		if(Array.isArray(nodeUuid)) {
			const results = [];

			if(nodeUuid.length === 0) {
				for(const key in this.$nodes) {
					results.push(this.$nodes[ key ].emit(event, ...args));
				}
			} else {
				for(const uuid of nodeUuid) {
					results.push(this.$nodes[ uuid ].emit(event, ...args));
				}
			}

			return results;
		}

		const node = this.$nodes[ nodeUuid ];

		if(node) {
			return node.emit(event, ...args);
		}

		return;
	}
	$next(reducer, target, ...args) {
		const next = reducer(target, ...args);

		this.$registry[ next.$id ].value = next;

		return next;
	}

	tick({ dt, ip, startTime, lastTime, fps }) { }
	render(dt) { }
};

export default Game;