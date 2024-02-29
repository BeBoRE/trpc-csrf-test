import fastify from "fastify";
import fastifyVite from "@fastify/vite";

const csrfServer = fastify();

await csrfServer.register(fastifyVite, {
  root: import.meta.url,
  dev: true,
  spa: true,
});

csrfServer.get("/", (_req, reply) => {
  reply.html();
});

await csrfServer.vite.ready();

export default csrfServer;
