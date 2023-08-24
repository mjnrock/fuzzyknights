import { Routes, Route } from "react-router-dom";

import { Default as DefaultRoute } from "./routes/Default.jsx";
import { Editor as EditorRoute } from "./routes/Editor.jsx";
import { Viewer as ViewerRoute } from "./routes/Viewer.jsx";
import { Struct as StructRoute } from "./routes/Struct.jsx";
import { Spriteski as SpriteskiRoute } from "./routes/Spriteski.jsx";
import { Sandbox as SandboxRoute } from "./routes/Sandbox.jsx";

import SqlHelper from "./lib/SqlHelper.js";

setTimeout(() => {
	SqlHelper.query(`SELECT GETDATE() AS CurrentDateTime`).then(result => console.log(result));
	SqlHelper.exec(`spTEST`).then(result => console.log(result));
	SqlHelper.tvf(`tvfTEST`).then(result => console.log(result));
}, 500);

export function App() {
	return (
		<Routes>
			<Route index element={ <DefaultRoute /> } />
			<Route path="/editor" element={ <EditorRoute /> } />
			<Route path="/viewer" element={ <ViewerRoute /> } />
			<Route path="/spriteski" element={ <SpriteskiRoute /> } />
			<Route path="/data" element={ <StructRoute /> } />

			<Route path="/sandbox" element={ <SandboxRoute /> } />
		</Routes>
	);
}

export default App;