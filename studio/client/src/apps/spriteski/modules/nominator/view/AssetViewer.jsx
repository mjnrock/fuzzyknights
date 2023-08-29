import { useEffect, useState } from "react";

import { NamespaceViewer } from "../components/NamespaceViewer.jsx";
import { TileContainer } from "../components/TIleContainer.jsx";

export const AssetViewer = ({ data, update, ...props }) => {
	const { tessellatorData, nominatorData, viewerData } = data;
	const { tessellatorDispatch, tessellatorDispatchAsync, nominatorDispatch, nominatorDispatchAsync } = update;

	const [ current, setCurrent ] = useState(viewerData?.textures);
	const [ namespace, setNamespace ] = useState(null);

	useEffect(() => {
		if(viewerData?.textures) {
			setCurrent(viewerData?.textures);
		}
	}, [ viewerData?.textures ]);

	useEffect(() => {
		if(namespace) {
			const next = viewerData?.textures.filter((record) => {
				if(record?.Name?.startsWith(namespace)) return true;
			});
			setCurrent(next);
		}
	}, [ namespace, viewerData?.textures ]);

	return (
		<div className="flex flex-row items-start justify-start h-full" { ...props }>
			<div className="flex-grow h-full p-2 font-mono text-xs font-light border border-b-2 border-r-2 border-solid rounded shadow-md basis-1/3 bg-neutral-100 border-neutral-300">
				<NamespaceViewer
					data={ viewerData?.namespaces }
					selected={ namespace }
					onSelect={ setNamespace }
				/>
			</div>
			<div
				className="flex flex-wrap justify-center flex-grow h-full gap-4 p-2 m-2 border border-solid rounded basis-2/3 border-neutral-200 bg-neutral-800"
			>
				<TileContainer
					current={ current }
				/>
			</div>
		</div>
	);
};

export default AssetViewer;