import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

router.get("/", async (req, res) => {
  try {
    const tournaments = await prisma.tournament.findMany();
    res.json(tournaments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching tournaments" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, theme, startDate, endDate } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    const tournament = await prisma.tournament.create({
      data: { name, theme, startDate, endDate },
    });

    res.status(201).json(tournament);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating tournament" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const tournament = await prisma.tournament.findUnique({
      where: { id },
      include: { groups: true, matches: true },
    });

    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found" });
    }

    res.json(tournament);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching tournament" });
  }
});

export default router;
