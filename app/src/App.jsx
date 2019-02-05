import React, { Component } from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { connect } from "react-redux";

import { RequestGame } from "./dux/API";

class App extends Component {
    componentDidMount() {
        this.props.RequestGame();
    }
    
	render() {
        console.log(this.props.API.Payload);
		return (
            <div>cat</div>
		);
	}
}
export default connect(
	(state) => ({
        API: state.API
    }),
	(dispatch) => ({
        RequestGame: () => dispatch(RequestGame()),
    })
)(App);