import crypto from "crypto-js";
import { useState, useEffect } from "react";

import { FileSource } from "../../tessellator/components/FileSource.jsx";
import { TileCanvas } from "../../tessellator/components/TileCanvas.jsx";
import { NominatorBar } from "../components/NominatorBar.jsx";

import SqlHelper from "../../../../../lib/SqlHelper.js";
import Base64 from "../../../../../util/Base64.js";
import clone from "../../../../../util/clone.js";

import Timer from "../../$cadence/Timer.js";
import Cadence from "../../$cadence/Cadence.js";

const timer = Timer.State({
	cadence: Cadence.State({
		steps: [ 1,1,1,1 ],
		isRelative: true,
	}),
	duration: 50,
});
console.log(timer)
console.log(Timer.Reducers().tick(timer, 83))
console.log(Timer.Reducers().tick(timer, 135))
console.log(Timer.Reducers().tick(timer, 190))
console.log(Timer.Reducers().tick(timer, 300))

export function Tessellator({ data, update, ...props }) {
	const { tessellatorData, nominatorData } = data;
	const { tessellatorDispatch, tessellatorDispatchAsync, nominatorDispatch, nominatorDispatchAsync } = update;

	return (
		<div className="m-2" { ...props }>
			Hi
		</div>
	);
};

export default Tessellator;