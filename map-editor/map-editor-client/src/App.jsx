import { Routes, Route } from "react-router-dom";

import { Default } from "./routes/Default.jsx";

export function App() {
	return (
		<Routes>
			<Route index element={ <Default /> } />
		</Routes>
	);
}

export default App;