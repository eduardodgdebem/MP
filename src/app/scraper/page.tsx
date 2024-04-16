"use client";

import { useEffect, useState } from "react";
import { Reorder } from "framer-motion";
import { api } from "~/trpc/react";
import LoadingPage from "~/app/_components/loading/loadingPage";
import { useUrlStore } from "../store/urlStore";
import LinkForm from "../_components/link-form";

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
    if (
      scraper.data &&
      scraper.data?.bufferedImgs &&
      scraper.data?.bufferedImgs.size > 0
    ) {
      const ImgMap = scraper.data.bufferedImgs;
      const titleList = [...ImgMap.keys()];
      const firstSelectedImg = [...ImgMap.values()]?.[0] ?? "";

      setImgMap(ImgMap);
      setSelectedImg(firstSelectedImg);
      setTitleList(titleList);

      setForm({
        base64Imgs: titleList.map((t) => imgMap.get(t)!),
        fileNames: titleList,
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
      <div className="flex w-full items-start justify-start gap-4 p-4 max-[1538px]:flex-wrap-reverse">
        <section className="flex flex-col gap-2">
          <div className="flex w-full flex-col">
            <label htmlFor="title">Title:</label>
            <input
              name="title"
              id="title"
              className="w-64 border-[0.5px] bg-gray-900 placeholder:text-gray-600"
              value={epubTitle}
              onChange={(e) => setEpubTitle(e.target.value)}
            />
          </div>
          <div className="flex border-[0.5px] max-sm:flex-col-reverse sm:h-[90vh] ">
            <Reorder.Group
              axis="y"
              values={titleList}
              onReorder={setTitleList}
              className="flex flex-col justify-between overflow-y-auto max-sm:border-t-[0.5px] sm:border-r-[0.5px]"
            >
              {titleList.map((title, i) => (
                <Reorder.Item
                  key={title}
                  value={title}
                  onMouseEnter={() => setSelectedImg(imgMap.get(title)!)}
                  className="flex h-full items-center justify-between border-b-[1px] p-2 accent-gray-200 hover:bg-gray-100 hover:text-gray-900 hover:accent-gray-900"
                >
                  <div className="w-52 overflow-hidden text-ellipsis whitespace-nowrap">
                    <input
                      type="checkbox"
                      name={title}
                      id={title}
                      defaultChecked={true}
                      onChange={(e) => {
                        if (!e.target.checked)
                          setTitleList((titleList) =>
                            titleList.filter((t) => t !== e.target.name),
                          );
                      }}
                    />
                    <label htmlFor={title} className="p-2">
                      {title}
                    </label>
                  </div>
                  <p>#{i + 1}</p>
                </Reorder.Item>
              ))}
            </Reorder.Group>
            <div className="aspect-[3/4] p-2">
              <img
                src={`data:image/png;base64,${selectedImg}`}
                alt=""
                className="h-full object-contain"
              />
            </div>
          </div>
        </section>
        <section className="flex w-full flex-col gap-2">
          <LinkForm />
          <div className="flex items-end gap-2 max-sm:w-full max-sm:py-4">
            <button
              onClick={() => getEpub.mutate(form)}
              className="w-full border-[0.5px] p-4 hover:bg-gray-100 hover:text-gray-900"
            >
              Download EPUB
            </button>
            <button
              onClick={() => {
                sendEpubToKindle.mutate(form);
              }}
              className="w-full border-[0.5px] p-4 hover:bg-gray-100 hover:text-gray-900"
            >
              Mail to Kindle
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
