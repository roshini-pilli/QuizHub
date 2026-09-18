import { Link } from "react-router-dom";
import {
  ArrowRight,
  Moon,
  Sun,
  Sparkles,
  Users,
  Trophy
} from "lucide-react";

function Home({ darkMode, setDarkMode }) {
  return (
    <div className="min-h-screen bg-sky-200 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-white">
      <nav className="border-b border-sky-300 bg-white dark:border-slate-700 dark:bg-slate-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link to="/" className="text-2xl font-bold tracking-tight">
            Quiz<span className="text-sky-600 dark:text-sky-400">Hub</span>
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setDarkMode(!darkMode)}
              aria-label="Toggle theme"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-sky-200 bg-white text-slate-700 transition hover:bg-sky-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <Link
              to="/login"
              className="hidden rounded-xl px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-white/70 dark:text-slate-200 dark:hover:bg-slate-800 sm:block"
            >
              Log in
            </Link>

            <Link
              to="/signup"
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-sky-500 dark:text-white dark:hover:bg-sky-400"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main>
        <section className="mx-auto max-w-7xl px-6 pb-20 pt-20 lg:pb-28 lg:pt-28">
          <div className="grid items-center gap-14 lg:grid-cols-2">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-300 bg-white px-4 py-2 text-sm font-medium text-sky-700 shadow-sm dark:border-slate-600 dark:bg-slate-800 dark:text-sky-300">
                <Sparkles size={16} />
                Make learning more interactive
              </div>

              <h1 className="mt-7 max-w-2xl text-5xl font-bold leading-tight tracking-tight sm:text-6xl">
                Create. Play.
                <span className="block text-sky-700 dark:text-sky-400">
                  Challenge.
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-700 dark:text-slate-300">
                QuizHub makes it easy to create your own quizzes, invite
                friends, and see who comes out on top.
              </p>

              <div className="mt-9 flex flex-wrap gap-4">
                <Link
                  to="/create-quiz"
                  className="flex items-center gap-2 rounded-xl bg-sky-600 px-6 py-3.5 font-semibold text-white transition hover:bg-sky-700"
                >
                  Create a Quiz
                  <ArrowRight size={18} />
                </Link>

                <Link
                  to="/join"
                  className="flex items-center gap-2 rounded-xl border border-sky-300 bg-white px-6 py-3.5 font-semibold text-slate-800 transition hover:border-sky-500 hover:bg-sky-50 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:hover:border-sky-600 dark:hover:bg-slate-700"
                >
                  Join a Quiz
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="rounded-[2rem] border border-sky-300 bg-white p-6 shadow-xl shadow-sky-300/40 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/30">
                <div className="flex items-center justify-between border-b border-slate-200 pb-5 dark:border-slate-700">
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Live Quiz
                    </p>
                    <h2 className="mt-1 text-xl font-bold">
                      General Knowledge
                    </h2>
                  </div>

                  <div className="rounded-lg bg-sky-100 px-3 py-1.5 text-sm font-semibold text-sky-700 dark:bg-sky-900 dark:text-sky-300">
                    08:42
                  </div>
                </div>

                <div className="py-7">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Question 4 of 10
                  </p>

                  <h3 className="mt-3 text-2xl font-bold leading-snug">
                    Which planet is known as the Red Planet?
                  </h3>

                  <div className="mt-6 space-y-3">
                    {["Earth", "Mars", "Jupiter", "Venus"].map(
                      (option, index) => (
                        <div
                          key={option}
                          className={`flex items-center gap-4 rounded-xl border p-4 ${
                            index === 1
                              ? "border-sky-400 bg-sky-100 dark:border-sky-500 dark:bg-sky-900/50"
                              : "border-slate-200 dark:border-slate-700"
                          }`}
                        >
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-sm font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-200">
                            {String.fromCharCode(65 + index)}
                          </span>

                          <span className="font-medium">{option}</span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-sky-300 bg-white dark:border-slate-700 dark:bg-slate-900">
          <div className="mx-auto grid max-w-7xl gap-6 px-6 py-12 md:grid-cols-3">
            <div className="flex gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-600 dark:bg-sky-900 dark:text-sky-300">
                <Sparkles size={21} />
              </div>

              <div>
                <h3 className="font-semibold">Build your way</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
                  Create quizzes with different question types and custom
                  timing.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-600 dark:bg-sky-900 dark:text-sky-300">
                <Users size={21} />
              </div>

              <div>
                <h3 className="font-semibold">Play together</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
                  Share a quiz ID and compete with friends or classmates.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-600 dark:bg-sky-900 dark:text-sky-300">
                <Trophy size={21} />
              </div>

              <div>
                <h3 className="font-semibold">Track results</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
                  See your scores, attempts, and leaderboard performance.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Home;