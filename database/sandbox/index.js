import "./dotenv.js";
import { localhostConfig, SqlExecutor } from "./js/SqlExecutor.js";

const sqlExecutor = new SqlExecutor({
	...localhostConfig,
	server: process.env.MSSQL_SERVER,
	database: process.env.MSSQL_DATABASE,
	user: process.env.MSSQL_USERNAME,
	password: process.env.MSSQL_PASSWORD,
});

sqlExecutor
	// .query(`SELECT JSON_VALUE(Data, '$.elevation') AS Elevation FROM DotF.Terrain WHERE TerrainID = 11`)
	// .query(`SELECT JSON_VALUE(Data, '$.elevation') AS Elevation FROM DotF.Terrain WHERE TerrainID = @param1`, [ 11 ])
	.queryFromFile("./sql/TestQuery.sql")
	.then(result => {
		console.log(result);  // This should display the elevation value.
	});


// sqlExecutor
// 	.exec(`DotF.spUpsert`, {
// 		Schema: "DotF",
// 		Target: "Terrain",
// 		JSON: {
// 			Name: "Mountain",
// 			Cost: 50,
// 			Mask: 2,
// 			Data: { elevation: 3000 },
// 			Tags: [ "high", "rocky" ],
// 			Meta: { color: "gray" },
// 			UUID: "a6e95c8b-dfad-42bd-b2a7-5f6b3c3d85e3",
// 			NamespaceID: 1
// 		},
// 	})
// 	.then(result => {
// 		console.log(result);
// 	});