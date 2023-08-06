import { IdentityClass } from "../../@node/Identity";

/**
 * This is like a Universe, but in the sense that it's a collection of Worlds;
 * additionally, there can be multiple Realms.
 */
export class Realm extends IdentityClass {
	constructor ({ $game, worlds = {}, ...args } = {}) {
		super({ ...args });

		this.$game = $game;

		this.worlds = worlds;
	}

	[ Symbol.iterator ]() {
		return Object.entries(this.worlds)[ Symbol.iterator ]();
	}

	tick() { }
	render() { }
};

export default Realm;