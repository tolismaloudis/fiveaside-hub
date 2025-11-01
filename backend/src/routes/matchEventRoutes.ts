import express from "express";
import prisma from "../lib/prisma";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { matchId, playerId, teamId, minute, type } = req.body;
    if (!matchId || !playerId || !type) {
      return res
        .status(400)
        .json({ error: "matchId, playerId, and type are required" });
    }

    const event = await prisma.matchEvent.create({
      data: { matchId, playerId, teamId, minute, type },
    });

    res.status(201).json(event);
  } catch (error) {
    console.error("❌ Error creating event:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/by-match/:matchId", async (req, res) => {
  try {
    const { matchId } = req.params;
    const events = await prisma.matchEvent.findMany({
      where: { matchId },
      include: {
        player: true,
        team: true,
      },
      orderBy: { minute: "asc" },
    });
    res.json(events);
  } catch (error) {
    console.error("❌ Error fetching match events:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.matchEvent.delete({ where: { id } });
    res.json({ message: "Event deleted" });
  } catch (error) {
    console.error("❌ Error deleting event:", error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
