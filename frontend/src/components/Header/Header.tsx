import { NavLink } from "react-router-dom";
import './Header.css'

export default function Header() {
  return (
    <div className="header">
      <NavLink
        to="/"
        className={({ isActive }) =>
          isActive ? "active" : ""
        }
      >
        Home
      </NavLink>
      <NavLink
        to="/recipes"
        className={({ isActive }) =>
          isActive ? "active" : ""
        }
      >
        Recipes list
      </NavLink>
      <NavLink
        to="/ingredients"
        className={({ isActive }) =>
          isActive ? "active" : ""
        }
      >
        Ingredients list
      </NavLink>
    </div>
  );
}
