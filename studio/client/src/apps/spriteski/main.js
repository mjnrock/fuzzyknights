import Chord from "@lespantsfancy/chord";

import Tile from "./modules/tessellator/Tile";
import { LTRTTB } from "./modules/tessellator/data/algorithms/LTRTTB";
import Base64 from "../../util/Base64";

export const Reducers = {
	tessellator: {
		togglePreview(state) {
			return {
				...state,
				preview: !state.preview,
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
		setPattern(state, pattern) {
			return {
				...state,
				pattern,
			};
		},
		setPhrase(state, phrase) {
			return {
				...state,
				phrase,
			};
		},
		setForm(state, form) {
			return {
				...state,
				form,
			};
		},
	},
};

export const Nodes = Chord.Node.Node.CreateMany({
	tessellator: {
		state: {
			source: null,
			preview: true,
			algorithm: LTRTTB,
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
			pattern: null,
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