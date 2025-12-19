import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../lib/api";
import { getSession, setSession } from "../lib/session";

function isValidEmail(value: string): boolean {
  const v = value.trim();
  if (v.length === 0) return false;
  // Simple, practical email validation (enough for UI gating).
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

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

  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const emailOk = isValidEmail(email);
  const passwordOk = password.trim().length > 0;
  const canSubmit = emailOk && passwordOk;

  const emailError =
    emailTouched && !emailOk ? "Enter a valid email address" : null;
  const passwordError =
    passwordTouched && !passwordOk ? "Password cannot be empty" : null;

  const emailWarningId = "email-warning";
  const passwordWarningId = "password-warning";

  async function onLogin() {
    setEmailTouched(true);
    setPasswordTouched(true);
    if (!canSubmit) return;

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
            onBlur={() => setEmailTouched(true)}
            autoComplete="email"
            placeholder="Enter your email"
            aria-invalid={!!emailError}
            aria-describedby={emailError ? emailWarningId : undefined}
          />
          {emailError ? (
            <p id={emailWarningId} className="fieldWarning" role="alert">
              {emailError}
            </p>
          ) : null}
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
            onBlur={() => setPasswordTouched(true)}
            autoComplete="current-password"
            placeholder="Enter your password"
            aria-invalid={!!passwordError}
            aria-describedby={passwordError ? passwordWarningId : undefined}
          />
          {passwordError ? (
            <p id={passwordWarningId} className="fieldWarning" role="alert">
              {passwordError}
            </p>
          ) : null}
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
