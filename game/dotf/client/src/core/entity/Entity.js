import { IdentityClass } from "../../@node/Identity";

export const EnumShape = {
	CIRCLE: "CIRCLE",
	RECTANGLE: "RECTANGLE",
};

export const EnumEntityType = {
	GENERIC: "GENERIC",

	// (Pseudo) Terrain
	TERRAIN: "TERRAIN",			// Tile-based terrain
	FLORA: "FLORA",				// X/Y-based flora (e.g. harvestable plant, tree, etc.)
	FAUNA: "FAUNA",				// X/Y-based fauna (e.g. harvestable fish pool, birds, etc.)
	PORTAL: "PORTAL",			// The interactable portal
	DECORATION: "DECORATION",	// Any decoration that can be rendered and/or interacted with (e.g. a signpost, picture frame, etc.)
	TREASURE: "TREASURE",		// Any treasure that can be interacted with (e.g. a chest, a barrel, etc.)
	SPAWNER: "SPAWNER",			// Any spawner that can spawn entities (e.g. a monster spawner, a chest, etc.)

	// (Pseudo) Entities
	CREATURE: "CREATURE",		// Any creature that uses AI
	EFFECT: "EFFECT",			// A general term for any "collision effect" (e.g. heal spell, arrow, melee attack, etc.) (think affliction, but not necessarily negative)
	ITEM: "ITEM",				// Any item that can be picked up and/or used

	// (Pseudo) Perceptual Effects
	VISUAL: "VISUAL",			// Any visual effect that can be rendered
	SOUND: "SOUND",				// Any sound effect that can be played
};

/**
 * This is sort of like a stripped-down version of a Node.  The primary motivation here
 * is that, in practice, Entities will most often be updated in bulk (i.e. tick), so
 * the overhead of a Node is problematic at scale.  This is thus meant to be a minimal
 * wrapper around a functional data object, with some additional "node-like" functionality.
 */
export class Entity extends IdentityClass {
	static EnumType = EnumEntityType;

	constructor ({ id, tags, type, tick, draw, ...components } = {}) {
		super({ id, tags });

		this.type = type ?? Entity.EnumType.GENERIC;
		this.reducers = {};
		this.state = {};

		for(const key in components) {
			if(key[ 0 ] === "$") {
				this[ key ] = components[ key ];
			} else {
				this.state[ key ] = components[ key ];
			}
		}

		if(tick) {
			this.tick = tick.bind(this);
		}
		if(draw) {
			this.draw = draw.bind(this);
		}
	}

	[ Symbol.iterator ]() {
		return Object.entries(this.state)[ Symbol.iterator ]();
	}

	next(action, ...args) {
		const next = this.reducers[ action ]({
			self: this,
			state: this.state
		}, ...args);

		this.state = next;

		return next;
	}
	async nextAsync(action, ...args) {
		return new Promise((resolve, reject) => {
			resolve(this.next(action, ...args));
		});
	}


	tick({ observer, game, dt, ip, startTime, lastTime, fps }) { }
	draw({ observer, offset, game, dt, now }) {
		const graphics = this.state.render.sprite;
		const entity = this.state;

		/* If the entity is within the observer's view, render it */
		graphics.visible = true;

		// clear previous line
		graphics.clear();

		const { sx, sy } = offset;
		graphics.x = entity.physics.x * sx;
		graphics.y = entity.physics.y * sy;

		// redraw entity
		graphics.beginFill("#FFF", 1.0);

		switch(entity.model.type) {
			case EnumShape.CIRCLE:
				graphics.drawCircle(entity.model.ox * game.config.scale, entity.model.oy * game.config.scale, entity.model.radius * game.config.scale);
				break;
			case EnumShape.RECTANGLE:
				graphics.drawRect(entity.model.ox * game.config.scale, entity.model.oy * game.config.scale, entity.model.width * game.config.scale, entity.model.height * game.config.scale);
				graphics.rotation = entity.physics.theta;
				break;
			default:
				break;
		}
		graphics.endFill();
	}
};

export default Entity;