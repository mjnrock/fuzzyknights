export const ModuleID = "XAPI";
export const Enum = {
    REQUEST_GAME: "REQUEST_GAME",
    REQUEST_GAME_SUCCESS: "REQUEST_GAME_SUCCESS",
    REQUEST_GAME_FAILURE: "REQUEST_GAME_FAILURE"
};

export const RequestGame = () => ({
    type: Enum.REQUEST_GAME,
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
    whiskies: [], // for this example we"ll make an app that fetches and lists whiskies
    isLoading: false,
    error: false
};

export function Reducer(state = initialState, action) {
    switch (action.type) {
        case Enum.REQUEST_GAME:
            return {
                ...state
            };
        case Enum.REQUEST_GAME_SUCCESS:
            return {
                ...state
            };
        case Enum.REQUEST_GAME_FAILURE:
            return {
                ...state
            };
        default:
            return state;
    }
}

export function RequestGameEpic(action$) {
    return action$
        .ofType("REQUEST_GAME")
        .switchMap(({ url }) =>
            fetch(url)
                .then(response => response.ok ? response.json() : RequestGameFailure())
                .then(result => result.type === "REQUEST_GAME_FAILURE" ? result : RequestGameSuccess(result))
                .catch(() => RequestGameFailure())
        );
}