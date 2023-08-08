import Chord from "@lespantsfancy/chord";

export const Tile = {
	Next({ data, width, height, ...target } = {}) {
		target.data = data;
		target.width = width;
		target.height = height;

		return target;
	},
	New({ data, width, height } = {}) {
		return Tile.Next(Chord.Node.Identity.New({ data, width, height }));
	},
};

export default Tile;