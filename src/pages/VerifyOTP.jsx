import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext.jsx";

function VerifyOTP({ darkMode, setDarkMode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { setAuthData } = useAuth();

  const email = location.state?.email || "";
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown(value => value - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (otp.length !== 6) {
      setError("Enter the 6-digit OTP.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/verify-otp",
        {
          email,
          otp
        }
      );

      setAuthData(response.data.token, response.data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to verify OTP."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email || cooldown > 0) return;

    setError("");
    setMessage("");
    setResending(true);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/resend-otp",
        {
          email
        }
      );

      setMessage(response.data.message);
      setOtp("");
      setCooldown(60);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to resend OTP."
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-sky-200 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-white">
      <nav className="border-b border-sky-300 bg-white dark:border-slate-700 dark:bg-slate-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link to="/" className="text-2xl font-bold tracking-tight">
            Quiz<span className="text-sky-600 dark:text-sky-400">Hub</span>
          </Link>

          <button
            onClick={() => setDarkMode(!darkMode)}
            aria-label="Toggle theme"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-sky-200 bg-white text-slate-700 transition hover:bg-sky-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </nav>

      <main className="flex min-h-[calc(100vh-81px)] items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <Link
            to="/signup"
            className="mb-6 inline-flex items-center gap-2 text-sm text-slate-600 transition hover:text-sky-700 dark:text-slate-400 dark:hover:text-sky-400"
          >
            <ArrowLeft size={16} />
            Back to signup
          </Link>

          <div className="rounded-3xl border border-sky-300 bg-white p-8 shadow-lg shadow-sky-300/30 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/30">
            <div className="mb-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-600 dark:bg-sky-900 dark:text-sky-300">
                <CheckCircle size={22} />
              </div>

              <h1 className="mt-6 text-3xl font-bold">
                Verify your email
              </h1>

              <p className="mt-2 text-slate-600 dark:text-slate-400">
                Enter the 6-digit code sent to{" "}
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {email || "your email"}
                </span>
                .
              </p>
            </div>

            {error && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
                {error}
              </div>
            )}

            {message && (
              <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-600 dark:border-green-900/50 dark:bg-green-950/30 dark:text-green-400">
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Verification Code
                </label>

                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={e =>
                    setOtp(e.target.value.replace(/\D/g, ""))
                  }
                  placeholder="Enter 6-digit OTP"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-center text-xl font-semibold tracking-[0.4em] outline-none transition placeholder:text-sm placeholder:tracking-normal placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-800 dark:focus:border-sky-500 dark:focus:ring-sky-900"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full rounded-xl bg-sky-600 px-5 py-3.5 font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Verifying..." : "Verify Email"}
              </button>
            </form>

            {email && (
              <div className="mt-5 text-center text-sm text-slate-600 dark:text-slate-400">
                Didn't receive the code?{" "}
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending || cooldown > 0}
                  className="font-semibold text-sky-700 hover:text-sky-800 disabled:cursor-not-allowed disabled:text-slate-400 dark:text-sky-400 dark:hover:text-sky-300 dark:disabled:text-slate-600"
                >
                  {resending
                    ? "Sending..."
                    : cooldown > 0
                      ? `Resend in ${cooldown}s`
                      : "Resend OTP"}
                </button>
              </div>
            )}

            {!email && (
              <p className="mt-5 text-center text-sm text-red-500">
                Please start the signup process again.
              </p>
            )}

            <p className="mt-7 text-center text-sm text-slate-600 dark:text-slate-400">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-sky-700 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-300"
              >
                Log in
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default VerifyOTP;