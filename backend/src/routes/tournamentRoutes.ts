import express from "express";
import prisma from "../lib/prisma";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    console.log("📡 GET /api/tournaments");
    const tournaments = await prisma.tournament.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        groups: true,
        matches: true,
      },
    });
    res.json(tournaments);
  } catch (error) {
    console.error("❌ Error fetching tournaments:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const tournament = await prisma.tournament.findUnique({
      where: { id },
      include: {
        groups: {
          include: { teams: true },
        },
        matches: true,
      },
    });

    if (!tournament)
      return res.status(404).json({ error: "Tournament not found" });

    res.json(tournament);
  } catch (error) {
    console.error("❌ Error fetching tournament:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, theme, startDate, endDate } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Tournament name is required" });
    }

    const newTournament = await prisma.tournament.create({
      data: {
        name,
        theme,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
    });

    res.status(201).json(newTournament);
  } catch (error) {
    console.error("❌ Error creating tournament:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, theme, startDate, endDate } = req.body;

    const existing = await prisma.tournament.findUnique({ where: { id } });
    if (!existing)
      return res.status(404).json({ error: "Tournament not found" });

    const updated = await prisma.tournament.update({
      where: { id },
      data: {
        name: name ?? existing.name,
        theme: theme ?? existing.theme,
        startDate: startDate ? new Date(startDate) : existing.startDate,
        endDate: endDate ? new Date(endDate) : existing.endDate,
      },
    });

    res.json(updated);
  } catch (error) {
    console.error("❌ Error updating tournament:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.tournament.findUnique({ where: { id } });
    if (!existing)
      return res.status(404).json({ error: "Tournament not found" });

    // Προαιρετικά: διαγραφή σχετικών δεδομένων (groups, matches)
    await prisma.match.deleteMany({ where: { tournamentId: id } });
    await prisma.group.deleteMany({ where: { tournamentId: id } });

    await prisma.tournament.delete({ where: { id } });

    res.json({ message: "Tournament deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting tournament:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/:id/leaderboard", async (req, res) => {
  try {
    const { id } = req.params;

    // Πάρε όλα τα matches του τουρνουά
    const matches = await prisma.match.findMany({
      where: { tournamentId: id },
      select: { teamAId: true, teamBId: true },
    });

    // Μάζεψε όλα τα teamIds (και αφαίρεσε nulls)
    const ids: string[] = Array.from(
      new Set(
        matches
          .flatMap((m) => [m.teamAId, m.teamBId])
          .filter((id): id is string => Boolean(id)) // 👈 τύπος string μόνο
      )
    );

    // Αν δεν υπάρχουν ομάδες, γύρνα κενό array
    if (ids.length === 0) return res.json([]);

    // Φέρε τις ομάδες και ταξινόμησέ τες
    const teams = await prisma.team.findMany({
      where: { id: { in: ids } },
      orderBy: [{ points: "desc" }, { wins: "desc" }, { name: "asc" }],
    });

    res.json(teams);
  } catch (error) {
    console.error("❌ Error fetching leaderboard:", error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
