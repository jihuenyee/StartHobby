import React from 'react';
import '../styles/HobbyQuiz.css'; // We'll reuse the same CSS file

const HobbyQuizUI = ({ question, progress, answer, onAnswerChange, onNextQuestion, isLoading }) => {
    return (
        <div className="hobby-quiz-page">
            <main className="main-content">
                <div className="quiz-container">
                    <section className="top-section">
                        <div className="chat-bubble">
                            {/* The question is now a prop */}
                            {question}
                        </div>
                        {/* The squirrel is now a clickable button */}
                        <button 
                            className="squirrel-button" 
                            onClick={onNextQuestion}
                            disabled={isLoading} // Disable button while loading next question
                        >
                            <img 
                                src="/squirrel.png" 
                                alt="Next Question" 
                                className="squirrel-image" 
                            />
                        </button>
                    </section>

                    <section className="progress-section">
                        <div className="progress-bar-container">
                          <img 
                                src="/acorn.png" 
                                alt="Next Question" 
                                className="acorn-image" 
                            />
                            {/* Progress is now a prop */}
                            <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
                        </div>
                        <div className="progress-percentage">{progress}%</div>
                    </section>

                    <section className="response-area">
                        <input 
                            type="text" 
                            className="response-input" 
                            placeholder="Type your answer here..."
                            value={answer} // Answer value is a prop
                            onChange={onAnswerChange} // The change handler is a prop
                            disabled={isLoading} // Disable input while loading
                        />
                    </section>
                </div>
            </main>
        </div>
    );
};

export default HobbyQuizUI;

