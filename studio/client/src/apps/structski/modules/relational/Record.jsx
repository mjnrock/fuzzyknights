import React, { useState } from "react";
import { BsPencilSquare, BsTrash, BsPlusCircleDotted, BsPlusSquareDotted, BsCheck, BsX } from "react-icons/bs";

export const Record = ({ data, localName = "", fullName = "", selectedRows = [], setSelectedRows }) => {
	const isSelected = selectedRows.includes(fullName);
	const [ editing, setEditing ] = useState(false);
	const [ newKey, setNewKey ] = useState("");
	const [ newValue, setNewValue ] = useState("");

	const handleClick = () => {
		if(isSelected) {
			setSelectedRows((prev) => prev.filter((row) => row !== fullName));
		} else {
			setSelectedRows((prev) => [ ...prev, fullName ]);
		}
	};

	const addNewValue = () => {
		setEditing(true);
	};
	const addNewObject = () => {
		data[ newKey ] = {};
		setNewKey("");
		setEditing(false);
	};

	const addNewArray = () => {
		data[ newKey ] = [];
		setNewKey("");
		setEditing(false);
	};

	const saveNewValue = () => {
		data[ newKey ] = newValue;
		setNewKey("");
		setNewValue("");
		setEditing(false);
	};

	const cancelNewValue = () => {
		setNewKey("");
		setNewValue("");
		setEditing(false);
	};

	return (
		<div className={ `p-2 my-1 border border-solid rounded shadow border-neutral-200 ${ isSelected ? "bg-sky-200 border-sky-300" : "bg-white" }` }>
			{
				(typeof data === "object" && data !== null) ? (
					<div className={ `pl-4 border-l-2 hover:border-l-sky-400 ${ isSelected ? "border-l-sky-300" : "border-l-gray-200" }` }>
						{ localName && (
							<div
								className={ `flex items-center mt-2 cursor-pointer hover:text-sky-600` }
								onClick={ handleClick }
							>
								<div className="flex-1 font-bold">{ localName }</div>
							</div>
						) }
						{ Object.keys(data).map((key) => (
							<Record
								key={ key }
								data={ data[ key ] }
								localName={ key }
								fullName={ fullName ? `${ fullName }.${ key }` : key }
								selectedRows={ selectedRows }
								setSelectedRows={ setSelectedRows }
							/>
						)) }
					</div>
				) : (
					<div className={ `pl-4 border-l-2 hover:border-l-sky-400 ${ isSelected ? "border-l-sky-300" : "border-l-gray-200" }` }>
						<div
							className={ `flex items-center mt-2 cursor-pointer hover:text-sky-600` }
							onClick={ handleClick }
						>
							<div className="flex-1">
								<span className="font-bold">{ localName }</span>: <span className="font-mono">{ String(data) }</span>
							</div>
						</div>
					</div>
				)
			}

			<div className="flex flex-row">
				{
					typeof data === "object" && data !== null && (
						<div className="flex flex-row items-center justify-center w-full h-full gap-2 p-2 overflow-hidden">
							{
								!editing && (
									<>
										<div className="flex items-center justify-center flex-1 h-4 py-3 text-xs text-center border border-b-2 border-solid rounded shadow cursor-pointer bg-sky-50 hover:bg-sky-100 active:bg-sky-200 border-sky-300 text-sky-500 hover:border-sky-400">
											<BsPlusCircleDotted onClick={ addNewValue } />
										</div>
										<div className="flex items-center justify-center flex-1 h-4 py-3 text-xs text-center border border-b-2 border-solid rounded shadow cursor-pointer bg-violet-50 hover:bg-violet-100 active:bg-violet-200 border-violet-300 text-violet-500 hover:border-violet-400">
											<span onClick={ addNewArray }>[]</span>
										</div>
										<div className="flex items-center justify-center flex-1 h-4 py-3 text-xs text-center text-indigo-500 border border-b-2 border-indigo-300 border-solid rounded shadow cursor-pointer bg-indigo-50 hover:bg-indigo-100 active:bg-indigo-200 hover:border-indigo-400">
											<span onClick={ addNewObject }>{ `{}` }</span>
										</div>
									</>
								)
							}
							{
								editing && (
									<div className="flex flex-row items-center justify-center w-full h-full gap-2 p-2 overflow-hidden">
										<input
											className="p-2 border border-b-2 border-solid rounded shadow-sm border-neutral-200"
											value={ newKey }
											onChange={ e => setNewKey(e.target.value) }
											placeholder="Key"
										/>
										<input
											className="p-2 border border-b-2 border-solid rounded shadow-sm border-neutral-200"
											value={ newValue }
											onChange={ e => setNewValue(e.target.value) }
											placeholder="Value"
										/>
										<div className="p-2 text-center border border-b-2 border-solid rounded shadow cursor-pointer bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 border-emerald-300 text-emerald-500 hover:border-emerald-400">
											<BsCheck onClick={ saveNewValue } />
										</div>
										<div className="p-2 text-center border border-b-2 border-solid rounded shadow cursor-pointer bg-rose-50 hover:bg-rose-100 active:bg-rose-200 border-rose-300 text-rose-500 hover:border-rose-400">
											<BsX onClick={ cancelNewValue } />
										</div>
									</div>
								)
							}
						</div>
					)
				}
			</div>
		</div>
	);
};

const RecursiveComponent = ({ data }) => {
	const [ record, setRecord ] = useState(data); // data is an object, so record is an object
	const [ selectedRows, setSelectedRows ] = useState([]);
	const [ isModifying, setIsModifying ] = useState(false);

	const toggleModify = () => {
		setIsModifying((prev) => !prev);
	};

	const deleteSelectedRows = () => {
		const next = { ...record };
		for(let i = 0; i < selectedRows.length; i++) {
			const path = selectedRows[ i ].split(".");
			let obj = next;
			for(let j = 0; j < path.length - 1; j++) {
				obj = obj[ path[ j ] ];
			}

			delete obj[ path[ path.length - 1 ] ];
		}

		setRecord(next);
		setSelectedRows([]);
	};

	return (
		<div className="w-1/2 p-4">
			<div className="flex flex-row items-center justify-center w-full h-full gap-2 p-2 overflow-hidden">
				<button className="p-2 text-center border border-b-2 border-solid rounded shadow cursor-pointer bg-sky-50 hover:bg-sky-100 active:bg-sky-200 border-sky-300 text-sky-500 hover:border-sky-400" onClick={ toggleModify }>
					<BsPencilSquare className={ isModifying ? "text-sky-400" : "text-sky-300" } />
				</button>
				{ isModifying &&
					<div className="flex items-center gap-2">
						<span className="font-mono font-thin">{ selectedRows.length }</span>
						<button className="p-2 text-center border border-b-2 border-solid rounded shadow cursor-pointer bg-rose-50 hover:bg-rose-100 active:bg-rose-200 border-rose-300 text-rose-500 hover:border-rose-400" onClick={ deleteSelectedRows }>
							<BsTrash />
						</button>
					</div>
				}
			</div>

			{ Object.keys(data).map((key) => (
				<Record
					key={ key }
					data={ data[ key ] }
					localName={ key }
					fullName={ key }
					selectedRows={ selectedRows }
					setSelectedRows={ setSelectedRows }
				/>
			)) }
			<pre>Selected Rows: { JSON.stringify(selectedRows, null, 2) }</pre>
		</div>
	);
};

export default RecursiveComponent;
