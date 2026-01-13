// src/App.js
import React, { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Twister from "./pages/Twister";
import Blog from "./pages/Blog";
import Corporate from "./pages/Corporate";
import HobbyProviders from "./pages/HobbyProviders";
import Shop from "./pages/Shop";
import Quiz from "./pages/Quiz";
import HobbyGame from "./pages/HobbyGame";
import LoginPage from "./pages/Login";
import SignupPage from "./pages/Signup";
import SignUpEmail from "./pages/SignUpEmail";
import Profile from "./pages/Profile";
import MembershipPage from "./pages/Membership";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminQuiz from "./pages/AdminQuiz";
import StoryIntro from "./pages/StoryIntro";
import GameMap from "./pages/GameMap";
import SquirrelGame from "./pages/SquirrelGame";
import ClawQuizGame from "./pages/ClawQuizGame";
import { initGameResults } from "./utils/initGameResults";
import ResultScreen from "./pages/ResultScreen";
import "./App.css";

const App = () => {
  const location = useLocation();
  const pathsWithoutNavbar = ["/login", "/signup", "/signup-email"];
  const showNavbar = !pathsWithoutNavbar.includes(location.pathname);

  // ✅ CORRECT PLACE FOR useEffect
  useEffect(() => {
    initGameResults();
  }, []);

  return (
    <>
      {showNavbar && <Navbar />}

      <div className="content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/twister" element={<Twister />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/corporate" element={<Corporate />} />
          <Route path="/hobby-providers" element={<HobbyProviders />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/hobby-game" element={<HobbyGame />} />
          <Route path="/quiz" element={<Quiz />} />

          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/signup-email" element={<SignUpEmail />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/membership" element={<MembershipPage />} />

          {/* GAME FLOW */}
          <Route path="/story" element={<StoryIntro />} />
          <Route path="/game-map" element={<GameMap />} />
          <Route path="/squirrel-game" element={<SquirrelGame />} />
          <Route path="/claw-quiz-game" element={<ClawQuizGame />} />
          <Route path="/result" element={<ResultScreen />} />

          {/* ADMIN ROUTES */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/quiz" element={<AdminQuiz />} />
        </Routes>
      </div>
    </>
  );
};

export default App;
