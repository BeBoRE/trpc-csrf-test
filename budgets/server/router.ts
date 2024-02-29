import { z } from "zod";
import { t } from "./trpc";
import { TRPCError, inferRouterInputs, inferRouterOutputs } from "@trpc/server";

type User = {
  id: string;
  username: string;
  value: number;
};

const users: Map<string, User> = new Map();

users.set("a", { id: crypto.randomUUID(), username: "a", value: 100 });
users.set("b", { id: crypto.randomUUID(), username: "b", value: 100 });
users.set("c", { id: crypto.randomUUID(), username: "c", value: 100 });

const publicProcedure = t.procedure;
const privateProcedure = t.procedure.use((opts) => {
  const { ctx } = opts;

  if (!ctx.userId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to do that",
    });
  }

  const user = Array.from(users.values()).find((u) => u.id === ctx.userId);

  if (!user) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "User not found",
    });
  }

  return opts.next({
    ctx: {
      ...ctx,
      userId: ctx.userId,
      user,
    },
  });
});

export const appRouter = t.router({
  login: publicProcedure
    .input(
      z.object({
        username: z.string(),
      }),
    )
    .query(({ input, ctx }) => {
      const user = users.get(input.username) ?? {
        id: crypto.randomUUID(),
        username: input.username,
        value: 100,
      };
      users.set(user.username, user);

      ctx.res.headers({
        "Set-Cookie": `user=${user.id}; HttpOnly; Path=/`,
      });
    }),
  user: privateProcedure.query(({ ctx: { user } }) => {
    return { user };
  }),
  allUsers: privateProcedure.query(() => {
    return { users: Array.from(users.values()) };
  }),
  giveValue: privateProcedure
    .input(
      z.object({
        username: z.string(),
        value: z.number({ coerce: true }).int().positive(),
      }),
    )
    .mutation(({ input, ctx: { user: currentUser } }) => {
      const targetUser = users.get(input.username);
      if (!targetUser) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User not found",
        });
      }

      if (currentUser.value < input.value) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Not enough value",
        });
      }

      currentUser.value -= input.value;
      targetUser.value += input.value;

      return { user: currentUser, targetUser };
    }),
  saferGiveValue: privateProcedure
    .input(
      z.object({
        username: z.string(),
        value: z.number({ coerce: true }).int().positive(),
      }),
    )
    .mutation(({ input, ctx }) => {
      if (!ctx.req.headers["content-type"]?.startsWith("application/json")) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid content type",
        });
      }

      const currentUser = ctx.user;
      const targetUser = users.get(input.username);
      if (!targetUser) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User not found",
        });
      }

      if (currentUser.value < input.value) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Not enough value",
        });
      }

      currentUser.value -= input.value;
      targetUser.value += input.value;

      return { user: currentUser, targetUser };
    }),
});

export type AppRouter = typeof appRouter;

export type RouterOutputs = inferRouterOutputs<AppRouter>;
export type ProcedureInputs = inferRouterInputs<AppRouter>;
