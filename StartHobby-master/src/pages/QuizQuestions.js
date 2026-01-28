import React, { useState, useEffect } from 'react';
import HobbyQuizUI from './HobbyQuizUI';

// --- MOCK DATA to simulate the quiz flow ---
// Later, you will replace this with API calls.
const MOCK_QUESTIONS = [
    { id: 1, text: "Do you prefer hobbies that engage more mentally or physically?" },
    { id: 2, text: "Are you looking for a solo activity or something to do with friends?" },
    { id: 3, text: "What's your budget for a new hobby? (Low, Medium, High)" },
    { id: 4, text: "How much time can you dedicate to a hobby each week?" },
    { id: 5, text: "Great! We're analyzing your results now..." }
];

const HobbyQuizContainer = () => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState({});
    const [progress, setProgress] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    // Update progress whenever the question index changes
    useEffect(() => {
        const newProgress = Math.round(((currentQuestionIndex) / (MOCK_QUESTIONS.length -1)) * 100);
        setProgress(newProgress);
    }, [currentQuestionIndex]);

    const handleAnswerChange = (e) => {
        const currentQuestionId = MOCK_QUESTIONS[currentQuestionIndex].id;
        setUserAnswers({
            ...userAnswers,
            [currentQuestionId]: e.target.value
        });
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex >= MOCK_QUESTIONS.length - 1) {
            console.log("Quiz Finished! Final Answers:", userAnswers);
            // Here you would navigate to a results page or show a final message
            return;
        }

        setIsLoading(true);

        // =================================================================
        // V V V V V V V   AI INTEGRATION POINT   V V V V V V V
        // =================================================================
        //
        // 1. Get the current question ID and the user's answer.
        //    const questionId = MOCK_QUESTIONS[currentQuestionIndex].id;
        //    const answer = userAnswers[questionId] || "";
        //
        // 2. Make your API call to the AI here with the question and answer.
        //    const nextQuestion = await fetchNextAIQuestion(questionId, answer);
        //
        // 3. For now, we simulate this with a delay.
        
        console.log("Submitting answer:", userAnswers[MOCK_QUESTIONS[currentQuestionIndex].id] || "");

        setTimeout(() => {
            // 4. Once you get the next question from the AI, update the state.
            //    (Here we just move to the next item in our mock array)
            setCurrentQuestionIndex(prevIndex => prevIndex + 1);
            setIsLoading(false);
        }, 1000); // Simulate 1 second network delay
        
        // =================================================================
        // ^ ^ ^ ^ ^ ^ ^   END OF AI INTEGRATION POINT   ^ ^ ^ ^ ^ ^ ^
        // =================================================================
    };

    const currentQuestion = MOCK_QUESTIONS[currentQuestionIndex];
    const currentAnswer = userAnswers[currentQuestion.id] || '';

    return (
        <HobbyQuizUI 
            question={currentQuestion.text}
            progress={progress}
            answer={currentAnswer}
            onAnswerChange={handleAnswerChange}
            onNextQuestion={handleNextQuestion}
            isLoading={isLoading}
        />
    );
};

export default HobbyQuizContainer;