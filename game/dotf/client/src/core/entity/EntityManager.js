import { IdentityClass } from "../../@node/Identity";
import { EnumEntityType } from "./Entity";
import { EntityCollection } from "./EntityCollection";

/**
 * The EntityManager is a container for all EntityCollections, differentiated
 * by their type (as defined in the EnumEntityType).  As such, there will be
 * a resulting EntityCollection for each EnumEntityType.
 * 
 * Iterating over the EntityManager will iterate over all EntityCollections,
 * collapsed into a single array.  Accordingly, this method can be used to
 * indiscriminately iterate over all entities in the EntityManager.
 */
export class EntityManager extends IdentityClass {
	constructor ({ entities = [], ...args } = {}) {
		super({ ...args });

		this.collections = {};
		for(const type in EnumEntityType) {
			const collection = new EntityCollection();

			this.collections[ type ] = collection;
		}

		if(entities.length) {
			for(const entity of entities) {
				const collection = this.collections[ entity.type ];

				collection.register(entity);

				this.collections[ entity.type ] = collection;
			}
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

	register(entity) {
		this.collections[ entity.type ].register(entity);

		return this;
	}
	unregister(entity) {
		this.collections[ entity.type ].unregister(entity);

		return this;
	}
};

export default EntityManager;