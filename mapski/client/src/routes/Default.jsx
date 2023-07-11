import React from "react";
import { Link } from "react-router-dom";

export function Default() {
	return (
		<div className="flex flex-col items-center justify-center h-screen bg-gray-200">
			<div className="mb-4 text-3xl font-bold text-gray-700">Studio FuzzyKnights</div>
			<Link to="/editor" className="px-4 py-2 mb-2 font-semibold text-white transition duration-200 bg-blue-500 rounded hover:bg-blue-700" target="_blank" rel="noopener noreferrer">
				Go to Editor
			</Link>
			<Link to="/viewer" className="px-4 py-2 font-semibold text-white transition duration-200 bg-blue-500 rounded hover:bg-blue-700" target="_blank" rel="noopener noreferrer">
				Go to Viewer
			</Link>
		</div>
	);
};

export default Default;