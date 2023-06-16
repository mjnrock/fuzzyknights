import { Routes, Route } from "react-router-dom";

import { Default as DefaultRoute } from "./routes/Default.jsx";
import { EditorRoute } from "./routes/EditorRoute.jsx";

export function App() {
	return (
		<Routes>
			<Route index element={ <DefaultRoute /> } />
			<Route path="editor" element={ <EditorRoute /> } />
		</Routes>
	);
}

export default App;