import Registry from "../../@node/Registry";
import { IdentityClass } from "../../@node/Identity";
import { EnumEntityType } from "./Entity";

export class EntityManager extends IdentityClass {
	constructor ({ collections = {}, ...args } = {}) {
		super({ ...args });

		this.collections = {};
		for(const type in EnumEntityType) {
			const collection = new Registry.RegistryClass({ entries: collections?.[ type ] || {} });

			this.collections[ type ] = collection;
		}
	}

	[ Symbol.iterator ]() {
		const entityArray = [];

		for(const type in this.collections) {
			const collection = this.collections[ type ];
			for(const entity of collection) {	// As the collection is a RegistryClass, this will already be ENTRY types only.
				entityArray.push(entity);
			}
		}

		return entityArray[ Symbol.iterator ]();
	}
};

export default EntityManager;