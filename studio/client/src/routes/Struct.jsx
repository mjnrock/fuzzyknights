import { Table } from "../apps/structski/modules/crud/Table";
import Record from "../apps/structski/modules/crud/Record";

export function Struct() {
	return (
		<>
			<div className="flex flex-col items-center justify-center m-2 overflow-hidden border border-solid rounded shadow-md select-none border-neutral-200">
				<Record
					data={ {
						"foo": "bar",
						"baz": {
							"qux": "quux",
							"corge": "grault",
							"array": [
								"one",
								"two",
								"three"
							],
							"garply": {
								"waldo": "fred",
								"plugh": "xyzzy",
								"thud": "wibble"
							}
						}
					} }
				/>
			</div>

			<div className="flex flex-col items-center justify-center m-2 overflow-hidden border border-solid rounded shadow-md select-none border-neutral-200">
				<Table />
			</div>
		</>
	);
}