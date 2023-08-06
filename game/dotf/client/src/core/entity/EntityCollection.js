import { IdentityClass } from "../@node/Identity";
import { EnumEntryType, RegistryClass } from "../../@node/Registry";

/**
 * Similarly to the Entity, the EntityCollection is a stripped-down
 * version of a Registry, but is specifically for Entities.
 */
export class EntityCollection extends IdentityClass {
	constructor ({ entities = {}, ...args } = {}) {
		super({ ...args });

		this.set(entities);
	}

	[ Symbol.iterator ]() {
		return Object.entries(this.entities)[ Symbol.iterator ]();
	}

	/**
	 * A broadcast-like convenience method for calling next() on all entities.
	 */
	next(action, ...args) {
		const results = [];

		for(const entity of Object.values(this.entities)) {
			results.push(entity.next(action, ...args));
		}

		return results;
	}
	async nextAsync(action, ...args) {
		// create a group-level promise
		return new Promise((resolve, reject) => {
			// create a list of promises
			const promises = [];

			// for each entity
			for(const entity of Object.values(this.entities)) {
				// create a promise for the entity
				const promise = entity.nextAsync(action, ...args);

				// add the promise to the list
				promises.push(promise);
			}

			// resolve the group-level promise with the list of promises
			resolve(Promise.all(promises));
		});
	}

	tick({ ...args } = {}) {
		for(const entry of Object.values(this.entities)) {
			if(entry.type === EnumEntryType.ENTRY) {
				const entity = entry.value;

				entity.tick({ ...args });
			}
		}
	}
	render({ ...args } = {}) {
		for(const entry of Object.values(this.entities)) {
			if(entry.type === EnumEntryType.ENTRY) {
				const entity = entry.value;

				entity.render({ ...args });
			}
		}
	}

	set(entities) {
		if(Array.isArray(entities)) {
			this.entities = entities.reduce((acc, entity) => {
				acc[ entity.$id ] = entity;

				return acc;
			}, {});
		} else {
			this.entities = entities;
		}

		return this;
	}
	add(...entities) {
		for(const entity of entities) {
			this.entities[ entity.$id ] = entity;
		}
	}
	remove(...entities) {
		for(const entity of entities) {
			delete this.entities[ entity.$id ];
		}
	}
	has(entity) {
		return this.entities.hasOwnProperty(entity.$id);
	}

	each(fn, ...args) {
		for(const entity of Object.values(this.entities)) {
			fn(entity, ...args);
		}
	}
	map(fn, ...args) {
		return Object.values(this.entities).map(entity => fn(entity, ...args));
	}
	reduce(fn, initial, ...args) {
		return Object.values(this.entities).reduce((acc, entity) => fn(acc, entity, ...args), initial);
	}
	filter(fn, ...args) {
		return Object.values(this.entities).filter(entity => fn(entity, ...args));
	}
	filterByMask(mask = []) {
		return Object.values(this.entities).filter((entity, index) => mask[ index ]);
	}
	filterByComponent(...components) {
		return Object.values(this.entities).filter(entity => components.every(component => entity.hasOwnProperty(component)));
	}
	filterByType(...types) {
		return Object.values(this.entities).filter(entity => types.includes(entity.type));
	}

	union(...entityCollections) {
		return new EntityCollection({
			entities: [
				...Object.values(this.entities),
				...entityCollections.reduce((acc, collection) => [ ...acc, ...Object.values(collection.entities) ], []),
			],
		});
	}
	intersection(...entityCollections) {
		return new EntityCollection({
			entities: [
				...Object.values(this.entities),
				...entityCollections.reduce((acc, collection) => [ ...acc, ...Object.values(collection.entities) ], []),
			].reduce((acc, entity) => {
				if(acc.hasOwnProperty(entity.$id)) {
					acc[ entity.$id ] = entity;
				}

				return acc;
			}, {}),
		});
	}


	mapToNew(fn, ...args) {
		return new EntityCollection({
			entities: Object.values(this.entities).map(entity => fn(entity, ...args)),
		});
	}
	reduceToNew(fn, initial, ...args) {
		return new EntityCollection({
			entities: Object.values(this.entities).reduce((acc, entity) => fn(acc, entity, ...args), initial),
		});
	}
	filterToNew(fn, ...args) {
		return new EntityCollection({
			entities: Object.values(this.entities).filter(entity => fn(entity, ...args)),
		});
	}
	filterByMaskToNew(mask = []) {
		return new EntityCollection({
			entities: Object.values(this.entities).filter((entity, index) => mask[ index ]),
		});
	}
	filterByComponentToNew(...components) {
		return new EntityCollection({
			entities: Object.values(this.entities).filter(entity => components.every(component => entity.hasOwnProperty(component))),
		});
	}
	filterByTypeToNew(...types) {
		return new EntityCollection({
			entities: Object.values(this.entities).filter(entity => types.includes(entity.type)),
		});
	}
};

export default EntityCollection;