import { IdentityClass } from "../../@node/Identity";
import { RegistryClass } from "../../@node/Registry";

export class AssetManager extends IdentityClass {
	constructor ({ $game, assets = {}, ...args } = {}) {
		super({ ...args });

		this.$game = $game;

		this.registry = new RegistryClass();
	}

	[ Symbol.iterator ]() {
		return Object.entries(this.assets)[ Symbol.iterator ]();
	}

	tick() { }
	draw() { }
};

export default AssetManager;