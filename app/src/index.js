import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";

import storeInit from "./store";

import App from "./App";

ReactDOM.render(
	<Provider store={ storeInit() }>
		<App />
	</Provider>,
	document.getElementById("root")
);