import fastify, { FastifyReply, FastifyRequest } from "fastify";
import cors from "@fastify/cors";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { prisma, disconnectDatabase } from "./db.js";

type AuthBody = {
  email: string;
  password: string;
};

type IdeaBody = {
  title: string;
  content: string;
};

type IdeaResult = {
  id: number;
  title: string;
  content: string;
  createdAt: Date;
  analysis?: AiAnalysis | undefined;
};

type AiAnalysis = {
  score: number;
  strengths: string[];
  weaknesses: string[];
  summary: string;
};

type UpdateMeBody = {
  email?: string;
  password?: string;
};

type JwtPayload = {
  id: number;
  email: string;
};

declare module "fastify" {
  interface FastifyRequest {
    user?: JwtPayload;
  }
}

const app = fastify({ logger: true });
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error("JWT_SECRET mangler i .env");
}
const jwtSecretValue: string = jwtSecret;

await app.register(cors, {
  origin: true,
});

function simulateAiAnalysis(title: string, content: string): AiAnalysis {
  const baseScore = 60 + Math.floor(Math.random() * 36); // 60-95
  const strengthsPool = [
    "Klar problemformulering",
    "Konkrete brukere",
    "Mulig teknisk løsning",
    "Skalerbar idé",
    "Enkel å teste",
  ];
  const weaknessesPool = [
    "Uavklart målgruppe",
    "Manglende datagrunnlag",
    "Behov for mer validering",
    "Potensielt høy kost",
    "Utydelig differensiering",
  ];

  const strengths = strengthsPool.sort(() => 0.5 - Math.random()).slice(0, 2);
  const weaknesses = weaknessesPool.sort(() => 0.5 - Math.random()).slice(0, 2);

  return {
    score: baseScore,
    strengths,
    weaknesses,
    summary: `Foreløpig vurdering av "${title}": lovende, men krever videre utforskning.`,
  };
}

function issueToken(payload: JwtPayload): string {
  return jwt.sign(payload, jwtSecretValue, { expiresIn: "7d" });
}

async function requireUser(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<JwtPayload | undefined> {
  const auth = request.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    reply.code(401).send({ message: "Mangler bearer-token." });
    return;
  }

  const token = auth.slice("Bearer ".length);
  try {
    const decoded = jwt.verify(token, jwtSecretValue);
    if (
      decoded &&
      typeof decoded === "object" &&
      "id" in decoded &&
      "email" in decoded
    ) {
      const userPayload = {
        id: (decoded as JwtPayload).id,
        email: (decoded as JwtPayload).email,
      };
      request.user = userPayload;
      return userPayload;
    }
    reply.code(401).send({ message: "Ugyldig token." });
    return;
  } catch (err) {
    request.log.warn({ err }, "Ugyldig token");
    reply.code(401).send({ message: "Ugyldig eller utløpt token." });
    return;
  }
}

app.get("/api/health", async () => ({ status: "ok" }));

app.post<{ Body: AuthBody }>("/api/register", async (request, reply) => {
  const { email, password } = request.body;

  if (!email || !password) {
    return reply.code(400).send({ message: "E-post og passord må fylles ut." });
  }

  if (password.length < 8) {
    return reply.code(400).send({ message: "Passord må være minst 8 tegn." });
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return reply.code(409).send({ message: "E-post er allerede registrert." });
  }

  const passwordHash = await argon2.hash(password);
  const user = await prisma.user.create({
    data: { email, passwordHash },
  });

  const token = issueToken({ id: user.id, email: user.email });
  return reply.code(201).send({ id: user.id, email: user.email, token });
});

app.post<{ Body: AuthBody }>("/api/login", async (request, reply) => {
  const { email, password } = request.body;

  if (!email || !password) {
    return reply.code(400).send({ message: "E-post og passord må fylles ut." });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return reply.code(401).send({ message: "Ugyldig e-post eller passord." });
  }

  const passwordOk = await argon2.verify(user.passwordHash, password);
  if (!passwordOk) {
    return reply.code(401).send({ message: "Ugyldig e-post eller passord." });
  }

  const token = issueToken({ id: user.id, email: user.email });
  return reply.send({ id: user.id, email: user.email, token });
});

app.get("/api/me", async (request, reply) => {
  const user = await requireUser(request, reply);
  if (!user) {
    return;
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { id: true, email: true, createdAt: true, updatedAt: true },
  });

  if (!dbUser) {
    return reply.code(404).send({ message: "Bruker ikke funnet." });
  }

  return reply.send(dbUser);
});

app.put<{ Body: UpdateMeBody }>("/api/me", async (request, reply) => {
  const user = await requireUser(request, reply);
  if (!user) {
    return;
  }

  const { email, password } = request.body;

  if (!email && !password) {
    return reply.code(400).send({ message: "Oppgi minst én verdi å oppdatere." });
  }

  const data: { email?: string; passwordHash?: string } = {};

  if (email) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing && existing.id !== user.id) {
      return reply.code(409).send({ message: "E-post er allerede i bruk." });
    }
    data.email = email;
  }

  if (password) {
    if (password.length < 8) {
      return reply.code(400).send({ message: "Passord må være minst 8 tegn." });
    }
    data.passwordHash = await argon2.hash(password);
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data,
    select: { id: true, email: true, updatedAt: true },
  });

  return reply.send({ id: updated.id, email: updated.email, updatedAt: updated.updatedAt });
});

app.post<{ Body: IdeaBody }>("/api/ideas", async (request, reply) => {
  const user = await requireUser(request, reply);
  if (!user) {
    return;
  }

  const { title, content } = request.body;

  if (!title || !content) {
    return reply
      .code(400)
      .send({ message: "title og content må fylles ut." });
  }

  const userExists = await prisma.user.findUnique({ where: { id: user.id } });
  if (!userExists) {
    return reply.code(404).send({ message: "Fant ikke bruker." });
  }

  const analysis = simulateAiAnalysis(title, content);

  const idea = await prisma.idea.create({
    data: { userId: user.id, title, content, aiReply: JSON.stringify(analysis) },
  });

  return reply.code(201).send({
    id: idea.id,
    title: idea.title,
    content: idea.content,
    analysis,
  });
});

app.get("/api/ideas", async (request, reply) => {
  const user = await requireUser(request, reply);
  if (!user) {
    return;
  }

  const ideas = await prisma.idea.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  const result: IdeaResult[] = ideas.map((idea) => {
    let parsed: AiAnalysis | undefined;
    if (idea.aiReply) {
      try {
        parsed = JSON.parse(idea.aiReply) as AiAnalysis;
      } catch (err) {
        request.log.warn({ err }, "Kunne ikke parse aiReply");
      }
    }
    return {
      id: idea.id,
      title: idea.title,
      content: idea.content,
      createdAt: idea.createdAt,
      analysis: parsed,
    };
  });

  return reply.send(result);
});

app.addHook("onClose", async () => {
  await disconnectDatabase();
});

const port = Number(process.env.PORT) || 3000;
const host = process.env.HOST || "0.0.0.0";

app
  .listen({ port, host })
  .then(() => {
    app.log.info(`Server kjører på http://${host}:${port}`);
  })
  .catch(async (err) => {
    app.log.error(err, "Kunne ikke starte server");
    await disconnectDatabase();
    process.exit(1);
  });
