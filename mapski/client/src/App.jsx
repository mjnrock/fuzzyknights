import { Routes, Route } from "react-router-dom";

import { Default as DefaultRoute } from "./routes/Default.jsx";
import { Editor as EditorRoute } from "./routes/Editor.jsx";
import { Viewer as ViewerRoute } from "./routes/Viewer.jsx";

export function App() {
	return (
		<Routes>
			<Route index element={ <DefaultRoute /> } />
			<Route path="/editor" element={ <EditorRoute /> } />
			<Route path="/viewer" element={ <ViewerRoute /> } />
		</Routes>
	);
}

export default App;