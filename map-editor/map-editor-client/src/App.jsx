import { Routes, Route } from "react-router-dom";

import { Editor } from "./routes/Editor.jsx";

export function App() {
	return (
		<Routes>
			<Route index element={ <Editor /> } />
		</Routes>
	);
}

export default App;