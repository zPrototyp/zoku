import React from "react";
import RegisterForm from "../Components/RegisterForm";
import '../assets/css/App.css';

export default function Register()
{
  return (
    <div className="page-content">
      <h1>Skapa konto</h1>
      <p>Fyll i uppgifterna nedan för att registrera dig.</p>
      <RegisterForm />
    </div>
  );
}
