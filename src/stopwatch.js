import React, {useState} from "react";
import axios, {isCancel, AxiosError} from "axios";

function Stopwatch(){
    const [hour, setHour] = useState("00");
    const [minute, setMinute] = useState("00");
    const [second, setSecond] = useState("00");
    const [timeDisplay, setTimeDisplay] = useState('00:00:00');
    const [stopwatchData, setStopwatchData] = useState([]);
    const [isStoppedVisible, setIsStoppedVisible] = useState(false);
    const [isLoopedVisible, setIsLoopedVisible] = useState(false);

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
        const save_url = `http://localhost:5000/stopwatch/save`;
        axios.post(save_url, user_time)
        .then(response => {
            console.log('Data transfered', response.data);
        })
        .catch(error => {
            console.error('Error during saving:', error);
        });
    };

    const handleStartClick = () => {
        const start_url = `http://localhost:5000/stopwatch/start`;
        axios.post(start_url, user_time)
        .then(response => {
            console.log('Data transfered', response.data);
            setStopwatchData([]);
        })
        .catch(error => {
            console.error('Error during saving:', error);
        });
    };

    const handleStopClick = () => {
        const stop_url = `http://localhost:5000/stopwatch/stop`;
        axios.get(stop_url)
        .then(response => {
            setTimeDisplay(`${response.data.hour}:${response.data.minute}:${response.data.second}`);
            setIsStoppedVisible(true);
            setHour(response.data.hour);
            setMinute(response.data.minute);
            setSecond(response.data.second);
        })
        .catch(error => {
            console.error('Error during stopping stopwatch:', error);
        });
    };

    const handleLoopClick = () => {
        const loop_url = `http://localhost:5000/stopwatch/loop`;
        axios.get(loop_url)
        .then(response => {
            const lastTime = {
                hour: response.data.hour,
                minute: response.data.minute,
                second: response.data.second
            };
            setStopwatchData([...stopwatchData, lastTime]);
            setIsLoopedVisible(true);
            setHour(response.data.hour);
            setMinute(response.data.minute);
            setSecond(response.data.second);
        })
        .catch(error => {
            console.error('Error during looping stopwatch', error);
        });
    };

    return(
        <span className="main_span">
            <input placeholder="hour" onChange={saveHour} value = {hour === "00" ? "" : hour} type="number"></input>
            <input placeholder="minute" onChange={saveMinute} value={minute === "00" ? "" : minute} type="number"></input>
            <input placeholder="second" onChange={saveSecond} value={second === "00" ? "" : second} type="number"></input>
            <div className="buttons">
                <button onClick={handleStartClick}>Start</button>
                <button onClick={handleStopClick}>Stop</button>
            </div>
            <div className="buttons">
                <button onClick={handleLoopClick}>Loop</button>
                <button onClick={handleSaveClick}>Save</button>
            </div>
            <div className="stopwatch_time" style={{ display: isLoopedVisible ? 'block' : 'none' }}> 
                {stopwatchData.map((item, index) => (
                    <div key={index}>
                        <p>Loop Iteration {index + 1}: {item.hour}:{item.minute}:{item.second}</p>
                    </div>
                    ))}
            </div>
            <div className="stopwatch_time" style={{ display: isStoppedVisible ? 'block' : 'none' }}> 
                <div>Stopwatch time: {timeDisplay}</div>
            </div>
        </span>
    )
}

export default Stopwatch;