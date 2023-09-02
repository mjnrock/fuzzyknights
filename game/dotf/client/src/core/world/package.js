import * as PIXI from "pixi.js";

import Zone from "./Zone.js";
import World from "./World.js";
import Realm from "./Realm.js";

import Entity from "../entity/Entity.js";

export const Factory = {
	genericWorlds(realm = []) {
		const worlds = realm.map(world => {
			const zones = world.map(({ ...args }) => {
				const zone = new Zone({ ...args });

				for(const row of zone.tiles) {
					for(const tile of row) {
						const terrainEntity = new Entity({
							type: Entity.EnumType.TERRAIN,

							$zone: zone,
							terrain: tile.data,
							physics: {
								x: tile.x,
								y: tile.y,
							},
							render: {
								isDirty: true,
								sprite: new PIXI.Graphics(),
							},

							draw: function ({ game, dt, now }) {
								if(!this.state.render.isDirty) return;

								const terrain = zone.terrain[ this.state.terrain ];

								this.state.render.sprite.clear();
								this.state.render.sprite.beginFill(terrain.texture, 1.0);
								this.state.render.sprite.drawRect(0, 0, game.config.tiles.width * game.config.scale, game.config.tiles.height * game.config.scale);
								this.state.render.sprite.endFill();

								this.state.render.sprite.x = this.state.physics.x * game.config.tiles.width * game.config.scale;
								this.state.render.sprite.y = this.state.physics.y * game.config.tiles.height * game.config.scale;

								this.state.render.isDirty = false;
							},
						});

						zone.register(terrainEntity);
					}
				}

				return zone;
			});

			return new World({ zones });
		});

		return worlds;
	},
};

export default {
	Factory,

	Zone,
	World,
	Realm,
};