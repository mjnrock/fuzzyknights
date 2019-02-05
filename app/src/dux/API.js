import { ofType } from "redux-observable";
import { switchMap } from 'rxjs/operators'

export const ModuleID = "XAPI";
export const Enum = {
    REQUEST_GAME: "REQUEST_GAME",
    REQUEST_GAME_SUCCESS: "REQUEST_GAME_SUCCESS",
    REQUEST_GAME_FAILURE: "REQUEST_GAME_FAILURE"
};

export const RequestGame = () => ({
    type: Enum.REQUEST_GAME,
    url: "http://localhost:3099/validate"
});

export const RequestGameSuccess = (payload) => ({
    type: Enum.REQUEST_GAME_SUCCESS,
    payload: payload
});

export const RequestGameFailure = (payload) => ({
    type: Enum.REQUEST_GAME_FAILURE,
    payload: payload
});

const initialState = {
    Payload: null
};

export function Reducer(state = initialState, action) {
    switch (action.type) {
        case Enum.REQUEST_GAME:
            return {
                ...state
            };
        case Enum.REQUEST_GAME_SUCCESS:
            return {
                ...state,
                Payload: action.payload
            };
        case Enum.REQUEST_GAME_FAILURE:
            return {
                ...state,
                Payload: action.payload
            };
        default:
            return state;
    }
}

export function RequestGameEpic(action$) {
    return action$.pipe(
        ofType("REQUEST_GAME"),
        switchMap(({ url }) =>
            fetch(url)
                .then(response => response.ok ? response.json() : RequestGameFailure())
                .then(result => result.type === "REQUEST_GAME_FAILURE" ? result : RequestGameSuccess(result))
                .catch(() => RequestGameFailure())
        )
    );
}