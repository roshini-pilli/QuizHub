import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Trophy,
  Clock3,
  Target,
  RotateCcw,
  Home,
  BarChart3
} from "lucide-react";

const Result = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const formatAnswer = answer => {
    if (answer === null || answer === undefined || answer === "") {
      return "Not answered";
    }

    if (Array.isArray(answer)) {
      return answer.length
        ? answer.join(", ")
        : "Not answered";
    }

    if (typeof answer === "boolean") {
      return answer ? "True" : "False";
    }

    return String(answer);
  };

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const token = sessionStorage.getItem("quizhub_token");

        if (!attemptId || !token) {
          setError("Unable to load result");
          setLoading(false);
          return;
        }

        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/attempts/${attemptId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        setQuiz(response.data.quiz);
        setResult(response.data.result);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load quiz result"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [attemptId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900 dark:bg-slate-950 dark:text-white">
        <div className="mx-auto max-w-5xl">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-48 rounded-lg bg-slate-200 dark:bg-slate-800" />
            <div className="h-48 rounded-3xl bg-white dark:bg-slate-900" />
            <div className="h-64 rounded-3xl bg-white dark:bg-slate-900" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !quiz || !result) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 dark:bg-slate-950">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <XCircle
            className="mx-auto mb-4 text-red-500"
            size={48}
          />

          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Result unavailable
          </h1>

          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            {error || "We couldn't load this quiz result."}
          </p>

          <Link
            to="/dashboard"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-sky-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-600"
          >
            <Home size={17} />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const percentage = result.totalPoints
    ? Math.round(
        (result.score / result.totalPoints) * 100
      )
    : 0;

  const correctCount = result.answers.filter(
    answer => answer.isCorrect
  ).length;

  const incorrectCount = result.answers.filter(
    answer => !answer.isCorrect
  ).length;

  const totalTime = result.answers.reduce(
    (sum, answer) =>
      sum + (answer.timeTaken || 0),
    0
  );

  const averageTime = result.answers.length
    ? Math.round(totalTime / result.answers.length)
    : 0;

  const getPerformanceMessage = () => {
    if (percentage >= 90) {
      return "Excellent performance!";
    }

    if (percentage >= 75) {
      return "Great work!";
    }

    if (percentage >= 60) {
      return "Good effort!";
    }

    if (percentage >= 40) {
      return "Keep practicing!";
    }

    return "There's room to improve!";
  };

  const handleRetake = () => {
    navigate(`/quiz/${quiz.quizId}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-white">
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-sky-500 dark:text-slate-300 dark:hover:text-sky-400"
          >
            <ArrowLeft size={18} />
            Dashboard
          </Link>

          <div className="text-right">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              {quiz.title}
            </p>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Quiz ID: {quiz.quizId}
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-sky-500">
            Quiz Review
          </p>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {getPerformanceMessage()}
          </h1>

          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Here is a detailed breakdown of your performance.
          </p>
        </div>

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-200 px-6 py-8 dark:border-slate-800 sm:px-8">
            <div className="flex flex-col items-center gap-6 sm:flex-row">
              <div className="flex h-32 w-32 shrink-0 flex-col items-center justify-center rounded-full border-8 border-sky-100 bg-sky-50 dark:border-sky-950 dark:bg-sky-950/40">
                <span className="text-3xl font-bold text-sky-600 dark:text-sky-400">
                  {percentage}%
                </span>

                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Score
                </span>
              </div>

              <div className="flex-1 text-center sm:text-left">
                <div className="flex items-center justify-center gap-2 sm:justify-start">
                  <Trophy
                    size={22}
                    className="text-amber-500"
                  />

                  <h2 className="text-xl font-bold">
                    Performance Overview
                  </h2>
                </div>

                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  You scored{" "}
                  <span className="font-semibold text-slate-800 dark:text-white">
                    {result.score}
                  </span>{" "}
                  out of{" "}
                  <span className="font-semibold text-slate-800 dark:text-white">
                    {result.totalPoints}
                  </span>{" "}
                  points.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 divide-x divide-y border-b border-slate-200 dark:divide-slate-800 dark:border-slate-800 sm:grid-cols-4 sm:divide-y-0">
            <div className="p-5 text-center">
              <Target
                className="mx-auto mb-2 text-sky-500"
                size={21}
              />

              <p className="text-2xl font-bold">
                {result.score}
              </p>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Points
              </p>
            </div>

            <div className="p-5 text-center">
              <CheckCircle2
                className="mx-auto mb-2 text-emerald-500"
                size={21}
              />

              <p className="text-2xl font-bold">
                {correctCount}
              </p>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Correct
              </p>
            </div>

            <div className="p-5 text-center">
              <XCircle
                className="mx-auto mb-2 text-red-500"
                size={21}
              />

              <p className="text-2xl font-bold">
                {incorrectCount}
              </p>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Incorrect
              </p>
            </div>

            <div className="p-5 text-center">
              <Clock3
                className="mx-auto mb-2 text-violet-500"
                size={21}
              />

              <p className="text-2xl font-bold">
                {averageTime}s
              </p>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Avg. Time
              </p>
            </div>
          </div>

          <div className="px-6 py-6 sm:px-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              {quiz.allowRetakes && (
                <button
                  onClick={handleRetake}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-600"
                >
                  <RotateCcw size={17} />
                  Retake Quiz
                </button>
              )}

              <Link
                to={`/leaderboard/${quiz.quizId}`}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <Trophy size={17} />
                Leaderboard
              </Link>

              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <Home size={17} />
                Dashboard
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-10">
          <div className="mb-5">
            <p className="text-sm font-semibold uppercase tracking-wider text-sky-500">
              Review
            </p>

            <h2 className="mt-1 text-2xl font-bold">
              Answer Breakdown
            </h2>
          </div>

          <div className="space-y-5">
            {quiz.questions.map((question, index) => {
              const submittedAnswer = result.answers.find(
                answer =>
                  answer.questionId.toString() ===
                  question._id.toString()
              );

              const userAnswer =
                submittedAnswer?.answer ?? null;

              const isCorrect =
                submittedAnswer?.isCorrect ?? false;

              const pointsEarned =
                submittedAnswer?.pointsEarned ?? 0;

              const timeTaken =
                submittedAnswer?.timeTaken ?? 0;

              return (
                <article
                  key={question._id}
                  className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-7"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                        isCorrect
                          ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"
                          : "bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400"
                      }`}
                    >
                      {isCorrect ? (
                        <CheckCircle2 size={23} />
                      ) : (
                        <XCircle size={23} />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                        Question {index + 1}
                      </p>

                      <h3 className="mt-1 text-lg font-semibold leading-relaxed text-slate-900 dark:text-white">
                        {question.question}
                      </h3>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 lg:grid-cols-2">
                    <div
                      className={`rounded-2xl p-5 ${
                        isCorrect
                          ? "bg-emerald-50 dark:bg-emerald-950/30"
                          : "bg-red-50 dark:bg-red-950/30"
                      }`}
                    >
                      <p
                        className={`text-xs font-semibold uppercase tracking-wider ${
                          isCorrect
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        Your Answer
                      </p>

                      <p
                        className={`mt-2 break-words text-base font-semibold ${
                          isCorrect
                            ? "text-emerald-700 dark:text-emerald-300"
                            : "text-red-700 dark:text-red-300"
                        }`}
                      >
                        {formatAnswer(userAnswer)}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-sky-50 p-5 dark:bg-sky-950/30">
                      <p className="text-xs font-semibold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                        Correct Answer
                      </p>

                      <p className="mt-2 break-words text-base font-semibold text-sky-700 dark:text-sky-300">
                        {formatAnswer(question.correctAnswer)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60">
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        Points earned
                      </p>

                      <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                        {pointsEarned} / {question.points}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60">
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        Time taken
                      </p>

                      <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                        {timeTaken}s
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400">
              <BarChart3 size={22} />
            </div>

            <div>
              <h2 className="text-lg font-bold">
                Speed Analysis
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                You spent an average of{" "}
                <span className="font-semibold text-slate-800 dark:text-white">
                  {averageTime} seconds
                </span>{" "}
                per question.
              </p>
            </div>
          </div>

          <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-sky-500 transition-all"
              style={{
                width: `${Math.min(
                  (averageTime /
                    Math.max(
                      quiz.timePerQuestion || 20,
                      1
                    )) *
                    100,
                  100
                )}%`
              }}
            />
          </div>

          <div className="mt-2 flex justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Faster</span>

            <span>
              {quiz.timePerQuestion || 20}s allowed
            </span>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Result;