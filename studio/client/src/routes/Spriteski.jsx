import Chord from "@lespantsfancy/chord";

import { Tessellator } from "../apps/spriteski/modules/tessellator/Tessellator";

export function Spriteski() {
	// const { state: menubarData, dispatch: menubarDispatch } = Chord.Node.React.useNode(Nodes.menubar);

	//create a file input element and handle the import of an image
	return (
		<div>
			<h1>Spriteski</h1>
			<p>Sprite Sheet Editor</p>

			<hr />

			<h2>Test</h2>
			{
				JSON.stringify(Tessellator.New({
					algorithm: () => {},
				}))
			}

			<hr />

			<h2>Import</h2>
			<input type="file" id="file" name="file" />
			<label htmlFor="file">Choose a file</label>

			<hr />

			<h2>Export</h2>
			<button>Export</button>
		</div>
	);
};

export default Spriteski;