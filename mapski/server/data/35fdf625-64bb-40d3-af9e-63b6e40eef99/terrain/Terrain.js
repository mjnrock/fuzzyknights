import EnumType from "./EnumType.js";
import EnumCost from "./EnumCost.js";
import EnumMask from "./EnumMask.js";

export const Terrain = {
	[ EnumType.VOID ]: {
		type: EnumType.VOID,
		cost: EnumCost.IMPOSSIBLE,
		mask: 0,
	},
	[ EnumType.WATER ]: {
		type: EnumType.WATER,
		cost: EnumCost.VERY_SLOW,
		mask: EnumMask.IsNavigable,
	},
	[ EnumType.SAND ]: {
		type: EnumType.SAND,
		cost: EnumCost.SLOW,
		mask: EnumMask.IsNavigable,
	},
	[ EnumType.DIRT ]: {
		type: EnumType.DIRT,
		cost: EnumCost.NORMAL,
		mask: EnumMask.IsNavigable | EnumMask.IsBuildable,
	},
	[ EnumType.GRASS ]: {
		type: EnumType.GRASS,
		cost: EnumCost.NORMAL,
		mask: EnumMask.IsNavigable | EnumMask.IsBuildable | EnumMask.IsHarvestable,
	},
	[ EnumType.ROCK ]: {
		type: EnumType.ROCK,
		cost: EnumCost.SLOW,
		mask: EnumMask.IsNavigable | EnumMask.IsBuildable,
	},
	[ EnumType.SNOW ]: {
		type: EnumType.SNOW,
		cost: EnumCost.SLOW,
		mask: EnumMask.IsNavigable,
	},
};

export default Terrain;