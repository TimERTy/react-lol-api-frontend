import React from "react";
import logo from "../logo.svg";
import "./Home.css";

class Home extends React.Component {
    constructor() {
        super();
        this.state = {};
    }

    render() {
        return (
            <div className="Home">
                <img src={logo} className="Home-logo" alt="logo" />
            </div>
        );
    }
}

export default Home;
