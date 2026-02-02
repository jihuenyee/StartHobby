import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
import '../styles/PersonalityReveal.css';

/* =========================================
   🔮 MAGICAL INSIGHTS
   ========================================= */
const TAG_DEFINITIONS = {
    // Creative
    "Solo": "✨ The Independent Spirit! You recharge best when alone to build worlds in your mind.",
    "Focus": "👁️ The Deep Diver! You have the rare ability to enter a 'Flow State' where time ceases to exist.",
    "Story": "📖 The Weaver! You see life as a narrative, connecting events into a meaningful story.",
    "Lore": "📜 The Scholar! Surface details bore you. You crave the deep history and the 'why' behind everything.",
    "Tactile": "👐 The Shaper! You think with your hands. You feel joy when physically molding materials.",
    "Visual": "🎨 The Artist's Eye! You notice lighting, composition, and colors that others walk right past.",

    // Active
    "Strength": "💪 The Force! Pushing physical limits isn't just exercise—it's proof you are stronger than yesterday.",
    "Puzzle": "🧩 The Tactical Athlete! You use your brain and body together. Obstacles are equations to be solved.",
    "Adventure": "🧭 The Wild Heart! Comfort zones are cages. You feel alive exploring the unknown.",
    "Outdoor": "🌲 Nature Bound! Fluorescent lights drain you, but sunlight recharges you.",
    "Agility": "🌊 Flow Master! You value freedom of movement. You adapt like water rather than standing still.",
    "Endurance": "🔥 Iron Will! You play the long game. When others quit, you keep going because you have discipline.",

    // Strategic
    "Strategy": "🧠 The Grandmaster! You are always three moves ahead, planning for what will happen ten steps later.",
    "Logic": "⚙️ System Architect! You love taking a messy problem and dismantling it until it runs perfectly.",
    "Tech": "💻 Digital Wizard! You don't just use technology; you create it and understand the magic behind it.",
    "Team": "🛡️ Squad Leader! You know a lone wolf dies, but the pack survives. You coordinate people into winning units.",
    "Science": "🔭 Truth Seeker! You are driven by a need to know how the universe works based on evidence.",
    "Chill": "☕ Zen Master! You perform best when things are calm, rejecting chaos for deep thinking.",

    // Social
    "Social": "🦋 The Connector! You gain energy from the electricity of being with people.",
    "Lead": "👑 Natural Captain! When things go wrong, people look to you for confidence and direction.",
    "Heart": "❤️ The Empath! You don't just help; you feel. Your superpower is understanding emotions.",
    "Storytelling": "🔥 The Bard! You capture attention, turning boring anecdotes into epic legends."
};

