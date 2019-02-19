import FuzzyKnights from "./../fk-core/package";

class Main {
	constructor(...args) {}

	static Run(...args) {
		let plane = new FuzzyKnights.Utility.Plane(5, 5);

		// console.log(plane.GetNeighbors(2, 2, 1, null, false));
		console.log(plane.GetRectangle(0, 0, 2, 2, true));
		console.log(plane.GetRectangle(0, 0, 2, 2, false));
	}
}

export default Main;