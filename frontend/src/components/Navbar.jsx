import React from 'react';
import { NavLink } from 'react-router-dom';

const linkClass =
  'px-3 py-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700';

function Navbar() {
  return (
    <nav className="bg-white dark:bg-gray-800 shadow mb-4">
      <div className="container mx-auto p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Family App</h1>
        <div className="space-x-2">
          <NavLink end to="/" className={({ isActive }) => `${linkClass} ${isActive ? 'font-semibold' : ''}`}>Home</NavLink>
          <NavLink to="/meals" className={({ isActive }) => `${linkClass} ${isActive ? 'font-semibold' : ''}`}>Meals</NavLink>
          <NavLink to="/tasks" className={({ isActive }) => `${linkClass} ${isActive ? 'font-semibold' : ''}`}>Tasks</NavLink>
          <NavLink to="/finance" className={({ isActive }) => `${linkClass} ${isActive ? 'font-semibold' : ''}`}>Finance</NavLink>
          <NavLink to="/login" className={({ isActive }) => `${linkClass} ${isActive ? 'font-semibold' : ''}`}>Login</NavLink>
          <NavLink to="/signup" className={({ isActive }) => `${linkClass} ${isActive ? 'font-semibold' : ''}`}>Signup</NavLink>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
