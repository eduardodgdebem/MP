"use client";

import { useEffect, useState } from "react";
import { Reorder } from "framer-motion";
import { api } from "~/trpc/react";
import LoadingPage from "~/app/_components/loading/loadingPage";
import { useUrlStore } from "../store/urlStore";
import LinkForm from "../_components/link-form";
import Image from "next/image";

export default function Scraper() {
  const url = useUrlStore((state) => state.url);
  const scraper = api.scraper.getImgsFromUrl.useQuery({ url });
  const [imgMap, setImgMap] = useState<Map<string, string>>(new Map());
  const [titleList, setTitleList] = useState<string[]>([]);
  const [selectedImg, setSelectedImg] = useState("");
  const [epubTitle, setEpubTitle] = useState("");
  const [form, setForm] = useState<{
    title: string;
    base64Imgs: string[];
    fileNames: string[];
  }>({
    title: "DANDADAN",
    base64Imgs: [],
    fileNames: [],
  });
  const getEpub = api.epubGen.getEpub.useMutation({
    onSuccess: (base64) => {
      const mediaType = "data:application/epub+zip;base64,";
      const epubLink = `${mediaType}${base64}`;
      const anchorElement = document.createElement("a");
      const fileName = `${epubTitle}.epub`;
      anchorElement.href = epubLink;
      anchorElement.download = fileName;
      anchorElement.click();
    },
  });

  const sendEpubToKindle = api.mailer.sendEpubToKindle.useMutation();

  useEffect(() => {
    if (!imgMap) return;
    const temp = titleList.map((t) => imgMap.get(t)!);
    setForm({
      base64Imgs: temp,
      fileNames: titleList,
      title: epubTitle,
    });
  }, [titleList, imgMap, epubTitle]);

  useEffect(() => {
    if (scraper.data?.bufferedImgs && scraper.data?.bufferedImgs.size > 0) {
      const tempImgMap = scraper.data.bufferedImgs;
      const tempTitleList = [...tempImgMap.keys()];
      const firstSelectedImg = [...tempImgMap.values()]?.[0] ?? "";

      setImgMap(tempImgMap);
      setSelectedImg(firstSelectedImg);
      setTitleList(tempTitleList);

      setForm({
        base64Imgs: tempTitleList.map((t) => tempImgMap.get(t)!),
        fileNames: tempTitleList,
        title: epubTitle,
      });
    }
  }, [scraper.data?.bufferedImgs]);

  if (
    !scraper.data?.bufferedImgs ||
    !imgMap ||
    scraper.isLoading ||
    getEpub.isPending
  )
    return <LoadingPage />;

  return (
    <main className="flex min-h-screen w-screen items-center justify-center overflow-y-auto">
      <div className="flex w-full max-md:flex-wrap-reverse items-start justify-start gap-4 p-4">
        <section className="flex flex-col gap-2">
          <div className="relative flex w-full flex-wrap justify-between gap-2">
            <input
              name="title"
              id="title"
              placeholder="Title:"
              className="w-64 rounded-full bg-neutral-800 p-2 placeholder:text-neutral-300 max-sm:w-full"
              value={epubTitle}
              onChange={(e) => setEpubTitle(e.target.value)}
            />
            <div className="flex gap-2 max-sm:w-full">
              <button
                onClick={() => getEpub.mutate(form)}
                className="max-w-fit text-nowrap rounded-full bg-neutral-700 p-3 text-sm hover:bg-neutral-200 hover:text-black"
              >
                Download EPUB
              </button>
              <button
                onClick={() => {
                  sendEpubToKindle.mutate(form);
                }}
                className="max-w-fit text-nowrap rounded-full bg-neutral-700 p-3 text-sm hover:bg-neutral-200 hover:text-black"
              >
                Mail to Kindle
              </button>
            </div>
          </div>
          <div className="flex rounded-md bg-gradient-to-b from-neutral-800 to-neutral-900 p-4 max-sm:flex-col-reverse sm:h-[90vh] ">
            <Reorder.Group
              axis="y"
              values={titleList}
              onReorder={setTitleList}
              className="flex flex-col justify-between overflow-y-auto pr-2"
            >
              {titleList.map((title, i) => (
                <Reorder.Item
                  key={title}
                  value={title}
                  onMouseEnter={() => setSelectedImg(imgMap.get(title)!)}
                  className="flex h-full items-center justify-between rounded-sm p-2 accent-gray-200 hover:bg-white/10 "
                >
                  <div className="flex w-52 items-center">
                    <button
                      onClick={() => {
                        setTitleList((titleList) =>
                          titleList.filter((t) => t !== title),
                        );
                      }}
                      className="relative aspect-square h-4  p-4 hover:text-black"
                    >
                      <Image
                        src="/trash.svg"
                        alt="trash bin"
                        height="26"
                        width="26"
                        className="absolute bottom-1/4 left-0"
                      ></Image>
                    </button>
                    <p className="overflow-hidden text-ellipsis whitespace-nowrap">
                      {title}
                    </p>
                  </div>
                  <p className="text-neutral-500">#{i + 1}</p>
                </Reorder.Item>
              ))}
            </Reorder.Group>
            <div className="flex aspect-[145/212] items-center p-2">
              <img
                src={`data:image/png;base64,${selectedImg}`}
                alt=""
                className="rounded-md object-contain shadow-[rgba(210,210,210,0.4)0px_0px_40px]"
              />
            </div>
          </div>
        </section>
        <section className="flex w-fit flex-col gap-2 max-sm:w-full">
          <LinkForm />
        </section>
      </div>
    </main>
  );
}
