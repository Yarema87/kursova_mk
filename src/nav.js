import React from "react";
import axios, {isCancel, AxiosError} from "axios";

function Nav(){

    const chooseClock = () => {
        const clock_url = `http://localhost:5000/clock`;
        axios.get(clock_url)
        .then(response => {
            console.log("Clock was chosen");
        })
        .catch(error => {
            console.error('Error during choosing clock:', error);
        });
    };

    const chooseAlarm = () => {
        const alarm_url = `http://localhost:5000/alarm`;
        axios.get(alarm_url)
        .then(response => {
            console.log("Alarm was chosen");
        })
        .catch(error => {
            console.error('Error during choosing alarm:', error);
        });
    };

    const chooseStopwatch = () => {
        const stopwatch_url = `http://localhost:5000/stopwatch`;
        axios.get(stopwatch_url)
        .then(response => {
            console.log("Stopwatch was chosen");
        })
        .catch(error => {
            console.error('Error during choosing stopwatch:', error);
        });
    };

    const chooseTimer = () => {
        const timer_url = `http://localhost:5000/timer`;
        axios.get(timer_url)
        .then(response => {
            console.log("Timer was chosen");
        })
        .catch(error => {
            console.error('Error during choosing timer:', error);
        });
    };



    return(
        <nav>
            <h2>Choose mode</h2>
            <div id="nav_buttons">
                <button className="nav-button" onClick={chooseClock}>Clock</button>
                <button className="nav-button" onClick={chooseAlarm}>Alarm</button>
                <button className="nav-button" onClick={chooseStopwatch}>Stopwatch</button>
                <button className="nav-button" onClick={chooseTimer}>Timer</button>
            </div>
        </nav>
    )
}

export default Nav;