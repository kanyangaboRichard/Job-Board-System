import dotenv from "dotenv";
import { connectDB } from "./db";
import app from "./server";

dotenv.config();

const PORT = process.env.PORT || 5432;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
