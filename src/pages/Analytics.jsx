import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  BarChart3,
  Clock3,
  Target,
  Trophy,
  Users,
  TrendingUp
} from "lucide-react";
import ThemeToggle from "../components/ThemeToggle";

const Analytics = () => {
  const navigate = useNavigate();
  const { quizId } = useParams();

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = sessionStorage.getItem("quizhub_token");

        const response = await axios.get(
          `http://localhost:5000/api/attempts/analytics/${quizId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        setAnalytics(response.data.analytics);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load quiz analytics."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [quizId]);

  const formatTime = seconds => {
    if (!seconds || seconds <= 0) {
      return "0s";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes === 0) {
      return `${remainingSeconds}s`;
    }

    if (remainingSeconds === 0) {
      return `${minutes}m`;
    }

    return `${minutes}m ${remainingSeconds}s`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-sky-100 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-slate-600 dark:text-slate-300 font-medium">
          Loading analytics...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-sky-100 dark:bg-slate-950 transition-colors">
        <header className="border-b border-sky-200/70 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
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

            <ThemeToggle />
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-10">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-sky-600 dark:text-sky-300 font-semibold mb-6"
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </button>

          <div className="bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/50 rounded-2xl p-8">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Unable to load analytics
            </h1>

            <p className="mt-2 text-red-500 dark:text-red-300">
              {error}
            </p>
          </div>
        </main>
      </div>
    );
  }

  const maxAccuracy = Math.max(
    ...(analytics?.questionAnalytics || []).map(
      question => question.accuracy
    ),
    1
  );

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

          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-sky-600 dark:text-sky-300 hover:text-sky-700 dark:hover:text-sky-200 font-semibold transition mb-6"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>

        <div className="mb-8">
          <p className="text-sm font-semibold text-sky-600 dark:text-sky-400 mb-1">
            Creator Analytics
          </p>

          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
            {analytics?.quiz?.title || "Quiz Analytics"}
          </h1>

          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              Quiz ID
            </span>

            <span className="px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 text-xs font-bold tracking-wide">
              {analytics?.quiz?.quizId}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-900 border border-sky-100 dark:border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Attempts
                </p>

                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
                  {analytics?.totalAttempts || 0}
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-sky-100 dark:bg-sky-900/40 flex items-center justify-center text-sky-600 dark:text-sky-300">
                <BarChart3 size={21} />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-sky-100 dark:border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Participants
                </p>

                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
                  {analytics?.uniqueParticipants || 0}
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-sky-100 dark:bg-sky-900/40 flex items-center justify-center text-sky-600 dark:text-sky-300">
                <Users size={21} />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-sky-100 dark:border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Average Score
                </p>

                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
                  {analytics?.averagePercentage || 0}%
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-sky-100 dark:bg-sky-900/40 flex items-center justify-center text-sky-600 dark:text-sky-300">
                <Target size={21} />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-sky-100 dark:border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Highest Score
                </p>

                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
                  {analytics?.highestPercentage || 0}%
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-sky-100 dark:bg-sky-900/40 flex items-center justify-center text-sky-600 dark:text-sky-300">
                <Trophy size={21} />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-sky-100 dark:border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Average Time
                </p>

                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
                  {formatTime(analytics?.averageTime)}
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-sky-100 dark:bg-sky-900/40 flex items-center justify-center text-sky-600 dark:text-sky-300">
                <Clock3 size={21} />
              </div>
            </div>
          </div>
        </div>

        {analytics?.totalAttempts === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-sky-100 dark:border-slate-800 rounded-2xl p-10 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-sky-100 dark:bg-sky-900/40 flex items-center justify-center text-sky-600 dark:text-sky-300 mb-5">
              <TrendingUp size={28} />
            </div>

            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              No attempts yet
            </h2>

            <p className="max-w-lg mx-auto mt-2 text-slate-500 dark:text-slate-400">
              Once participants complete this quiz, their performance data will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <section className="bg-white dark:bg-slate-900 border border-sky-100 dark:border-slate-800 rounded-2xl p-6">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Score Distribution
                  </h2>

                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    How participants performed across score ranges.
                  </p>
                </div>

                <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-900/40 flex items-center justify-center text-sky-600 dark:text-sky-300">
                  <BarChart3 size={19} />
                </div>
              </div>

              <div className="space-y-5">
                {analytics.scoreDistribution.map(item => {
                  const percentage =
                    analytics.totalAttempts > 0
                      ? Math.round(
                          (item.count /
                            analytics.totalAttempts) *
                            100
                        )
                      : 0;

                  return (
                    <div key={item.range}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          {item.range}
                        </span>

                        <span className="text-sm text-slate-500 dark:text-slate-400">
                          {item.count}{" "}
                          {item.count === 1
                            ? "participant"
                            : "participants"}
                        </span>
                      </div>

                      <div className="h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-sky-500 transition-all"
                          style={{
                            width: `${percentage}%`
                          }}
                        />
                      </div>

                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                        {percentage}% of attempts
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="bg-white dark:bg-slate-900 border border-sky-100 dark:border-slate-800 rounded-2xl p-6">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Question Performance
                  </h2>

                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Accuracy across every question.
                  </p>
                </div>

                <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-900/40 flex items-center justify-center text-sky-600 dark:text-sky-300">
                  <Target size={19} />
                </div>
              </div>

              <div className="space-y-5">
                {analytics.questionAnalytics.map(question => (
                  <div key={question.questionId}>
                    <div className="flex items-center justify-between gap-4 mb-2">
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Question {question.questionNumber}
                      </span>

                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {question.accuracy}%
                      </span>
                    </div>

                    <div className="h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-sky-500 transition-all"
                        style={{
                          width: `${
                            (question.accuracy / maxAccuracy) * 100
                          }%`
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between mt-2 text-xs text-slate-400 dark:text-slate-500">
                      <span>
                        Avg. time:{" "}
                        {formatTime(question.averageTime)}
                      </span>

                      <span>
                        {question.pointsPossible} points
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
};

export default Analytics;