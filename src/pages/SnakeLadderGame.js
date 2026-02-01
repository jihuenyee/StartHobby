import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/SnakeLadderGame.css";

const BOARD_SIZE = 25;
const REQUIRED_QUESTIONS = 5;
const SNAKES = { 14: 4, 19: 8, 22: 20, 24: 16 };
const LADDERS = { 3: 11, 6: 17, 9: 18, 10: 12 };

const API_BASE = process.env.NODE_ENV === "production"
    ? "https://starthobbybackend-production.up.railway.app"
    : "http://localhost:5000";

const SnakeLadderGame = () => {
    const navigate = useNavigate();
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [position, setPosition] = useState(1);
    const [isRolling, setIsRolling] = useState(false);
    const [diceNum, setDiceNum] = useState(1);
    const [statusMsg, setStatusMsg] = useState("Roll to start your adventure!");
    const [modalData, setModalData] = useState(null);
    const [answers, setAnswers] = useState([]);
    const [answerTypes, setAnswerTypes] = useState([]);
    const [isFinished, setIsFinished] = useState(false);
    const [miniInsight, setMiniInsight] = useState(null);

    const sounds = useRef({
        click: new Audio("/sounds/click.mp3"),
        up: new Audio("/sounds/slideUP.mp3"),
        down: new Audio("/sounds/slideDOWN.mp3"),
        bg: new Audio("/sounds/SnakeLadder.mp3"),
    });

    const playSound = useCallback((soundKey) => {
        const audio = sounds.current[soundKey];
        if (audio) { audio.currentTime = 0; audio.play().catch(() => {}); }
    }, []);

    useEffect(() => {
        const loadData = async () => {
            try {
                const res = await fetch(`${API_BASE}/api/quizzes/snake`);
                const data = await res.json();
                const qList = Array.isArray(data) ? data : (data.questions || []);
                if (qList.length > 0) {
                    const formatted = qList.map(q => ({
                        id: q.id, q: q.question,
                        options: [{ text: q.option_a, type: "Active" }, { text: q.option_b, type: "Strategic" }, { text: q.option_c, type: "Creative" }, { text: q.option_d, type: "Social" }]
                    }));
                    setQuestions(formatted.sort(() => Math.random() - 0.5));
                }
            } catch (err) { console.error(err); } 
            finally { setLoading(false); }
        };
        loadData();
        const bgAudio = sounds.current.bg;
        bgAudio.loop = true; bgAudio.volume = 0.2;
        return () => { bgAudio.pause(); };
    }, []);

    const triggerQuestion = useCallback((len) => {
        if (len < REQUIRED_QUESTIONS) {
            setModalData(questions[len] || null);
            setStatusMsg("Riddle Time!");
        } else { setStatusMsg("One last push to the Castle!"); }
    }, [questions]);

    const checkTile = useCallback((curr) => {
        if (SNAKES[curr]) {
            setStatusMsg("🐍 Oops! Slid down!");
            playSound('down');
            setTimeout(() => { setPosition(SNAKES[curr]); setTimeout(() => triggerQuestion(answers.length), 800); }, 800);
        } else if (LADDERS[curr]) {
            setStatusMsg("🪜 Yay! Climbed up!");
            playSound('up');
            setTimeout(() => { setPosition(LADDERS[curr]); setTimeout(() => triggerQuestion(answers.length), 800); }, 800);
        } else if (curr === BOARD_SIZE) {
            setStatusMsg("Victory! 🏰");
            setIsFinished(true);
            setTimeout(() => {
                const counts = {};
                answerTypes.forEach(t => counts[t] = (counts[t] || 0) + 1);
                const top = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b, "Creative");
                const msgs = { Creative: "Vivid Imagination! 🎨", Active: "Full of Energy! 🏃", Strategic: "Master Planner! 🧠", Social: "People Person! 🤝" };
                setMiniInsight(msgs[top]);
            }, 1000);
        } else { triggerQuestion(answers.length); }
    }, [answers.length, answerTypes, playSound, triggerQuestion]);

    const handleRollDice = () => {
        if (isRolling || modalData || isFinished) return;
        if (answers.length === 0) sounds.current.bg.play().catch(() => {});
        playSound('click'); setIsRolling(true); setStatusMsg("Rolling...");

        const rollInt = setInterval(() => setDiceNum(Math.floor(Math.random() * 6) + 1), 80);

        setTimeout(() => {
            clearInterval(rollInt);
            let target = 1;
            const turn = answers.length;
            if (turn === 0) target = 3;
            else if (turn === 1) target = 14;
            else if (turn === 2) target = 9;
            else if (turn === 3) target = 20;
            else if (turn === 4) target = 23;
            else if (turn === 5) target = BOARD_SIZE;

            const movement = Math.max(1, target - position);
            setDiceNum(movement);
            setIsRolling(false); 
            setStatusMsg(`Rolled a ${movement}!`);

            setTimeout(() => {
                setStatusMsg("Moving...");
                setPosition(target);
                setTimeout(() => checkTile(target), 800);
            }, 700); 
        }, 800); 
    };

    const gridCells = [];
    for (let r = 4; r >= 0; r--) {
        for (let c = 0; c < 5; c++) {
            let num = (r % 2 === 0) ? (r * 5) + (c + 1) : (r * 5) + (5 - c);
            gridCells.push(num);
        }
    }

    const getPlayerStyle = () => {
        const index = gridCells.indexOf(position);
        return { top: `${Math.floor(index / 5) * 20}%`, left: `${(index % 5) * 20}%` };
    };

    if (loading) return <div className="snake-game-container"><h2>Entering Forest...</h2></div>;

    return (
        <div className="snake-game-container">
            <div className="game-header">
                <div className="progress-bar">
                    <div className="fill" style={{ width: `${(answers.length / REQUIRED_QUESTIONS) * 100}%` }}></div>
                </div>
                <p className="status-text">{statusMsg}</p>
            </div>

            <div className="board-wrapper">
                <div className="board-grid">
                    {gridCells.map((num) => (
                        <div key={num} className={`tile ${SNAKES[num] ? 'snake-tile' : ''} ${LADDERS[num] ? 'ladder-tile' : ''} ${num === BOARD_SIZE ? 'finish-tile' : ''}`}>
                            <span className="tile-num">{num}</span>
                            {SNAKES[num] && <span className="marker">🐍</span>}
                            {LADDERS[num] && <span className="marker">🪜</span>}
                            {num === BOARD_SIZE && <div className="finish-label">GOAL 🏰</div>}
                        </div>
                    ))}
                </div>
                <div className="player-token" style={getPlayerStyle()}>🐿️</div>
            </div>

            <div className="controls-area">
                <div className={`dice-display ${isRolling ? "animate-roll" : ""}`}>{diceNum}</div>
                <button className="roll-btn" onClick={handleRollDice} disabled={isRolling || modalData || isFinished}>
                    {isFinished ? "WIN!" : "ROLL"}
                </button>
            </div>

            {modalData && (
                <div className="modal-overlay">
                    <div className="sl-question-card">
                        <h3>{modalData.q}</h3>
                        {modalData.options.map((opt, i) => (
                            <button key={i} className="option-btn" onClick={() => {
                                setAnswers(prev => [...prev, { q: modalData.q, a: opt.text }]);
                                setAnswerTypes(prev => [...prev, opt.type]);
                                setModalData(null);
                            }}>{opt.text}</button>
                        ))}
                    </div>
                </div>
            )}

            {miniInsight && (
                <div className="modal-overlay">
                    <div className="insight-card">
                        <h1>Adventure Complete!</h1>
                        <h2>{miniInsight}</h2>
                        <button className="roll-btn" onClick={() => navigate("/finalize")}>Show Hobby</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SnakeLadderGame;