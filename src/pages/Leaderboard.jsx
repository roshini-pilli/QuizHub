import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Trophy, Medal } from "lucide-react";
import axios from "axios";

function Leaderboard() {
  const { quizId } = useParams();

  const [quiz, setQuiz] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [hasAttempted, setHasAttempted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const token = sessionStorage.getItem("quizhub_token");

        const [quizResponse, leaderboardResponse, historyResponse] =
          await Promise.all([
            axios.get(
              `http://localhost:5000/api/quizzes/${quizId}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`
                }
              }
            ),
            axios.get(
              `http://localhost:5000/api/attempts/leaderboard/${quizId}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`
                }
              }
            ),
            axios.get(
              "http://localhost:5000/api/attempts/history",
              {
                headers: {
                  Authorization: `Bearer ${token}`
                }
              }
            )
          ]);

        const currentQuiz = quizResponse.data.quiz;
        const attempts = historyResponse.data.attempts || [];

        const completedAttempt = attempts.some((attempt) => {
          const attemptQuizId =
            attempt.quiz?._id ||
            attempt.quiz?.quizId ||
            attempt.quiz;

          return (
            attemptQuizId === currentQuiz._id ||
            attemptQuizId === currentQuiz.quizId
          ) && attempt.completed;
        });

        setQuiz(currentQuiz);
        setLeaderboard(leaderboardResponse.data.leaderboard);
        setHasAttempted(completedAttempt);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load leaderboard."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [quizId]);

  const canTakeQuiz = quiz?.allowRetakes || !hasAttempted;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-sky-200 dark:bg-slate-950">
        <div className="rounded-3xl bg-white px-8 py-6 text-slate-700 shadow-lg dark:bg-slate-900 dark:text-slate-200">
          Loading leaderboard...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-sky-200 px-6 dark:bg-slate-950">
        <div className="w-full max-w-md rounded-3xl border border-red-200 bg-white p-8 text-center dark:border-red-900 dark:bg-slate-900">
          <h1 className="text-2xl font-bold">
            Unable to load leaderboard
          </h1>

          <p className="mt-3 text-slate-600 dark:text-slate-400">
            {error}
          </p>

          <Link
            to="/dashboard"
            className="mt-6 inline-flex rounded-xl bg-sky-600 px-5 py-3 font-semibold text-white hover:bg-sky-700"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

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
        <section className="rounded-[2rem] border border-sky-300 bg-white p-8 shadow-lg shadow-sky-300/20 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/20">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-100 text-sky-600 dark:bg-sky-900 dark:text-sky-300">
              <Trophy size={30} />
            </div>

            <p className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-sky-600 dark:text-sky-400">
              Leaderboard
            </p>

            <h1 className="mt-2 text-3xl font-bold md:text-4xl">
              {quiz?.title || "Quiz"}
            </h1>

            <p className="mt-2 text-slate-500 dark:text-slate-400">
              {leaderboard.length} completed attempt
              {leaderboard.length !== 1 ? "s" : ""}
            </p>
          </div>

          {leaderboard.length === 0 ? (
            <div className="mt-10 rounded-2xl bg-sky-50 p-8 text-center dark:bg-slate-800">
              <p className="font-semibold">
                No completed attempts yet
              </p>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Be the first person to complete this quiz.
              </p>
            </div>
          ) : (
            <div className="mt-10 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="grid grid-cols-[60px_1fr_100px_100px] gap-4 bg-sky-50 px-5 py-4 text-sm font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                <span>Rank</span>
                <span>Participant</span>
                <span className="text-center">Score</span>
                <span className="text-center">Result</span>
              </div>

              <div className="divide-y divide-slate-200 dark:divide-slate-700">
                {leaderboard.map((entry) => (
                  <div
                    key={`${entry.rank}-${entry.name}`}
                    className="grid grid-cols-[60px_1fr_100px_100px] items-center gap-4 px-5 py-5 transition hover:bg-sky-50 dark:hover:bg-slate-800/70"
                  >
                    <div className="flex items-center">
                      {entry.rank <= 3 ? (
                        <Medal
                          size={22}
                          className="text-sky-600 dark:text-sky-400"
                        />
                      ) : (
                        <span className="pl-1 text-sm font-bold text-slate-500 dark:text-slate-400">
                          {entry.rank}
                        </span>
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-semibold">
                        {entry.name}
                      </p>

                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        Completed attempt
                      </p>
                    </div>

                    <div className="text-center">
                      <p className="font-bold">
                        {entry.score}/{entry.totalPoints}
                      </p>
                    </div>

                    <div className="text-center">
                      <span className="rounded-lg bg-sky-100 px-3 py-1.5 text-sm font-bold text-sky-700 dark:bg-sky-900 dark:text-sky-300">
                        {entry.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {canTakeQuiz && (
            <div className="mt-8 flex justify-center">
              <Link
                to={`/quiz/${quizId}`}
                className="rounded-xl bg-sky-600 px-6 py-3 font-semibold text-white transition hover:bg-sky-700"
              >
                Take Quiz
              </Link>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Leaderboard;