import { useEffect, useState } from "react";

import Identity from "../v2/lib/Identity";
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
		resize: (data, [ columns, rows ]) => TileMapData.Next({
			...data,
			columns: Math.max(columns, 1),
			rows: Math.max(rows, 1),
		}),
		resizeTile: (data, [ tw, th ]) => TileMapData.Next({
			...data,
			tw: Math.max(tw, 1),
			th: Math.max(th, 1),
		}),
	},
};

const node = new Node({
	state: Query.getByAlias(MasterRegistry, "map"),
	reducers: [
		(state, next) => {
			return {
				...state,
				...next,
			};
		},
	]
});

console.log(node)

function useNode(node, map) {
	const [ state, setState ] = useState(node.state);
	const dispatch = (msg) => {
		if(msg.type in map) {
			const next = map[ msg.type ](state, msg.data);

			if(next !== state) {
				node.dispatch(next);
			}
		}
	};

	useEffect(() => {
		const fn = next => setState(next);

		node.addEventListeners(Node.EventTypes.UPDATE, fn);

		return () => {
			node.removeEventListeners(Node.EventTypes.UPDATE, fn);
		};
	}, []);

	return {
		state,
		dispatch,
	};
}

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