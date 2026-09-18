import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Save,
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

function EditQuiz() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const errorRef = useRef(null);

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const token = sessionStorage.getItem("quizhub_token");

        const response = await axios.get(
          `http://localhost:5000/api/quizzes/mine/${quizId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const loadedQuiz = response.data.quiz;

        setQuiz({
          ...loadedQuiz,
          allowRetakes: loadedQuiz.allowRetakes ?? true,
          questions: loadedQuiz.questions.map(question => ({
            ...question,
            options:
              question.type === "true_false"
                ? ["true", "false"]
                : question.type === "fill"
                  ? []
                  : question.options || [],
            correctAnswer:
              question.type === "multiple"
                ? Array.isArray(question.correctAnswer)
                  ? question.correctAnswer
                  : []
                : question.correctAnswer || "",
            points: question.points ?? 10
          }))
        });
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load quiz."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId]);

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
    setQuiz(previous => {
      const questions = [...previous.questions];

      questions[index] = {
        ...questions[index],
        [field]: value
      };

      return {
        ...previous,
        questions
      };
    });
  };

  const updateQuestionType = (index, type) => {
    setQuiz(previous => {
      const questions = [...previous.questions];

      questions[index] = {
        ...questions[index],
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

      return {
        ...previous,
        questions
      };
    });
  };

  const updateOption = (questionIndex, optionIndex, value) => {
    setQuiz(previous => {
      const questions = [...previous.questions];
      const question = questions[questionIndex];

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
        correctAnswer = Array.isArray(correctAnswer)
          ? correctAnswer.map(answer =>
              answer === oldOption ? value : answer
            )
          : [""];
      }

      questions[questionIndex] = {
        ...question,
        options,
        correctAnswer
      };

      return {
        ...previous,
        questions
      };
    });
  };

  const updateMultipleCorrectAnswer = (
    questionIndex,
    answerIndex,
    value
  ) => {
    setQuiz(previous => {
      const questions = [...previous.questions];

      const answers = Array.isArray(
        questions[questionIndex].correctAnswer
      )
        ? [...questions[questionIndex].correctAnswer]
        : [""];

      answers[answerIndex] = value;

      questions[questionIndex] = {
        ...questions[questionIndex],
        correctAnswer: answers
      };

      return {
        ...previous,
        questions
      };
    });
  };

  const addMultipleCorrectAnswer = questionIndex => {
    setQuiz(previous => {
      const questions = [...previous.questions];

      const currentAnswers = Array.isArray(
        questions[questionIndex].correctAnswer
      )
        ? questions[questionIndex].correctAnswer
        : [];

      if (currentAnswers.length >= 4) {
        return previous;
      }

      questions[questionIndex] = {
        ...questions[questionIndex],
        correctAnswer: [...currentAnswers, ""]
      };

      return {
        ...previous,
        questions
      };
    });
  };

  const removeMultipleCorrectAnswer = (
    questionIndex,
    answerIndex
  ) => {
    setQuiz(previous => {
      const questions = [...previous.questions];

      const currentAnswers = Array.isArray(
        questions[questionIndex].correctAnswer
      )
        ? questions[questionIndex].correctAnswer
        : [];

      if (currentAnswers.length <= 1) {
        return previous;
      }

      questions[questionIndex] = {
        ...questions[questionIndex],
        correctAnswer: currentAnswers.filter(
          (_, index) => index !== answerIndex
        )
      };

      return {
        ...previous,
        questions
      };
    });
  };

  const addQuestion = () => {
    setQuiz(previous => ({
      ...previous,
      questions: [
        ...previous.questions,
        createQuestion()
      ]
    }));
  };

  const removeQuestion = index => {
    if (quiz.questions.length === 1) return;

    setQuiz(previous => ({
      ...previous,
      questions: previous.questions.filter(
        (_, questionIndex) => questionIndex !== index
      )
    }));
  };

  const handleArrowNavigation = e => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") {
      return;
    }

    const current = e.currentTarget;
    const section = current.closest("[data-question-section]");

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
        nextSection?.querySelector("[data-quiz-field]");

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
            previousSection.querySelectorAll("[data-quiz-field]")
          )
        : [];

      if (previousFields.length > 0) {
        previousFields[previousFields.length - 1].focus();
      }
    }
  };

  const saveQuiz = async () => {
    setError("");

    if (!quiz.title.trim()) {
      showError("Please enter a quiz title.");
      return;
    }

    const timePerQuestion = Number(
      quiz.timePerQuestion
    );

    const readingTime = Number(quiz.readingTime);

    if (
      !Number.isFinite(timePerQuestion) ||
      timePerQuestion < 1
    ) {
      showError(
        "Time per question must be at least 1 second."
      );
      return;
    }

    if (
      !Number.isFinite(readingTime) ||
      readingTime < 0
    ) {
      showError(
        "Reading time cannot be negative."
      );
      return;
    }

    const formattedQuestions = [];

    for (let i = 0; i < quiz.questions.length; i++) {
      const question = quiz.questions[i];

      if (!question.question?.trim()) {
        showError(`Please enter question ${i + 1}.`);
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
        if (
          !Array.isArray(question.options) ||
          question.options.length < 2
        ) {
          showError(
            `Question ${i + 1} must have at least 2 options.`
          );
          return;
        }

        const options = question.options.map(option =>
          String(option).trim()
        );

        if (options.some(option => !option)) {
          showError(
            `Please fill all options for question ${i + 1}.`
          );
          return;
        }

        if (
          new Set(options).size !==
          options.length
        ) {
          showError(
            `Options must be unique for question ${i + 1}.`
          );
          return;
        }

        if (question.type === "single") {
          const correctAnswer =
            String(question.correctAnswer || "").trim();

          if (!correctAnswer) {
            showError(
              `Please select the correct answer for question ${i + 1}.`
            );
            return;
          }

          if (!options.includes(correctAnswer)) {
            showError(
              `Correct answer for question ${i + 1} must match one of the options.`
            );
            return;
          }

          formattedQuestions.push({
            type: "single",
            question: question.question.trim(),
            options,
            correctAnswer,
            points
          });

          continue;
        }

        const correctAnswers = Array.isArray(
          question.correctAnswer
        )
          ? question.correctAnswer
              .map(answer => String(answer).trim())
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

        if (
          correctAnswers.some(
            answer => !options.includes(answer)
          )
        ) {
          showError(
            `Please select valid options for the correct answers in question ${i + 1}.`
          );
          return;
        }

        formattedQuestions.push({
          type: "multiple",
          question: question.question.trim(),
          options,
          correctAnswer: correctAnswers,
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
          question: question.question.trim(),
          options: ["true", "false"],
          correctAnswer: question.correctAnswer,
          points
        });

        continue;
      }

      if (question.type === "fill") {
        const correctAnswer =
          String(question.correctAnswer || "").trim();

        if (!correctAnswer) {
          showError(
            `Please enter the correct answer for question ${i + 1}.`
          );
          return;
        }

        formattedQuestions.push({
          type: "fill",
          question: question.question.trim(),
          options: [],
          correctAnswer,
          points
        });

        continue;
      }

      showError(
        `Invalid question type for question ${i + 1}.`
      );
      return;
    }

    try {
      setSaving(true);

      const token = sessionStorage.getItem("quizhub_token");

      await axios.put(
        `http://localhost:5000/api/quizzes/${quizId}`,
        {
          title: quiz.title.trim(),
          questions: formattedQuestions,
          timePerQuestion,
          readingTime,
          allowRetakes: quiz.allowRetakes
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      navigate("/dashboard");
    } catch (err) {
      showError(
        err.response?.data?.message ||
          "Unable to save quiz."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-sky-200 dark:bg-slate-950">
        <div className="rounded-3xl bg-white px-8 py-6 shadow-lg dark:bg-slate-900">
          Loading quiz...
        </div>
      </div>
    );
  }

  if (error && !quiz) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-sky-200 px-6 dark:bg-slate-950">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center dark:bg-slate-900">
          <h1 className="text-2xl font-bold">
            Unable to load quiz
          </h1>

          <p className="mt-3 text-slate-500 dark:text-slate-400">
            {error}
          </p>

          <Link
            to="/dashboard"
            className="mt-6 inline-flex rounded-xl bg-sky-600 px-5 py-3 font-semibold text-white"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return null;
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
            Edit Quiz
          </h1>

          <div className="w-24" />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        {error && (
          <div
            ref={errorRef}
            className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-600 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400"
          >
            {error}
          </div>
        )}

        <section className="rounded-[2rem] border border-sky-300 bg-white p-7 shadow-lg shadow-sky-300/20 dark:border-slate-700 dark:bg-slate-900">
          <div>
            <label className="text-sm font-semibold">
              Quiz Title
            </label>

            <input
              value={quiz.title}
              onChange={e =>
                setQuiz(previous => ({
                  ...previous,
                  title: e.target.value
                }))
              }
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-sky-500 dark:border-slate-700 dark:bg-slate-800"
            />
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div>
              <label className="text-sm font-semibold">
                Time per Question
              </label>

              <div className="relative mt-2">
                <input
                  type="number"
                  min="1"
                  value={quiz.timePerQuestion}
                  onChange={e =>
                    setQuiz(previous => ({
                      ...previous,
                      timePerQuestion: e.target.value
                    }))
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
                  value={quiz.readingTime}
                  onChange={e =>
                    setQuiz(previous => ({
                      ...previous,
                      readingTime: e.target.value
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 outline-none focus:border-sky-500 dark:border-slate-700 dark:bg-slate-800"
                />

                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                  sec
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <label className="text-sm font-semibold">
              Allow Retakes
            </label>

            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() =>
                  setQuiz(previous => ({
                    ...previous,
                    allowRetakes: true
                  }))
                }
                className={`rounded-xl border px-4 py-3 font-semibold transition ${
                  quiz.allowRetakes
                    ? "border-sky-500 bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300"
                    : "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                Yes, allow retakes
              </button>

              <button
                type="button"
                onClick={() =>
                  setQuiz(previous => ({
                    ...previous,
                    allowRetakes: false
                  }))
                }
                className={`rounded-xl border px-4 py-3 font-semibold transition ${
                  !quiz.allowRetakes
                    ? "border-sky-500 bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300"
                    : "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
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
          {quiz.questions.map((question, questionIndex) => (
            <section
              key={question._id || questionIndex}
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
                    removeQuestion(questionIndex)
                  }
                  disabled={quiz.questions.length === 1}
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
                  onKeyDown={handleArrowNavigation}
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
                    data-quiz-field
                    value={question.type}
                    onChange={e =>
                      updateQuestionType(
                        questionIndex,
                        e.target.value
                      )
                    }
                    onKeyDown={handleArrowNavigation}
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
                    data-quiz-field
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
                    onKeyDown={handleArrowNavigation}
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
                    value={question.correctAnswer || ""}
                    onChange={e =>
                      updateQuestion(
                        questionIndex,
                        "correctAnswer",
                        e.target.value
                      )
                    }
                    onKeyDown={handleArrowNavigation}
                    placeholder="Enter the correct answer..."
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-sky-500 dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
              ) : question.type === "true_false" ? (
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
                        question.correctAnswer === "true"
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
                        question.correctAnswer === "false"
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
                  <label className="text-sm font-semibold">
                    Options
                  </label>

                  <div className="mt-3 grid gap-3">
                    {question.options.map(
                      (option, optionIndex) => (
                        <div
                          key={optionIndex}
                          className="flex items-center gap-3"
                        >
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-100 font-bold text-sky-700 dark:bg-sky-900 dark:text-sky-300">
                            {String.fromCharCode(
                              65 + optionIndex
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
                            onKeyDown={handleArrowNavigation}
                            placeholder={`Option ${optionIndex + 1}`}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-sky-500 dark:border-slate-700 dark:bg-slate-800"
                          />
                        </div>
                      )
                    )}
                  </div>

                  <div className="mt-5">
                    <label className="text-sm font-semibold">
                      {question.type === "multiple"
                        ? "Correct Answers"
                        : "Correct Answer"}
                    </label>

                    {question.type === "multiple" ? (
                      <div className="mt-3 space-y-3">
                        {(Array.isArray(
                          question.correctAnswer
                        )
                          ? question.correctAnswer
                          : [""]
                        ).map((answer, answerIndex) => {
                          const selectedByOthers =
                            Array.isArray(
                              question.correctAnswer
                            )
                              ? question.correctAnswer.filter(
                                  (_, index) =>
                                    index !== answerIndex
                                )
                              : [];

                          return (
                            <div
                              key={answerIndex}
                              className="flex items-center gap-3"
                            >
                              <select
                                data-quiz-field
                                value={answer}
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
                                  (option, optionIndex) => (
                                    <option
                                      key={optionIndex}
                                      value={option}
                                      disabled={
                                        !option.trim() ||
                                        selectedByOthers.includes(
                                          option
                                        )
                                      }
                                    >
                                      {option ||
                                        `Option ${
                                          optionIndex + 1
                                        }`}
                                    </option>
                                  )
                                )}
                              </select>

                              {Array.isArray(
                                question.correctAnswer
                              ) &&
                                question.correctAnswer
                                  .length > 1 && (
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
                                    <X size={17} />
                                  </button>
                                )}
                            </div>
                          );
                        })}

                        {Array.isArray(
                          question.correctAnswer
                        ) &&
                          question.correctAnswer.length < 4 && (
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
                        value={question.correctAnswer || ""}
                        onChange={e =>
                          updateQuestion(
                            questionIndex,
                            "correctAnswer",
                            e.target.value
                          )
                        }
                        onKeyDown={handleArrowNavigation}
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none dark:border-slate-700 dark:bg-slate-800"
                      >
                        <option value="">
                          Select correct answer
                        </option>

                        {question.options.map(
                          (option, optionIndex) => (
                            <option
                              key={optionIndex}
                              value={option}
                            >
                              {option ||
                                `Option ${
                                  optionIndex + 1
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
          ))}
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
            type="button"
            onClick={saveQuiz}
            disabled={saving}
            className="flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-6 py-3 font-semibold text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save size={18} />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </main>
    </div>
  );
}

export default EditQuiz;