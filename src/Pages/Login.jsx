import React from "react";
import LoginForm from "../Components/LoginForm";
import '../assets/css/App.css';

export default function Login() {
  return (
    <div className="page-content">
      <h1>Login</h1>
      <p>Fyll i dina uppgifter för att logga in.</p>
      <LoginForm />
    </div>
  );
}
 