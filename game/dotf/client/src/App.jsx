import { Routes, Route } from "react-router-dom";

import { Default as DefaultRoute } from "./routes/Default.jsx";
import { Game as GameRoute } from "./routes/Game.jsx";

import { Realm } from "./core/world/Realm.js";
import { EntityManager } from "./core/entity/EntityManager.js";
import { Zone } from "./core/world/Zone.js";
console.log(new Realm());
console.log(new EntityManager());
console.log(new Zone());

export function App() {
	return (
		<Routes>
			<Route index element={ <DefaultRoute /> } />
			<Route path="/game" element={ <GameRoute /> } />
		</Routes>
	);
}

export default App;