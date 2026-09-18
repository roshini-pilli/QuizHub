import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Moon, Sun, Users } from "lucide-react";
import axios from "axios";

function JoinQuiz({ darkMode, setDarkMode }) {
  const navigate = useNavigate();

  const [quizId, setQuizId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const token = sessionStorage.getItem("quizhub_token");

      const response = await axios.post(
        "http://localhost:5000/api/quizzes/join",
        {
          quizId: quizId.trim().toUpperCase()
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      navigate(`/quiz/${response.data.quiz.quizId}`);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to join quiz"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-sky-200 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-white">
      <nav className="border-b border-sky-300 bg-white dark:border-slate-700 dark:bg-slate-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link
            to="/"
            className="text-2xl font-bold tracking-tight"
          >
            Quiz<span className="text-sky-600 dark:text-sky-400">
              Hub
            </span>
          </Link>

          <button
            onClick={() => setDarkMode(!darkMode)}
            aria-label="Toggle theme"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-sky-200 bg-white text-slate-700 transition hover:bg-sky-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            {darkMode ? (
              <Sun size={18} />
            ) : (
              <Moon size={18} />
            )}
          </button>
        </div>
      </nav>

      <main className="flex min-h-[calc(100vh-81px)] items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <Link
            to="/dashboard"
            className="mb-6 inline-flex items-center gap-2 text-sm text-slate-600 transition hover:text-sky-700 dark:text-slate-400 dark:hover:text-sky-400"
          >
            <ArrowLeft size={16} />
            Back to dashboard
          </Link>

          <div className="rounded-3xl border border-sky-300 bg-white p-8 shadow-lg shadow-sky-300/30 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/30">
            <div className="mb-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-600 dark:bg-sky-900 dark:text-sky-300">
                <Users size={22} />
              </div>

              <h1 className="mt-6 text-3xl font-bold">
                Join a Quiz
              </h1>

              <p className="mt-2 text-slate-600 dark:text-slate-400">
                Enter the quiz ID shared by the quiz creator.
              </p>
            </div>

            {error && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
                {error}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Quiz ID
                </label>

                <input
                  type="text"
                  value={quizId}
                  onChange={e =>
                    setQuizId(
                      e.target.value.toUpperCase()
                    )
                  }
                  placeholder="Enter 6-character Quiz ID"
                  maxLength={6}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-center text-lg font-semibold tracking-[0.3em] uppercase outline-none transition placeholder:text-sm placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-800 dark:focus:border-sky-500 dark:focus:ring-sky-900"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-sky-600 px-5 py-3.5 font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Joining..."
                  : "Join Quiz"}
              </button>
            </form>

            <div className="mt-7 rounded-2xl bg-sky-50 p-4 dark:bg-slate-800">
              <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                Ask the quiz creator for the 6-character quiz ID to join their
                quiz.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default JoinQuiz;