import { Routes, Route } from "react-router-dom";

import Router from "./routes/package.js";

export function App() {
	return (
		<Routes>
			<Route index element={ <Router.Default /> } />
			<Route path="editor" element={ <Router.Editor /> } />
		</Routes>
	);
}

export default App;