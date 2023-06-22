import { useState } from "react";

import Identity from "../v2/lib/Identity";
import Registry, { Query as QueryRegistry, Write as WriteRegistry } from "../v2/lib/Registry";

import TileMapData from "../v2/modules/map/TileMap";
import TileMapJSX from "../v2/components/TileMap";
import TileMapSizing from "../v2/components/TileMapSizing";

export const DataRegistry = Registry.Generate(Identity.New(), {
	map: TileMapData.New({
		columns: 10,
		rows: 10,
		tw: 64,
		th: 64,
		tileData: (x, y) => Math.floor(Math.random() * 5),
	}),
});
export const FunctionRegistry = Registry.Generate(Identity.New(), {
	mapResize: (data, [ columns, rows ]) => {
		// data.columns = columns;
		// data.rows = rows;

		return TileMapData.New({
			...data,
			columns,
			rows,
		});
	},
	mapResizeTile: (data, [ tw, th ]) => {
		// data.tw = tw;
		// data.th = th;

		return TileMapData.New({
			...data,
			tw,
			th,
		});
	},
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