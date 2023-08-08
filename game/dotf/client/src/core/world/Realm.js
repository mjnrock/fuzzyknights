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

	get current() {
		const player = this.$game.players.player;
		const { observer } = player;

		return {
			player,
			zone: observer.zone,
		};
	}

	[ Symbol.iterator ]() {
		return Object.entries(this.worlds)[ Symbol.iterator ]();
	}

	tick({ dt, ip, startTime, lastTime, fps }) {
		const { zone, player: { observer } } = this.$game.realm.current;

		zone.tick({ observer, dt, ip, startTime, lastTime, fps });
	}
	draw({ dt }) {
		const { zone, player: { observer } } = this.$game.realm.current;

		zone.draw({ observer, dt });
	}
};

export default Realm;