import { Routes, Route } from "react-router-dom";

export function Home() {
	return (
		<h1 className="text-3xl font-bold underline">
			Hello world!
		</h1>
	)
}
export function Home2() {
	return (
		<h1 className="text-3xl font-bold underline">
			Hello world2!
		</h1>
	)
}

export function App() {
	return (
		<Routes>
			<Route index element={ <Home /> } />
			<Route path="test" element={ <Home2 /> } />
		</Routes>
	);
	;
}

export default App;