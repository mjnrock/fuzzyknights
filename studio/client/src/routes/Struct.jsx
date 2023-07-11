import React, { useEffect, useRef, useState } from "react";
import { PhotoshopPicker } from "react-color";
import { BsLock, BsUnlock, BsTrash } from "react-icons/bs"; // Importing required icons

const defaultRecord = { type: "", cost: "", mask: "", texture: "" };

export function Struct() {
	const [ records, setRecords ] = useState([
		{ type: "VOID", cost: Infinity, mask: 0, texture: `#000000` },
		{ type: "WATER", cost: 4, mask: 1, texture: `#3e91af` },
		{ type: "SAND", cost: 2, mask: 1, texture: `#dcdbc2` },
		{ type: "DIRT", cost: 1, mask: 3, texture: `#7b674a` },
		{ type: "GRASS", cost: 1, mask: 7, texture: `#5d8c53` },
		{ type: "ROCK", cost: 2, mask: 3, texture: `#908c87` },
		{ type: "SNOW", cost: 2, mask: 1, texture: `#fffafa` },
	]);

	const [ editing, setEditing ] = useState({});
	const [ selectedRows, setSelectedRows ] = useState([]);
	const [ isModifying, setIsModifying ] = useState(false);
	const inputRef = useRef();

	useEffect(() => {
		inputRef.current && inputRef.current.select();
	}, [ editing ]);

	const handleKeyPress = (event, index, field) => {
		if(event.key === "Enter") {
			setRecords((prev) => {
				const newRecords = [ ...prev ];
				newRecords[ index ][ field ] = event.target.value;
				return newRecords;
			});
			setEditing({});
		} else if(event.key === "Escape") {
			setEditing({});
		}
	};

	const handleEdit = (index, field) => {
		setEditing({ index, field });
	};

	const handleRowClick = (index) => {
		if(isModifying) {
			setSelectedRows((prev) => {
				if(prev.includes(index)) {
					return prev.filter((i) => i !== index);
				} else {
					return [ ...prev, index ];
				}
			});
		}
	};

	const handleAddRecord = () => {
		setRecords((prev) => [ ...prev, { ...defaultRecord } ]);
	};

	const toggleModify = () => {
		setIsModifying((prev) => !prev);
		setSelectedRows([]); // Clear selected rows when toggling off the "Modify Rows" mode
	};

	const deleteSelectedRows = () => {
		setRecords((prev) => prev.filter((_, index) => !selectedRows.includes(index)));
		setSelectedRows([]); // Clear selected rows after deletion
	};

	return (
		<div className="flex flex-col items-center justify-center w-full h-full overflow-hidden select-none">
			<div className="text-4xl">Structski</div>
			<div className="text-2xl">Terrain</div>
			<div className="flex flex-row items-center justify-center w-full h-full overflow-hidden">
				<div className="flex flex-col items-center justify-center w-full h-full gap-1 p-2 overflow-hidden">
					<div className="flex flex-row items-center justify-center w-full h-full gap-2 p-2 overflow-hidden">
						<button className="p-2 rounded bg-sky-200 focus:outline-none hover:bg-sky-300 text-sky-500" onClick={ toggleModify }>
							{ isModifying ? <BsLock /> : <BsUnlock /> } {/* Replaced text with icons */ }
						</button>
						{ isModifying &&
							<div className="flex items-center gap-2">
								<span>Selected: { selectedRows.length }</span>
								<button className="p-2 text-red-500 bg-red-200 rounded focus:outline-none hover:bg-red-300" onClick={ deleteSelectedRows }>
									<BsTrash /> {/* Replaced text with icon */ }
								</button>
							</div>
						}
					</div>

					<div className="flex flex-row items-center justify-center w-full h-full py-2 mb-4 overflow-hidden border-b border-b-neutral-100">
						<div className="flex-1 text-lg italic font-semibold text-center">type</div>
						<div className="flex-1 text-lg italic font-semibold text-center">cost</div>
						<div className="flex-1 text-lg italic font-semibold text-center">mask</div>
						<div className="flex-1 text-lg italic font-semibold text-center">texture</div>
					</div>
					{ records.map((row, index) => (
						<div
							key={ index }
							className={ `gap-1 flex flex-row items-center justify-center w-full h-full p-2 mx-2 overflow-hidden text-center border border-solid rounded shadow border-neutral-100 ${ selectedRows.includes(index) ? "border-sky-300 bg-sky-100" : "" } ${ isModifying ? "hover:border-sky-200 hover:bg-sky-50" : "hover:border-neutral-200 hover:bg-neutral-50" }` }
							onClick={ () => handleRowClick(index) }
						>
							{ [ "type", "cost", "mask", "texture" ].map((field) =>
								<div
									className={ `rounded w-full ${ isModifying ? "" : "hover:bg-sky-200 active:bg-sky-300 focus:bg-sky-400 focus:text-neutral-50 focus:outline-none" }` }
								>
									<DynamicField
										key={ field }
										field={ field }
										value={ row[ field ] }
										mode={ !isModifying && editing.index === index && editing.field === field ? "edit" : "view" }
										handleEdit={ () => handleEdit(index, field) }
										handleKeyPress={ (e) => handleKeyPress(e, index, field) }
									/>
								</div>
							) }
						</div>
					)) }
					<div
						onClick={ handleAddRecord }
						className="flex flex-row items-center justify-center w-full h-full mx-2 mt-2 overflow-hidden text-center border border-solid rounded shadow-md cursor-pointer bg-sky-50 border-sky-300 hover:border-sky-400"
					>
						<div className="flex-1 w-full p-2 hover:bg-sky-300 text-sky-600">+</div>
					</div>
				</div>
			</div>
		</div>
	);
};

const DynamicField = ({ mode, field, value, handleEdit, handleKeyPress }) => {
	let inputType = "text";
	if(typeof value === "number") inputType = "number";
	else if(typeof value === "string" && value.startsWith("#")) inputType = "color";

	if(mode === "edit") {
		if(inputType === "color") {
			return (
				<PhotoshopPicker
					color={ value }
					onChangeComplete={ (color) => handleKeyPress({ key: 'Enter', target: { value: color.hex } }) }
				/>
			);
		}
		return (
			<input
				key={ field }
				className="flex-1 w-full p-2 text-center rounded cursor-pointer hover:bg-sky-200 active:bg-sky-300 focus:bg-sky-400 focus:text-neutral-50 focus:outline-none"
				type={ inputType }
				defaultValue={ value }
				autoFocus
				// onFocus={ (event) => event.target.select() }
				onBlur={ () => handleEdit() }
				onKeyDown={ handleKeyPress }
			/>
		);
	}

	if(inputType === "color") {
		return (
			<div
				onClick={ handleEdit }
				className="flex-1 w-full h-full p-2 text-center rounded cursor-pointer focus:outline-none"
				style={ { backgroundColor: value } }
			/>
		);
	}

	return (
		<div
			onClick={ handleEdit }
			className="flex-1 w-full p-2 text-center rounded cursor-pointer"
		>
			{ value }
		</div>
	);
};


export default Struct;