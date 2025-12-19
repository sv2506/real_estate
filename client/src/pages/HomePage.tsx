import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getSession } from "../lib/session";

export default function HomePage() {
  const navigate = useNavigate();
  const session = useMemo(() => getSession(), []);

  useEffect(() => {
    if (!session) {
      navigate("/", { replace: true });
    }
  }, [navigate, session]);

  const welcomeText =
    session?.type === "user"
      ? `Welcome ${session.user.username}`
      : session?.type === "guest"
      ? "Welcome guest"
      : "";

  return (
    <div className="page">
      <h1 className="pageTitle">Home</h1>
      <p>{welcomeText}</p>
    </div>
  );
}
