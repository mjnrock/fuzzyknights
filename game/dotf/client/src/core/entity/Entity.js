import { IdentityClass } from "../../@node/Identity";

export const EnumEntityType = {
	GENERIC: "GENERIC",

	// (Pseudo) Terrain
	TERRAIN: "TERRAIN",			// Tile-based terrain
	FLORA: "FLORA",				// X/Y-based flora (e.g. harvestable plant, tree, etc.)
	FAUNA: "FAUNA",				// X/Y-based fauna (e.g. harvestable fish pool, birds, etc.)
	PORTAL: "PORTAL",			// The interactable portal
	DECORATION: "DECORATION",	// Any decoration that can be rendered and/or interacted with (e.g. a signpost, picture frame, etc.)

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

	constructor ({ ...args } = {}) {
		super({ ...args });

		this.type = Entity.EnumType.GENERIC;
		this.reducers = {};
		this.state = {};
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

	tick() { }
	draw() { }
};

export default Entity;