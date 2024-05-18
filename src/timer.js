import React, {useState} from "react";
import axios, {isCancel, AxiosError} from "axios";

function Timer(){
    const [hour, setHour] = useState("00");
    const [minute, setMinute] = useState("00");
    const [second, setSecond] = useState("00");
    const [timers, setTimers] = useState([]);
    const [timeDisplay, setTimeDisplay] = useState('00:00:00');
    const [isStoppedVisible, setIsStoppedVisible] = useState(false);

    const user_time = {
        user_hour: hour,
        user_minute: minute,
        user_second: second
    }

    const saveHour = (e) => {
        if(e.target.value > 23){
            alert("Enter valid hour");
            e.target.value = 0;
        }
        else{
            setHour(e.target.value);
        }
    };

    const saveMinute = (e) => {
        if(e.target.value > 59){
            alert("Enter valid minute");
            e.target.value = 0;
        }
        else{
            setMinute(e.target.value);
        }
    };

    const saveSecond = (e) => {
        if(e.target.value > 59){
            alert("Enter valid second");
            e.target.value = 0;
        }
        else{
            setSecond(e.target.value);
        }
    }

    const handleSaveClick = () => {
        const save_url = `http://localhost:5000/timer/save`;
        axios.post(save_url, user_time)
        .then(response => {
            console.log('Data transfered', response.data);
        })
        .catch(error => {
            console.error('Error during saving:', error);
        });
    };

    const handleStartClick = () => {
        const start_url = `http://localhost:5000/timer/start`;
        axios.post(start_url, user_time)
        .then(response => {
            console.log('Data transfered', response.data);
        })
        .catch(error => {
            console.error('Error during starting timer:', error);
        });
    };

    const handleStopClick = () => {
        const stop_url = `http://localhost:5000/timer/stop`;
        axios.get(stop_url)
        .then(response => {
            setTimeDisplay(`${response.data.hour}:${response.data.minute}:${response.data.second}`);
            setIsStoppedVisible(true);
            setHour(response.data.hour);
            setMinute(response.data.minute);
            setSecond(response.data.second);
        })
        .catch(error => {
            console.error('Error during stopping timer:', error);
        });
    };

    const chooseFromSaved = () => {
        const choose_url = `http://localhost:5000/timer/choose`;
        axios.get(choose_url)
        .then(response => {
            setTimers(response.data);
        })
        .catch(error => {
            console.error('Error during getting saved timers', error);
        });
        if(document.querySelector(".saved-timers")){
            document.querySelector(".saved-timers").classList.toggle("hidden");
        }
    };

    const handleTimerClick = (timer) => {
        setHour(timer.hour.toString()); 
        setMinute(timer.minute.toString());
        setSecond(timer.second.toString());
        document.querySelector(".saved-timers").classList.add("hidden");
      };

    return(
        <span className="main_span">
            <input placeholder="hour" onChange={saveHour} value = {hour === "00" ? "" : hour} type="number"></input>
            <input placeholder="minute" onChange={saveMinute} value={minute === "00" ? "" : minute} type="number"></input>
            <input placeholder="second" onChange={saveSecond} value = {second === "00" ? "" : second} type="number"></input>
            <div className="buttons">
                <button onClick={handleStartClick}>Start</button>
                <button onClick={handleStopClick}>Stop</button>
            </div>
            <div className="buttons">
                <button onClick={handleSaveClick}>Save</button>
                <button onClick={chooseFromSaved}>Choose from saved</button>
            </div>
            {timers.length > 0 && (
        <div className="saved-timers">
        <h3>Saved Timers:</h3>
        <ul>
            {timers.map((timer, index) => (
                <button className="saved_timers" onClick={() => handleTimerClick(timer)}>
            <li key={index}>
                {timer.hour}:{timer.minute}:{timer.second}
            </li>
            </button>
            ))}
        </ul>
        </div>
    )}
            <div className="stopwatch_time" style={{ display: isStoppedVisible ? 'block' : 'none' }}> 
                <div>Timer stopped at: {timeDisplay}</div>
            </div>
        </span>
    )
}

export default Timer;