import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium-min";
import type { HTTPResponse, Page, Handler } from "puppeteer-core";
import { sleep } from "~/helper";

const imgExtensionRegex = /\.(png|jpeg|jpg)$/i;

const scrollToBottomSlowly = async (page: Page) => {
  const scrollHeight = await page.evaluate(() => document.body.scrollHeight);
  const viewportHeight = await page.evaluate(() => window.innerHeight);

  let currentPosition = 0;
  while (currentPosition < scrollHeight) {
    await page.evaluate(() => {
      window.scrollBy(0, window.innerHeight / 10);
    });
    currentPosition += viewportHeight / 10;
    await sleep(50);
  }
};

export const scraper = async (url: string) => {
  if (!url?.length) throw Error("No URL for the download");

  const chromiumPack = "https://github.com/Sparticuz/chromium/releases/download/v121.0.0/chromium-v121.0.0-pack.tar";

  const options =
    process.env.ENV === "production"
      ? {
          args: chromium.args,
          defaultViewport: chromium.defaultViewport,
          executablePath: await chromium.executablePath(chromiumPack),
          headless: chromium.headless,
        }
      : {
          args: [],
          executablePath:
            process.platform === "win32"
              ? "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe"
              : process.platform === "linux"
                ? "/usr/bin/google-chrome"
                : "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        };

  const browser = await puppeteer.launch(options);
  const page = await browser.newPage();

  const filesMap = new Map<string, string>();

  const downloadOnResponse = (res: HTTPResponse) => {
    const url = res.url();
    if (
      res.request().resourceType() === "image" &&
      imgExtensionRegex.test(url)
    ) {
      res
        .buffer()
        .then((file) => {
          const fileName = url.split("/").pop();
          const base64 = Buffer.from(file).toString("base64");
          if (fileName) filesMap.set(fileName, base64);
        })
        .catch(console.error);
    }
  };

  page.on("response", downloadOnResponse as Handler);

  await page.goto(url);
  await page.waitForNetworkIdle({
    idleTime: 100
  });
  await scrollToBottomSlowly(page);
  await browser.close();
  const sortedFilesMap = new Map(
    [...filesMap.entries()].sort((a, b) => {
      const aNum = +a[0].split(".")[0]!;
      const bNum = +b[0].split(".")[0]!;
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return aNum - bNum;
      }
      return a[0].localeCompare(b[0]);
    }),
  );
  return sortedFilesMap;
};
