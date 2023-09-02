import { IdentityClass } from "../../@node/Identity";

/**
 * This is like a Universe, but in the sense that it's a collection of Worlds;
 * additionally, there can be multiple Realms.
 */
export class Realm extends IdentityClass {
	constructor ({ $game, worlds = {}, ...args } = {}) {
		super({ ...args });

		this.$game = $game;

		this.worlds = {};
		this.claim(worlds);
	}
	claim(worlds) {
		for(const key in worlds) {
			worlds[ key ].$realm = this;

			for(const zone of worlds[ key ].zones) {
				zone.$world = worlds[ key ];
			}
		}

		this.worlds = worlds;

		return this;
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

	tick({ game, dt, ip, startTime, lastTime, fps }) {
		const { zone, player: { observer } } = this.current;

		if(observer.subject) {
			const { x, y } = observer.subject();
			observer.position.x = x;
			observer.position.y = y;
		}

		zone.tick({ observer, game, dt, ip, startTime, lastTime, fps });
	}
	draw({ game, dt }) {
		const { zone, player: { observer } } = this.current;
		zone.draw({ observer, game, dt });
	}
};

export default Realm;