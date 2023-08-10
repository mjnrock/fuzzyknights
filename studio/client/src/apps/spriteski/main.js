import Chord from "@lespantsfancy/chord";
import { Node } from "../../@node/Node";

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
			};
		},
		async tessellate(state) {
			const { source, algorithm, parameters } = state;
			const tiles = [];

			const rows = Math.ceil(parameters.sh / parameters.th);
			const cols = Math.ceil(parameters.sw / parameters.tw);

			const ctx = source.getContext("2d");
			for(let row = 0; row < rows; row++) {
				const tileRow = [];

				for(let col = 0; col < cols; col++) {
					const data = ctx.getImageData(parameters.sx + col * parameters.tw, parameters.sy + row * parameters.th, parameters.tw, parameters.th);
					const tile = Tile.New({
						data: await Base64.Decode(data),
						width: parameters.tw,
						height: parameters.th,
					});

					tileRow.push(tile);
				}

				tiles.push(tileRow);
			}

			return {
				...state,
				tiles,
			};
		}
	},
};

// export const Nodes = Chord.Node.Node.CreateMany({
export const Nodes = Node.CreateMany({
	tessellator: {
		state: {
			source: document.createElement("canvas"),
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