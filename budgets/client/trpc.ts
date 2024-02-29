import { createTRPCProxyClient, httpBatchLink, httpLink } from "@trpc/client";
import type { AppRouter } from "../server/router";

export const api = createTRPCProxyClient<AppRouter>({
  links: [
    httpLink({
      url: "/api",
    }),
  ],
});
