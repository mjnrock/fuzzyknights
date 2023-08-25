import { useState, useEffect } from "react";
import { NamespaceViewer } from "./NamespaceViewer.jsx";

import SqlHelper from "../../../../../lib/SqlHelper.js";
import Base64 from "../../../../../util/Base64.js";
import { Canvas } from "../../../../../components/Canvas.jsx";

export const TextureViewer = ({ data, update }) => {
	const [ namespaces, setNamespaces ] = useState([]);
	const [ records, setRecords ] = useState([]);
	const [ textures, setTextures ] = useState({});

	const [ current, setCurrent ] = useState([]);
	const [ namespace, setNamespace ] = useState(null);

	useEffect(() => {
		SqlHelper.query(`SELECT * FROM DotF.vwTextureNamespace`)
			.then(result => setNamespaces(result))
			.catch(err => console.error(err));
	}, []);

	useEffect(() => {
		SqlHelper.query(`SELECT * FROM DotF.Texture`)
			.then(result => setRecords(result))
			.catch(err => console.error(err));
	}, []);

	useEffect(() => {
		async function decode() {
			const next = {};
			for(const record of records) {
				next[ record.UUID ] = await Base64.Decode(record.Base64);
			};

			setTextures(next);
		};
		decode();
	}, [ records ]);

	useEffect(() => {
		if(namespace) {
			const next = records.filter((record) => {
				// if the namespace of the record is a descendant of the selected namespace, include it
				if(record?.Name?.startsWith(namespace)) return true;
			});

			setCurrent(next);
		}
	}, [ namespace, records ]);

	return (
		<>
			<NamespaceViewer
				data={ namespaces }
				selected={ namespace }
				onNamespaceSelect={ setNamespace }
			/>

			<div className="grid grid-cols-8">
				{
					current.map((record, i) => {
						const texture = textures[ record.UUID ];

						return (
							<div key={ record.UUID } className="flex flex-col items-center justify-center m-2">
								<Canvas source={ texture } width={ data.width } height={ data.height } />
								<div className="font-mono text-xs text-center">{ record.Name }</div>
							</div>
						);
					})
				}
			</div>
		</>
	);
};