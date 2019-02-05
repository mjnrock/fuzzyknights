import { createStore, applyMiddleware, combineReducers } from "redux";
import { combineEpics, createEpicMiddleware } from "redux-observable";

import { Reducer as APIReducer, RequestGameEpic as APIRequestGameEpic } from "./dux/API";

const epicMiddleware = createEpicMiddleware(combineEpics(
    APIRequestGameEpic
));

export default function init() {
	let store = createStore(
		combineReducers({
            API: APIReducer
        }),
		applyMiddleware(epicMiddleware)
	);

	return store;
}