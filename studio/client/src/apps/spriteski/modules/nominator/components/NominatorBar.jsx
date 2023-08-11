
import { useForm } from "../../../../../@form/react/useForm.js";
import { BsUiChecks, BsPlay } from "react-icons/bs";

export function NominatorBar({ data, update }) {
	const { nominatorData } = data;
	const { nominatorDispatch, nominatorDispatchAsync } = update;

	console.log(nominatorData)

	return (
		<>
			<div className="flex flex-row items-center justify-between w-full gap-2 p-2 my-2 border border-solid rounded shadow-md border-neutral-100">
				<button
					className="flex flex-col items-center justify-center p-4 border border-solid rounded shadow cursor-pointer text-neutral-400 hover:text-amber-400 border-neutral-200 hover:bg-amber-50 active:bg-amber-100 hover:border-amber-200"
					onClick={ e => null }
					title="Adjust pattern parameters"
				>
					<BsUiChecks className="text-lg" />
				</button>
				<input
					className="w-full p-2 h-[50px] text-center border border-solid rounded border-neutral-200 hover:bg-neutral-50 text-xl shadow"
					type="text"
					placeholder="Naming Pattern"
					value={ nominatorData.phrase }
					onChange={ e => nominatorDispatch({ type: "setPhrase", data: e.target.value }) }
				/>
				<button
					className="flex flex-col items-center justify-center p-4 border border-solid rounded shadow cursor-pointer text-neutral-400 hover:text-emerald-400 border-neutral-200 hover:bg-emerald-50 active:bg-emerald-100 hover:border-emerald-200"
					onClick={ e => null }
					title="Apply name to respective tiles"
				>
					<BsPlay className="text-lg" />
				</button>
			</div>
		</>
	);
};

export default NominatorBar;