export class Terrain {
	constructor ({ type, cost = 0, mask = 0, ...rest } = {}) {
		this.type = type;
		this.cost = cost;
		this.mask = mask;

		Object.assign(this, rest);
	}
};

export default Terrain;