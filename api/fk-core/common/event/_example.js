import FuzzyKnights from "./../../package";
console.log(FuzzyKnights);

let emitter = new FuzzyKnights.Common.Event.Emitter();
let subs = emitter.Listen("data", data => console.log(data));
let subs2 = emitter.Listen("data", data => console.log(data));

emitter.Emit("data", "foo");

console.log(FuzzyKnights);