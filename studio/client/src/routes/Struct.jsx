import { CRUDTable } from "../apps/structski/modules/relational/CRUDTable";
import Record from "../apps/structski/modules/relational/Record";

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
				<CRUDTable />
			</div>
		</>
	);
}