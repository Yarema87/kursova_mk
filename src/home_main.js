import React from "react";
import Clock from "./clock";
import Alarm from "./alarm";
import Timer from "./timer";
import Stopwatch from "./stopwatch";

function HomeMain(){
    return(
        <div className="home_main">
            <div className="main_part" id="clock">
                <h4 className="type_text">Clock</h4>
                <Clock />
            </div>
            <div className="main_part" id="alarm">
                <h4 className="type_text">Alarm</h4>
                <Alarm />
            </div>
            <div className="main_part" id="timer">
                <h4 className="type_text">Timer</h4>
                <Timer />
            </div>
            <div className="main_part" id="stopwatch">
                <h4 className="type_text">Stopwatch</h4>
                <Stopwatch />
            </div>
        </div>
    )
}

export default HomeMain;
