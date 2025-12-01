// src/pages/Quiz.js
import React, { useEffect, useState } from "react";
import "../styles/Quiz.css";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

function Quiz() {
  const [quiz, setQuiz] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchQuiz() {
      try {
        const res = await fetch(`${API_BASE_URL}/quizzes/1`);
        if (!res.ok) throw new Error("Failed to load quiz");
        const data = await res.json();
        setQuiz(data);
      } catch (err) {
        setError("Unable to load quiz questions.");
      } finally {
        setLoading(false);
      }
    }
    fetchQuiz();
  }, []);

  const handleAnswerClick = (question_id, option_id) => {
    const newAnswers = [...answers, { question_id, selected_option_id: option_id }];
    const nextIndex = currentIndex + 1;

    if (quiz && nextIndex < quiz.questions.length) {
      setAnswers(newAnswers);
      setCurrentIndex(nextIndex);
    } else {
      setAnswers(newAnswers);
      submitForEvaluation(newAnswers);
    }
  };

  const submitForEvaluation = async (answersArr) => {
    setEvaluating(true);
    try {
      const res = await fetch(`${API_BASE_URL}/quizzes/1/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: null, answers: answersArr }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to evaluate quiz");

      setResult(data.ai_result);
    } catch (err) {
      setError(err.message);
    } finally {
      setEvaluating(false);
    }
  };

  if (loading) return <div className="quiz-container">Loading quiz...</div>;
  if (error) return <div className="quiz-container">{error}</div>;

  if (result) {
    return (
      <div className="quiz-container">
        <div className="score-section">
          <h2>{result.personality_type}</h2>
          <p>{result.personality_summary}</p>

          <h3>Recommended hobbies:</h3>
          <ul>
            {result.recommended_hobbies.map((h, i) => (
              <li key={i}><strong>{h.hobby}:</strong> {h.reason}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  const question = quiz.questions[currentIndex];

  return (
    <div className="quiz-container">
      <div className="question-section">
        <div className="question-count">
          Question {currentIndex + 1}/{quiz.questions.length}
        </div>
        <div className="question-text">{question.question_text}</div>
      </div>

      <div className="answer-section">
        {question.options.map((opt) => (
          <button
            key={opt.option_id}
            onClick={() => handleAnswerClick(question.question_id, opt.option_id)}
            disabled={evaluating}
          >
            {opt.option_text}
          </button>
        ))}
      </div>
    </div>
  );
}

export default Quiz;
