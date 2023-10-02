import Chord from "@lespantsfancy/chord";
import Node from "../@node/Node";

import { GameLoop } from "./GameLoop.js";
import { Pixi } from "./render/Pixi.js";
import Input from "./input/package.js";
import Realm from "./world/Realm";
import AssetManager from "./assets/AssetManager";
import InputManager from "./input/InputManager";
import { ViewPort } from "./viewport/ViewPort";

export class Game extends Node {
	static Instances = new Map();
	static GetInstance(id) {
		let game;
		if(id) {
			game = Game.Instances.get(id);
		} else {
			game = Game.Instances.values().next().value;
		}

		return game;
	}

	constructor ({ input = {}, players = {}, realm = {}, pixi = {}, loop = {}, assets = {}, config = {}, viewport = {}, $registry = {}, $run, ...self } = {}) {
		super({ ...self, $run: false });	// Don't run the init function quite yet

		/**
		 * A common registry for all Nodes and Data with a $id property.
		 * Primarily, this is used for data/instances that are worth tracking.
		 */
		this.$registry = Chord.Node.Registry.Registry.New($registry);

		/**
		 * The configuration object for the game.
		 */
		this.config = {
			...config,
		};

		/**
		 * The interactive assets that are loaded into the game, such as images, sounds, etc.
		 */
		this.assets = new AssetManager(assets);

		/**
		 * The renderer is the PixiJS instance that handles the rendering of the game.
		 */
		this.renderer = new Pixi({
			$game: this,
			pixi,
			onDraw: (...args) => this.draw.call(this, ...args),
		});
		this.renderer.app.ticker.add((delta) => {
			this.draw.call(this, {
				game: this,
				dt: delta,
				ip: (delta * 1000) / this.loop.spf,
				now: Date.now(),
			});
		});

		/**
		 * The input object contains all of the input handlers for the game,
		 * such as keyboard and mouse.
		 */
		this.input = new InputManager({
			$game: this,
			...input,
		})

		/**
		 * The game loop is the main loop that handles the game's tick.
		 */
		this.loop = new GameLoop({
			$game: this,
			...loop,
			onTick: (...args) => this.tick.call(this, ...args),
		});

		this.realm = new Realm({ $game: this, ...realm });
		this.players = players;

		this.viewport = {
			current: new ViewPort({ $game: this, ...viewport }),
		};

		if($run) {
			this.init.call(this, ...(Array.isArray($run) ? $run : []));
		}

		Game.Instances.set(this.$id, this);
	}
	deconstructor() {
		Game.Instances.delete(this.$id);
	}

	tick({ game, dt, ip, startTime, lastTime, fps }) { }
	draw({ game, dt, now }) { }
};

export default Game;