import { IdentityClass } from "../../@node/Identity";
import { EntityManager } from "../entity/EntityManager";

/**
 * This is a Map, but since that's a "reserved word", we'll call it a Zone.
 */
export class Zone extends IdentityClass {
	constructor ({ $world, rows, cols, tiles = [], entities = [], portals = {}, ...args } = {}) {
		super({ ...args });

		this.$world = $world;

		this.rows = rows ?? tiles?.length ?? 0;
		this.cols = cols ?? tiles?.[ 0 ]?.length ?? 0;
		this.tiles = tiles;

		this.entities = new EntityManager({ entities });
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

	tick() { }
	render() { }
};

export default Zone;