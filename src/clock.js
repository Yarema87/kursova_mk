import React, {useState} from "react";
import axios, {isCancel, AxiosError} from "axios";

function Clock(){
    const [hour, setHour] = useState("00");
    const [minute, setMinute] = useState("00");
    const [second, setSecond] = useState("00");
    const [UTC, setUTC] = useState("+3");

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
        const set_url = `http://localhost:5000/clock/set`;
        axios.post(set_url, user_time)
        .then(response => {
            console.log('Data transfered', response.data);
        })
        .catch(error => {
            console.error('Error during saving:', error);
        });
    };

    const setRealTime = () => {
        const real_time_url = `http://localhost:5000/clock/real`;

        const headers = {
            'Content-Type': 'application/json', 
        };

        const data = {
            UTC: UTC
        };

        axios.post(real_time_url, data, { headers })
            .then((postResponse) => {
                console.log('UTC offset set:', postResponse.data);
                return axios.get(real_time_url);
            })
            .then((getResponse) => {
                console.log('Time after setting UTC:', getResponse.data);
            })
            .catch((error) => {
                console.error('Error during POST or GET:', error);
            });
    };

    const chooseUTC = () => {
        document.querySelector(".UTC").classList.toggle("hidden");
    }

    const changeUTC = (e) => {
        setUTC(e.target.value);
    }

    return(
        <span className="main_span">
            <input placeholder="hour" onChange={saveHour} type="number"></input>
            <input placeholder="minute" onChange={saveMinute} type="number"></input>
            <input placeholder="second" onChange={saveSecond} type="number"></input>
            <div className="buttons">
                <button onClick={handleSaveClick}>Set</button>
                <button onClick={chooseUTC}>Choose UTC</button>
            </div>
            <div className="buttons" id="middle">
                <button onClick={setRealTime}>Set real time</button>
            </div>
            <input defaultValue={"+3"} className="UTC hidden" onChange={changeUTC}></input>
        </span>
    )
}

export default Clock;