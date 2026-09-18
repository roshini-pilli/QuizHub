import Quiz from "../models/Quiz.js";

const generateQuizId = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

const validateQuestions = questions => {
  if (!Array.isArray(questions) || questions.length === 0) {
    return "At least one question is required";
  }

  for (const question of questions) {
    if (!question.question?.trim()) {
      return "Every question must have question text";
    }

    if (!["single", "multiple", "fill", "true_false"].includes(question.type)) {
      return "Invalid question type";
    }

    if (question.type === "single" || question.type === "multiple") {
      if (!Array.isArray(question.options) || question.options.length < 2) {
        return "Choice questions must have at least 2 options";
      }

      const options = question.options.map(option => option.trim());

      if (options.some(option => !option)) {
        return "Options cannot be empty";
      }

      if (new Set(options).size !== options.length) {
        return "Options must be unique";
      }

      if (question.type === "single") {
        if (
          typeof question.correctAnswer !== "string" ||
          !options.includes(question.correctAnswer.trim())
        ) {
          return "Single choice must have one correct answer";
        }
      }

      if (question.type === "multiple") {
        if (
          !Array.isArray(question.correctAnswer) ||
          question.correctAnswer.length === 0
        ) {
          return "Multiple choice must have at least one correct answer";
        }

        if (
          question.correctAnswer.some(
            answer => !options.includes(answer.trim())
          )
        ) {
          return "Multiple choice contains an invalid correct answer";
        }
      }
    }

    if (question.type === "true_false") {
      if (
        question.correctAnswer !== "true" &&
        question.correctAnswer !== "false"
      ) {
        return "True/False question must have a valid answer";
      }
    }

    if (question.type === "fill") {
      if (
        typeof question.correctAnswer !== "string" ||
        !question.correctAnswer.trim()
      ) {
        return "Fill in the blank must have a correct answer";
      }
    }
  }

  return null;
};

export const createQuiz = async (req, res) => {
  try {
    const {
      title,
      questions,
      timePerQuestion,
      readingTime,
      allowRetakes
    } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({
        message: "Title is required"
      });
    }

    const validationError = validateQuestions(questions);

    if (validationError) {
      return res.status(400).json({
        message: validationError
      });
    }

    let quizId = generateQuizId();

    while (await Quiz.findOne({ quizId })) {
      quizId = generateQuizId();
    }

    const quiz = await Quiz.create({
      title: title.trim(),
      quizId,
      creator: req.user._id,
      questions,
      timePerQuestion: timePerQuestion || 20,
      readingTime: readingTime || 10,
      allowRetakes: allowRetakes ?? true
    });

    res.status(201).json({
      message: "Quiz created successfully",
      quiz
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: error.message
    });
  }
};

export const joinQuiz = async (req, res) => {
  try {
    const { quizId } = req.body;

    if (!quizId) {
      return res.status(400).json({
        message: "Quiz ID is required"
      });
    }

    const quiz = await Quiz.findOne({
      quizId: quizId.toUpperCase()
    });

    if (!quiz) {
      return res.status(404).json({
        message: "Quiz not found"
      });
    }

    const alreadyJoined = quiz.participants.some(
      participant => participant.toString() === req.user._id.toString()
    );

    if (!alreadyJoined) {
      quiz.participants.push(req.user._id);
      await quiz.save();
    }

    res.json({
      message: "Joined quiz successfully",
      quiz: {
        id: quiz._id,
        quizId: quiz.quizId,
        title: quiz.title,
        questions: quiz.questions,
        timePerQuestion: quiz.timePerQuestion,
        readingTime: quiz.readingTime
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: error.message
    });
  }
};

export const getQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;

    const quiz = await Quiz.findOne({ quizId }).select(
      "-questions.correctAnswer"
    );

    if (!quiz) {
      return res.status(404).json({
        message: "Quiz not found"
      });
    }

    res.json({
      quiz
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: error.message
    });
  }
};

export const getMyQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({
      creator: req.user._id
    })
      .sort({ createdAt: -1 })
      .select(
        "title quizId questions participants timePerQuestion readingTime allowRetakes createdAt"
      );

    res.json({
      quizzes
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: error.message
    });
  }
};

export const deleteQuiz = async (req, res) => {
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

    await Quiz.deleteOne({
      _id: quiz._id
    });

    res.json({
      message: "Quiz deleted successfully"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: error.message
    });
  }
};

export const updateQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;

    const {
      title,
      questions,
      timePerQuestion,
      readingTime,
      allowRetakes
    } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({
        message: "Title is required"
      });
    }

    const validationError = validateQuestions(questions);

    if (validationError) {
      return res.status(400).json({
        message: validationError
      });
    }

    const quiz = await Quiz.findOne({
      quizId,
      creator: req.user._id
    });

    if (!quiz) {
      return res.status(404).json({
        message: "Quiz not found"
      });
    }

    quiz.title = title.trim();
    quiz.questions = questions;
    quiz.timePerQuestion = timePerQuestion || 20;
    quiz.readingTime = readingTime || 10;
    quiz.allowRetakes = allowRetakes ?? true;

    await quiz.save();

    res.json({
      message: "Quiz updated successfully",
      quiz
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: error.message
    });
  }
};

export const getMyQuiz = async (req, res) => {
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

    res.json({
      quiz
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: error.message
    });
  }
};