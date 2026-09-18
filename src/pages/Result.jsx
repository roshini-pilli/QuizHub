import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  CheckCircle2,
  XCircle,
  Trophy,
  ArrowLeft,
  RotateCcw,
  BarChart3,
  Clock3,
  Target
} from "lucide-react";
import axios from "axios";

function Result() {
  const location = useLocation();
  const navigate = useNavigate();
  const { attemptId } = useParams();

  const token = sessionStorage.getItem("quizhub_token");

  const [result, setResult] = useState(location.state?.result || null);
  const [quiz, setQuiz] = useState(location.state?.quiz || null);
  const [loading, setLoading] = useState(
    !location.state?.result || !location.state?.quiz
  );

  useEffect(() => {
    const loadResult = async () => {
      if (location.state?.result && location.state?.quiz) {
        setResult(location.state.result);
        setQuiz(location.state.quiz);
        setLoading(false);
        return;
      }

      if (!attemptId || !token) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:5000/api/attempts/${attemptId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        setResult(response.data.result);
        setQuiz(response.data.quiz);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadResult();
  }, [attemptId, location.state, token]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-sky-200 dark:bg-slate-950">
        <div className="rounded-3xl bg-white px-8 py-6 text-slate-700 shadow-lg dark:bg-slate-900 dark:text-slate-200">
          Loading result...
        </div>
      </div>
    );
  }

  if (!result || !quiz) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-sky-200 px-6 dark:bg-slate-950">
        <div className="w-full max-w-md rounded-3xl border border-sky-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
          <h1 className="text-2xl font-bold">
            Result not found
          </h1>

          <p className="mt-3 text-slate-600 dark:text-slate-400">
            Your quiz result could not be loaded.
          </p>

          <Link
            to="/dashboard"
            className="mt-6 inline-flex rounded-xl bg-sky-600 px-5 py-3 font-semibold text-white transition hover:bg-sky-700"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const correctCount = result.answers.filter(
    answer => answer.isCorrect
  ).length;

  const incorrectCount =
    result.answers.length - correctCount;

  const totalTime = result.answers.reduce(
    (total, answer) =>
      total + (Number(answer.timeTaken) || 0),
    0
  );

  const answeredQuestions = result.answers.filter(
    answer =>
      Number(answer.timeTaken) > 0 ||
      answer.answer
  ).length;

  const averageTime = answeredQuestions
    ? totalTime / answeredQuestions
    : 0;

  const fastestTime = result.answers.length
    ? Math.min(
        ...result.answers.map(
          answer => Number(answer.timeTaken) || 0
        )
      )
    : 0;

  const slowestTime = result.answers.length
    ? Math.max(
        ...result.answers.map(
          answer => Number(answer.timeTaken) || 0
        )
      )
    : 0;

  const accuracy = quiz.questions.length
    ? Math.round(
        (correctCount / quiz.questions.length) * 100
      )
    : 0;

  const formatTime = seconds => {
    const value = Math.round(seconds);

    if (value < 60) {
      return `${value}s`;
    }

    const minutes = Math.floor(value / 60);
    const remainingSeconds = value % 60;

    return remainingSeconds
      ? `${minutes}m ${remainingSeconds}s`
      : `${minutes}m`;
  };

  return (
    <div className="min-h-screen bg-sky-200 text-slate-900 dark:bg-slate-950 dark:text-white">
      <header className="border-b border-sky-300 bg-white dark:border-slate-700 dark:bg-slate-900">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <Link
            to="/"
            className="text-2xl font-bold tracking-tight"
          >
            Quiz<span className="text-sky-600 dark:text-sky-400">Hub</span>
          </Link>

          <Link
            to="/dashboard"
            className="flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-sky-600 dark:text-slate-300 dark:hover:text-sky-400"
          >
            <ArrowLeft size={17} />
            Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <section className="rounded-[2rem] border border-sky-300 bg-white p-8 text-center shadow-lg shadow-sky-300/20 md:p-12 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/20">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-sky-100 text-sky-600 dark:bg-sky-900 dark:text-sky-300">
            <Trophy size={38} />
          </div>

          <p className="mt-7 text-sm font-semibold uppercase tracking-[0.2em] text-sky-600 dark:text-sky-400">
            Quiz Completed
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
            {quiz.title}
          </h1>

          <div className="mx-auto mt-10 grid max-w-2xl gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-sky-50 p-5 dark:bg-slate-800">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Score
              </p>

              <p className="mt-2 text-3xl font-black text-sky-600 dark:text-sky-400">
                {result.score}
                <span className="text-lg font-medium text-slate-400">
                  /{result.totalPoints}
                </span>
              </p>
            </div>

            <div className="rounded-2xl bg-sky-50 p-5 dark:bg-slate-800">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Percentage
              </p>

              <p className="mt-2 text-3xl font-black">
                {result.percentage}%
              </p>
            </div>

            <div className="rounded-2xl bg-sky-50 p-5 dark:bg-slate-800">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Correct
              </p>

              <p className="mt-2 text-3xl font-black text-emerald-600 dark:text-emerald-400">
                {correctCount}/{quiz.questions.length}
              </p>
            </div>
          </div>

          <div className="mt-8 flex justify-center gap-6 text-sm">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 size={17} />
              {correctCount} correct
            </div>

            <div className="flex items-center gap-2 text-red-500 dark:text-red-400">
              <XCircle size={17} />
              {incorrectCount} incorrect
            </div>
          </div>

          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            {quiz.allowRetakes && (
              <button
                type="button"
                onClick={() => navigate(`/quiz/${quiz.quizId}`)}
                className="flex items-center justify-center gap-2 rounded-xl border border-sky-300 px-6 py-3 font-semibold text-slate-700 transition hover:bg-sky-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <RotateCcw size={17} />
                Try Again
              </button>
            )}

            <Link
              to={`/leaderboard/${quiz.quizId}`}
              className="flex items-center justify-center gap-2 rounded-xl border border-sky-300 px-6 py-3 font-semibold text-slate-700 transition hover:bg-sky-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <BarChart3 size={17} />
              Leaderboard
            </Link>

            <Link
              to="/dashboard"
              className="flex items-center justify-center rounded-xl bg-sky-600 px-6 py-3 font-semibold text-white transition hover:bg-sky-700"
            >
              Back to Dashboard
            </Link>
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-5">
            <p className="text-sm font-medium text-sky-700 dark:text-sky-400">
              Insights
            </p>

            <h2 className="mt-1 text-2xl font-bold">
              Performance overview
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-3xl border border-sky-300 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-100 text-sky-600 dark:bg-sky-950 dark:text-sky-400">
                <Clock3 size={21} />
              </div>

              <p className="mt-5 text-sm text-slate-500 dark:text-slate-400">
                Total time
              </p>

              <p className="mt-1 text-2xl font-bold">
                {formatTime(totalTime)}
              </p>
            </div>

            <div className="rounded-3xl border border-sky-300 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-100 text-sky-600 dark:bg-sky-950 dark:text-sky-400">
                <Clock3 size={21} />
              </div>

              <p className="mt-5 text-sm text-slate-500 dark:text-slate-400">
                Average time
              </p>

              <p className="mt-1 text-2xl font-bold">
                {formatTime(averageTime)}
              </p>
            </div>

            <div className="rounded-3xl border border-sky-300 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-100 text-sky-600 dark:bg-sky-950 dark:text-sky-400">
                <Target size={21} />
              </div>

              <p className="mt-5 text-sm text-slate-500 dark:text-slate-400">
                Accuracy
              </p>

              <p className="mt-1 text-2xl font-bold">
                {accuracy}%
              </p>
            </div>

            <div className="rounded-3xl border border-sky-300 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-100 text-sky-600 dark:bg-sky-950 dark:text-sky-400">
                <Clock3 size={21} />
              </div>

              <p className="mt-5 text-sm text-slate-500 dark:text-slate-400">
                Fastest answer
              </p>

              <p className="mt-1 text-2xl font-bold">
                {formatTime(fastestTime)}
              </p>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-[2rem] border border-sky-300 bg-white p-6 dark:border-slate-700 dark:bg-slate-900 md:p-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium text-sky-700 dark:text-sky-400">
                Speed analysis
              </p>

              <h2 className="mt-1 text-2xl font-bold">
                Time per question
              </h2>
            </div>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              Fastest {formatTime(fastestTime)} · Slowest{" "}
              {formatTime(slowestTime)}
            </p>
          </div>

          <div className="mt-7 space-y-5">
            {quiz.questions.map((question, index) => {
              const answer = result.answers.find(
                item => item.questionId === question._id
              );

              const time = Number(answer?.timeTaken) || 0;

              const width =
                slowestTime > 0
                  ? Math.max((time / slowestTime) * 100, 4)
                  : 4;

              return (
                <div key={question._id}>
                  <div className="mb-2 flex items-center justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-100 text-xs font-bold text-sky-700 dark:bg-sky-950 dark:text-sky-400">
                        {index + 1}
                      </span>

                      <span className="truncate text-sm font-medium">
                        Question {index + 1}
                      </span>
                    </div>

                    <div className="flex shrink-0 items-center gap-2 text-sm">
                      {answer?.isCorrect ? (
                        <CheckCircle2
                          size={16}
                          className="text-emerald-500"
                        />
                      ) : (
                        <XCircle
                          size={16}
                          className="text-red-500"
                        />
                      )}

                      <span className="font-semibold">
                        {formatTime(time)}
                      </span>
                    </div>
                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className={`h-full rounded-full ${
                        answer?.isCorrect
                          ? "bg-emerald-400"
                          : "bg-red-400"
                      }`}
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-7 flex flex-wrap gap-5 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              Correct
            </div>

            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
              Incorrect
            </div>
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-5">
            <p className="text-sm font-medium text-sky-700 dark:text-sky-400">
              Review
            </p>

            <h2 className="mt-1 text-2xl font-bold">
              Answer breakdown
            </h2>
          </div>

          <div className="space-y-4">
            {quiz.questions.map((question, index) => {
              const answer = result.answers.find(
                item => item.questionId === question._id
              );

              return (
                <div
                  key={question._id}
                  className="rounded-3xl border border-sky-300 bg-white p-6 dark:border-slate-700 dark:bg-slate-900"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                        answer?.isCorrect
                          ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400"
                          : "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400"
                      }`}
                    >
                      {answer?.isCorrect ? (
                        <CheckCircle2 size={20} />
                      ) : (
                        <XCircle size={20} />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        Question {index + 1}
                      </p>

                      <h3 className="mt-1 text-lg font-semibold">
                        {question.question}
                      </h3>

                      <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Your answer
                          </p>

                          <p className="mt-1 font-medium">
                            {Array.isArray(answer?.answer)
                              ? answer.answer.join(", ")
                              : answer?.answer || "Not answered"}
                          </p>
                        </div>

                        <div className="rounded-xl bg-sky-50 p-3 dark:bg-slate-800">
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Points earned
                          </p>

                          <p className="mt-1 font-medium">
                            {answer?.pointsEarned || 0} /{" "}
                            {question.points}
                          </p>
                        </div>

                        <div className="rounded-xl bg-sky-50 p-3 dark:bg-slate-800">
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Time taken
                          </p>

                          <p className="mt-1 font-medium">
                            {formatTime(answer?.timeTaken || 0)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}

export default Result;