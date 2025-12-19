import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../lib/api";
import { getSession, setSession } from "../lib/session";

export default function LoginPage() {
  const navigate = useNavigate();

  const existingSession = useMemo(() => getSession(), []);
  useEffect(() => {
    if (existingSession) {
      navigate("/home", { replace: true });
    }
  }, [existingSession, navigate]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = email.trim().length > 0 && password.trim().length > 0;

  async function onLogin() {
    setError(null);
    setIsSubmitting(true);
    try {
      const result = await login(email.trim(), password);
      if (!result.ok || !result.user) {
        setError("Login failed");
        return;
      }

      setSession({
        type: "user",
        createdAt: new Date().toISOString(),
        user: result.user,
        viewedPropertyIds: [],
      });

      navigate("/home");
    } catch {
      setError("Login failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  function onContinueAsGuest() {
    setSession({
      type: "guest",
      createdAt: new Date().toISOString(),
      viewedPropertyIds: [],
    });

    navigate("/home");
  }

  return (
    <div className="authPage">
      <div className="authCard">
        <h1 className="authTitle">Login</h1>

        <div className="authField">
          <label className="authLabel" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            className="authInput"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            placeholder="Enter your email"
          />
        </div>

        <div className="authField">
          <label className="authLabel" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            className="authInput"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            placeholder="Enter your password"
          />
        </div>

        {error ? (
          <p className="authError" role="alert">
            {error}
          </p>
        ) : null}

        <div className="authActions">
          <div className="authPrimaryRow">
            <button
              className="authPrimary"
              onClick={onLogin}
              disabled={isSubmitting || !canSubmit}
            >
              {isSubmitting ? "Submitting…" : "Submit"}
            </button>
          </div>

          <div className="authDivider" role="separator" aria-label="or">
            <span>OR</span>
          </div>

          <button
            className="authSecondary"
            onClick={onContinueAsGuest}
            disabled={isSubmitting}
          >
            Continue as a guest
          </button>
        </div>
      </div>
    </div>
  );
}
