import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: Number(process.env.PORT || 4000),
  nodeEnv: process.env.NODE_ENV || "development",
  adjutorBaseUrl: process.env.ADJUTOR_BASE_URL || "https://api.adjutor.io",
  adjutorApiKey: process.env.ADJUTOR_API_KEY || "",
};
