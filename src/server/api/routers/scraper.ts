import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";
import { scraper } from "~/server/scraper";

export const scraperRoute = createTRPCRouter({
  getImgsFromUrl: publicProcedure
    .input(z.object({ url: z.string() }))
    .query(async ({ input }) => {
      const bufferedImgs = await scraper(input.url)
      return {
        bufferedImgs: bufferedImgs
      };
    }),
});
