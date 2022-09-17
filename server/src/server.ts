import { PrismaClient } from "@prisma/client";
import cors from "cors";
import express, { json } from "express";
import { convertHoursStringToMinutes } from "./utils/convertHoursStringToMinutes";
import { convertMinutesToHoursString } from "./utils/convertMinutesToHoursString";

const app = express();
app.use(json());
app.use(cors());

const prisma = new PrismaClient({
  // log: ["query"],
});

app.get("/games", async (request, response) => {
  const games = await prisma.game.findMany({
    include: {
      _count: {
        select: {
          ads: true,
        },
      },
    },
  });
  response.json(games);
});

app.post("/games/:id/ads", async (request, response) => {
  const gameId = request.params.id;
  const {
    name,
    yearsPlaying,
    discord,
    weekDays,
    hourStart,
    hourEnd,
    useVoiceChannel,
  } = request.body;

  // zod

  const game = await prisma.game.findUnique({
    where: {
      id: gameId,
    },
  });

  if (!game) response.status(400).json({ error: "Incorrect game id." });

  const ad = await prisma.ad.create({
    data: {
      gameId,
      name,
      yearsPlaying,
      discord,
      weekDays: weekDays.join(","),
      hourStart: convertHoursStringToMinutes(hourStart),
      hourEnd: convertHoursStringToMinutes(hourEnd),
      useVoiceChannel,
    },
  });

  response.status(201).json(ad);
});

app.get("/games/:id/ads", async (request, response) => {
  const gameId = request.params.id;

  const ads = await prisma.ad.findMany({
    select: {
      id: true,
      name: true,
      weekDays: true,
      useVoiceChannel: true,
      yearsPlaying: true,
      hourStart: true,
      hourEnd: true,
    },
    where: { gameId },
    orderBy: { createAt: "desc" },
  });

  response.json(
    ads.map((ad) => {
      return {
        ...ad,
        weekDays: ad.weekDays.split(","),
        hourStart: convertMinutesToHoursString(ad.hourStart),
        hourEnd: convertMinutesToHoursString(ad.hourEnd),
      };
    })
  );
});

app.get("/ads/:id/discord", async (request, response) => {
  const adId = request.params.id;

  const ad = await prisma.ad.findUnique({
    select: {
      discord: true,
    },
    where: {
      id: adId,
    },
  });

  response.json({
    discord: ad?.discord,
  });
});

const port = 3333;
app.listen(port, () => {
  console.log(`Server is running on 🚪: ${port}`);
});
