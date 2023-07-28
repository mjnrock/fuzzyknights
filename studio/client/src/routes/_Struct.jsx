import { useState } from "react";
import { Table } from "../apps/structski/modules/crud/Table";
import Record from "../apps/structski/modules/crud/Record";

export function Struct() {
	const [ data, setData ] = useState({
		"foo": "bar",
		"baz": {
			"qux": "quux",
			"corge": "grault",
			"array": [
				"one",
				"two",
			],
			"garply": {
				"waldo": "fred",
				"plugh": "xyzzy",
				"thud": "wibble"
			}
		}
	});

	return (
		<>
			<div className="flex flex-col items-center justify-center m-2 overflow-hidden border border-solid rounded shadow-md select-none border-neutral-200">
				<Record
					data={ data }
				/>
			</div>

			<div className="flex flex-col items-center justify-center m-2 overflow-hidden border border-solid rounded shadow-md select-none border-neutral-200">
				<Table />
			</div>
		</>
	);
}