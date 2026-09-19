import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Clock3, ChevronLeft, ChevronRight, Send } from "lucide-react";
import axios from "axios";

function QuizRoom() {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [attemptId, setAttemptId] = useState("");
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isReading, setIsReading] = useState(true);

  const questionStartTime = useRef(null);
  const questionTimes = useRef({});

  useEffect(() => {
    const startQuiz = async () => {
      try {
        const token = sessionStorage.getItem("quizhub_token");

        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/attempts/start`,
          {
            quizId: quizId.toUpperCase()
          },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const loadedQuiz = response.data.quiz;

        setQuiz(loadedQuiz);
        setAttemptId(response.data.attemptId);

        if (loadedQuiz.questions.length > 0) {
          setIsReading(loadedQuiz.readingTime > 0);
          setTimeLeft(
            loadedQuiz.readingTime > 0
              ? loadedQuiz.readingTime
              : loadedQuiz.timePerQuestion
          );

          questionStartTime.current = Date.now();
        }
      } catch (err) {
        setError(
          err.response?.data?.message || "Unable to start this quiz."
        );
      } finally {
        setLoading(false);
      }
    };

    startQuiz();
  }, [quizId]);

  useEffect(() => {
    if (!quiz || submitting || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(previous => Math.max(previous - 1, 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [quiz, submitting]);

  useEffect(() => {
    if (!quiz || submitting || timeLeft !== 0) return;

    if (isReading) {
      setIsReading(false);
      setTimeLeft(quiz.timePerQuestion);
      questionStartTime.current = Date.now();
      return;
    }

    const currentQuestionId =
      quiz.questions[currentQuestion]._id;

    if (questionStartTime.current) {
      const elapsed = Math.floor(
        (Date.now() - questionStartTime.current) / 1000
      );

      questionTimes.current[currentQuestionId] = Math.min(
        elapsed,
        quiz.timePerQuestion
      );
    }

    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(previous => previous + 1);

      if (quiz.readingTime > 0) {
        setIsReading(true);
        setTimeLeft(quiz.readingTime);
      } else {
        setIsReading(false);
        setTimeLeft(quiz.timePerQuestion);
      }

      questionStartTime.current = Date.now();
    } else {
      handleSubmit();
    }
  }, [timeLeft, isReading, currentQuestion, quiz, submitting]);

  const selectAnswer = value => {
    const question = quiz.questions[currentQuestion];

    if (question.type === "multiple") {
      const currentAnswers = answers[question._id] || [];

      const updatedAnswers = currentAnswers.includes(value)
        ? currentAnswers.filter(answer => answer !== value)
        : [...currentAnswers, value];

      setAnswers(previous => ({
        ...previous,
        [question._id]: updatedAnswers
      }));

      return;
    }

    setAnswers(previous => ({
      ...previous,
      [question._id]: value
    }));
  };

  const moveToQuestion = nextIndex => {
    const currentQuestionId =
      quiz.questions[currentQuestion]._id;

    if (questionStartTime.current && !isReading) {
      const elapsed = Math.floor(
        (Date.now() - questionStartTime.current) / 1000
      );

      questionTimes.current[currentQuestionId] = Math.min(
        elapsed,
        quiz.timePerQuestion
      );
    }

    setCurrentQuestion(nextIndex);

    if (quiz.readingTime > 0) {
      setIsReading(true);
      setTimeLeft(quiz.readingTime);
    } else {
      setIsReading(false);
      setTimeLeft(quiz.timePerQuestion);
    }

    questionStartTime.current = Date.now();
  };

  const nextQuestion = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      moveToQuestion(currentQuestion + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      moveToQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    if (submitting) return;

    try {
      setSubmitting(true);

      const currentQuestionId =
        quiz.questions[currentQuestion]?._id;

      if (currentQuestionId && questionStartTime.current && !isReading) {
        const elapsed = Math.floor(
          (Date.now() - questionStartTime.current) / 1000
        );

        questionTimes.current[currentQuestionId] = Math.min(
          elapsed,
          quiz.timePerQuestion
        );
      }

      const token = sessionStorage.getItem("quizhub_token");

      const formattedAnswers = quiz.questions.map(question => ({
        questionId: question._id,
        answer:
          question.type === "multiple"
            ? answers[question._id] || []
            : answers[question._id] || "",
        timeTaken: questionTimes.current[question._id] || 0
      }));

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/attempts/submit`,
        {
          attemptId,
          answers: formattedAnswers
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      sessionStorage.setItem(
        "quizhub_last_attempt_id",
        response.data.result.attemptId
      );

      navigate(`/result/${response.data.result.attemptId}`, {
        state: {
          result: response.data.result,
          quiz
        }
      });
    } catch (err) {
      setSubmitting(false);
      setError(
        err.response?.data?.message ||
          "Unable to submit the quiz."
      );
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-sky-200 dark:bg-slate-950">
        <div className="rounded-3xl bg-white px-8 py-6 text-slate-700 shadow-lg dark:bg-slate-900 dark:text-slate-200">
          Loading quiz...
        </div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-sky-200 px-6 dark:bg-slate-950">
        <div className="w-full max-w-md rounded-3xl border border-red-200 bg-white p-8 text-center dark:border-red-900 dark:bg-slate-900">
          <h1 className="text-2xl font-bold">
            Unable to open quiz
          </h1>

          <p className="mt-3 text-slate-600 dark:text-slate-400">
            {error || "Quiz not found."}
          </p>

          <button
            onClick={() => navigate("/dashboard")}
            className="mt-6 rounded-xl bg-sky-600 px-5 py-3 font-semibold text-white hover:bg-sky-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const question = quiz.questions[currentQuestion];
  const selectedAnswer = answers[question._id];

  return (
    <div className="min-h-screen bg-sky-200 text-slate-900 dark:bg-slate-950 dark:text-white">
      <header className="border-b border-sky-300 bg-white dark:border-slate-700 dark:bg-slate-900">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-sm font-medium text-sky-600 dark:text-sky-400">
              QuizHub
            </p>

            <h1 className="mt-1 text-xl font-bold">
              {quiz.title}
            </h1>
          </div>

          <div
            className={`flex items-center gap-2 rounded-xl px-4 py-2 font-bold ${
              timeLeft <= 5
                ? "bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400"
                : "bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300"
            }`}
          >
            <Clock3 size={18} />
            {timeLeft}s
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {isReading ? "Reading Time" : "Question"}
            </p>

            <p className="mt-1 text-xl font-bold">
              {currentQuestion + 1}{" "}
              <span className="font-normal text-slate-400">
                / {quiz.questions.length}
              </span>
            </p>
          </div>

          <div className="h-2 w-40 overflow-hidden rounded-full bg-white/70 dark:bg-slate-800 sm:w-56">
            <div
              className="h-full rounded-full bg-sky-600 transition-all duration-300"
              style={{
                width: `${
                  ((currentQuestion + 1) /
                    quiz.questions.length) *
                  100
                }%`
              }}
            />
          </div>
        </div>

        <section className="rounded-[2rem] border border-sky-300 bg-white p-7 shadow-lg shadow-sky-300/20 md:p-10 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/20">
          <div className="flex items-center justify-between">
            <span className="rounded-lg bg-sky-100 px-3 py-1.5 text-sm font-semibold text-sky-700 dark:bg-sky-900 dark:text-sky-300">
              {question.points} points
            </span>

            <span className="text-sm text-slate-500 dark:text-slate-400">
              {isReading
                ? "Read the question before answering"
                : question.type === "multiple"
                ? "Select all that apply"
                : question.type === "fill"
                ? "Type your answer"
                : "Select one answer"}
            </span>
          </div>

          <h2 className="mt-8 text-2xl font-bold leading-snug md:text-3xl">
            {question.question}
          </h2>

          {isReading ? (
            <div className="mt-8 rounded-2xl bg-sky-50 p-5 text-center text-sm font-medium text-sky-700 dark:bg-slate-800 dark:text-sky-300">
              Answering will be available when reading time ends.
            </div>
          ) : question.type === "fill" ? (
            <input
              value={selectedAnswer || ""}
              onChange={e => selectAnswer(e.target.value)}
              placeholder="Type your answer..."
              className="mt-8 w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-lg outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-800 dark:focus:border-sky-500 dark:focus:ring-sky-900"
            />
          ) : (
            <div className="mt-8 grid gap-4">
              {question.options.map((option, index) => {
                const isSelected =
                  question.type === "multiple"
                    ? selectedAnswer?.includes(option)
                    : selectedAnswer === option;

                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => selectAnswer(option)}
                    disabled={isReading}
                    className={`flex items-center gap-4 rounded-2xl border p-5 text-left transition ${
                      isSelected
                        ? "border-sky-500 bg-sky-50 text-sky-800 dark:border-sky-500 dark:bg-sky-900/40 dark:text-sky-200"
                        : "border-slate-200 bg-slate-50 hover:border-sky-300 hover:bg-sky-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600 dark:hover:bg-slate-700"
                    } disabled:cursor-not-allowed disabled:opacity-60`}
                  >
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold ${
                        isSelected
                          ? "bg-sky-600 text-white"
                          : "bg-white text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {String.fromCharCode(65 + index)}
                    </span>

                    <span className="font-medium">
                      {option}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            onClick={previousQuestion}
            disabled={
              currentQuestion === 0 ||
              submitting ||
              isReading
            }
            className="flex items-center gap-2 rounded-xl border border-sky-300 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <ChevronLeft size={18} />
            Previous
          </button>

          {currentQuestion === quiz.questions.length - 1 ? (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || isReading}
              className="flex items-center gap-2 rounded-xl bg-sky-600 px-6 py-3 font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Send size={17} />
              {submitting ? "Submitting..." : "Submit Quiz"}
            </button>
          ) : (
            <button
              type="button"
              onClick={nextQuestion}
              disabled={submitting || isReading}
              className="flex items-center gap-2 rounded-xl bg-sky-600 px-6 py-3 font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Next
              <ChevronRight size={18} />
            </button>
          )}
        </div>
      </main>
    </div>
  );
}

export default QuizRoom;