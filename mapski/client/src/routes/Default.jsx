import { useNode } from "../v2/lib/react/useNode";
import Registry, { Query, Query as QueryRegistry, Write as WriteRegistry } from "../v2/lib/Registry";

import TileMapData from "../v2/modules/map/TileMap";
import TileMapJSX from "../v2/components/TileMap";
import TileMapSizing from "../v2/components/TileMapSizing";

import { Node } from "../v2/lib/Node";

export const MasterRegistry = Registry.New({
	map: TileMapData.Next({
		columns: 10,
		rows: 10,
		tw: 64,
		th: 64,
		tileData: (x, y) => Math.floor(Math.random() * 4),
	}),
});

export const Reducers = {
	map: {
		// Need this in order to seed the added col/rows.
		resize: (state, [ columns, rows ]) => TileMapData.Next({
			...state,
			columns: Math.max(columns, 1),
			rows: Math.max(rows, 1),
		}),
		resizeTile: (state, [ tw, th ]) => ({
			tw: Math.max(tw, 1),
			th: Math.max(th, 1),
		}),
	},
};

const node = new Node({
	state: Query.getByAlias(MasterRegistry, "map"),
	reducers: [
		// A "merge" reducer -- note that "next" is paradigm dependent (i.e. it's ...args[0] -- if you change the messaging paradigm, you'll need to change this)
		(state, next) => {
			return {
				...state,
				...next,
			};
		},
		// An "update" reducer
		// (state, next) => next,
	]
});

console.log(node)

export function Default() {
	const { state, dispatch } = useNode(node, Reducers.map);

	return (
		<>
			<TileMapSizing data={ state } update={ dispatch } />
			<TileMapJSX data={ state } update={ dispatch } />
		</>
	);
};

export default Default;