import express from "express";
import prisma from "../lib/prisma";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const teams = await prisma.team.findMany({
      include: {
        players: {
          include: {
            player: true,
          },
        },
      },
    });
    res.json(teams);
  } catch (error) {
    console.error("❌ Error fetching teams:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const team = await prisma.team.findUnique({
      where: { id },
      include: {
        players: { include: { player: true } },
      },
    });

    if (!team) return res.status(404).json({ error: "Team not found" });
    res.json(team);
  } catch (error) {
    console.error("❌ Error fetching team:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, logoUrl } = req.body;
    if (!name) return res.status(400).json({ error: "Team name is required" });

    const newTeam = await prisma.team.create({
      data: { name, logoUrl },
    });

    res.status(201).json(newTeam);
  } catch (error) {
    console.error("❌ Error creating team:", error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
