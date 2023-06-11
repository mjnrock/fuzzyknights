export class Terrain {
	constructor ({ type, cost = 0, mask = 0, texture, ...rest } = {}) {
		this.type = type;
		this.cost = cost;
		this.mask = mask;
		this.texture = texture;

		Object.assign(this, rest);
	}

	setType(type) {
		return new Terrain({
			...this,
			type,
		});
	}

	setCost(cost) {
		return new Terrain({
			...this,
			cost,
		});
	}

	setMask(mask) {
		return new Terrain({
			...this,
			mask,
		});
	}

	setTexture(texture) {
		return new Terrain({
			...this,
			texture,
		});
	}
};

export default Terrain;