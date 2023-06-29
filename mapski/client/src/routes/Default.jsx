import { useNode } from "../v2/lib/react/useNode";
import Registry, { Query } from "../v2/lib/Registry";

import TileMapData from "../v2/modules/map/TileMap";
import TileMapJSX from "../v2/components/TileMap";
import TileMapSizing from "../v2/components/TileMapSizing";

import { Node } from "../v2/lib/Node";

/**
 * The Registry is a global store of all the data in the app.
 * A Node within this context can be thought of as a "slice"
 * of the global state.  Each node is assigned a UUID (typically
 * its own .id property) and can be accessed by that UUID.
 * Optionally, aliases can be assigned to nodes, which can be
 * used to access the node by that alias, instead.  This allows
 * for a more "semantic" approach to accessing data, but can
 * also be expanded to allow for "namespaced" data, as well,
 * or multiple instances of the same data (e.g. map1, map2, etc.)
 */
export const MasterRegistry = Registry.New({
	map: new Node({
		state: TileMapData.Next({
			columns: 10,
			rows: 10,
			tw: 64,
			th: 64,
			tileData: (x, y) => Math.floor(Math.random() * 4),
		}),
		reducers: [
			Node.MergeReducer,
		],
	}),
});

/**
 * A reduction namespace is a way to group reducers together
 * for a specific purpose.  This allows for a more "semantic"
 * approach to updating data.  Most commonly, this is used
 * with the useNode hook, which allows for a more "functional"
 * approach to updating data.
 * 
 * NOTE: Reducers are abstracted here so that multiple Nodes could
 * share the same reducer, if desired, rather than having to
 * duplicate the same reducer for each Node.
 */
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

export function Default() {
	/**
	 * The general idea here is that the "update" prop fn receives a { type, data } object,
	 * and `dispatch` uses that .type to find a reducer of the same name in the passed map.
	 * This is separated into `node` and `reducer maps` so that multiple nodes can share
	 * the same reducer, if desired (e.g. multiple maps, multiple players, etc.)
	 */
	const { state: map, dispatch: mapDispatch } = useNode(Query.getByAlias(MasterRegistry, "map"), Reducers.map);

	return (
		<>
			<TileMapSizing data={ map } update={ mapDispatch } />
			<TileMapJSX data={ map } update={ mapDispatch } />
		</>
	);
};

export default Default;