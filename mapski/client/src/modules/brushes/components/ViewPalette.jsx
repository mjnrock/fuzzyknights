import { BsPen, BsPlus, BsSquare, BsDice5, BsPaintBucket } from "react-icons/bs";

export function Button({ text, active, children, ...props } = {}) {
	return (
		<div className={ `p-2 text-blue-300 border border-blue-200 border-solid rounded shadow cursor-pointer ${ active ? "bg-blue-300 text-neutral-100" : "bg-neutral-50" } hover:bg-blue-500 hover:text-neutral-300` } { ...props }>
			{ text || children }
		</div>
	)
}

export function ViewPalette({ data, update }) {
	const { mapDispatch, brushesDispatch } = update;
	return (
		<div className="flex flex-row items-center justify-center gap-2">
			<div className="flex flex-row items-center justify-center gap-2 p-2 border border-solid rounded bg-blue-50 border-neutral-200">
				<Button
					active={ data.brush === "point" }
					onClick={ e => brushesDispatch({
						type: "point",
					}) }
				>
					<BsPen className="text-2xl" />
				</Button>
				<Button
					active={ data.brush === "plus" }
					onClick={ e => brushesDispatch({
						type: "plus",
					}) }
				>
					<BsPlus className="text-2xl" />
				</Button>
				<Button
					active={ data.brush === "rectangle" }
					onClick={ e => brushesDispatch({
						type: "rectangle",
						data: [ "rectangle", data.x, data.y ],
					}) }
				>
					<BsSquare className="text-2xl" />
				</Button>
			</div>
			<div className="flex flex-row items-center justify-center gap-2 p-2 border border-solid rounded bg-gray-50 border-neutral-200">
				<div className="flex flex-row gap-2">
					<div
						className="flex-1 p-2 text-center text-gray-400 border border-gray-300 border-solid rounded shadow cursor-pointer bg-neutral-50 hover:bg-gray-400 hover:text-neutral-100 active:bg-gray-500"
						onClick={ e => mapDispatch({
							type: "randomize",
						}) }
					>
						<BsDice5 className="mx-auto text-2xl" />
					</div>
					<div
						className="flex-1 p-2 text-center text-gray-400 border border-gray-300 border-solid rounded shadow cursor-pointer bg-neutral-50 hover:bg-gray-400 hover:text-neutral-100 active:bg-gray-500"
						onClick={ e => mapDispatch({
							type: "solidFill",
						}) }
					>
						<BsPaintBucket className="mx-auto text-2xl" />
					</div>
				</div>
			</div>
		</div>
	);
};

export default ViewPalette;