import React, { useState, useEffect } from 'react';
import './index.css';
import questionsData from './questions.json';

const QuizApp = ({ questionCount = 20, onComplete }) => {
  // Storage keys
  const STORAGE_PREFIX = `quizApp_${questionCount}_`;
  const STORAGE_KEYS = {
    ATTEMPTS: 'quizApp_attempts',
    COMPLETED: 'quizApp_completed',
    CURRENT_QUESTION: `${STORAGE_PREFIX}currentQuestion`,
    SCORE: `${STORAGE_PREFIX}score`,
    ANSWERED: `${STORAGE_PREFIX}answered`,
    SELECTED_ANSWER: `${STORAGE_PREFIX}selectedAnswer`,
    QUESTIONS: `${STORAGE_PREFIX}questions`,
    EXAM_HISTORY: 'quizApp_examHistory'
  };

  // State initialization
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [savedAttempts, setSavedAttempts] = useState(0);
  const [savedCompleted, setSavedCompleted] = useState(0);
  const [examHistory, setExamHistory] = useState([]);
  // Add flag to prevent double history recording
  const [historyRecorded, setHistoryRecorded] = useState(false);

   // Fisher-Yates shuffle algorithm to shuffle questions
   const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Prepare questions with specified count
  const prepareQuestions = () => {
    const shuffledAll = shuffleArray([...questionsData]);
    return shuffledAll.slice(0, questionCount).map(q => ({
      ...q,
      options: shuffleArray([...q.options])
    }));
  };

  // Storage helper functions
  const saveToStorage = (key, value) => {
    try {
      localStorage.setItem(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
    } catch (err) {
      console.error(`Error saving to storage (${key}):`, err);
    }
  };

  const getFromStorage = (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      if (!item) return defaultValue;
      
      // Try to parse as JSON, but fall back to the raw value if it fails
      try {
        return JSON.parse(item);
      } catch {
        return item;
      }
    } catch (err) {
      console.error(`Error loading from storage (${key}):`, err);
      return defaultValue;
    }
  };

  // Initialize quiz
  useEffect(() => {
    try {
      loadProgress();
      const savedQuestions = getFromStorage(STORAGE_KEYS.QUESTIONS);
      const isCompleted = getFromStorage(STORAGE_KEYS.COMPLETED) === 1;
      
      // If there's no saved test or the previous one was completed, generate a new one
      if (!savedQuestions || savedQuestions.length !== questionCount || isCompleted) {
        const newQuestions = prepareQuestions();
        setQuestions(newQuestions);
        saveToStorage(STORAGE_KEYS.QUESTIONS, newQuestions);
        
        // Only reset other state if there was a completed test
        if (isCompleted) {
          setCurrentQuestionIndex(0);
          setScore(0);
          setSelectedAnswer(null);
          setQuizCompleted(false);
          setAnswered(false);
          setHistoryRecorded(false); // Reset history recorded flag
          // Don't reset attempts
        } else {
          loadProgress();
        }
      } else {
        setQuestions(savedQuestions);
        loadProgress();
      }
    } catch (err) {
      console.error("Initialization error:", err);
      setError('Failed to load questions');
      const newQuestions = prepareQuestions();
      setQuestions(newQuestions);
    } finally {
      setLoading(false);
    }
  }, [questionCount]);

  // Clear specific storage keys
  const clearQuizData = () => {
    console.log("clearing Quiz Data");
    Object.values(STORAGE_KEYS).forEach(key => {
      if (key !== STORAGE_KEYS.ATTEMPTS && key !== STORAGE_KEYS.COMPLETED && key !== STORAGE_KEYS.EXAM_HISTORY) { // Keep track of attempts
        console.log("clearing: " + key);
        localStorage.removeItem(key);
      }
    });
  };

  // Przycisk jeszcze raz
  const restartQuiz = () => {
    // Don't save progress here to avoid double saving
    clearQuizData();
    loadProgress();
    try {
      const savedQuestions = getFromStorage(STORAGE_KEYS.QUESTIONS);
      // If there's no saved test or the previous one was completed, generate a new one
      if (!savedQuestions || savedQuestions.length !== questionCount) {
        const newQuestions = prepareQuestions();
        setQuestions(newQuestions);
        saveToStorage(STORAGE_KEYS.QUESTIONS, newQuestions);
        setCurrentQuestionIndex(0);
        setScore(0);
        setSelectedAnswer(null);
        setQuizCompleted(false);
        setAnswered(false);
        setHistoryRecorded(false); // Reset history recorded flag
      }
    } catch (err) {
      console.error("Initialization error:", err);
      setError('Failed to load questions');
      const newQuestions = prepareQuestions();
      setQuestions(newQuestions);
    } finally {
      setLoading(false);
    }
  }

  // Calculate score percentage
  const calculateScorePercentage = () => {
    if (questions.length === 0) return 0;
    return Math.round((score / questions.length) * 100);
  };

  // Check if score is passing (≥90%)
  const isPassingScore = () => {
    console.log("checking if pass")
    return calculateScorePercentage() >= 90;
  };

  // Save all progress
  const saveProgress = () => {
    console.log("saving to storage")
    if (loading) return;
    saveToStorage(STORAGE_KEYS.CURRENT_QUESTION, currentQuestionIndex);
    console.log("saving current question index: " + currentQuestionIndex);
    saveToStorage(STORAGE_KEYS.SCORE, score);
    console.log("saving to storage score: " + score);
    saveToStorage(STORAGE_KEYS.ATTEMPTS, quizCompleted ? Number(savedAttempts + 1) : savedAttempts);
    console.log("saving to storage attempts: " + String(quizCompleted ? Number(savedAttempts + 1) : savedAttempts));
    saveToStorage(STORAGE_KEYS.ANSWERED, answered ? 1 : 0);
    saveToStorage(STORAGE_KEYS.SELECTED_ANSWER, selectedAnswer || '');
    
    if (quizCompleted && !historyRecorded) {
      const scorePercentage = (score / questionCount) * 100;
      const passed = isPassingScore();
      const newExam = {
        date : new Date().toISOString(),
        score, 
        questionCount,
        scorePercentage,
        passed
      };
      const updatedHistory = [...examHistory, newExam];
      setExamHistory(updatedHistory);
      localStorage.setItem(STORAGE_KEYS.EXAM_HISTORY, JSON.stringify(updatedHistory));
      setHistoryRecorded(true); // Mark that we've recorded history for this quiz
      
      // Update the global completed status if score is passing (≥90%)
      if (isPassingScore()) {
        saveToStorage(STORAGE_KEYS.COMPLETED, Number(savedCompleted + 1));
        console.log("saving to storage, completed: " + Number(savedCompleted + 1));
      }
    }
  };

  // Load saved progress
  const loadProgress = () => {
    const savedIndex = getFromStorage(STORAGE_KEYS.CURRENT_QUESTION);
    const savedScore = getFromStorage(STORAGE_KEYS.SCORE);
    const savedAttempts = getFromStorage(STORAGE_KEYS.ATTEMPTS);
    console.log("getting info from storage, attempts: " + savedAttempts);
    const savedCompleted = getFromStorage(STORAGE_KEYS.COMPLETED);
    console.log("getting info from storage, completed: " + savedCompleted);
    const savedAnswered = getFromStorage(STORAGE_KEYS.ANSWERED);
    const savedSelectedAnswer = getFromStorage(STORAGE_KEYS.SELECTED_ANSWER);
    const savedHistory = getFromStorage(STORAGE_KEYS.EXAM_HISTORY, []);

    if (savedIndex !== null) setCurrentQuestionIndex(Number(savedIndex));
    if (savedScore !== null) setScore(Number(savedScore));
    if (savedAttempts !== null) setSavedAttempts(Number(savedAttempts));
    if (savedCompleted !== null) setSavedCompleted(Number(savedCompleted));
    if (savedAnswered !== null) setAnswered(savedAnswered === 1);
    if (savedSelectedAnswer && savedSelectedAnswer !== '') setSelectedAnswer(savedSelectedAnswer);
    if (savedHistory) setExamHistory(savedHistory);
  };

  // Save progress when state changes
  useEffect(() => {
    saveProgress();
  }, [currentQuestionIndex, score, quizCompleted, answered, selectedAnswer]);

  // Handle going back to main website
  const handleReturnToMain = () => {
    // Save the current attempt if completed
    saveProgress();
    // Clear quiz data to ensure a fresh test next time
    clearQuizData();
    // Call the onComplete callback to return to main website
    if (onComplete) onComplete(false);
  };

  // Handle answer selection
  const handleAnswerSelect = (option) => {
    if (answered) return;
    
    setSelectedAnswer(option);
    setAnswered(true);
    
    if (option === questions[currentQuestionIndex].correctAnswer) {
      setScore(prev => prev + 1);
    }
  };

  // Move to next question or complete quiz
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setAnswered(false);
    } else {
      setQuizCompleted(true);
      
      // Check if score is passing and update completed status
      if (isPassingScore()) {
        saveToStorage(STORAGE_KEYS.COMPLETED, 1);
      }
    }
  };

  // UI Components
  const LoadingView = () => (
    <div className="flex justify-center items-center h-screen text-lg font-bold">
      Ładowanie pytań...
    </div>
  );

  const ErrorView = () => (
    <div className="flex justify-center items-center h-screen text-red-500 text-lg">
      {error}
    </div>
  );

  const CompletedView = () => {
    const scorePercentage = calculateScorePercentage();
    const passed = scorePercentage >= 90;
    
    return (
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-6">Test zakończony!</h2>
        <p className="text-xl font-semibold">
          Twój wynik: {scorePercentage}% ({score}/{questions.length})
        </p>
        <p className={`text-lg font-bold mt-4 ${passed ? 'text-lime-950' : 'text-red-600'}`}>
          {passed ? 'ZDAŁEŚ!' : 'NIE ZDAŁEŚ'}
        </p>
        <div className="flex flex-col space-y-3 mt-6">
          <button
            onClick={restartQuiz}
            className="w-full bg-lime-900 text-white text-lg py-3 px-6 rounded-md hover:bg-blue-700"
          >
            Jeszcze raz!
          </button>
          <button
            onClick={handleReturnToMain}
            className="w-full bg-lime-900 text-white text-lg py-3 px-6 rounded-md hover:bg-red-700"
          >
            Strona główna
          </button>
        </div>
      </div>
    );
  };

  const QuestionView = () => {
    const currentQuestion = questions[currentQuestionIndex];
    
    return (
      <div>
        <div className="mb-6">
          <div className="text-center text-lg font-semibold mb-4">
            <span>Pytanie {currentQuestionIndex + 1}/{questions.length}</span>
          </div>
          <div className="w-full bg-gray-300 rounded-full h-2.5 mb-4">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
          <h2 className="text-2xl font-bold mb-6">{currentQuestion?.question}</h2>
          {currentQuestion?.law && (
            <h3 className="text-lg font-semibold mb-4">{currentQuestion.law}</h3>
          )}
        </div>

        <div className="space-y-4">
          {currentQuestion?.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(option)}
              disabled={answered}
              className={`w-full py-3 px-4 border rounded-md text-lg transition-colors font-medium ${
                selectedAnswer === option
                  ? option === currentQuestion.correctAnswer
                    ? "bg-green-500 text-white border-green-500"
                    : "bg-red-500 text-white border-red-500"
                  : answered && option === currentQuestion.correctAnswer
                  ? "bg-green-500 text-white border-green-500"
                  : "bg-white hover:bg-gray-200 border-gray-400"
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        {answered && (
          <button
            onClick={handleNextQuestion}
            className="mt-6 w-full bg-blue-600 text-white text-lg py-3 px-6 rounded-md hover:bg-blue-700"
          >
            {currentQuestionIndex < questions.length - 1 
              ? "Następne pytanie" 
              : "Zakończ test"}
          </button>
        )}
      </div>
    );
  };

  if (loading) return <LoadingView />;
  if (error && questions.length === 0) return <ErrorView />;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-cover bg-center p-6 text-center">
      <h1 className="text-4xl font-bold text-white mb-4">KSK Borsuk</h1>
      <h2 className="text-2xl font-semibold text-white mb-6">
        WPA Gdańsk pozwolenie kolekcjonerskie ({questionCount} pytań)
      </h2>
      
      <div className="bg-green-200 bg-opacity-70 p-8 rounded-3xl shadow-lg w-full max-w-lg">
        {quizCompleted ? <CompletedView /> : <QuestionView />}
      </div>

      <div className="mt-6 text-white text-sm">
        <p>Wymagane do zaliczenia: 90% poprawnych odpowiedzi</p>
      </div>
    </div>
  );
};

export default QuizApp;