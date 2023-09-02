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
		for(const entity of this.entities) {
			//TODO: This doesn't properly account for the Observer's shape (it just assumes a square of 16x16)
			if(entity.state.physics.x < observer.position.x - 8 || entity.state.physics.x > observer.position.x + 8) continue;
			if(entity.state.physics.y < observer.position.y - 8 || entity.state.physics.y > observer.position.y + 8) continue;

			entity.draw({ game, dt, now });
		}
	}
};

export default Zone;