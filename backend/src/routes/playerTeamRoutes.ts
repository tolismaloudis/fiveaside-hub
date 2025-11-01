import express from "express";
import prisma from "../lib/prisma";

const router = express.Router();

router.get("/", async (_, res) => {
  try {
    const allRelations = await prisma.playerTeam.findMany();
    res.json(allRelations);
  } catch (error) {
    console.error("❌ Error fetching player-team relations:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { playerId, teamId } = req.body;

    const player = await prisma.player.findUnique({ where: { id: playerId } });
    const team = await prisma.team.findUnique({ where: { id: teamId } });

    if (!player || !team)
      return res.status(404).json({ error: "Player or Team not found" });

    const relation = await prisma.playerTeam.create({
      data: { playerId, teamId },
    });

    res.status(201).json({
      message: "✅ Player added to team successfully",
      relation,
    });
  } catch (error) {
    console.error("❌ Error creating player-team relation:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/", async (req, res) => {
  try {
    const { playerId, teamId } = req.body;

    const existing = await prisma.playerTeam.findFirst({
      where: { playerId, teamId },
    });

    if (!existing)
      return res
        .status(404)
        .json({ error: "Relation between player and team not found" });

    await prisma.playerTeam.delete({ where: { id: existing.id } });

    res.json({ message: "✅ Player removed from team" });
  } catch (error) {
    console.error("❌ Error deleting player-team relation:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/:teamId", async (req, res) => {
  try {
    const { teamId } = req.params;

    const players = await prisma.playerTeam.findMany({
      where: { teamId },
      include: {
        player: true,
      },
    });

    res.json(players);
  } catch (error) {
    console.error("❌ Error fetching team players:", error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
