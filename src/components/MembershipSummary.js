import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom"; // For navigation
import { FaChevronRight } from "react-icons/fa";
import { BiSolidDiscount } from "react-icons/bi";
import "../styles/Membership.css";

// --- Tier Logic ---
const TIERS = [
  { id: "red", name: "Red — Member", color: "#E11D48", threshold: 0, nextThreshold: 800 },
  { id: "gold", name: "Gold — Elite", color: "#F59E0B", threshold: 800, nextThreshold: 3000 },
  { id: "black", name: "Black — Premier", color: "#0F172A", threshold: 3000, nextThreshold: null },
];

function useTier(currentPoints) {
  const tier = useMemo(() => {
    if (currentPoints >= 3000) return TIERS[2];
    if (currentPoints >= 800) return TIERS[1];
    return TIERS[0];
  }, [currentPoints]);

  const nextTarget = tier.nextThreshold;
  const toNext = nextTarget ? Math.max(0, nextTarget - currentPoints) : 0;
  const progress = nextTarget
    ? Math.min(100, Math.round(((currentPoints - tier.threshold) / (nextTarget - tier.threshold)) * 100))
    : 100;

  return { tier, toNext, progress };
}

export default function MembershipSummary() {
  const navigate = useNavigate();
  // In a real app, this comes from your UserContext/Backend
  const [annualPoints, setAnnualPoints] = useState(620);
  const { tier, toNext, progress } = useTier(annualPoints);

  const handleSimulate = (delta) => setAnnualPoints((p) => Math.max(0, p + delta));

  return (
    <div className="roadmap-section" style={{ width: '100%' }}>
      {/* Header of the Card */}
      <div className="roadmap-header">
        <div className="current-tier-display">
          <BiSolidDiscount size={24} color="#d97706" />
          <div>
            <div style={{ fontSize: "0.85rem", color: "#64748b" }}>Current tier</div>
            <div style={{ fontSize: "1.25rem", fontWeight: "bold", color: tier.color }}>
              {tier.name}
            </div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "0.85rem", color: "#64748b" }}>Qualified Annual Points</div>
          <div style={{ fontSize: "1.1rem", fontWeight: "bold" }}>
            {annualPoints.toLocaleString()} / {tier.nextThreshold ?? 3000}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-bar-container">
        <div
          className="progress-bar-fill"
          style={{
            width: `${progress}%`,
            background: `linear-gradient(90deg, ${tier.color}, #fbbf24)`,
          }}
        />
      </div>
      
      <div className="progress-stats">
        <span>{tier.threshold} pts</span>
        <span style={{ color: tier.color, fontWeight: 600 }}>{progress}% to next</span>
        <span>{tier.nextThreshold ?? "Max"} pts</span>
      </div>

      <div className="next-tier-msg" style={{ textAlign: 'center', margin: '1rem 0' }}>
        {tier.id !== "black" ? (
          <span>
            You are <strong>{toNext.toLocaleString()} points</strong> away from{" "}
            <strong>{tier.id === "red" ? "Gold — Elite" : "Black — Premier"}</strong>.
          </span>
        ) : (
          <span>You have unlocked the highest tier!</span>
        )}
      </div>

      {/* Demo Controls (Optional - remove in production) */}
      <div className="demo-controls" style={{justifyContent: 'center', marginBottom: '1rem'}}>
        <button className="demo-btn" style={{ background: "#0f172a", color: "white" }} onClick={() => handleSimulate(50)}>+50</button>
        <button className="demo-btn" style={{ background: "#e2e8f0" }} onClick={() => handleSimulate(200)}>+200</button>
        <button className="demo-btn" style={{ background: "#f1f5f9" }} onClick={() => handleSimulate(-100)}>-100</button>
        <span style={{ color: '#94a3b8' }}>(demo)</span>
      </div>

      {/* View More Button */}
      <button 
        onClick={() => navigate("/membership")}
        style={{
          width: '100%',
          padding: '0.75rem',
          marginTop: '0.5rem',
          background: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '0.5rem',
          color: '#475569',
          fontWeight: '600',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          transition: 'background 0.2s'
        }}
        onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'}
        onMouseOut={(e) => e.currentTarget.style.background = 'white'}
      >
        View Membership Benefits <FaChevronRight size={12} />
      </button>
    </div>
  );
}