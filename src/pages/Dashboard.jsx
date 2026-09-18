import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Copy,
  Check,
  Edit3,
  Trophy,
  Trash2,
  LogOut,
  Plus,
  Play,
  RotateCcw,
  Clock3,
  Users,
  FileQuestion,
  BarChart3,
  Eye,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import ThemeToggle from "../components/ThemeToggle";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [quizzes, setQuizzes] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedQuizId, setCopiedQuizId] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);

  const quizScrollRef = useRef(null);
  const attemptScrollRef = useRef(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = sessionStorage.getItem("quizhub_token");

        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };

        const [quizResponse, attemptResponse] = await Promise.all([
          axios.get(
            "http://localhost:5000/api/quizzes/mine",
            config
          ),
          axios.get(
            "http://localhost:5000/api/attempts/history",
            config
          )
        ]);

        setQuizzes(quizResponse.data.quizzes || []);
        setAttempts(attemptResponse.data.attempts || []);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load dashboard."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const scrollSection = (ref, direction) => {
    if (!ref.current) {
      return;
    }

    ref.current.scrollBy({
      left: direction * 420,
      behavior: "smooth"
    });
  };

  const copyQuizId = async quizId => {
    try {
      await navigator.clipboard.writeText(quizId);

      setCopiedQuizId(quizId);

      setTimeout(() => {
        setCopiedQuizId("");
      }, 2000);
    } catch {
      setError("Unable to copy Quiz ID.");
    }
  };

  const deleteQuiz = async quizId => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this quiz?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const token = sessionStorage.getItem("quizhub_token");

      await axios.delete(
        `http://localhost:5000/api/quizzes/${quizId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setQuizzes(prev =>
        prev.filter(quiz => quiz.quizId !== quizId)
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to delete quiz."
      );
    }
  };

  const deleteAccount = async () => {
    const confirmed = window.confirm(
      "Delete your QuizHub account permanently? This action cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    const finalConfirmation = window.confirm(
      "Your account will be deleted permanently. Continue?"
    );

    if (!finalConfirmation) {
      return;
    }

    setDeletingAccount(true);
    setError("");

    try {
      const token = sessionStorage.getItem("quizhub_token");

      await axios.delete(
        "http://localhost:5000/api/auth/delete-account",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      logout();
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to delete account."
      );

      setDeletingAccount(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const totalQuestions = quizzes.reduce(
    (total, quiz) =>
      total + (quiz.questions?.length || 0),
    0
  );

  const uniqueAttemptedQuizzes = new Set(
    attempts
      .map(attempt => attempt.quiz?.quizId)
      .filter(Boolean)
  ).size;

  if (loading) {
    return (
      <div className="min-h-screen bg-sky-100 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-slate-600 dark:text-slate-300 font-medium">
          Loading dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sky-100 dark:bg-slate-950 transition-colors">
      <header className="border-b border-sky-200/70 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2"
          >
            <div className="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center text-white font-bold text-lg">
              Q
            </div>

            <span className="text-xl font-bold text-slate-900 dark:text-white">
              QuizHub
            </span>
          </button>

          <div className="flex items-center gap-3">
            <ThemeToggle />

            <div className="hidden sm:block text-right">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {user?.name}
              </p>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                {user?.email}
              </p>
            </div>

            <button
              onClick={deleteAccount}
              disabled={deletingAccount}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 dark:border-red-900/50 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition disabled:opacity-60"
            >
              <Trash2 size={17} />

              <span className="hidden sm:inline">
                {deletingAccount
                  ? "Deleting..."
                  : "Delete Account"}
              </span>
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              <LogOut size={17} />

              <span className="hidden sm:inline">
                Logout
              </span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <p className="text-sm font-semibold text-sky-600 dark:text-sky-400 mb-1">
              Dashboard
            </p>

            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
              Welcome back,{" "}
              {user?.name?.split(" ")[0] || "there"}!
            </h1>

            <p className="mt-2 text-slate-500 dark:text-slate-400">
              Create quizzes, manage your quizzes and track your attempts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/join")}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-sky-300 dark:border-sky-700 bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-slate-800 font-semibold transition"
            >
              <Play size={19} />
              Join Quiz
            </button>

            <button
              onClick={() => navigate("/create-quiz")}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold transition shadow-sm"
            >
              <Plus size={19} />
              Create Quiz
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-sky-100 dark:border-slate-800 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Quizzes Created
                </p>

                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
                  {quizzes.length}
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-sky-100 dark:bg-sky-900/40 flex items-center justify-center text-sky-600 dark:text-sky-300">
                <FileQuestion size={21} />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-sky-100 dark:border-slate-800 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Total Questions
                </p>

                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
                  {totalQuestions}
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-sky-100 dark:bg-sky-900/40 flex items-center justify-center text-sky-600 dark:text-sky-300">
                <BarChart3 size={21} />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-sky-100 dark:border-slate-800 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Quizzes Attempted
                </p>

                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
                  {uniqueAttemptedQuizzes}
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-sky-100 dark:bg-sky-900/40 flex items-center justify-center text-sky-600 dark:text-sky-300">
                <Trophy size={21} />
              </div>
            </div>
          </div>
        </div>

        <section className="mb-10">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                My Quizzes
              </h2>

              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Manage the quizzes you created.
              </p>
            </div>

            {quizzes.length > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    scrollSection(quizScrollRef, -1)
                  }
                  aria-label="Previous quizzes"
                  className="w-10 h-10 rounded-xl border border-sky-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-slate-800 transition flex items-center justify-center"
                >
                  <ChevronLeft size={19} />
                </button>

                <button
                  onClick={() =>
                    scrollSection(quizScrollRef, 1)
                  }
                  aria-label="Next quizzes"
                  className="w-10 h-10 rounded-xl border border-sky-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-slate-800 transition flex items-center justify-center"
                >
                  <ChevronRight size={19} />
                </button>
              </div>
            )}
          </div>

          {quizzes.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-sky-100 dark:border-slate-800 rounded-2xl p-10 text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-sky-100 dark:bg-sky-900/40 flex items-center justify-center text-sky-600 dark:text-sky-300 mb-4">
                <FileQuestion size={25} />
              </div>

              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                No quizzes yet
              </h3>

              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-5">
                Create your first quiz and share it with others.
              </p>

              <button
                onClick={() => navigate("/create-quiz")}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold transition"
              >
                <Plus size={18} />
                Create Quiz
              </button>
            </div>
          ) : (
            <div
              ref={quizScrollRef}
              className="flex gap-5 overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-hide"
            >
              {quizzes.map(quiz => (
                <div
                  key={quiz.quizId}
                  className="shrink-0 w-[min(520px,calc(100vw-3rem))] snap-start bg-white dark:bg-slate-900 border border-sky-100 dark:border-slate-800 rounded-2xl p-6 hover:border-sky-300 dark:hover:border-slate-700 transition"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white truncate">
                        {quiz.title}
                      </h3>

                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                          Quiz ID
                        </span>

                        <span className="px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 text-xs font-bold tracking-wide">
                          {quiz.quizId}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        copyQuizId(quiz.quizId)
                      }
                      className="shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl border border-sky-200 dark:border-slate-700 text-sky-600 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-slate-800 text-sm font-semibold transition"
                    >
                      {copiedQuizId === quiz.quizId ? (
                        <>
                          <Check size={17} />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy size={17} />
                          Copy Quiz ID
                        </>
                      )}
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mt-5">
                    <div className="rounded-xl bg-slate-50 dark:bg-slate-800/70 p-3">
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        <FileQuestion size={16} />
                        <span className="text-xs">
                          Questions
                        </span>
                      </div>

                      <p className="mt-1 font-bold text-slate-900 dark:text-white">
                        {quiz.questions?.length || 0}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 dark:bg-slate-800/70 p-3">
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        <Clock3 size={16} />
                        <span className="text-xs">
                          Time
                        </span>
                      </div>

                      <p className="mt-1 font-bold text-slate-900 dark:text-white">
                        {quiz.timePerQuestion}s
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 dark:bg-slate-800/70 p-3">
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        <Users size={16} />
                        <span className="text-xs">
                          Participants
                        </span>
                      </div>

                      <p className="mt-1 font-bold text-slate-900 dark:text-white">
                        {quiz.participants?.length || 0}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <span
                      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold ${
                        quiz.allowRetakes
                          ? "bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                      }`}
                    >
                      {quiz.allowRetakes ? (
                        <RotateCcw size={15} />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-slate-400" />
                      )}

                      {quiz.allowRetakes
                        ? "Retakes allowed"
                        : "One attempt only"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-5">
                    <button
                      onClick={() =>
                        navigate(
                          `/edit-quiz/${quiz.quizId}`
                        )
                      }
                      className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold transition"
                    >
                      <Edit3 size={16} />
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        navigate(
                          `/leaderboard/${quiz.quizId}`
                        )
                      }
                      className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-sky-200 dark:border-slate-700 text-sky-600 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-slate-800 text-sm font-semibold transition"
                    >
                      <Trophy size={16} />
                      Leaderboard
                    </button>

                    <button
                      onClick={() =>
                        navigate(
                          `/analytics/${quiz.quizId}`
                        )
                      }
                      className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-sky-200 dark:border-slate-700 text-sky-600 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-slate-800 text-sm font-semibold transition"
                    >
                      <BarChart3 size={16} />
                      Analytics
                    </button>

                    <button
                      onClick={() =>
                        navigate(
                          `/quiz/${quiz.quizId}`
                        )
                      }
                      className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-semibold transition"
                    >
                      <Eye size={16} />
                      Preview
                    </button>

                    <button
                      onClick={() =>
                        deleteQuiz(quiz.quizId)
                      }
                      className="sm:col-span-4 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-red-200 dark:border-red-900/50 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-sm font-semibold transition"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mb-10">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                My Attempts
              </h2>

              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Your recent quiz attempts and results.
              </p>
            </div>

            {attempts.length > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    scrollSection(
                      attemptScrollRef,
                      -1
                    )
                  }
                  aria-label="Previous attempts"
                  className="w-10 h-10 rounded-xl border border-sky-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-slate-800 transition flex items-center justify-center"
                >
                  <ChevronLeft size={19} />
                </button>

                <button
                  onClick={() =>
                    scrollSection(
                      attemptScrollRef,
                      1
                    )
                  }
                  aria-label="Next attempts"
                  className="w-10 h-10 rounded-xl border border-sky-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-slate-800 transition flex items-center justify-center"
                >
                  <ChevronRight size={19} />
                </button>
              </div>
            )}
          </div>

          {attempts.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-sky-100 dark:border-slate-800 rounded-2xl p-8 text-center">
              <p className="text-slate-500 dark:text-slate-400">
                You haven't attempted any quizzes yet.
              </p>

              <button
                onClick={() => navigate("/join")}
                className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold transition"
              >
                <Play size={17} />
                Join a Quiz
              </button>
            </div>
          ) : (
            <div
              ref={attemptScrollRef}
              className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-hide"
            >
              {attempts.map(attempt => (
                <div
                  key={attempt._id}
                  className="shrink-0 w-[min(560px,calc(100vw-3rem))] snap-start bg-white dark:bg-slate-900 border border-sky-100 dark:border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                >
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 dark:text-white truncate">
                      {attempt.quiz?.title || "Quiz"}
                    </h3>

                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      Score: {attempt.score} /{" "}
                      {attempt.totalPoints}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 shrink-0">
                    <span className="px-3 py-1.5 rounded-full bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300 text-sm font-bold">
                      {attempt.totalPoints
                        ? Math.round(
                            (attempt.score /
                              attempt.totalPoints) *
                              100
                          )
                        : 0}
                      %
                    </span>

                    <button
                      onClick={() =>
                        navigate(
                          `/result/${attempt._id}`,
                          {
                            state: {
                              attemptId: attempt._id
                            }
                          }
                        )
                      }
                      className="px-4 py-2 rounded-xl border border-sky-200 dark:border-slate-700 text-sky-600 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-slate-800 text-sm font-semibold transition"
                    >
                      View Result
                    </button>

                    {attempt.quiz?.allowRetakes === true ? (
                      <button
                        onClick={() =>
                          navigate(
                            `/quiz/${attempt.quiz?.quizId}`
                          )
                        }
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold transition"
                      >
                        <RotateCcw size={16} />
                        Retake
                      </button>
                    ) : (
                      <span className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-sm font-semibold">
                        One attempt only
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Dashboard;