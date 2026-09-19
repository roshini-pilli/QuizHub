import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const sendEmail = async (to, subject, text) => {
  await axios.post(
    "https://api.brevo.com/v3/smtp/email",
    {
      sender: {
        name: "QuizHub",
        email: process.env.EMAIL_USER
      },
      to: [
        {
          email: to
        }
      ],
      subject,
      textContent: text
    },
    {
      headers: {
        accept: "application/json",
        "api-key": process.env.BREVO_API_KEY,
        "content-type": "application/json"
      }
    }
  );
};

export default sendEmail;