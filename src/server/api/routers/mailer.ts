import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure
} from "~/server/api/trpc";
import { EpubGenerator } from "~/server/epub-gen";
import { transporter } from "~/server/mailer";

export const mailerRoute = createTRPCRouter({
  sendEpubToKindle: publicProcedure
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
      const buff = Buffer.from(epubBuff);
      await transporter.sendMail({
        from: process.env.EMAIL,
        to: "eduardogdebem_yh4sdl@kindle.com",
        attachments: [
          {
            filename: `${input.title}.epub`,
            content: buff
          },
        ],
        html: '<div dir="auto"></div>',
      });
      console.log("DONE 😎")
    }),
});
