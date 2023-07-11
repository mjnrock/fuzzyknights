import React, { useState } from "react";
import { BsEraser, BsInfinity, BsSearch, BsXCircle, BsPlusCircleDotted } from "react-icons/bs";
import { TerrainPreview } from "./TerrainPreview";
import { BitMask } from "../../../components/BitMask";
import { TerrainModal } from "./TerrainModal";

// STUB: Import from data network
export const EnumMask = {
	IsNavigable: 1 << 0,
	IsBuildable: 1 << 1,
	IsHarvestable: 1 << 2,
};

const SearchBox = ({ search, setSearch, ...props }) => (
	<div{ ...props }>
		<input
			type="text"
			className="w-full min-h-[48px] rounded pl-10 pr-6 text-neutral-600 focus:outline-neutral-300"
			placeholder="Search..."
			value={ search }
			onChange={ e => setSearch(e.target.value) }
		/>
		<BsSearch className="absolute text-xl transform -translate-y-1/2 left-2 top-1/2" />
		{ search && <BsXCircle className="absolute text-xl transform -translate-y-1/2 cursor-pointer hover:text-neutral-500 right-2 top-1/2" onClick={ () => setSearch("") } /> }
	</div>
);

export function TerrainMap({ data, update, ...props }) {
	const [ search, setSearch ] = useState("");
	const [ isModalOpen, setIsModalOpen ] = useState(false);
	const terrains = Object.keys(data.terrains).filter(key => {
		const terrain = data.terrains[ key ];
		//NOTE: Add any additional search criteria here
		return terrain.type.toLowerCase().includes(search.toLowerCase());
	});

	return (
		<div className="flex flex-col items-center justify-center max-h-screen p-2 border border-solid rounded select-none border-neutral-200 bg-neutral-50" { ...props }>
			<div className="flex flex-row items-center justify-center w-full gap-2">
				<>
					<div
						className="flex flex-row items-center justify-center w-1/6 p-2 border border-transparent border-solid rounded cursor-pointer text-neutral-500 hover:bg-sky-50 hover:text-sky-500 hover:border-sky-200"
						onClick={ () => setIsModalOpen(true) }
					>
						<BsPlusCircleDotted className="text-2xl" />
					</div>
					<TerrainModal
						isOpen={ isModalOpen }
						setIsOpen={ setIsModalOpen }
						onSubmit={ (terrain) => {
							update({
								type: "addTerrain",
								data: terrain
							});
						} }
						terrain={ {
							type: "NEW_TERRAIN",
							cost: 1,
							mask: 0,
							texture: "#000000",
						} }
					/>
				</>
				<div
					className={ `w-5/6 text-neutral-500 flex flex-row items-center justify-center rounded p-2 border border-solid cursor-pointer hover:text-sky-500 hover:bg-sky-50 hover:border-sky-200 ` + (data.selected === null ? ` bg-sky-100 border-sky-300 text-sky-500` : `border-transparent`) }
					onClick={ () => {
						update({
							type: "selectTerrain",
							data: null
						});
					} }
				>
					<BsEraser className="text-2xl" />
					<div className="ml-2">Eraser</div>
				</div>
			</div>

			<hr className="w-full my-2 border-neutral-200" />

			<SearchBox
				className="relative w-full mb-2 text-center border border-gray-300 border-solid rounded text-neutral-400"
				search={ search }
				setSearch={ setSearch }
			/>

			<div className="overflow-y-scroll h-screenoverflow-x-hidden flex flex-col w-full max-h-[64rem] space-y-2">
				{
					terrains.map((key, i) => {
						const terrain = data.terrains[ key ];

						return (
							<div
								key={ key }
								className={ `flex flex-row items-center justify-center rounded p-2 border border-solid cursor-pointer hover:bg-sky-50 hover:border-sky-200 ` + (data.selected === key ? ` bg-sky-100 border-sky-300` : `border-transparent`) }
								onClick={ () => {
									update({
										type: "selectTerrain",
										data: key
									});
								} }
							>
								<TerrainPreview
									terrain={ terrain }
									colorHandler={ (color) => {
										update({
											type: "setTerrainTexture",
											data: { key, texture: color }
										});
									} }
									imageHandler={ (image) => {
										update({
											type: "setTerrainTexture",
											data: { key, texture: image }
										});
									} }
								/>

								<div className="flex flex-col space-y-2">
									<div className="flex">
										<p className="font-bold">type:</p>
										<p className="ml-2 italic">{ terrain.type }</p>
									</div>
									<div className="flex">
										<p className="font-bold">cost:</p>
										<p className="m-auto ml-2 italic">{ terrain.cost === Infinity ? <BsInfinity className="text-sm" /> : terrain.cost }</p>
									</div>
									<div className="flex">
										<p className="font-bold">mask:</p>
										<p className="ml-2 italic">{ terrain.mask }</p>
									</div>
									<BitMask mask={ terrain.mask } dict={ EnumMask } />
								</div>
							</div>
						);
					})
				}
			</div>
		</div>
	);
};

export default TerrainMap;