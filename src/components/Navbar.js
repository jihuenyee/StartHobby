// src/components/Navbar.js
import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";
import { CgProfile } from "react-icons/cg";
import { FaShoppingCart } from "react-icons/fa";
import { GiHamburgerMenu } from "react-icons/gi";
import { IoClose } from "react-icons/io5";
import { useAuth } from "../context/AuthContext";
import ConfirmModal from "./ConfirmModal";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const profileRef = useRef(null);

  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const toggleProfileMenu = () => setProfileOpen((prev) => !prev);

  const confirmLogout = () => {
    setProfileOpen(false);
    setIsModalOpen(true);
  };

  const handleLogout = async () => {
    try {
      await logout();
      setIsModalOpen(false);
      navigate("/");
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  const displayName =
    user?.username || user?.displayName || user?.email || "Profile";

  // click-outside to close profile menu
  useEffect(() => {
    if (!profileOpen) return;

    function handleClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileOpen]);

  return (
    <>
      <nav className="navbar">
        {/* Left: logo */}
        <div className="navbar-left">
          <Link to="/" className="logo-link">
            <img src="/Logos-01.png" alt="Logo" />
          </Link>
        </div>

        {/* Hamburger for mobile */}
        <div className="hamburger" onClick={toggleMenu}>
          {menuOpen ? <IoClose size={28} /> : <GiHamburgerMenu size={28} />}
        </div>

        {/* Center links */}
        <ul className={`navbar-links ${menuOpen ? "open" : ""}`}>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/twister">Twister</Link></li>
          <li className="dropdown">
            <span className="dropbtn">Explore ▾</span>
            <div className="dropdown-content">
              <Link to="/blog">Blog</Link>
              <Link to="/daily-note">Daily Note</Link>
            </div>
          </li>
          <li><Link to="/corporate">For Corporate</Link></li>
          <li><Link to="/hobby-providers">Hobby Providers</Link></li>
          <li><Link to="/shop">Shop</Link></li>
        </ul>

        {/* Right: profile + cart */}
        <div className={`navbar-profile ${menuOpen ? "open" : ""}`}>
          {user ? (
            <>
              {/* PROFILE DROPDOWN (click to open) */}
              <div className="profile-dropdown" ref={profileRef}>
                <button
                  type="button"
                  className="profile-trigger"
                  onClick={toggleProfileMenu}
                >
                  <CgProfile size={18} />
                  <span>{displayName}</span>
                </button>

                {profileOpen && (
                  <div className="profile-menu">
                    <Link
                      to="/profile"
                      onClick={() => setProfileOpen(false)}
                      className="profile-menu-item"
                    >
                      View profile
                    </Link>
                    <button
                      type="button"
                      className="profile-menu-item"
                      onClick={confirmLogout}
                    >
                      Log out
                    </button>
                  </div>
                )}
              </div>

              {/* Cart icon */}
              <Link to="/cart" className="cart-link">
                <FaShoppingCart size={20} />
              </Link>
            </>
          ) : (
            <Link to="/signup" className="profile-link">
              <CgProfile size={20} />
              <span>Login</span>
            </Link>
          )}
        </div>
      </nav>

      {isModalOpen && (
        <ConfirmModal
          title="Confirm Logout"
          onConfirm={handleLogout}
          onCancel={() => setIsModalOpen(false)}
        >
          <p>Are you sure you want to log out?</p>
        </ConfirmModal>
      )}
    </>
  );
}

export default Navbar;
