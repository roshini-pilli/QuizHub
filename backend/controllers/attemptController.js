import Quiz from "../models/Quiz.js";
import QuizAttempt from "../models/QuizAttempt.js";

export const startAttempt = async (req, res) => {
  try {
    const { quizId } = req.body;

    if (!quizId) {
      return res.status(400).json({
        message: "Quiz ID is required"
      });
    }

    const quiz = await Quiz.findOne({ quizId });

    if (!quiz) {
      return res.status(404).json({
        message: "Quiz not found"
      });
    }

    if (!quiz.allowRetakes) {
      const completedAttempt = await QuizAttempt.findOne({
        quiz: quiz._id,
        user: req.user._id,
        completed: true
      });

      if (completedAttempt) {
        return res.status(400).json({
          message: "Retakes are not allowed for this quiz",
          attemptId: completedAttempt._id
        });
      }
    }

    let attempt = await QuizAttempt.findOne({
      quiz: quiz._id,
      user: req.user._id,
      completed: false
    });

    if (!attempt) {
      attempt = await QuizAttempt.create({
        quiz: quiz._id,
        user: req.user._id,
        totalPoints: quiz.questions.reduce(
          (total, question) => total + question.points,
          0
        )
      });
    }

    const safeQuestions = quiz.questions.map(question => ({
      _id: question._id,
      type: question.type,
      question: question.question,
      options: question.options,
      points: question.points
    }));

    res.json({
      attemptId: attempt._id,
      quiz: {
        _id: quiz._id,
        title: quiz.title,
        quizId: quiz.quizId,
        timePerQuestion: quiz.timePerQuestion,
        readingTime: quiz.readingTime,
        allowRetakes: quiz.allowRetakes,
        questions: safeQuestions
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: error.message
    });
  }
};

export const submitAttempt = async (req, res) => {
  try {
    const { attemptId, answers } = req.body;

    if (!attemptId || !answers) {
      return res.status(400).json({
        message: "Attempt ID and answers are required"
      });
    }

    const attempt = await QuizAttempt.findOne({
      _id: attemptId,
      user: req.user._id
    }).populate("quiz");

    if (!attempt) {
      return res.status(404).json({
        message: "Attempt not found"
      });
    }

    if (attempt.completed) {
      return res.status(400).json({
        message: "Quiz already submitted"
      });
    }

    let score = 0;

    const evaluatedAnswers = attempt.quiz.questions.map(question => {
      const submitted = answers.find(
        answer => answer.questionId === question._id.toString()
      );

      if (!submitted) {
        return {
          questionId: question._id,
          answer: "",
          isCorrect: false,
          timeTaken: 0,
          pointsEarned: 0
        };
      }

      let isCorrect = false;
      let pointsEarned = 0;

      if (question.type === "multiple") {
        const correct = [...question.correctAnswer].map(String);

        const selected = Array.isArray(submitted.answer)
          ? submitted.answer.map(String)
          : [];

        const correctSet = new Set(
          correct.map(answer =>
            answer.trim().toLowerCase()
          )
        );

        const selectedSet = new Set(
          selected.map(answer =>
            answer.trim().toLowerCase()
          )
        );

        let correctSelected = 0;

        selectedSet.forEach(answer => {
          if (correctSet.has(answer)) {
            correctSelected++;
          }
        });

        pointsEarned =
          correctSet.size > 0
            ? (correctSelected / correctSet.size) *
              question.points
            : 0;

        isCorrect =
          correctSelected === correctSet.size &&
          selectedSet.size === correctSet.size;
      } else {
        isCorrect =
          String(submitted.answer)
            .trim()
            .toLowerCase() ===
          String(question.correctAnswer)
            .trim()
            .toLowerCase();

        pointsEarned = isCorrect
          ? question.points
          : 0;
      }

      score += pointsEarned;

      return {
        questionId: question._id,
        answer: submitted.answer,
        isCorrect,
        timeTaken: submitted.timeTaken || 0,
        pointsEarned
      };
    });

    attempt.answers = evaluatedAnswers;
    attempt.score = score;
    attempt.completed = true;
    attempt.completedAt = new Date();

    await attempt.save();

    res.json({
      message: "Quiz submitted successfully",
      result: {
        attemptId: attempt._id,
        score: attempt.score,
        totalPoints: attempt.totalPoints,
        percentage: attempt.totalPoints
          ? Math.round(
              (attempt.score / attempt.totalPoints) * 100
            )
          : 0,
        answers: attempt.answers
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: error.message
    });
  }
};

export const getAttemptResult = async (req, res) => {
  try {
    const { attemptId } = req.params;

    const attempt = await QuizAttempt.findOne({
      _id: attemptId,
      user: req.user._id,
      completed: true
    }).populate("quiz");

    if (!attempt) {
      return res.status(404).json({
        message: "Completed attempt not found"
      });
    }

    const quiz = attempt.quiz;

    res.json({
      quiz: {
        _id: quiz._id,
        title: quiz.title,
        quizId: quiz.quizId,
        allowRetakes: quiz.allowRetakes,
        questions: quiz.questions.map(question => ({
          _id: question._id,
          type: question.type,
          question: question.question,
          options: question.options,
          correctAnswer: question.correctAnswer,
          points: question.points
        }))
      },
      result: {
        attemptId: attempt._id,
        score: attempt.score,
        totalPoints: attempt.totalPoints,
        percentage: attempt.totalPoints
          ? Math.round(
              (attempt.score / attempt.totalPoints) * 100
            )
          : 0,
        answers: attempt.answers
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: error.message
    });
  }
};

export const getLeaderboard = async (req, res) => {
  try {
    const { quizId } = req.params;

    const quiz = await Quiz.findOne({ quizId });

    if (!quiz) {
      return res.status(404).json({
        message: "Quiz not found"
      });
    }

    const attempts = await QuizAttempt.find({
      quiz: quiz._id,
      completed: true
    })
      .populate("user", "name")
      .sort({
        score: -1,
        completedAt: 1
      });

    res.json({
      leaderboard: attempts.map((attempt, index) => ({
        rank: index + 1,
        name: attempt.user?.name || "Unknown",
        score: attempt.score,
        totalPoints: attempt.totalPoints,
        percentage: attempt.totalPoints
          ? Math.round(
              (attempt.score / attempt.totalPoints) * 100
            )
          : 0,
        completedAt: attempt.completedAt
      }))
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: error.message
    });
  }
};

export const getMyAttempts = async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({
      user: req.user._id,
      completed: true
    })
      .populate("quiz", "title quizId allowRetakes")
      .sort({ completedAt: -1 });

    res.json({
      attempts
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: error.message
    });
  }
};

export const getQuizAnalytics = async (req, res) => {
  try {
    const { quizId } = req.params;

    const quiz = await Quiz.findOne({
      quizId,
      creator: req.user._id
    });

    if (!quiz) {
      return res.status(404).json({
        message: "Quiz not found or you are not the creator"
      });
    }

    const attempts = await QuizAttempt.find({
      quiz: quiz._id,
      completed: true
    }).sort({
      completedAt: 1
    });

    const totalAttempts = attempts.length;

    const uniqueParticipants = new Set(
      attempts.map(attempt => attempt.user.toString())
    ).size;

    if (totalAttempts === 0) {
      return res.json({
        analytics: {
          quiz: {
            title: quiz.title,
            quizId: quiz.quizId
          },
          totalAttempts: 0,
          uniqueParticipants: 0,
          averageScore: 0,
          averagePercentage: 0,
          highestPercentage: 0,
          averageTime: 0,
          questionAnalytics: quiz.questions.map(
            (question, index) => ({
              questionNumber: index + 1,
              questionId: question._id,
              accuracy: 0,
              averageTime: 0,
              pointsPossible: question.points
            })
          ),
          scoreDistribution: [
            {
              range: "0-39%",
              count: 0
            },
            {
              range: "40-59%",
              count: 0
            },
            {
              range: "60-79%",
              count: 0
            },
            {
              range: "80-100%",
              count: 0
            }
          ]
        }
      });
    }

    const totalScore = attempts.reduce(
      (sum, attempt) => sum + attempt.score,
      0
    );

    const totalPercentage = attempts.reduce(
      (sum, attempt) =>
        sum +
        (attempt.totalPoints
          ? (attempt.score / attempt.totalPoints) * 100
          : 0),
      0
    );

    const highestPercentage = Math.max(
      ...attempts.map(attempt =>
        attempt.totalPoints
          ? (attempt.score / attempt.totalPoints) * 100
          : 0
      )
    );

    const totalTimes = attempts.map(attempt =>
      attempt.answers.reduce(
        (sum, answer) =>
          sum + (answer.timeTaken || 0),
        0
      )
    );

    const averageTime =
      totalTimes.reduce(
        (sum, time) => sum + time,
        0
      ) / totalAttempts;

    const questionAnalytics =
      quiz.questions.map(
        (question, index) => {
          const questionAnswers = attempts
            .flatMap(attempt => attempt.answers)
            .filter(
              answer =>
                answer.questionId.toString() ===
                question._id.toString()
            );

          const correctAnswers =
            questionAnswers.filter(
              answer => answer.isCorrect
            ).length;

          const totalTime =
            questionAnswers.reduce(
              (sum, answer) =>
                sum + (answer.timeTaken || 0),
              0
            );

          return {
            questionNumber: index + 1,
            questionId: question._id,
            accuracy: questionAnswers.length
              ? Math.round(
                  (correctAnswers /
                    questionAnswers.length) *
                    100
                )
              : 0,
            averageTime: questionAnswers.length
              ? Math.round(
                  totalTime /
                    questionAnswers.length
                )
              : 0,
            pointsPossible: question.points
          };
        }
      );

    const scoreDistribution = [
      {
        range: "0-39%",
        count: 0
      },
      {
        range: "40-59%",
        count: 0
      },
      {
        range: "60-79%",
        count: 0
      },
      {
        range: "80-100%",
        count: 0
      }
    ];

    attempts.forEach(attempt => {
      const percentage =
        attempt.totalPoints
          ? (attempt.score /
              attempt.totalPoints) *
            100
          : 0;

      if (percentage < 40) {
        scoreDistribution[0].count++;
      } else if (percentage < 60) {
        scoreDistribution[1].count++;
      } else if (percentage < 80) {
        scoreDistribution[2].count++;
      } else {
        scoreDistribution[3].count++;
      }
    });

    res.json({
      analytics: {
        quiz: {
          title: quiz.title,
          quizId: quiz.quizId
        },
        totalAttempts,
        uniqueParticipants,
        averageScore: Number(
          (
            totalScore /
            totalAttempts
          ).toFixed(1)
        ),
        averagePercentage: Math.round(
          totalPercentage /
            totalAttempts
        ),
        highestPercentage: Math.round(
          highestPercentage
        ),
        averageTime: Math.round(
          averageTime
        ),
        questionAnalytics,
        scoreDistribution
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: error.message
    });
  }
};