const PERSONALITY_PROFILES = [
    {
        type: "Creative",
        title: "The Visionary Artist",
        icon: "🎨",
        class: "Creator",
        motto: "Reality is merely a canvas waiting for your brush.",
        aura: "You see the world not as it is, but as it could be. Where others see silence, you hear melodies; where others see emptiness, you see potential. Your mind is a kaleidoscope of ideas constantly turning.",
        superpower: "Materializing abstract dreams into tangible beauty.",
        stats: [ { label: "Imagination", value: "95%" }, { label: "Empathy", value: "85%" }, { label: "Innovation", value: "90%" } ],
        hobbies: [
            { name: "Digital Art Communities", desc: "Join art jams and share your worlds.", tags: ["Solo", "Focus"], url: "https://www.artstation.com/" },
            { name: "Writing Groups", desc: "Find a local critique circle or write-in.", tags: ["Story", "Lore"], url: "https://nanowrimo.org/regions" },
            { name: "Pottery Classes", desc: "Get your hands dirty at a local studio.", tags: ["Tactile", "Chill"], url: "https://www.coursehorse.com/pottery-classes" },
            { name: "Photography Walks", desc: "Meet others to capture the city.", tags: ["Visual", "Solo"], url: "https://www.meetup.com/topics/photo/" }
        ]
    },
    {
        type: "Active",
        title: "The Trailblazing Ranger",
        icon: "🏹",
        class: "Explorer",
        motto: "The path is not found; it is made.",
        aura: "Static walls cannot contain you. You possess a restless spirit that craves the wind in your face and the earth beneath your boots. For you, movement is not just exercise—it is freedom.",
        superpower: "Boundless energy to face the unknown.",
        stats: [ { label: "Stamina", value: "90%" }, { label: "Agility", value: "85%" }, { label: "Bravery", value: "95%" } ],
        hobbies: [
            { name: "Bouldering Gyms", desc: "Solve wall puzzles with a supportive crew.", tags: ["Strength", "Puzzle"], url: "https://www.mountainproject.com/gyms" },
            { name: "Geocaching Events", desc: "Hunt for treasures with a team.", tags: ["Adventure", "Outdoor"], url: "https://www.geocaching.com/calendar/" },
            { name: "Parkour Jams", desc: "Learn to flow through the city.", tags: ["Agility", "Strength"], url: "https://wfpf.com/gyms/" },
            { name: "Hiking Clubs", desc: "Explore trails with a group.", tags: ["Outdoor", "Endurance"], url: "https://www.meetup.com/topics/hiking/" }
        ]
    },
    {
        type: "Strategic",
        title: "The Grandmaster",
        icon: "🧠",
        class: "Strategist",
        motto: "Chaos is just a pattern you haven't decoded yet.",
        aura: "While others panic, you plan. You see the hidden strings that govern the world. You find peace in logic, systems, and the beautiful click of a puzzle piece falling exactly into place.",
        superpower: "Turning confusion into perfect order.",
        stats: [ { label: "Logic", value: "95%" }, { label: "Focus", value: "90%" }, { label: "Planning", value: "85%" } ],
        hobbies: [
            { name: "Chess Clubs", desc: "Meet rivals for a battle of minds.", tags: ["Strategy", "Focus"], url: "https://www.chess.com/clubs" },
            { name: "Hackathons", desc: "Build systems with a coding team.", tags: ["Tech", "Logic"], url: "https://mlh.io/seasons/2025/events" },
            { name: "Escape Rooms", desc: "Solve mysteries with friends nearby.", tags: ["Puzzle", "Team"], url: "https://worldofescapes.com/" },
            { name: "Astronomy Nights", desc: "Star parties at local observatories.", tags: ["Science", "Chill"], url: "https://www.go-astronomy.com/astronomy-clubs.php" }
        ]
    },
    {
        type: "Social",
        title: "The Radiant Soul",
        icon: "✨",
        class: "Leader",
        motto: "We are stronger together than we are alone.",
        aura: "You are the warmth in a cold room. Your energy feeds on connection, laughter, and shared stories. You have a rare gift: the ability to make anyone feel like the most important person in the world.",
        superpower: "Uniting people and sparking joy.",
        stats: [ { label: "Charisma", value: "95%" }, { label: "Leadership", value: "85%" }, { label: "Empathy", value: "90%" } ],
        hobbies: [
            { name: "D&D Game Stores", desc: "Find a local game store to play D&D.", tags: ["Social", "Storytelling"], url: "https://locator.wizards.com/" },
            { name: "Rec Sports Leagues", desc: "Join a casual team for fun and glory.", tags: ["Active", "Team"], url: "https://www.volosports.com/" },
            { name: "Community Events", desc: "Organize or attend local gatherings.", tags: ["Lead", "Creative"], url: "https://www.eventbrite.com/" },
            { name: "Volunteer Groups", desc: "Make friends while making a difference.", tags: ["Social", "Heart"], url: "https://www.volunteermatch.org/" }
        ]
    }
];

const PersonalityReveal = () => {
    const [profile, setProfile] = useState(null);
    const [tooltipData, setTooltipData] = useState(null); 
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

    const handleMouseEnter = (e, tag) => {
        const rect = e.target.getBoundingClientRect();
        setTooltipData({
            title: tag,
            text: TAG_DEFINITIONS[tag] || "A unique trait defining your playstyle.",
            x: rect.left + (rect.width / 2),
            y: rect.top - 12
        });
    };

    const handleMouseLeave = () => {
        setTooltipData(null);
    };

    if (!profile) return <div className="loading-screen">✨ Loading Magic... ✨</div>;

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
                    
                    <div className="aura-box">
                        {/* Quote icon removed */}
                        <p className="aura-text">{profile.aura}</p> {/* Quotes removed here */}
                        <div className="motto-text">~ {profile.motto} ~</div>
                        
                        <div className="superpower-container">
                            <span className="superpower-label">HIDDEN POWER</span>
                            <span className="superpower-text">{profile.superpower}</span>
                        </div>
                    </div>

                    <div className="quest-header">⚔️ Community Quests (Click to Visit)</div>
                    
                    <div className="quests-grid">
                        {profile.hobbies.map((hobby, i) => (
                            <a 
                                key={i} 
                                href={hobby.url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="quest-card"
                            >
                                <h4>{hobby.name} ↗</h4>
                                <p>{hobby.desc}</p>
                                
                                <div className="tags-container">
                                    {hobby.tags.map(tag => (
                                        <span 
                                            key={tag} 
                                            className="quest-tag"
                                            onMouseEnter={(e) => handleMouseEnter(e, tag)}
                                            onMouseLeave={handleMouseLeave}
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </a>
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

            {/* 🧙‍♂️ PORTAL TOOLTIP */}
            {tooltipData && ReactDOM.createPortal(
                <div 
                    className="magic-tooltip" 
                    style={{ 
                        top: tooltipData.y, 
                        left: tooltipData.x 
                    }}
                >
                    <strong>{tooltipData.title}</strong>
                    <p>{tooltipData.text}</p>
                    <div className="tooltip-arrow"></div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default PersonalityReveal;