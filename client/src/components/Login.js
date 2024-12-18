import React, { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import axios from "axios";

function Login() {
  let emailInputRef = useRef();
  let passwordInputRef = useRef();

  let navigate = useNavigate();
  let dispatch = useDispatch();

  axios.defaults.baseURL = "http://localhost:4567";

  useEffect(() => {
    if (localStorage.getItem("token")) {
      //sendTokenToServer();
      axios.defaults.headers.common["Authorization"] =
        localStorage.getItem("token");
    }
  }, []);

  let sendTokenToServer = async () => {
    let dataToSend = new FormData();
    dataToSend.append("token", localStorage.getItem("token"));

    let reqOptions = {
      method: "POST",
      body: dataToSend,
    };

    let JSONData = await fetch(
      "http://localhost:4567/validateToken",
      reqOptions
    );

    let JSOData = await JSONData.json();
    console.log(JSOData);

    if (JSOData.status == "failure") {
      alert(JSOData.msg);
    } else {
      localStorage.setItem("token", JSOData.data.token);
      dispatch({ type: "login", data: JSOData.data });
      navigate("/dashboard");
    }
    console.log(JSOData);
  };

  let onLogin = async () => {
    let dataToSend = new FormData();
    dataToSend.append("email", emailInputRef.current.value);
    dataToSend.append("password", passwordInputRef.current.value);

    let reqOptions = {
      method: "POST",
      body: dataToSend,
    };

    let JSONData = await fetch("http://localhost:4567/login", reqOptions);

    let JSOData = await JSONData.json();

    if (JSOData.status == "failure") {
      alert(JSOData.msg);
    } else {
      localStorage.setItem("token", JSOData.data.token);
      dispatch({ type: "login", data: JSOData.data });
      navigate("/dashboard");
    }
    console.log(JSOData);
  };

  let onLogin2 = () => {
    return async () => {
      let dataToSend = new FormData();
      dataToSend.append("email", emailInputRef.current.value);
      dataToSend.append("password", passwordInputRef.current.value);

      let reqOptions = {
        method: "POST",
        body: dataToSend,
      };

      let JSONData = await fetch("http://localhost:4567/login", reqOptions);

      let JSOData = await JSONData.json();

      if (JSOData.status == "failure") {
        alert(JSOData.msg);
      } else {
        localStorage.setItem("token", JSOData.data.token);
        dispatch({ type: "login", data: JSOData.data });
        navigate("/dashboard");
      }
      console.log(JSOData);
    };
  };

  let onLogin3 = () => {
    return async () => {
      let dataToSend = new FormData();
      dataToSend.append("email", emailInputRef.current.value);
      dataToSend.append("password", passwordInputRef.current.value);

      let response = await axios.post("/login", dataToSend);

      console.log(response);

      if (response.data.status == "failure") {
        alert(response.data.msg);
      } else {
        localStorage.setItem("token", response.data.data.token);
        dispatch({ type: "login", data: response.data.data });
        navigate("/dashboard");
      }
      console.log(response.data);
    };
  };

  return (
    <div className="App">
      <form>
        <h2>Login</h2>
        <div>
          <label>Email</label>
          <input ref={emailInputRef}></input>
        </div>
        <div>
          <label>Password</label>
          <input ref={passwordInputRef}></input>
        </div>
        <div>
          <button
            type="button"
            onClick={() => {
              //onLogin();
              dispatch(onLogin3());
            }}
          >
            Login
          </button>
        </div>
      </form>
      <div>
        <Link to="/signup">Signup</Link>
      </div>
    </div>
  );
}

export default Login;