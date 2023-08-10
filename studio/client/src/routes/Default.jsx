import React from "react";
import { Link } from "react-router-dom";

export function Default() {
	return (
		<div className="flex flex-col items-center justify-center h-screen bg-gray-200">
			<div class="flex items-start justify-center mb-6 text-gray-600">
				<div class="text-3xl font-bold">FuzzyKnights<sup class="self-start text-sm">™</sup></div>
			</div>

			<div className="flex flex-col items-center justify-center text-gray-600">
				<div className="text-xl font-semibold">Studio</div>
				<code className="flex flex-row justify-between mt-2 mb-4">
					@/studio/client
				</code>

				<Link to="/editor" className="px-4 py-2 mb-2 font-semibold text-white transition duration-200 bg-blue-500 rounded hover:bg-blue-700" target="_blank" rel="noopener noreferrer">
					Go to Mapski™ - Editor
				</Link>
				<Link to="/viewer" className="px-4 py-2 font-semibold text-white transition duration-200 bg-blue-500 rounded hover:bg-blue-700" target="_blank" rel="noopener noreferrer">
					Go to Mapski™ - Viewer
				</Link>
				<Link to="/spriteski" className="px-4 py-2 mt-2 font-semibold text-white transition duration-200 bg-orange-500 rounded hover:bg-orange-700" target="_blank" rel="noopener noreferrer">
					Go to Spriteski™ - Tessellator
				</Link>
				<Link to="/$spriteskiNominator" className="px-4 py-2 mt-2 font-semibold text-white transition duration-200 bg-orange-500 rounded hover:bg-orange-700" target="_blank" rel="noopener noreferrer">
					Go to Spriteski™ - Nominator
				</Link>
				<Link to="/$spriteski" className="px-4 py-2 mt-2 font-semibold text-white transition duration-200 bg-orange-500 rounded hover:bg-orange-700" target="_blank" rel="noopener noreferrer">
					Go to (Beta) Spriteski™
				</Link>
				<Link to="/data" className="px-4 py-2 mt-2 font-semibold text-white transition duration-200 bg-purple-500 rounded hover:bg-purple-700" target="_blank" rel="noopener noreferrer">
					Go to Data
				</Link>
				<Link to="/sandbox" className="px-4 py-2 mt-2 font-semibold text-white transition duration-200 bg-yellow-500 rounded hover:bg-yellow-700" target="_blank" rel="noopener noreferrer">
					Go to Sandbox
				</Link>

				<div className="h-[1px] border border-solid border-neutral-300 w-full my-4 shadow" />

				<div className="flex flex-col items-center justify-center text-sm text-gray-600">
					<div className="text-xl font-semibold">Defenders of the Forest</div>
					<code className="flex flex-row justify-between mt-2 mb-4">
						@/game/dotf/client
					</code>

					<div className="flex flex-row justify-between italic">
						This is a separate project; ensure that it is running.
					</div>
					<a href="https://buddha.com:3400/game" className="px-4 py-2 mt-4 font-semibold text-center text-white transition duration-200 bg-green-500 rounded hover:bg-green-700" target="_blank" rel="noopener noreferrer">
						Go to Game
					</a>
				</div>
			</div>
		</div>
	);
};

export default Default;