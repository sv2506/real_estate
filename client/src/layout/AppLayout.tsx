import { useEffect, useMemo } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { getSession } from "../lib/session";

export default function AppLayout() {
  const navigate = useNavigate();
  const session = useMemo(() => getSession(), []);

  useEffect(() => {
    if (!session) {
      navigate("/", { replace: true });
    }
  }, [navigate, session]);

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
            Home
          </NavLink>
          <NavLink
            to="/properties"
            className={({ isActive }) =>
              isActive ? "navItem navItemActive" : "navItem"
            }
          >
            Properties
          </NavLink>
        </nav>
      </aside>

      <main className="mainContent">
        <Outlet />
      </main>
    </div>
  );
}
