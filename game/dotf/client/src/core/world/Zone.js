import { IdentityClass } from "../@node/Identity";

/**
 * This is a Map, but since that's a "reserved word", we'll call it a Zone.
 */
export class Zone extends IdentityClass {
	constructor ({ $world, tiles = [], entities = {}, portals = {}, ...args } = {}) {
		super({ ...args });

		this.$world = $world;

		this.tiles = tiles;
		this.entities = entities;
		this.portals = portals;
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