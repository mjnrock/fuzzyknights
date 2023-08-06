import { IdentityClass } from "../@node/Identity";

/**
 * This is the "Super Map", in the sense that it's a collection of Zones.
 * A World can have many, many zones, such as adjacencies (viv. Portals),
 * caves, buildings, etc.
 */
export class World extends IdentityClass {
	constructor ({ $realm, zones, ...args } = {}) {
		super({ ...args });

		this.$realm = $realm;

		this.zones = zones;
	}

	[ Symbol.iterator ]() {
		return Object.entries(this.zones)[ Symbol.iterator ]();
	}

	tick() { }
	render() { }
};

export default World;