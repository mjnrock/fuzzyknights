import Chord from "@lespantsfancy/chord";

import { Nodes } from "../apps/spriteski/main.js";

import Tessellator from "../apps/spriteski/modules/nominator/view/Tessellator.jsx";
import AssetViewer from "../apps/spriteski/modules/nominator/view/AssetViewer.jsx";

export function Spriteski() {
	const { state: tessellatorData, dispatch: tessellatorDispatch, dispatchAsync: tessellatorDispatchAsync } = Chord.Node.React.useNode(Nodes.tessellator);
	const { state: nominatorData, dispatch: nominatorDispatch, dispatchAsync: nominatorDispatchAsync } = Chord.Node.React.useNode(Nodes.nominator);
	const { state: viewerData, dispatch: viewerDispatch, dispatchAsync: viewerDispatchAsync } = Chord.Node.React.useNode(Nodes.viewer);
	
	return (
		<div className="m-2">
			<AssetViewer
				data={ { tessellatorData, nominatorData, viewerData } }
				update={ { tessellatorDispatch, tessellatorDispatchAsync, nominatorDispatch, nominatorDispatchAsync, viewerDispatch, viewerDispatchAsync } }
			/>
			<Tessellator
				data={ { tessellatorData, nominatorData, viewerData } }
				update={ { tessellatorDispatch, tessellatorDispatchAsync, nominatorDispatch, nominatorDispatchAsync, viewerDispatch, viewerDispatchAsync } }
			/>
		</div>
	);
};

export default Spriteski;