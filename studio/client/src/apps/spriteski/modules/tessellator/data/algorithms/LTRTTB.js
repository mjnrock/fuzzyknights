import Chord from "@lespantsfancy/chord";
import Base64 from "../../../../../../util/Base64";

export const LTRTTB = async (canvas, { tw, th, sx = 0, sy = 0, sw = canvas.width, sh = canvas.height } = {}) => {
	const tiles = [];

	const rows = Math.ceil(sh / th);
	const cols = Math.ceil(sw / tw);

	const ctx = canvas.getContext("2d");
	for(let row = 0; row < rows; row++) {
		const tileRow = [];

		for(let col = 0; col < cols; col++) {
			const data = ctx.getImageData(sx + col * tw, sy + row * th, tw, th);
			const tile = Chord.Node.Identity.New({
				data: await Base64.Decode(data),
				width: tw,
				height: th,
			});

			tileRow.push(tile);
		}

		tiles.push(tileRow);
	}

	return tiles;
};

export default LTRTTB;