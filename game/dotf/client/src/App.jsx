import { Routes, Route } from "react-router-dom";

import { Default as DefaultRoute } from "./routes/Default.jsx";
import { Game as GameRoute } from "./routes/Game.jsx";

export function App() {
	return (
		<Routes>
			<Route index element={ <DefaultRoute /> } />
			<Route path="/game" element={ <GameRoute /> } />
		</Routes>
	);
}

export default App;