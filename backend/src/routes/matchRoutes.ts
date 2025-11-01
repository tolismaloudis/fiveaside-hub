import express from "express";
import prisma from "../lib/prisma";

const router = express.Router();

/**
 * 🟢 Create a new match
 */
router.post("/", async (req, res) => {
  try {
    const { tournamentId, teamAId, teamBId, date } = req.body;
    if (!tournamentId || !teamAId || !teamBId)
      return res.status(400).json({ error: "Missing required fields" });

    const match = await prisma.match.create({
      data: {
        tournamentId,
        teamAId,
        teamBId,
        date: date ? new Date(date) : undefined,
      },
    });
    res.status(201).json(match);
  } catch (error) {
    console.error("❌ Error creating match:", error);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * 🟢 Get all matches
 */
router.get("/", async (_, res) => {
  try {
    const matches = await prisma.match.findMany({
      include: {
        teamA: true,
        teamB: true,
        tournament: true,
      },
    });
    res.json(matches);
  } catch (error) {
    console.error("❌ Error fetching matches:", error);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * 🟢 Get matches by tournament
 */
router.get("/by-tournament/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const matches = await prisma.match.findMany({
      where: { tournamentId: id },
      include: {
        teamA: true,
        teamB: true,
      },
    });
    res.json(matches);
  } catch (error) {
    console.error("❌ Error fetching matches:", error);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * 🟡 Update match score (and team stats)
 */
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { scoreA, scoreB, status } = req.body;

    const match = await prisma.match.update({
      where: { id },
      data: { scoreA, scoreB, status },
    });

    // Auto-update standings if match is finished
    if (status === "finished") {
      const teamA = await prisma.team.findUnique({
        where: { id: match.teamAId! },
      });
      const teamB = await prisma.team.findUnique({
        where: { id: match.teamBId! },
      });

      if (teamA && teamB) {
        let updateA = {},
          updateB = {};
        if (scoreA > scoreB) {
          updateA = { wins: { increment: 1 }, points: { increment: 3 } };
          updateB = { losses: { increment: 1 } };
        } else if (scoreB > scoreA) {
          updateB = { wins: { increment: 1 }, points: { increment: 3 } };
          updateA = { losses: { increment: 1 } };
        } else {
          updateA = { draws: { increment: 1 }, points: { increment: 1 } };
          updateB = { draws: { increment: 1 }, points: { increment: 1 } };
        }

        await prisma.team.update({ where: { id: teamA.id }, data: updateA });
        await prisma.team.update({ where: { id: teamB.id }, data: updateB });
      }
    }

    res.json({ message: "✅ Match updated", match });
  } catch (error) {
    console.error("❌ Error updating match:", error);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * 🔴 Delete match
 */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.match.delete({ where: { id } });
    res.json({ message: "Match deleted" });
  } catch (error) {
    console.error("❌ Error deleting match:", error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
