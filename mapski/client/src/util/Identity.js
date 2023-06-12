import { v4 as uuid } from "uuid";
import { Tags } from "./Tags";

export class Identity {
	constructor ({ id, tags = [] } = {}) {
		this.$id = id || uuid();
		this.$tags = new Tags(...tags);
	}

	toObject(...args) {
		return {
			$id: this.$id,
			$tags: this.$tags.toTags(...args),
		};
	}
	toString(...args) {
		return JSON.stringify(this.toObject(...args));
	}
}

export default Identity;