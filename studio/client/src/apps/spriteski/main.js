import { v4 as uuid } from "uuid";
import Chord from "@lespantsfancy/chord";

import { EnumFieldType } from "../../@form/EnumFieldType";
import { LTRTTB } from "./modules/tessellator/data/algorithms/LTRTTB";
import Form from "./modules/nominator/Form";
import Base64 from "../../util/Base64";
import Serialize from "../../util/Serialize";
import SqlHelper from "../../lib/SqlHelper";

export const Helpers = {
	tessellator: {
		getFormData(state, schema) {
			const recurser = (field, data = {}) => {
				if(field.type === EnumFieldType.FORM || field.type === EnumFieldType.SECTION) {
					for(const subField of field.state) {
						recurser(subField, data);
					}
				} else {
					data[ field.name ] = state?.form?.data?.[ field.name ] ?? field.state;
				}

				return data;
			};

			const next = recurser(schema);

			return next;
		},
		calcFields: (state) => {
			// use the pattern array to create a Field array
			const next = [];
			for(const key in state.form.data) {
				const value = state.form.data[ key ];

				next.push({
					id: uuid(),
					type: EnumFieldType.NUMBER,
					name: key,
					meta: {
						label: key,
					},
					state: +value,
				});
			}

			return {
				id: uuid(),
				type: EnumFieldType.FORM,
				name: "@root",
				state: [
					{
						id: uuid(),
						type: EnumFieldType.SECTION,
						name: "@section",
						meta: {
							isVirtual: false,
						},
						state: next,
					},
				],
			};
		},
	},
	nominator: {
		getFormData(state, schema) {
			const recurser = (field, data = {}) => {
				if(field.type === EnumFieldType.FORM || field.type === EnumFieldType.SECTION) {
					for(const subField of field.state) {
						recurser(subField, data);
					}
				} else {
					data[ field.name ] = state?.form?.data?.[ field.name ] ?? field.state;
				}

				return data;
			};

			const next = recurser(schema);

			return next;
		},
		calcPattern(phrase) {
			// split the pattern-phrase into an array of words
			const pattern = [];
			const values = phrase.split("-");

			//FIXME: Hard-coded words don't appear to be working -- perhaps the value isn't making it into the form (which is the only source of data)?

			for(let i = 0; i < values.length; i++) {
				let word = values[ i ].trim();
				if(word.startsWith("{") && word.endsWith("}")) {
					const variable = word.slice(1, -1).trim();

					if(variable.startsWith("$")) {
						pattern.push(variable);
					} else {
						pattern.push(`@${ variable }`);
					}
				} else {
					pattern.push(word);
				}
			}

			return pattern;
		},
		calcFields: (pattern) => {
			// use the pattern array to create a Field array
			const next = [];
			for(let word of pattern) {
				if(word.startsWith("@")) {
					let name = word.slice(1);

					if(name.startsWith("$")) {
						word = name;
					}

					next.push({
						id: uuid(),
						type: EnumFieldType.TEXT,
						name: word,
						meta: {
							label: name,
							isConfigurable: true,
						},
						state: null,
					});
				} else {
					next.push({
						id: uuid(),
						type: EnumFieldType.TEXT,
						name: word,
						meta: {
							label: word,
							isConfigurable: false,
						},
						state: word,
					});
				}
			}

			return {
				id: uuid(),
				type: EnumFieldType.FORM,
				name: "@root",
				state: [
					{
						id: uuid(),
						type: EnumFieldType.SECTION,
						name: "@section",
						meta: {
							isVirtual: false,
						},
						state: next,
					},
				],
			};
		},

		serialize: async (nominations) => {
			const nextNomination = {};

			for(const name in nominations) {
				const tile = nominations[ name ];
				const nextTile = {
					...tile,
					data: await Base64.Encode(tile.data),
				};

				nextNomination[ nextTile.$id ] = nextTile;
			}

			return Serialize.stringify(nextNomination);
		},
		deserialize: async (json) => {
			const nominations = Serialize.parse(json);
			const next = {};

			for(let id in nominations) {
				const tile = nominations[ id ];
				next[ id ] = {
					...tile,
					data: await Base64.Decode(tile.data),
				};
			}

			return next;
		},
	},
	viewer: {
		loadTextures: async (self) => {
			SqlHelper.query(`SELECT * FROM DotF.Texture`)
				.then(result => {
					// gather and dispatch all of the promises from the Base64.Decode() calls to every texture in textures
					const promises = result.map(async (texture) => {
						texture.Base64 = await Base64.Decode(texture.Base64);
						return texture;
					});

					// wait for all of the promises to resolve, then dispatch the decoded textures
					Promise.all(promises)
						.then(textures => self.dispatch("setTextures", textures));
				})
				.catch(err => console.error(err));
		},
		loadNamespaces: async (self) => {
			SqlHelper.query(`SELECT * FROM DotF.vwTextureNamespace`)
				.then(result => self.dispatch("setNamespaces", result))
				.catch(err => console.error(err));
		},
	},
};

