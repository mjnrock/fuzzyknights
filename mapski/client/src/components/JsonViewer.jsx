import React, { useState } from "react";
import { BsChevronDown, BsChevronRight } from "react-icons/bs";

export function JsonViewer({ data, depth = 0, indices = [] }) {
	const [ collapsed, setCollapsed ] = useState(depth !== 0);

	const isArray = Array.isArray(data);

	const getColor = (value) => {
		switch(typeof value) {
			case "string":
				return "bg-emerald-200";
			case "number":
				return "bg-sky-200";
			case "boolean":
				return "bg-rose-200";
			case "function":
				return "bg-amber-200";
			case "object":
				if(Array.isArray(value)) {
					return "bg-violet-200";
				} else if(value === null) {
					return "bg-neutral-200";
				} else {
					return "bg-indigo-200";
				}
			default:
				return "bg-neutral-200";
		}
	}

	const copyToClipboard = (text) => {
		navigator.clipboard.writeText(text);
	}

	if(typeof data === "function") {
		return null;
	}

	if(typeof data !== "object" || data === null) {
		const jsonString = JSON.stringify(data);
		return (
			<div className="grid items-center w-full grid-cols-12 border border-solid cursor-copy hover:bg-neutral-100 active:bg-neutral-200" onMouseDown={ (e) => { if(e.ctrlKey) copyToClipboard(jsonString) } }>
				<span className="col-span-11 ml-2 font-mono truncate">{ jsonString }</span>
			</div>
		);
	}

	return (
		<div style={ { paddingLeft: `${ depth }em` } }>
			<div
				className="flex items-center mb-2 border border-solid rounded cursor-pointer hover:bg-neutral-100"
				onMouseDown={ (e) => setCollapsed(!collapsed) }
			>
				<div className="flex-grow p-1">
					{ collapsed ? <BsChevronRight /> : <BsChevronDown /> }
				</div>
			</div>
			{ !collapsed && Object.entries(data).map(([ key, value ], index) => {
				const newIndex = isArray ? [ ...indices, index ] : indices;
				const newIndexString = newIndex.join(",");
				return (
					<div key={ key } className="grid w-full grid-cols-12 mb-1">
						<span
							className={ `col-span-1 p-1 mr-2 rounded select-none truncate ${ getColor(value) }` }
							onMouseDown={ (e) => {
								if(e.ctrlKey) {
									copyToClipboard(JSON.stringify({ [ isArray ? newIndexString : key ]: value }));
								}
							} }
						>
							{ isArray ? newIndexString : key }
						</span>
						<div className="col-span-11">
							<JsonViewer data={ value } depth={ depth + 1 } indices={ newIndex } />
						</div>
					</div>
				)
			}) }
			{ !collapsed && <div className="mb-2" style={ { paddingLeft: `${ depth }em` } } /> }
		</div>
	);
}

export default JsonViewer;