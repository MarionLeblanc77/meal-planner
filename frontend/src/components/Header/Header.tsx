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
        to="/recipes/import"
        className={({ isActive }) =>
          isActive ? "active" : ""
        }
      >
        Import a recipe
      </NavLink>
      <NavLink
        to="/recipes/add"
        className={({ isActive }) =>
          isActive ? "active" : ""
        }
      >
        Add a recipe
      </NavLink>
      <NavLink
        to="/ingredients"
        className={({ isActive }) =>
          isActive ? "active" : ""
        }
      >
        Ingredients list
      </NavLink>
      <NavLink
        to="/ingredients/add"
        className={({ isActive }) =>
          isActive ? "active" : ""
        }
      >
        Add an ingredient
      </NavLink>
      <NavLink
        to="/categories"
        className={({ isActive }) =>
          isActive ? "active" : ""
        }
      >
        Categories list
      </NavLink>
    </div>
  );
}
