import React, { useState } from "react";
import Chord from "@lespantsfancy/chord";

import { Nodes } from "../apps/spriteski/main.js";
import Tessellator from "../apps/spriteski/modules/nominator/view/Tessellator.jsx";
import AssetViewer from "../apps/spriteski/modules/nominator/view/AssetViewer.jsx";
import { BsDatabase, BsGrid } from "react-icons/bs";

const PaneIcons = ({ setActivePane, activePane }) => {
	return (
		<div className="flex flex-col items-center w-16 p-2 bg-gray-800">
			<button
				onClick={ () => setActivePane("AssetViewer") }
				className={ `p-2 m-1 ${ activePane === "AssetViewer" ? "bg-gray-600" : "bg-transparent" } hover:bg-gray-700 focus:outline-none rounded` }
				title={ "Asset Viewer" }
			>
				<BsDatabase className="w-6 h-6 text-white" />
			</button>
			<button
				onClick={ () => setActivePane("Tessellator") }
				className={ `p-2 m-1 ${ activePane === "Tessellator" ? "bg-gray-600" : "bg-transparent" } hover:bg-gray-700 focus:outline-none rounded` }
				title={ "Tessellator" }
			>
				<BsGrid className="w-6 h-6 text-white" />
			</button>
		</div>
	);
};

export function Spriteski() {
	const [ activePane, setActivePane ] = useState("AssetViewer");
	const { state: tessellatorData, dispatch: tessellatorDispatch, dispatchAsync: tessellatorDispatchAsync } = Chord.Node.React.useNode(Nodes.tessellator);
	const { state: nominatorData, dispatch: nominatorDispatch, dispatchAsync: nominatorDispatchAsync } = Chord.Node.React.useNode(Nodes.nominator);
	const { state: viewerData, dispatch: viewerDispatch, dispatchAsync: viewerDispatchAsync } = Chord.Node.React.useNode(Nodes.viewer);

	return (
		<div className="flex h-full min-h-screen">
			<PaneIcons setActivePane={ setActivePane } activePane={ activePane } />

			<div className="flex-1 m-2">
				{ activePane === "AssetViewer" && (
					<AssetViewer
						data={ { tessellatorData, nominatorData, viewerData } }
						update={ { tessellatorDispatch, tessellatorDispatchAsync, nominatorDispatch, nominatorDispatchAsync, viewerDispatch, viewerDispatchAsync } }
					/>
				) }
				{ activePane === "Tessellator" && (
					<Tessellator
						data={ { tessellatorData, nominatorData, viewerData } }
						update={ { tessellatorDispatch, tessellatorDispatchAsync, nominatorDispatch, nominatorDispatchAsync, viewerDispatch, viewerDispatchAsync } }
					/>
				) }
			</div>
		</div>
	);
};

export default Spriteski;