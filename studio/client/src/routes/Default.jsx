import React from "react";
import { Link } from "react-router-dom";

export function Default() {
	return (
		<div className="flex flex-col items-center justify-center h-screen bg-gray-200">
			<div className="mb-4 text-3xl font-bold text-gray-700">FuzzyKnights™ Studio</div>
			<Link to="/editor" className="px-4 py-2 mb-2 font-semibold text-white transition duration-200 bg-blue-500 rounded hover:bg-blue-700" target="_blank" rel="noopener noreferrer">
				Go to Mapski™ - Editor
			</Link>
			<Link to="/viewer" className="px-4 py-2 font-semibold text-white transition duration-200 bg-blue-500 rounded hover:bg-blue-700" target="_blank" rel="noopener noreferrer">
				Go to Mapski™ - Viewer
			</Link>
			<Link to="/spriteski" className="px-4 py-2 mt-2 font-semibold text-white transition duration-200 bg-orange-500 rounded hover:bg-orange-700" target="_blank" rel="noopener noreferrer">
				Go to Spriteski™
			</Link>
			<Link to="/$spriteski" className="px-4 py-2 mt-2 font-semibold text-white transition duration-200 bg-orange-500 rounded hover:bg-orange-700" target="_blank" rel="noopener noreferrer">
				Go to (Beta) Spriteski™
			</Link>
			<Link to="/data" className="px-4 py-2 mt-2 font-semibold text-white transition duration-200 bg-purple-500 rounded hover:bg-purple-700" target="_blank" rel="noopener noreferrer">
				Go to Data
			</Link>
			<Link to="/sandbox" className="px-4 py-2 mt-2 font-semibold text-white transition duration-200 bg-green-500 rounded hover:bg-green-700" target="_blank" rel="noopener noreferrer">
				Go to Sandbox
			</Link>
		</div>
	);
};

export default Default;