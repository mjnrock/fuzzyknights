import { createStore, applyMiddleware, combineReducers } from "redux";
import { createEpicMiddleware, combineEpics  } from 'redux-observable';

import { Reducer as APIReducer, RequestGameEpic as APIRequestGameEpic } from "./dux/API";

export const rootReducer = combineReducers({
    API: APIReducer
});

const epicMiddleware = createEpicMiddleware();
export const rootEpic = combineEpics(
    APIRequestGameEpic
);

export default function configureStore() {
    const store = createStore(
        rootReducer,
        applyMiddleware(epicMiddleware)
    );

    epicMiddleware.run(rootEpic);

    return store;
}