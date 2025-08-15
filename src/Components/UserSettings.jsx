import React, { useState } from "react";
import { useAtom } from "jotai";
import { authTokenAtom } from "../Atoms/AuthAtom";
import { useNavigate } from "react-router-dom";
import "../assets/css/UserSettings.css";

function UserSettings({ userId, onClose })
{
  const [token] = useAtom(authTokenAtom);
  const navigate = useNavigate();

  // Change password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState(null);

  const headers = token
    ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    : { "Content-Type": "application/json" };

  async function handleChangePassword(e)
  {
    e.preventDefault();
    setPwMsg(null);

    if (!token) return setPwMsg({ type: "err", text: "Du är inte inloggad." });
    if (!currentPassword || !newPassword || !confirmNewPassword)
      return setPwMsg({ type: "err", text: "Fyll i alla fält." });
    if (newPassword !== confirmNewPassword)
      return setPwMsg({ type: "err", text: "Lösenorden matchar inte." });
    if (newPassword.length < 8)
      return setPwMsg({ type: "err", text: "Minst 8 tecken." });

    try
    {
      setPwLoading(true);
      const res = await fetch("/api/user/password",
      {
        method: "PATCH",
        headers,
        body: JSON.stringify({ currentPassword, newPassword, confirmNewPassword }),
      });

      const text = await res.text();
      let body;
      try { body = text ? JSON.parse(text) : null; } catch { body = null; }

      if (!res.ok)
      {
        const msg =
          body?.message ||
          (Array.isArray(body?.errors) ? body.errors.join(", ") : null) ||
          `Misslyckades (${res.status}).`;
        throw new Error(msg);
      }

      setPwMsg({ type: "ok", text: "Ditt lösenord är uppdaterat." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    }
    catch (err)
    {
      setPwMsg({ type: "err", text: err.message || "Ett fel inträffade." });
    }
    finally
    {
      setPwLoading(false);
    }
  }

  return (
    <div className="user-settings-panel">
      <div className="user-settings-header">
        <h2>Inställningar</h2>
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Stäng"
            className="user-settings-close"
            type="button"
          >
            ✕
          </button>
        )}
      </div>

      {/* Change password */}
      <section className="user-settings-card">
        <h3>Byt lösenord</h3>
        <form onSubmit={handleChangePassword} className="user-settings-form">
          <label className="user-settings-label">
            Nuvarande lösenord
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
              required
              className="user-settings-input"
            />
          </label>

          <label className="user-settings-label">
            Nytt lösenord
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              required
              minLength={8}
              className="user-settings-input"
            />
          </label>

          <label className="user-settings-label">
            Bekräfta nytt lösenord
            <input
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              autoComplete="new-password"
              required
              minLength={8}
              className="user-settings-input"
            />
          </label>

          <button className="active user-settings-submit" type="submit" disabled={pwLoading}>
            {pwLoading ? "Uppdaterar..." : "Uppdatera lösenord"}
          </button>

          {pwMsg && (
            <p
              className={`user-settings-message ${
                pwMsg.type === "ok" ? "ok" : "err"
              }`}
              role="status"
              aria-live="polite"
            >
              {pwMsg.text}
            </p>
          )}
        </form>
      </section>
    </div>
  );
}
export default UserSettings;