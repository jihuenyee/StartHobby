import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaCrown, FaGift, FaCheckCircle, FaInfoCircle } from "react-icons/fa";
import "../styles/Membership.css";

const TIERS = [
  {
    id: "red",
    name: "Red — Member",
    color: "#E11D48",
    headline: "Entry tier. Build your streak.",
    benefits: ["Access to quiz & Daily Notes", "Earn points with every booking", "No ongoing discount"],
    discount: 0,
  },
  {
    id: "gold",
    name: "Gold — Elite",
    color: "#F59E0B",
    headline: "Enjoy 5% off booking fees.",
    benefits: ["5% discount on booking fees", "Priority support", "Birthday perk"],
    discount: 5,
  },
  {
    id: "black",
    name: "Black — Premier",
    color: "#0F172A",
    headline: "10% off booking fees—every time.",
    benefits: ["10% discount on booking fees", "VIP concierge (48h response)", "Early access to events"],
    discount: 10,
  },
];

const REWARDS = [
  { id: "v10", title: "$10 Off Any Class", points: 120 },
  { id: "v25", title: "$25 Experience Voucher", points: 280 },
  { id: "v50", title: "$50 Experience Voucher", points: 520 },
  { id: "gear", title: "Merch Pack", points: 360 },
];

export default function MembershipPage() {
  
  // pass this wallet data via Context or API
  const [walletPoints, setWalletPoints] = useState(540);
  const navigate = useNavigate();

  return (
    <div className="membership-container" style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* Header */}
      <div className="membership-header">
        <div>
          <h2 className="membership-title">
            <FaCrown color="#F59E0B" size={28} /> Membership Benefits
          </h2>
          <p style={{ color: "#64748b", fontSize: "0.9rem" }}>Level up by booking experiences or purchasing products from the shop.</p>
        </div>
        <div className="membership-wallet" onClick={() => navigate("/profile")}>
          <div className="wallet-label">Your Wallet</div>
          <div className="wallet-amount">{walletPoints.toLocaleString()} pts</div>
        </div>
      </div>

      {/* Tiers Grid */}
      <section className="tiers-grid">
        {TIERS.map((t) => (
          <div key={t.id} className="tier-card" style={{ borderColor: t.color }}>
            <div className="tier-header">
              <div>
                <div style={{ fontWeight: 600, color: t.color }}>{t.name}</div>
                <div style={{ fontSize: "0.85rem", color: "#475569", marginTop: "4px" }}>{t.headline}</div>
              </div>
              <div className="discount-badge" style={{ color: t.color }}>
                {t.discount}% off
              </div>
            </div>
            <div className="tier-body" style={{ backgroundColor: `${t.color}08` }}>
              <ul className="tier-benefits">
                {t.benefits.map((b, i) => (
                  <li key={i}>
                    <FaCheckCircle size={16} color={t.color} />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </section>

      {/* Rewards */}
      <section>
        <h3 className="section-title">
          <FaGift color="#e11d48" /> Redeem Rewards
        </h3>
        <div className="rewards-grid">
          {REWARDS.map((r) => {
            const canRedeem = walletPoints >= r.points;
            return (
              <div key={r.id} className="reward-card">
                <h4>{r.title}</h4>
                <div style={{ fontSize: "0.9rem", color: "#64748b" }}>{r.points} pts</div>
                <button
                  className={`redeem-btn ${canRedeem ? "active" : "disabled"}`}
                  onClick={() => canRedeem && setWalletPoints((p) => p - r.points)}
                >
                  {canRedeem ? "Redeem" : "Not enough pts"}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      <div style={{ marginTop: '2rem', padding: '1rem', background: '#f8fafc', borderRadius: '0.5rem', fontSize: '0.85rem', color: '#64748b' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', marginBottom: '0.5rem'}}>
            <FaInfoCircle size={16} /> Requirements
        </div>
        1 point = $1 qualified spend. Tiers calculated on rolling 12-month basis.
      </div>

    </div>
  );
}