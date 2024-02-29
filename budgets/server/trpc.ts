import { initTRPC } from "@trpc/server";
import type { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";

export function createContext({ req, res }: CreateFastifyContextOptions) {
  const cookiesRaw = req.headers.cookie ?? "";

  const cookies = cookiesRaw.split(";").map((cookie) => cookie.trim());

  const userId = cookies
    .find((cookie) => cookie.startsWith("user="))
    ?.split("=")[1];

  return {
    req,
    res,
    userId: userId,
  };
}

export type Context = ReturnType<typeof createContext>;

export const t = initTRPC.context<Context>().create();