export const Reducers = {
	tessellator: {
		togglePreview(state, value) {
			return {
				...state,
				preview: value ?? !state.preview,
			};
		},
		setSize(state) {
			const { source } = state;
			const { tw } = state.form.data;

			return {
				...state,
				size: Math.ceil(source.width / tw),
			};
		},
		setSource(state, source) {
			const canvas = document.createElement("canvas");
			const ctx = canvas.getContext("2d");

			canvas.width = source.width;
			canvas.height = source.height;

			ctx.drawImage(source, 0, 0);

			return {
				...state,
				source: canvas,
				size: Math.ceil(source.width / state.form.data.tw),
			};
		},
		setFormData(state, data) {
			const { form } = state;

			return {
				...state,
				form: {
					...form,
					data,
				},
			};
		},
		setFormSchema(state, schema) {
			const { form } = state;

			return {
				...state,
				form: {
					...form,
					schema,
				},
			};
		},
		updateFieldValues(state, [ name, value ]) {
			const { form } = state;

			return {
				...state,
				form: {
					...form,
					data: {
						...form.data,
						[ name ]: value,
					},
				},
			};
		},
		async tessellate(state) {
			const { source, algorithm } = state;
			if(!source) return state;

			const tiles = await algorithm(source, state.form.data);

			return {
				...state,
				tiles,
			};
		}
	},
	nominator: {
		set(state, next) {
			return next;
		},
		merge(state, next) {
			return {
				...state,
				...next,
			};
		},
		setPattern(state, pattern) {
			return {
				...state,
				pattern,
			};
		},
		setPhrase(state, phrase) {
			const next = {
				...state,
				phrase,
			};

			let pattern = Helpers.nominator.calcPattern(phrase);
			next.pattern = pattern;
			next.form.schema = Helpers.nominator.calcFields(pattern);
			next.form.data = Helpers.nominator.getFormData(next, next.form.schema);

			return next;
		},
		setForm(state, form) {
			return {
				...state,
				form,
			};
		},

		updateFieldType(state, { id, type }) {
			const { form } = state;
			const field = Form.Helpers.findField(form.schema, id);

			if(!field) return state;

			field.type = type;

			if(type === EnumFieldType.FUNCTION) {
				field.state = `({ $x, $y, $i, ...args }) => {\r\n\treturn Date.now();\r\n}`;
			} else if(type === EnumFieldType.ENUM) {
				field.meta.options = [];
			}


			return {
				...state,
				form: {
					schema: Form.Reducers().replaceField(form.schema, id, field),
					data: {
						...form.data,
						[ field.name ]: field.state,
					},
				},
			};
		},
		setFormData(state, data) {
			const { form } = state;

			return {
				...state,
				form: {
					...form,
					data,
				},
			};
		},
		updateFieldValues(state, [ name, value ]) {
			const { form } = state;

			return {
				...state,
				form: {
					...form,
					data: {
						...form.data,
						[ name ]: value,
					},
				},
			};
		},


		nominate(state, tiles) {
			const { phrase, form, pattern } = state;
			const { data } = form;
			const nominations = {};

			//TODO: Implement after sql testing is done
			// if(!Object.values(data).every(v => !!v)) return state;

			let $i = 0,
				$x = 0,
				$y = 0,
				$r4 = 0,
				$r8 = 0;

			for(let y = 0; y < tiles.length; y++) {
				const row = tiles[ y ];
				$y = y;

				for(let x = 0; x < row.length; x++) {
					const tile = row[ x ];
					$x = x;

					const name = pattern.map(p => {
						if(p.startsWith("$")) {
							if(p === "$i") return $i;
							if(p === "$x") return $x;
							if(p === "$y") return $y;
							if(p === "$r4") return $y * 90;
							if(p === "$r8") return $y * 45;
						}

						const entry = data?.[ p ];
						const v = entry?.startsWith("({") ? eval(entry) : entry?.toString();

						if(typeof v === "function") {
							return v({ $i, $x, $y, $r4, $r8, tile });
						} else {
							return v;
						}
					}).join("-");	//TODO: Allow for custom separators (all will become dashes for now)

					nominations[ name ] = tile;
					tile.$name = name;

					++$i;
				}
			}

			return {
				...state,
				nominations,
			};
		}
	},
	viewer: {
		setTextures(state, textures) {
			return {
				...state,
				textures,
			};
		},
		setNamespaces(state, namespaces) {
			return {
				...state,
				namespaces,
			};
		}
	},
};

