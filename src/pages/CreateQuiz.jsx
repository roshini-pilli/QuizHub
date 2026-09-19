import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  Copy,
  Plus,
  Trash2,
  X
} from "lucide-react";
import axios from "axios";

const createQuestion = () => ({
  type: "single",
  question: "",
  options: ["", "", "", ""],
  correctAnswer: "",
  points: 10
});

function CreateQuiz({ darkMode, setDarkMode }) {
  const navigate = useNavigate();
  const errorRef = useRef(null);

  const [title, setTitle] = useState("");
  const [timePerQuestion, setTimePerQuestion] = useState(20);
  const [readingTime, setReadingTime] = useState(10);
  const [allowRetakes, setAllowRetakes] = useState(true);
  const [questions, setQuestions] = useState([createQuestion()]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [createdQuiz, setCreatedQuiz] = useState(null);
  const [copied, setCopied] = useState(false);

  const showError = message => {
    setError(message);

    setTimeout(() => {
      errorRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }, 0);
  };

  const updateQuestion = (index, field, value) => {
    setQuestions(previous => {
      const updated = [...previous];

      updated[index] = {
        ...updated[index],
        [field]: value
      };

      return updated;
    });
  };

  const updateQuestionType = (index, type) => {
    setQuestions(previous => {
      const updated = [...previous];

      updated[index] = {
        ...updated[index],
        type,
        options:
          type === "true_false"
            ? ["true", "false"]
            : type === "fill"
              ? []
              : ["", "", "", ""],
        correctAnswer:
          type === "multiple"
            ? [""]
            : ""
      };

      return updated;
    });
  };

  const updateOption = (questionIndex, optionIndex, value) => {
    setQuestions(previous => {
      const updated = [...previous];
      const question = updated[questionIndex];
      const options = [...question.options];
      const oldOption = options[optionIndex];

      options[optionIndex] = value;

      let correctAnswer = question.correctAnswer;

      if (
        question.type === "single" &&
        correctAnswer === oldOption
      ) {
        correctAnswer = value;
      }

      if (question.type === "multiple") {
        correctAnswer = Array.isArray(question.correctAnswer)
          ? question.correctAnswer.map(answer =>
              answer === oldOption ? value : answer
            )
          : [""];
      }

      updated[questionIndex] = {
        ...question,
        options,
        correctAnswer
      };

      return updated;
    });
  };

  const addOption = questionIndex => {
    setQuestions(previous => {
      const updated = [...previous];
      const question = updated[questionIndex];

      if (question.options.length >= 6) {
        return previous;
      }

      updated[questionIndex] = {
        ...question,
        options: [...question.options, ""]
      };

      return updated;
    });
  };

  const removeOption = (questionIndex, optionIndex) => {
    setQuestions(previous => {
      const updated = [...previous];
      const question = updated[questionIndex];

      if (question.options.length <= 2) {
        return previous;
      }

      const removedOption = question.options[optionIndex];

      const options = question.options.filter(
        (_, index) => index !== optionIndex
      );

      let correctAnswer = question.correctAnswer;

      if (question.type === "single") {
        if (correctAnswer === removedOption) {
          correctAnswer = "";
        }
      }

      if (question.type === "multiple") {
        correctAnswer = Array.isArray(question.correctAnswer)
          ? question.correctAnswer.filter(
              answer => answer !== removedOption
            )
          : [""];
        
        if (correctAnswer.length === 0) {
          correctAnswer = [""];
        }
      }

      updated[questionIndex] = {
        ...question,
        options,
        correctAnswer
      };

      return updated;
    });
  };

  const updateMultipleCorrectAnswer = (
    questionIndex,
    answerIndex,
    value
  ) => {
    setQuestions(previous => {
      const updated = [...previous];

      const answers = Array.isArray(
        updated[questionIndex].correctAnswer
      )
        ? [...updated[questionIndex].correctAnswer]
        : [""];

      answers[answerIndex] = value;

      updated[questionIndex] = {
        ...updated[questionIndex],
        correctAnswer: answers
      };

      return updated;
    });
  };

  const addMultipleCorrectAnswer = questionIndex => {
    setQuestions(previous => {
      const updated = [...previous];

      const currentAnswers = Array.isArray(
        updated[questionIndex].correctAnswer
      )
        ? updated[questionIndex].correctAnswer
        : [];

      if (currentAnswers.length >= 6) {
        return previous;
      }

      updated[questionIndex] = {
        ...updated[questionIndex],
        correctAnswer: [...currentAnswers, ""]
      };

      return updated;
    });
  };

  const removeMultipleCorrectAnswer = (
    questionIndex,
    answerIndex
  ) => {
    setQuestions(previous => {
      const updated = [...previous];

      const currentAnswers = Array.isArray(
        updated[questionIndex].correctAnswer
      )
        ? updated[questionIndex].correctAnswer
        : [];

      if (currentAnswers.length <= 1) {
        return previous;
      }

      updated[questionIndex] = {
        ...updated[questionIndex],
        correctAnswer: currentAnswers.filter(
          (_, index) => index !== answerIndex
        )
      };

      return updated;
    });
  };

  const addQuestion = () => {
    setQuestions(previous => [
      ...previous,
      createQuestion()
    ]);
  };

  const removeQuestion = index => {
    if (questions.length === 1) return;

    setQuestions(previous =>
      previous.filter(
        (_, questionIndex) => questionIndex !== index
      )
    );
  };

  const handleArrowNavigation = e => {
    if (
      e.key !== "ArrowDown" &&
      e.key !== "ArrowUp"
    ) {
      return;
    }

    const current = e.currentTarget;

    const section = current.closest(
      "[data-question-section]"
    );

    if (!section) return;

    const fields = Array.from(
      section.querySelectorAll("[data-quiz-field]")
    );

    const currentIndex = fields.indexOf(current);

    if (currentIndex === -1) return;

    e.preventDefault();

    if (e.key === "ArrowDown") {
      if (currentIndex < fields.length - 1) {
        fields[currentIndex + 1].focus();
        return;
      }

      const nextSection =
        section.nextElementSibling;

      const nextQuestion =
        nextSection?.querySelector(
          "[data-quiz-field]"
        );

      if (nextQuestion) {
        nextQuestion.focus();
      }
    }

    if (e.key === "ArrowUp") {
      if (currentIndex > 0) {
        fields[currentIndex - 1].focus();
        return;
      }

      const previousSection =
        section.previousElementSibling;

      const previousFields = previousSection
        ? Array.from(
            previousSection.querySelectorAll(
              "[data-quiz-field]"
            )
          )
        : [];

      if (previousFields.length > 0) {
        previousFields[
          previousFields.length - 1
        ].focus();
      }
    }
  };

  const copyCreatedQuizId = async () => {
    try {
      await navigator.clipboard.writeText(
        createdQuiz.quizId
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      setError("Unable to copy Quiz ID.");
    }
  };

  const handleCreateQuiz = async e => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      showError("Please enter a quiz title.");
      return;
    }

    const quizTime = Number(timePerQuestion);
    const quizReadingTime = Number(readingTime);

    if (
      !Number.isFinite(quizTime) ||
      quizTime < 1
    ) {
      showError(
        "Time per question must be at least 1 second."
      );
      return;
    }

    if (
      !Number.isFinite(quizReadingTime) ||
      quizReadingTime < 0
    ) {
      showError(
        "Reading time cannot be negative."
      );
      return;
    }

    const formattedQuestions = [];

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];

      if (!question.question.trim()) {
        showError(
          `Please enter question ${i + 1}.`
        );
        return;
      }

      const points = Number(question.points);

      if (
        !Number.isFinite(points) ||
        points < 1
      ) {
        showError(
          `Points for question ${i + 1} must be at least 1.`
        );
        return;
      }

      if (
        question.type === "single" ||
        question.type === "multiple"
      ) {
        if (question.options.length < 2) {
          showError(
            `Question ${i + 1} must have at least 2 options.`
          );
          return;
        }

        if (
          question.options.some(
            option => !option.trim()
          )
        ) {
          showError(
            `Please fill all options for question ${i + 1}.`
          );
          return;
        }

        const trimmedOptions =
          question.options.map(option =>
            option.trim()
          );

        if (
          new Set(trimmedOptions).size !==
          trimmedOptions.length
        ) {
          showError(
            `Options must be unique for question ${i + 1}.`
          );
          return;
        }
      }

      if (question.type === "single") {
        const correctAnswer =
          String(
            question.correctAnswer
          ).trim();

        if (!correctAnswer) {
          showError(
            `Please select the correct answer for question ${i + 1}.`
          );
          return;
        }

        const options =
          question.options.map(option =>
            option.trim()
          );

        if (!options.includes(correctAnswer)) {
          showError(
            `Correct answer for question ${i + 1} must match one of the options.`
          );
          return;
        }

        formattedQuestions.push({
          type: "single",
          question:
            question.question.trim(),
          options,
          correctAnswer,
          points
        });

        continue;
      }

      if (question.type === "multiple") {
        const correctAnswers =
          Array.isArray(
            question.correctAnswer
          )
            ? question.correctAnswer
                .map(answer =>
                  String(answer).trim()
                )
                .filter(Boolean)
            : [];

        if (correctAnswers.length === 0) {
          showError(
            `Please select at least one correct answer for question ${i + 1}.`
          );
          return;
        }

        if (
          correctAnswers.length !==
          new Set(correctAnswers).size
        ) {
          showError(
            `Please select each correct answer only once for question ${i + 1}.`
          );
          return;
        }

        const options =
          question.options.map(option =>
            option.trim()
          );

        const invalidAnswer =
          correctAnswers.some(
            answer => !options.includes(answer)
          );

        if (invalidAnswer) {
          showError(
            `Please select valid options for the correct answers in question ${i + 1}.`
          );
          return;
        }

        formattedQuestions.push({
          type: "multiple",
          question:
            question.question.trim(),
          options,
          correctAnswer:
            correctAnswers,
          points
        });

        continue;
      }

      if (question.type === "true_false") {
        if (
          question.correctAnswer !== "true" &&
          question.correctAnswer !== "false"
        ) {
          showError(
            `Please select True or False for question ${i + 1}.`
          );
          return;
        }

        formattedQuestions.push({
          type: "true_false",
          question:
            question.question.trim(),
          options: ["true", "false"],
          correctAnswer:
            question.correctAnswer,
          points
        });

        continue;
      }

      if (question.type === "fill") {
        const correctAnswer =
          String(
            question.correctAnswer
          ).trim();

        if (!correctAnswer) {
          showError(
            `Please enter the correct answer for question ${i + 1}.`
          );
          return;
        }

        formattedQuestions.push({
          type: "fill",
          question:
            question.question.trim(),
          options: [],
          correctAnswer,
          points
        });
      }
    }

    try {
      setLoading(true);

      const token =
        sessionStorage.getItem(
          "quizhub_token"
        );

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/quizzes/create`,
        {
          title: title.trim(),
          timePerQuestion: quizTime,
          readingTime: quizReadingTime,
          allowRetakes,
          questions: formattedQuestions
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setCreatedQuiz(response.data.quiz);
    } catch (err) {
      showError(
        err.response?.data?.message ||
          "Unable to create quiz."
      );
    } finally {
      setLoading(false);
    }
  };

  if (createdQuiz) {
    return (
      <div className="min-h-screen bg-sky-200 text-slate-900 dark:bg-slate-950 dark:text-white">
        <header className="border-b border-sky-300 bg-white dark:border-slate-700 dark:bg-slate-900">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
            <Link
              to="/dashboard"
              className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-sky-600 dark:text-slate-300 dark:hover:text-sky-400"
            >
              <ArrowLeft size={17} />
              Dashboard
            </Link>

            <button
              onClick={() =>
                setDarkMode(!darkMode)
              }
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              {darkMode ? "Light" : "Dark"}
            </button>
          </div>
        </header>

        <main className="flex min-h-[calc(100vh-81px)] items-center justify-center px-6 py-10">
          <section className="w-full max-w-lg rounded-[2rem] border border-sky-300 bg-white p-8 text-center shadow-xl shadow-sky-300/20 dark:border-slate-700 dark:bg-slate-900">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-100 text-sky-600 dark:bg-sky-900 dark:text-sky-300">
              {copied ? (
                <Check size={28} />
              ) : (
                <Copy size={28} />
              )}
            </div>

            <p className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-sky-600 dark:text-sky-400">
              Quiz Created
            </p>

            <h1 className="mt-2 text-3xl font-bold">
              {createdQuiz.title}
            </h1>

            <p className="mt-3 text-slate-500 dark:text-slate-400">
              Share this Quiz ID with participants.
            </p>

            <div className="mt-7 rounded-2xl bg-sky-50 p-5 dark:bg-slate-800">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Quiz ID
              </p>

              <p className="mt-2 text-3xl font-black tracking-widest text-sky-600 dark:text-sky-400">
                {createdQuiz.quizId}
              </p>
            </div>

            <button
              onClick={copyCreatedQuizId}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-sky-300 bg-white px-5 py-3 font-semibold text-sky-700 hover:bg-sky-50 dark:border-slate-600 dark:bg-slate-800 dark:text-sky-300 dark:hover:bg-slate-700"
            >
              {copied ? (
                <>
                  <Check size={18} />
                  Copied!
                </>
              ) : (
                <>
                  <Copy size={18} />
                  Copy Quiz ID
                </>
              )}
            </button>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <button
                onClick={() =>
                  navigate(
                    `/quiz/${createdQuiz.quizId}`
                  )
                }
                className="rounded-xl bg-sky-600 px-5 py-3 font-semibold text-white hover:bg-sky-700"
              >
                Preview Quiz
              </button>

              <Link
                to="/dashboard"
                className="rounded-xl border border-slate-200 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Dashboard
              </Link>
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sky-200 text-slate-900 dark:bg-slate-950 dark:text-white">
      <header className="border-b border-sky-300 bg-white dark:border-slate-700 dark:bg-slate-900">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-sky-600 dark:text-slate-300 dark:hover:text-sky-400"
          >
            <ArrowLeft size={17} />
            Dashboard
          </Link>

          <h1 className="text-xl font-bold">
            Create Quiz
          </h1>

          <button
            onClick={() =>
              setDarkMode(!darkMode)
            }
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            {darkMode ? "Light" : "Dark"}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <form onSubmit={handleCreateQuiz}>
          {error && (
            <div
              ref={errorRef}
              className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-600 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400"
            >
              {error}
            </div>
          )}

          <section className="rounded-[2rem] border border-sky-300 bg-white p-7 shadow-lg shadow-sky-300/20 dark:border-slate-700 dark:bg-slate-900">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600 dark:text-sky-400">
              Quiz Details
            </p>

            <div className="mt-6">
              <label className="text-sm font-semibold">
                Quiz Title
              </label>

              <input
                value={title}
                onChange={e =>
                  setTitle(e.target.value)
                }
                placeholder="e.g. General Knowledge Challenge"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-sky-500 dark:border-slate-700 dark:bg-slate-800"
              />
            </div>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div>
                <label className="text-sm font-semibold">
                  Time per Question
                </label>

                <div className="relative mt-2">
                  <input
                    type="number"
                    min="1"
                    value={timePerQuestion}
                    onChange={e =>
                      setTimePerQuestion(
                        e.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 outline-none focus:border-sky-500 dark:border-slate-700 dark:bg-slate-800"
                  />

                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                    sec
                  </span>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold">
                  Reading Time
                </label>

                <div className="relative mt-2">
                  <input
                    type="number"
                    min="0"
                    value={readingTime}
                    onChange={e =>
                      setReadingTime(
                        e.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 outline-none focus:border-sky-500 dark:border-slate-700 dark:bg-slate-800"
                  />

                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                    sec
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5">
              <label className="text-sm font-semibold">
                Allow Retakes
              </label>

              <div className="mt-2 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setAllowRetakes(true)
                  }
                  className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                    allowRetakes
                      ? "border-sky-500 bg-sky-50 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300"
                      : "border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
                  }`}
                >
                  Yes, allow retakes
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setAllowRetakes(false)
                  }
                  className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                    !allowRetakes
                      ? "border-sky-500 bg-sky-50 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300"
                      : "border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
                  }`}
                >
                  No, one attempt only
                </button>
              </div>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Choose whether participants can take this quiz more than once.
              </p>
            </div>
          </section>

          <div className="mt-8 space-y-6">
            {questions.map(
              (question, questionIndex) => (
                <section
                  key={questionIndex}
                  data-question-section
                  className="rounded-[2rem] border border-sky-300 bg-white p-7 shadow-sm dark:border-slate-700 dark:bg-slate-900"
                >
                  <div className="flex items-center justify-between gap-4">
                    <h2 className="text-xl font-bold">
                      Question {questionIndex + 1}
                    </h2>

                    <button
                      type="button"
                      onClick={() =>
                        removeQuestion(
                          questionIndex
                        )
                      }
                      disabled={
                        questions.length === 1
                      }
                      className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-red-950/30"
                    >
                      <Trash2 size={17} />
                      Remove
                    </button>
                  </div>

                  <div className="mt-5">
                    <label className="text-sm font-semibold">
                      Question
                    </label>

                    <textarea
                      data-quiz-field
                      value={question.question}
                      onChange={e =>
                        updateQuestion(
                          questionIndex,
                          "question",
                          e.target.value
                        )
                      }
                      onKeyDown={
                        handleArrowNavigation
                      }
                      rows="3"
                      placeholder="Enter your question..."
                      className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-sky-500 dark:border-slate-700 dark:bg-slate-800"
                    />
                  </div>

                  <div className="mt-5 grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="text-sm font-semibold">
                        Question Type
                      </label>

                      <select
                        value={question.type}
                        onChange={e =>
                          updateQuestionType(
                            questionIndex,
                            e.target.value
                          )
                        }
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none dark:border-slate-700 dark:bg-slate-800"
                      >
                        <option value="single">
                          Single Choice
                        </option>

                        <option value="multiple">
                          Multiple Choice
                        </option>

                        <option value="true_false">
                          True / False
                        </option>

                        <option value="fill">
                          Fill in the Blank
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-semibold">
                        Points
                      </label>

                      <input
                        type="number"
                        min="1"
                        value={question.points}
                        onChange={e =>
                          updateQuestion(
                            questionIndex,
                            "points",
                            e.target.value
                          )
                        }
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-sky-500 dark:border-slate-700 dark:bg-slate-800"
                      />
                    </div>
                  </div>

                  {question.type === "fill" ? (
                    <div className="mt-5">
                      <label className="text-sm font-semibold">
                        Correct Answer
                      </label>

                      <input
                        data-quiz-field
                        value={
                          question.correctAnswer
                        }
                        onChange={e =>
                          updateQuestion(
                            questionIndex,
                            "correctAnswer",
                            e.target.value
                          )
                        }
                        onKeyDown={
                          handleArrowNavigation
                        }
                        placeholder="Enter the correct answer..."
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-sky-500 dark:border-slate-700 dark:bg-slate-800"
                      />
                    </div>
                  ) : question.type ===
                    "true_false" ? (
                    <div className="mt-5">
                      <label className="text-sm font-semibold">
                        Correct Answer
                      </label>

                      <div className="mt-3 grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuestion(
                              questionIndex,
                              "correctAnswer",
                              "true"
                            )
                          }
                          className={`rounded-xl border px-4 py-3 font-semibold transition ${
                            question.correctAnswer ===
                            "true"
                              ? "border-sky-500 bg-sky-50 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300"
                              : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                          }`}
                        >
                          True
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            updateQuestion(
                              questionIndex,
                              "correctAnswer",
                              "false"
                            )
                          }
                          className={`rounded-xl border px-4 py-3 font-semibold transition ${
                            question.correctAnswer ===
                            "false"
                              ? "border-sky-500 bg-sky-50 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300"
                              : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                          }`}
                        >
                          False
                        </button>
                      </div>

                      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                        Participants will see True and False as the answer choices.
                      </p>
                    </div>
                  ) : (
                    <div className="mt-5">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-semibold">
                          Options
                        </label>

                        <span className="text-xs font-medium text-slate-400">
                          {question.options.length}/6 options
                        </span>
                      </div>

                      <div className="mt-3 grid gap-3">
                        {question.options.map(
                          (
                            option,
                            optionIndex
                          ) => (
                            <div
                              key={
                                optionIndex
                              }
                              className="flex items-center gap-3"
                            >
                              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-100 font-bold text-sky-700 dark:bg-sky-900 dark:text-sky-300">
                                {String.fromCharCode(
                                  65 +
                                    optionIndex
                                )}
                              </span>

                              <input
                                data-quiz-field
                                value={option}
                                onChange={e =>
                                  updateOption(
                                    questionIndex,
                                    optionIndex,
                                    e.target.value
                                  )
                                }
                                onKeyDown={
                                  handleArrowNavigation
                                }
                                placeholder={`Option ${
                                  optionIndex +
                                  1
                                }`}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-sky-500 dark:border-slate-700 dark:bg-slate-800"
                              />

                              <button
                                type="button"
                                onClick={() =>
                                  removeOption(
                                    questionIndex,
                                    optionIndex
                                  )
                                }
                                disabled={
                                  question.options
                                    .length <= 2
                                }
                                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-500 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-30 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400"
                                aria-label={`Remove option ${
                                  optionIndex + 1
                                }`}
                              >
                                <Trash2 size={17} />
                              </button>
                            </div>
                          )
                        )}
                      </div>

                      {question.options.length <
                        6 && (
                        <button
                          type="button"
                          onClick={() =>
                            addOption(
                              questionIndex
                            )
                          }
                          className="mt-3 flex items-center gap-2 rounded-xl border border-sky-300 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-700 hover:bg-sky-100 dark:border-slate-600 dark:bg-slate-800 dark:text-sky-300 dark:hover:bg-slate-700"
                        >
                          <Plus size={17} />
                          Add Option
                        </button>
                      )}

                      <div className="mt-5">
                        <label className="text-sm font-semibold">
                          {question.type ===
                          "multiple"
                            ? "Correct Answers"
                            : "Correct Answer"}
                        </label>

                        {question.type ===
                        "multiple" ? (
                          <div className="mt-3 space-y-3">
                            {(Array.isArray(
                              question.correctAnswer
                            )
                              ? question.correctAnswer
                              : [""]
                            ).map(
                              (
                                answer,
                                answerIndex
                              ) => {
                                const selectedByOthers =
                                  Array.isArray(
                                    question.correctAnswer
                                  )
                                    ? question.correctAnswer.filter(
                                        (
                                          _,
                                          index
                                        ) =>
                                          index !==
                                          answerIndex
                                      )
                                    : [];

                                return (
                                  <div
                                    key={
                                      answerIndex
                                    }
                                    className="flex items-center gap-3"
                                  >
                                    <select
                                      data-quiz-field
                                      value={
                                        answer
                                      }
                                      onChange={e =>
                                        updateMultipleCorrectAnswer(
                                          questionIndex,
                                          answerIndex,
                                          e.target.value
                                        )
                                      }
                                      onKeyDown={
                                        handleArrowNavigation
                                      }
                                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-sky-500 dark:border-slate-700 dark:bg-slate-800"
                                    >
                                      <option value="">
                                        Select correct option
                                      </option>

                                      {question.options.map(
                                        (
                                          option,
                                          optionIndex
                                        ) => (
                                          <option
                                            key={
                                              optionIndex
                                            }
                                            value={
                                              option
                                            }
                                            disabled={
                                              !option.trim() ||
                                              selectedByOthers.includes(
                                                option
                                              )
                                            }
                                          >
                                            {option ||
                                              `Option ${
                                                optionIndex +
                                                1
                                              }`}
                                          </option>
                                        )
                                      )}
                                    </select>

                                    {Array.isArray(
                                      question.correctAnswer
                                    ) &&
                                      question
                                        .correctAnswer
                                        .length >
                                        1 && (
                                        <button
                                          type="button"
                                          onClick={() =>
                                            removeMultipleCorrectAnswer(
                                              questionIndex,
                                              answerIndex
                                            )
                                          }
                                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-500 hover:bg-red-100 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400"
                                        >
                                          <X
                                            size={
                                              17
                                            }
                                          />
                                        </button>
                                      )}
                                  </div>
                                );
                              }
                            )}

                            {Array.isArray(
                              question.correctAnswer
                            ) &&
                              question
                                .correctAnswer
                                .length < 6 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    addMultipleCorrectAnswer(
                                      questionIndex
                                    )
                                  }
                                  className="flex items-center gap-2 rounded-xl border border-sky-300 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-700 hover:bg-sky-100 dark:border-slate-600 dark:bg-slate-800 dark:text-sky-300 dark:hover:bg-slate-700"
                                >
                                  <Plus size={17} />
                                  Add another correct answer
                                </button>
                              )}

                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              Select every option that is correct.
                            </p>
                          </div>
                        ) : (
                          <select
                            data-quiz-field
                            value={
                              question.correctAnswer
                            }
                            onChange={e =>
                              updateQuestion(
                                questionIndex,
                                "correctAnswer",
                                e.target.value
                              )
                            }
                            onKeyDown={
                              handleArrowNavigation
                            }
                            className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-sky-500 dark:border-slate-700 dark:bg-slate-800"
                          >
                            <option value="">
                              Select correct answer
                            </option>

                            {question.options.map(
                              (
                                option,
                                optionIndex
                              ) => (
                                <option
                                  key={
                                    optionIndex
                                  }
                                  value={option}
                                  disabled={!option.trim()}
                                >
                                  {option ||
                                    `Option ${
                                      optionIndex +
                                      1
                                    }`}
                                </option>
                              )
                            )}
                          </select>
                        )}
                      </div>
                    </div>
                  )}
                </section>
              )
            )}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={addQuestion}
              className="flex items-center justify-center gap-2 rounded-xl border border-sky-300 bg-white px-5 py-3 font-semibold text-sky-700 hover:bg-sky-50 dark:border-slate-600 dark:bg-slate-900 dark:text-sky-300 dark:hover:bg-slate-800"
            >
              <Plus size={18} />
              Add Question
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-sky-600 px-7 py-3 font-semibold text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Creating..."
                : "Create Quiz"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default CreateQuiz;