import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import tournamentRoutes from "./routes/tournamentRoutes";
import teamRoutes from "./routes/teamRoutes";
import playerRoutes from "./routes/playerRoutes";
import playerTeamRoutes from "./routes/playerTeamRoutes";
import matchRoutes from "./routes/matchRoutes";
import matchEventRoutes from "./routes/matchEventRoutes";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
const prisma = new PrismaClient();

(async () => {
  try {
    await prisma.$connect();
    console.log("✅ Connected successfully to MongoDB via Prisma");
  } catch (err) {
    console.error("❌ Prisma connection failed:", err);
  }
})();

app.use("/api/tournaments", tournamentRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/players", playerRoutes);
app.use("/api/player-teams", playerTeamRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/match-events", matchEventRoutes);

app.get("/", (_, res) => {
  res.send("Five-a-Side Manager API is running ⚽");
});

export default app;