const Effects = {
	tessellator: {
		setSource: [
			function (state) {
				this.dispatch("setFormData", {
					...state.form.data,
					sw: state.source.width,
					sh: state.source.height,
				});
			},
		],
	},
	nominator: {
		nominate: [
			//IDEA: Create a JSON file from the nominations
			async (state) => {
				// const { nominations } = state;

				// let result = await Helpers.nominator.serialize(nominations);

				// // invoke a save dialog
				// const blob = new Blob([ result ], { type: "application/json" });
				// const url = URL.createObjectURL(blob);
				// const a = document.createElement("a");

				// a.href = url;
				// a.download = `${ uuid() }.json`;
				// a.click();
			},
		],
	},
	viewer: {},
};


export const Nodes = Chord.Node.Node.CreateMany({
	tessellator: {
		state: {
			source: null,
			preview: true,
			algorithm: LTRTTB,
			size: 4,
			form: {
				schema: Form.Templates.SimpleForm(),
				data: {
					tw: 64,
					th: 64,
					sx: 0,
					sy: 0,
					sw: null,
					sh: null,
				},
			},
			tiles: [],
		},
		reducers: Reducers.tessellator,
		effects: Effects.tessellator,

		$run: true,
		$init: (self) => {
			self.dispatch("setFormSchema", Helpers.tessellator.calcFields(self.state));
			self.dispatch("setFormData", Helpers.tessellator.getFormData(self.state, self.state.form.schema));
		},
	},
	nominator: {
		state: {
			phrase: "entity-{entityType}-{entitySubType}-{state}-{$r8}-{$x}",
			form: {
				schema: Form.Templates.SimpleForm(),
				data: {},
			},
			pattern: [],
			nominations: {},
		},
		reducers: Reducers.nominator,
		effects: Effects.nominator,

		$run: true,
		$init: (self) => {
			//NOTE: Since setPhrase also kicks off the pattern and form process, invoke it here to seed with that behavior
			self.dispatch("setPhrase", self.state.phrase);
			self.dispatch("setFormData", Helpers.nominator.getFormData(self.state, self.state.form.schema));
		},
	},
	viewer: {
		state: {
			textures: [],
			namespaces: [],
		},
		reducers: Reducers.viewer,
		effects: Effects.viewer,

		$run: true,
		$init: (self) => {
			Helpers.viewer.loadTextures(self);
			Helpers.viewer.loadNamespaces(self);

			self.addEventListeners("syncTextures", () => {
				Helpers.viewer.loadTextures(self);
			});
		},
	},
});

export const IMM = (module, message, ...args) => {
	const node = Nodes[ module ];
	if(node) {
		return node.dispatch(message.type, message.data, ...args);
	}
};
export const IMS = (module) => {
	const node = Nodes[ module ];
	if(node) {
		return node.state;
	}
};