import React from "react";

import Identity from "../v2/lib/Identity";
import Registry, { Query as QueryRegistry } from "../v2/lib/Registry";

import Tile from "../v2/modules/map/Tile";
import TileMapData from "../v2/modules/map/Map";
import TileMapJSX from "../v2/components/TileMap";

export const DataRegistry = Registry(Identity().Create({ tags: [ [ "cat", 1 ], 5 ] })).Create({
	map: TileMapData().Create({
		tileData: (x, y) => Math.floor(Math.random() * 5),
	}),
});

console.log(DataRegistry);
console.log(QueryRegistry(DataRegistry).getByAlias("map"));

export function Default() {
	return (
		<>
			<TileMapJSX data={ QueryRegistry(DataRegistry).getByAlias("map") } />
		</>
	);
};

export default Default;