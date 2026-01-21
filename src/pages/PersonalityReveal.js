import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/PersonalityReveal.css';

/* =========================================
   🔮 DATA
   ========================================= */
const PERSONALITY_PROFILES = [
    {
        type: "Creative",
        title: "The Visionary Artist",
        icon: "🎨",
        class: "Creator",
        aura: "The world is your canvas. You notice details others miss—colors, emotions, and stories waiting to be told.",
        superpower: "Turning imagination into reality.",
        stats: [
            { label: "Imagination", value: "95%" },
            { label: "Empathy", value: "85%" },
            { label: "Innovation", value: "90%" }
        ],
        hobbies: [
            { name: "Digital Art", desc: "Create worlds with a stylus.", tags: ["Solo", "Focus"] },
            { name: "Creative Writing", desc: "Build universes with words.", tags: ["Story", "Lore"] },
            { name: "Pottery", desc: "Shape the earth into art.", tags: ["Tactile", "Relaxing"] },
            { name: "Photography", desc: "Capture magic in the mundane.", tags: ["Visual", "Active"] }
        ]
    },
    {
        type: "Active",
        title: "The Trailblazing Ranger",
        icon: "🏹",
        class: "Explorer",
        aura: "You have a wild heart. Stationary walls cannot contain you; you need movement, fresh air, and discovery.",
        superpower: "Boundless energy to face the unknown.",
        stats: [
            { label: "Stamina", value: "90%" },
            { label: "Agility", value: "85%" },
            { label: "Bravery", value: "95%" }
        ],
        hobbies: [
            { name: "Bouldering", desc: "A physical puzzle.", tags: ["Strength", "Puzzle"] },
            { name: "Geocaching", desc: "Real-world treasure hunt.", tags: ["Adventure", "GPS"] },
            { name: "Parkour", desc: "Flow through the city.", tags: ["Skill", "Agility"] },
            { name: "Hiking", desc: "Find peace on the trail.", tags: ["Nature", "Endurance"] }
        ]
    },
    {
        type: "Strategic",
        title: "The Grandmaster",
        icon: "🧠",
        class: "Strategist",
        aura: "You find peace in logic. While others panic, you plan. You see the hidden patterns that govern the world.",
        superpower: "Creating order out of chaos.",
        stats: [
            { label: "Logic", value: "95%" },
            { label: "Focus", value: "90%" },
            { label: "Planning", value: "85%" }
        ],
        hobbies: [
            { name: "Chess / Go", desc: "The ultimate mind battle.", tags: ["Strategy", "Focus"] },
            { name: "Coding", desc: "Build systems with logic.", tags: ["Tech", "Create"] },
            { name: "Escape Rooms", desc: "Solve mysteries under pressure.", tags: ["Puzzle", "Team"] },
            { name: "Astronomy", desc: "Map the stars above.", tags: ["Science", "Chill"] }
        ]
    },
    {
        type: "Social",
        title: "The Radiant Soul",
        icon: "✨",
        class: "Leader",
        aura: "You are the warmth in a cold room. Your energy feeds on connection, making others feel seen and heard.",
        superpower: "Uniting people and sparking joy.",
        stats: [
            { label: "Charisma", value: "95%" },
            { label: "Leadership", value: "85%" },
            { label: "Empathy", value: "90%" }
        ],
        hobbies: [
            { name: "D&D / RPGs", desc: "Tell epic stories with friends.", tags: ["Social", "Story"] },
            { name: "Team Sports", desc: "Win together, celebrate together.", tags: ["Active", "Team"] },
            { name: "Event Planning", desc: "Create unforgettable moments.", tags: ["Creative", "Lead"] },
            { name: "Volunteering", desc: "Make a real impact.", tags: ["Social", "Heart"] }
        ]
    }
];

const PersonalityReveal = () => {
    const [profile, setProfile] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const gameResults = JSON.parse(localStorage.getItem("gameResults"));
        
        let dominantType = "Creative"; 
        
        if (gameResults) {
            const allTypes = [
                ...(gameResults.clawGame?.types || []),
                ...(gameResults.castleGame?.types || []),
                ...(gameResults.snakeGame?.types || [])
            ];

            if (allTypes.length > 0) {
                const counts = {};
                allTypes.forEach(t => counts[t] = (counts[t] || 0) + 1);
                dominantType = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
            }
        }
        
        const match = PERSONALITY_PROFILES.find(p => p.type === dominantType) || PERSONALITY_PROFILES[0];
        setProfile(match);

    }, [navigate]);

    if (!profile) return <div style={{height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "#f0f2f5"}}>✨ Loading Magic... ✨</div>;

    return (
        <div className="reveal-container">
            <div className="magic-scroll">
                
                {/* 🎨 LEFT: IDENTITY */}
                <div className="left-panel">
                    <div className="profile-icon">{profile.icon}</div>
                    <div className="class-badge">{profile.class} Class</div>
                    <h1 className="magic-title">{profile.title}</h1>
                    
                    <div className="stats-box">
                        {profile.stats.map((stat, i) => (
                            <div key={i} className="stat-row">
                                <div className="stat-label">
                                    <span>{stat.label}</span>
                                    <span>{stat.value}</span>
                                </div>
                                <div className="progress-bg">
                                    <div className="progress-fill" style={{width: stat.value}}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 📝 RIGHT: CONTENT */}
                <div className="right-panel">
                    
                    {/* Story */}
                    <div className="aura-box">
                        <p className="aura-text">"{profile.aura}"</p>
                        <span className="superpower-highlight">✨ Power: {profile.superpower}</span>
                    </div>

                    {/* Quests */}
                    <div className="quest-header">⚔️ Recommended Quests</div>
                    
                    <div className="quests-grid">
                        {profile.hobbies.map((hobby, i) => (
                            <div key={i} className="quest-card">
                                <h4>{hobby.name}</h4>
                                <p>{hobby.desc}</p>
                                <div className="tags-container">
                                    {hobby.tags.map(tag => <span key={tag} className="quest-tag">{tag}</span>)}
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="restart-btn" onClick={() => {
                        localStorage.clear();
                        navigate("/");
                    }}>
                        Start New Journey ↻
                    </button>
                </div>

            </div>
        </div>
    );
};

export default PersonalityReveal;