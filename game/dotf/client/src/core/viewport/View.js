import { Pane } from "./Pane";

export class View extends Pane {
	constructor ({ observer, ...args } = {}) {
		super({
			...args
		});

		this.observer = observer;
	}
};

export default View;