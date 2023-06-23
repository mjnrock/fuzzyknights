import { useState } from "react";

import Identity from "../v2/lib/Identity";
import Registry, { Query as QueryRegistry, Write as WriteRegistry } from "../v2/lib/Registry";

import TileMapData from "../v2/modules/map/TileMap";
import TileMapJSX from "../v2/components/TileMap";
import TileMapSizing from "../v2/components/TileMapSizing";

export const DataRegistry = Registry.New({
	map: TileMapData.Next({
		columns: 10,
		rows: 10,
		tw: 64,
		th: 64,
		tileData: (x, y) => Math.floor(Math.random() * 4),
	}),
});
export const FunctionRegistry = Registry.New({
	mapResize: (data, [ columns, rows ]) => TileMapData.Next({
		...data,
		columns: Math.max(columns, 1),
		rows: Math.max(rows, 1),
	}),
	mapResizeTile: (data, [ tw, th ]) => TileMapData.Next({
		...data,
		tw: Math.max(tw, 1),
		th: Math.max(th, 1),
	}),
});

console.log(FunctionRegistry);
// console.log(DataRegistry);
// console.log(QueryRegistry.getByAlias(DataRegistry, "map"));

export function Default() {
	const map = () => QueryRegistry.getByAlias(DataRegistry, "map");
	const [ snapshot, setSnapshot ] = useState(map());

	const dispatch = (type, ...args) => QueryRegistry.getByAlias(FunctionRegistry, type)(snapshot, ...args);
	const update = (msg) => {
		let next;
		if(msg.type === "resize") {
			next = dispatch("mapResize", msg.data);
		} else if(msg.type === "resizeTile") {
			next = dispatch("mapResizeTile", msg.data);
		}

		WriteRegistry.setByAlias(DataRegistry, "map", next);

		setSnapshot(map());
	};

	// console.log("UPDATE", snapshot)

	return (
		<>
			<TileMapSizing data={ snapshot } update={ update } />
			<TileMapJSX data={ snapshot } update={ update } />
		</>
	);
};

export default Default;