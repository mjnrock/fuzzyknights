import { v4 as uuid } from "uuid";
import Chord from "@lespantsfancy/chord";

import {EnumFieldType} from "../../@form/EnumFieldType";
import { LTRTTB } from "./modules/tessellator/data/algorithms/LTRTTB";

export const Helpers = {
	calcPattern(phrase) {
		// split the pattern-phrase into an array of words
		const pattern = [];
		const values = phrase.split("-");
		for(let i = 0; i < values.length; i++) {
			const word = values[ i ].trim();
			if(word.startsWith("{") && word.endsWith("}")) {
				const variable = word.slice(1, -1).trim();

				pattern.push(`@${ variable }`);
			} else if(word.startsWith("@")) {
				let name = word.slice(1);

				if(name.startsWith("$")) {
					word = name;
				}

				pattern.push(word);
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

			let pattern = Helpers.calcPattern(phrase);
			next.pattern = pattern;
			next.form = Helpers.calcFields(pattern);

			console.log(next)

			return next;
		},
		setForm(state, form) {
			return {
				...state,
				form,
			};
		},

		nominate(state, tiles) {
			const { phrase, form, pattern } = state;
			const nominations = {};

			console.log(tiles, phrase, form, pattern);
			let $i = 0,
				$x = 0,
				$y = 0;

			for(let y = 0; y < tiles.length; y++) {
				const row = tiles[ y ];
				$y = y;

				for(let x = 0; x < row.length; x++) {
					const tile = row[ x ];
					$x = x;

					console.log(x, y, pattern)

					const name = pattern.map(p => {
						const v = p.startsWith("({") ? eval(p).toString() : p.toString();

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

			console.log(nominations)

			return {
				...state,
				nominations,
			};
		}
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
			form: null,
			pattern: [],
			nominations: {},
		},
		reducers: Reducers.nominator,
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