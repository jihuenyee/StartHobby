// src/pages/Quiz.js
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Quiz.css";

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
    return (
      <div className="quiz-container score-section">
        <h2>Your hobby personality</h2>
        {result.personality_summary && (
          <p>{result.personality_summary}</p>
        )}

        {Array.isArray(result.recommended_hobbies) && (
          <ul>
            {result.recommended_hobbies.map((h, i) => (
              <li key={i}>
                <strong>{h.hobby}</strong> – {h.reason}
              </li>
            ))}
          </ul>
        )}

        <Link to="/signup" className="quizbtn">
          Sign up to save your result
        </Link>
      </div>
    );
  }

  const question = quiz.questions[currentIndex];

  return (
    <div className="quiz-container">
      {evaluating ? (
        <div>Evaluating your answers...</div>
      ) : (
        <>
          <div className="question-section">
            <div className="question-count">
              <span>Question {currentIndex + 1}</span>/{quiz.questions.length}
            </div>
            <div className="question-text">
              {question.question_text}
            </div>
          </div>

          <div className="answer-section">
            {question.options.map((opt) => (
              <button
                key={opt.option_id}
                onClick={() =>
                  handleAnswerClick(question.question_id, opt.option_id)
                }
              >
                {opt.option_text}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default Quiz;
