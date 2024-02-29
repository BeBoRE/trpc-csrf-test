import {
  fastifyTRPCPlugin,
  FastifyTRPCPluginOptions,
} from "@trpc/server/adapters/fastify";
import fastify from "fastify";
import { createContext } from "./server/trpc";
import { appRouter, type AppRouter } from "./server/router";
import fastifyVite from "@fastify/vite";
import cors from '@fastify/cors';

const budgetServer = fastify();

await budgetServer.register(fastifyTRPCPlugin, {
  prefix: "/api",
  trpcOptions: {
    router: appRouter,
    createContext,
  } satisfies FastifyTRPCPluginOptions<AppRouter>["trpcOptions"],
});

await budgetServer.register(cors, {
  origin: 'http://localhost:3000',
});

await budgetServer.register(fastifyVite, {
  root: import.meta.url,
  dev: true,
  spa: true,
});

budgetServer.get("/", (_req, reply) => {
  reply.html();
});

await budgetServer.vite.ready();

export default budgetServer;
