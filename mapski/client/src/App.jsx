import { Routes, Route } from "react-router-dom";

import { EditorRoute } from "./routes/EditorRoute.jsx";

export function App() {
	return (
		<Routes>
			{/* <Route index element={ <Router.Default /> } /> */ }
			<Route path="editor" element={ <EditorRoute /> } />
		</Routes>
	);
}

export default App;