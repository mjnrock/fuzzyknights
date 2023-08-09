import { Routes, Route } from "react-router-dom";

import { Default as DefaultRoute } from "./routes/Default.jsx";
import { Editor as EditorRoute } from "./routes/Editor.jsx";
import { Viewer as ViewerRoute } from "./routes/Viewer.jsx";
import { Struct as StructRoute } from "./routes/Struct.jsx";
import { Spriteski as SpriteskiRoute } from "./routes/Spriteski.jsx";
import { Spriteski as $SpriteskiRoute } from "./routes/$Spriteski.jsx";
import { Sandbox as SandboxRoute } from "./routes/Sandbox.jsx";

// FIXME: Once you integrate the Node changes from Game into Chord, you *must* set the `config` allowShallowPrevious to `false` AND allowTrivialUpdates to `false`; otherwise state history will be mutated
// FIXME: Once you integrate the Node changes from Game into Chord, you *must* set the `config` allowShallowPrevious to `false` AND allowTrivialUpdates to `false`; otherwise state history will be mutated
// FIXME: Once you integrate the Node changes from Game into Chord, you *must* set the `config` allowShallowPrevious to `false` AND allowTrivialUpdates to `false`; otherwise state history will be mutated
// FIXME: Once you integrate the Node changes from Game into Chord, you *must* set the `config` allowShallowPrevious to `false` AND allowTrivialUpdates to `false`; otherwise state history will be mutated
// FIXME: Once you integrate the Node changes from Game into Chord, you *must* set the `config` allowShallowPrevious to `false` AND allowTrivialUpdates to `false`; otherwise state history will be mutated
// FIXME: Once you integrate the Node changes from Game into Chord, you *must* set the `config` allowShallowPrevious to `false` AND allowTrivialUpdates to `false`; otherwise state history will be mutated
// NOTE: Editor won't work correctly until you do this.

export function App() {
	return (
		<Routes>
			<Route index element={ <DefaultRoute /> } />
			<Route path="/editor" element={ <EditorRoute /> } />
			<Route path="/viewer" element={ <ViewerRoute /> } />
			<Route path="/spriteski" element={ <SpriteskiRoute /> } />
			<Route path="/$spriteski" element={ <$SpriteskiRoute /> } />
			<Route path="/data" element={ <StructRoute /> } />

			<Route path="/sandbox" element={ <SandboxRoute /> } />
		</Routes>
	);
}

export default App;