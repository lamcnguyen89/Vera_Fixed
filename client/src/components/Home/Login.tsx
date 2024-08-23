import React, { useState, useRef } from "react";
import { login } from "../../store/api";

const errorMessages = {
  incorrectInfo: "Email or password is incorrect.",
  cannotConnect: "Unable to connect. Check your network connection.",
  unknownError:
    "An unknown error occurred. Please refresh the page and try again.",
};

const Login = (props: any) => {
  const [err, setErr] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const emailRef = useRef<HTMLInputElement>();
  const passwordRef = useRef<HTMLInputElement>();

  const tryLogin = (e: any): void => {
    e.preventDefault();
    setErr("");
    setIsLoading(true);

    const userData = {
      email: emailRef.current.value,
      password: passwordRef.current.value,
    };
    const onError = (error: any) => {
      setIsLoading(false);
      if (error.toString() === "TypeError: Failed to fetch") {
        setErr(errorMessages.cannotConnect);
      } else if (error.toString() === "Email or password not found") {
        setErr(errorMessages.incorrectInfo);
      }
    };
    login(userData, onError);
  };

  const alert = err ? (
    <div className="home-inputs">
      <div
        style={{
          background: "#ff5959",
          color: "white",
          borderRadius: "5px",
          padding: "5px",
        }}
      >
        {err}
      </div>
    </div>
  ) : null;

  return (
    <div style={{ height: "100%" }}>
      <form className="home-form" onSubmit={tryLogin}>
        <h1 className="home-title">Sign In</h1>
        <div className="home-inputs">
          <label className="home-label">Email</label>
          <input
            ref={emailRef}
            className="home-input"
            type="email"
            placeholder="Enter your email"
            name="email"
          ></input>
        </div>
        <div className="home-inputs">
          <label className="home-label">Password</label>
          <input
            ref={passwordRef}
            className="home-input"
            type="password"
            placeholder="&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;"
            name="password"
          ></input>
        </div>
        {alert}
        <button type="submit" className="btn home-btn">
          {isLoading ? "Loading..." : "Sign In"}
        </button>
      </form>
    </div>
  );
};
Login.displayName = "Login";
export default Login;
