import { v4 as uuid } from "uuid";
import Chord from "@lespantsfancy/chord";

import { EnumFieldType } from "../../@form/EnumFieldType";
import { LTRTTB } from "./modules/tessellator/data/algorithms/LTRTTB";
import Form from "./modules/nominator/Form";
import Base64 from "../../util/Base64";
import Serialize from "../../util/Serialize";

export const Helpers = {
	nominator: {
		calcPattern(phrase) {
			// split the pattern-phrase into an array of words
			const pattern = [];
			const values = phrase.split("-");
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
				console.log(nextTile)

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
};

export const Reducers = {
	tessellator: {
		togglePreview(state) {
			return {
				...state,
				preview: !state.preview,
			};
		},
		setSize(state) {
			const { parameters, source } = state;
			const { tw } = parameters;

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
				size: Math.ceil(source.width / state.parameters.tw),
				parameters: {
					...state.parameters,
					sw: canvas.width,
					sh: canvas.height,
				},
			};
		},
		async tessellate(state) {
			const { source, algorithm, parameters } = state;
			if(!source) return state;

			const tiles = await algorithm(source, parameters);

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

			return next;
		},
		setForm(state, form) {
			return {
				...state,
				form,
			};
		},

		setFields(state, fields) {
			const { form } = state;

			return {
				...state,
				form: Form.Reducers().setSectionState(form, form.state[ 0 ].id, fields),
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


		nominate(state, tiles) {
			const { phrase, form, pattern } = state;
			const { data } = form;
			const nominations = {};

			let $i = 0,
				$x = 0,
				$y = 0;

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
						}

						const entry = data?.[ p ];
						const v = entry?.startsWith("({") ? eval(entry)?.toString() : entry?.toString();

						if(typeof v === "function") {
							return v({ $i, $x, $y, tile });
						} else {
							return v;
						}
					}).join("-");

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
};

const Effects = {
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
};


export const Nodes = Chord.Node.Node.CreateMany({
	tessellator: {
		state: {
			source: null,
			preview: true,
			algorithm: LTRTTB,
			size: 4,
			parameters: {
				tw: 64,
				th: 64,
				sx: 0,
				sy: 0,
				sw: null,
				sh: null,
			},
			tiles: [],
		},
		reducers: Reducers.tessellator,
	},
	nominator: {
		state: {
			phrase: "entity-{entityType}-{entitySubType}-{state}-{$y}-{$x}",
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
			//NOTE: Since setPhrase also kicks off the pattern and form process, invoke it here to "seed" that behavior (kind of a hack)
			self.dispatch("setPhrase", self.state.phrase);
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