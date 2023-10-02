import * as PIXI from "pixi.js";
import { IdentityClass } from "../../@node/Identity";
import { EntityManager } from "../entity/EntityManager";

/**
 * This is a Map, but since that's a "reserved word", we'll call it a Zone.
 */
export class Zone extends IdentityClass {
	constructor ({ $world, terrain = {}, tiles = [], entities = [], portals = {}, ...args } = {}) {
		super({ ...args });

		this.$world = $world;

		this.terrain = terrain;
		this.tiles = tiles;
		this.rows = tiles?.length ?? 0;
		this.columns = tiles?.[ 0 ]?.length ?? this.rows ?? 0;

		this.entities = new EntityManager({ entities });
		this.stage = new PIXI.Container();
	}

	register(...entities) {
		for(const entity of entities) {
			this.entities.register(entity);
			this.stage.addChild(entity.state.render.sprite);
		}

		return this;
	}
	unregister(...entities) {
		for(const entity of entities) {
			this.entities.unregister(entity);
			this.stage.removeChild(entity.state.render.sprite);
		}

		return this;
	}

	section(x, y, width, height) {
		const section = [];
		for(let j = y; j < y + height; j++) {
			for(let i = x; i < x + width; i++) {
				const tile = this.tiles?.[ j ]?.[ i ] || null;

				section.push(tile);
			}
		}

		return section;
	}

	tick({ observer, game, dt, ip, startTime, lastTime, fps }) {
		for(const entity of this.entities) {
			//TODO: This doesn't properly account for the Observer's shape (it just assumes a square of 16x16)
			if(entity.state.physics.x < observer.position.x - 8 || entity.state.physics.x > observer.position.x + 8) continue;
			if(entity.state.physics.y < observer.position.y - 8 || entity.state.physics.y > observer.position.y + 8) continue;

			entity.tick({ game, dt, ip, startTime, lastTime, fps });
		}
	}
	draw({ observer, game, dt, now }) {
		if(game.renderer.app.stage !== this.stage) {
			console.warn(`Switching Stage to Zone ${ this.$id }`);
			game.renderer.app.stage = this.stage;
		}

		//FIXME: The Zone dictating the position here goes against the ViewPort > View > Observer relationship -- refactor this over there
		// set the position of the stage to the middle, center of the screen, minus half the screen size to properly center the observer
		let scaleX = game.config.scale * game.config.tiles.width,
			scaleY = game.config.scale * game.config.tiles.height;
		let nextX = -observer.position.x * scaleX + game.renderer.app.renderer.width / 2 - scaleX / 2,
			nextY = -observer.position.y * scaleY + game.renderer.app.renderer.height / 2 - scaleY / 2;

		// set the position of the stage
		this.stage.x = nextX;
		this.stage.y = nextY;

		// create a pixel offset object, so that the entities can be drawn at the proper position, if visible
		const offset = {
			ox: this.stage.x,
			oy: this.stage.y,
			sx: scaleX,
			sy: scaleY,
		};

		// convert the observer rectangle to a bounding box
		const observerBox = {
			x: observer.position.x - observer.shape.width / 2,
			y: observer.position.y - observer.shape.height / 2,
			width: observer.shape.width,
			height: observer.shape.height,
		};

		for(const entity of this.entities) {
			// Using the observerBox, we can determine if the entity is within the observer's view
			if(
				entity.state.physics.x >= observerBox.x
				&& entity.state.physics.x <= observerBox.x + observerBox.width
				&& entity.state.physics.y >= observerBox.y
				&& entity.state.physics.y <= observerBox.y + observerBox.height
			) {
				entity.state.render.sprite.visible = true;
				entity.draw({ observer, offset, game, dt, now });
			} else {
				entity.state.render.sprite.visible = false;
			}
		}
	};
}

export default Zone;