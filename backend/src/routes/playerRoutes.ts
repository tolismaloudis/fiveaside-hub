import express from "express";
import prisma from "../lib/prisma";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const players = await prisma.player.findMany({
      include: {
        teams: {
          include: {
            team: true,
          },
        },
      },
    });
    res.json(players);
  } catch (error) {
    console.error("❌ Error fetching players:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const player = await prisma.player.findUnique({
      where: { id },
      include: {
        teams: { include: { team: true } },
      },
    });

    if (!player) return res.status(404).json({ error: "Player not found" });
    res.json(player);
  } catch (error) {
    console.error("❌ Error fetching player:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, number } = req.body;
    if (!name)
      return res.status(400).json({ error: "Player name is required" });

    const newPlayer = await prisma.player.create({
      data: { name, number },
    });

    res.status(201).json(newPlayer);
  } catch (error) {
    console.error("❌ Error creating player:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const team = await prisma.team.findUnique({ where: { id } });
    if (!team) return res.status(404).json({ error: "Team not found" });
    await prisma.team.delete({ where: { id } });
    res.json({ message: "Team deleted" });
  } catch (error) {
    console.error("❌ Error deleting team:", error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
