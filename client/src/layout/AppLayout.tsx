import { useEffect, useMemo } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { clearSession, getSession } from "../lib/session";

function HomeIcon() {
  return (
    <svg
      className="navIcon"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M4 10.5L12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-7H10v7H5a1 1 0 0 1-1-1v-9.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BuildingIcon() {
  return (
    <svg
      className="navIcon"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M5 21V4a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v17"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M14 8h4a1 1 0 0 1 1 1v12"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M8 7h3M8 10h3M8 13h3M8 16h3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M14 12h3M14 15h3M14 18h3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg
      className="navIcon"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M10 7V6a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-7a2 2 0 0 1-2-2v-1"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M3 12h10"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M6.5 9.5 3 12l3.5 2.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function AppLayout() {
  const navigate = useNavigate();
  const session = useMemo(() => getSession(), []);

  useEffect(() => {
    if (!session) {
      navigate("/", { replace: true });
    }
  }, [navigate, session]);

  function logout() {
    clearSession();
    navigate("/", { replace: true });
  }

  return (
    <div className="appShell">
      <aside className="sidebar">
        <div className="sidebarBrand">Real Estate</div>
        <nav className="sidebarNav">
          <NavLink
            to="/home"
            className={({ isActive }) =>
              isActive ? "navItem navItemActive" : "navItem"
            }
          >
            <HomeIcon />
            <span>Home</span>
          </NavLink>
          <NavLink
            to="/properties"
            className={({ isActive }) =>
              isActive ? "navItem navItemActive" : "navItem"
            }
          >
            <BuildingIcon />
            <span>Properties</span>
          </NavLink>
        </nav>

        <div className="sidebarFooter">
          <button className="navItem navButton" onClick={logout}>
            <LogoutIcon />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="mainContent">
        <Outlet />
      </main>
    </div>
  );
}
