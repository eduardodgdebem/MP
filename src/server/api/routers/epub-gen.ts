import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { EpubGenerator } from "~/server/epub-gen";

export const epubGenRoute = createTRPCRouter({
  getEpub: publicProcedure
    .input(
      z.object({
        title: z.string(),
        base64Imgs: z.string().array(),
        fileNames: z.string().array(),
      }),
    )
    .mutation(async ({ input }) => {
      const epubGen = new EpubGenerator(
        input.title,
        input.base64Imgs,
        input.fileNames,
      );
      const epubBuff = await epubGen.generateEpub();
      var binary = "";
      var bytes = new Uint8Array(epubBuff);
      var len = bytes.byteLength;
      for (var i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]!);
      }
      return btoa(binary);
    }),
});
