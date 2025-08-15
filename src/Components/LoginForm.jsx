import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAtom } from "jotai";
import { authTokenAtom } from "../Atoms/AuthAtom";
import { guestTokenAtom } from "../Atoms/GuestTokenAtom";

function LoginForm()
{
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [authToken, setAuthToken] = useAtom(authTokenAtom);
  const [guestToken, setGuestToken] = useAtom(guestTokenAtom);

  const handleChange = (e) =>
  {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) =>
  {
    e.preventDefault();
    setError("");

    try
    {
      const res = await fetch("/api/auth/login",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok)
      {
        setError(data.message || "Inloggning misslyckades");
      }
      else
      {
        const userId = data.data.userId;
        setAuthToken(data.data.token);
        setGuestToken(null); // Clear guest token on successful login
        
        navigate("/profile");
      }
    }
    catch (err)
    {
      setError("Något gick fel vid inloggning.");
      console.error("Login error:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: "400px" , padding: "1em"}}>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={{ marginBottom: "1rem" }}>
        <input
          type="email"
          name="email"
          placeholder="E-post"
          value={form.email}
          onChange={handleChange}
          required
          style={{ width: "100%", padding: "8px" }}
        />
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <input
          type="password"
          name="password"
          placeholder="Lösenord"
          value={form.password}
          onChange={handleChange}
          required
          style={{ width: "100%", padding: "8px" }}
        />
      </div>

      <button type="submit" className="active" style={{ padding: "10px 20px" }}>
        Logga in
      </button>
    </form>
  );
}

export default LoginForm;