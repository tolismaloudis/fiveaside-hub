import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import tournamentRoutes from "./routes/tournamentRoutes";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/tournaments", tournamentRoutes);

app.get("/", (_, res) => {
  res.send("Five-a-Side Manager API is running ⚽");
});

export default app;
