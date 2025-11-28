import React from 'react';
import '../styles/HobbyQuiz.css'; // We'll reuse the same CSS file

<<<<<<< HEAD
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

function Quiz() {
  const [quiz, setQuiz] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]); // {question_id, selected_option_id}
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [result, setResult] = useState(null); // AI result
  const [error, setError] = useState("");

  // 1. Load quiz (quiz_id = 1)
  useEffect(() => {
    async function fetchQuiz() {
      try {
        const res = await fetch(`${API_BASE_URL}/quizzes/1`);
        if (!res.ok) throw new Error("Failed to load quiz");
        const data = await res.json();
        setQuiz(data);
      } catch (err) {
        console.error(err);
        setError("Unable to load quiz questions.");
      } finally {
        setLoading(false);
      }
    }
    fetchQuiz();
  }, []);

  const handleAnswerClick = (question_id, option_id) => {
    const newAnswers = [
      ...answers,
      { question_id, selected_option_id: option_id },
    ];

    const nextIndex = currentIndex + 1;

    if (quiz && nextIndex < quiz.questions.length) {
      setAnswers(newAnswers);
      setCurrentIndex(nextIndex);
    } else {
      // last question → evaluate
      setAnswers(newAnswers);
      submitForEvaluation(newAnswers);
    }
  };

const submitForEvaluation = async (answersArray) => {
  setEvaluating(true);
  setError("");

    try {
      const body = {
        user_id: null,  // or real user_id if logged in
        answers: answersArray,
      };

      const res = await fetch(`${API_BASE_URL}/quizzes/1/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      let data = null;
      try {
        data = await res.json();
      } catch {
        // no JSON
      }

      if (!res.ok) {
        console.error("Evaluate HTTP error:", res.status, data);
        throw new Error(
          data?.error || `Failed to evaluate quiz (HTTP ${res.status})`
        );
      }

      console.log("Evaluate response:", data);
      setResult(data.ai_result);
    } catch (err) {
      console.error("Evaluate error:", err);
      setError(err.message || "Sorry, we could not evaluate your quiz.");
    } finally {
      setEvaluating(false);
    }
  };


  // ---------- RENDER ----------

  if (loading) {
    return <div className="quiz-container">Loading quiz...</div>;
  }

  if (error) {
    return <div className="quiz-container">{error}</div>;
  }

  // If AI result already returned:
  if (result) {
=======
const HobbyQuizUI = ({ question, progress, answer, onAnswerChange, onNextQuestion, isLoading }) => {
>>>>>>> ad88a4e3f11a54886598a1d97239008728c589d5
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

