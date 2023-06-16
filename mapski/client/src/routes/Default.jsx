import React from "react";

import Identity from "../v2/lib/Identity";
import Tags from "../v2/util/Tags";

const identity = Identity().Create({
	tags: [ [ "cat", 1 ], [ "dog", 2 ], "fish" ],
	test: 123,
});

// console.log(Identity(identity))
console.log(identity.$tags)

console.log(Tags.ToObject(identity.$tags))
console.log(Tags.ToEntries(identity.$tags))
console.log(Tags.ToTags(identity.$tags))

console.log(identity)
console.log(Identity(identity).toMetaObject())
console.log(Identity(identity).toObject())

export function Default() {
	return (
		<>
			Hi
		</>
	);
};

export default Default;