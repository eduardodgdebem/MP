"use client";

import { useEffect, useState } from "react";
import { Reorder } from "framer-motion";
import { api } from "~/trpc/react";
import Image from "next/image";

export default function Scraper({ params }: { params: { url: string } }) {
  const decodedUrl = decodeURIComponent(params.url);
  const scraper = api.scraper.getImgsFromUrl.useQuery({ url: decodedUrl });
  const [imgMap, setImgMap] = useState<Map<string, string>>(new Map());
  const [titleList, setTitleList] = useState<string[]>([]);
  const [selectedImgs, setSelectedImgs] = useState("");

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
      const fileName = `DANDADAN.epub`;
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
      title: "DANDADAN",
    });
  }, [titleList, imgMap]);

  useEffect(() => {
    if (
      scraper.data?.bufferedImgs?.size &&
      scraper.data?.bufferedImgs?.size > 0
    ) {
      setImgMap(scraper.data?.bufferedImgs);
      setTitleList([...scraper.data?.bufferedImgs].map(([t]) => t));
    }
  }, [scraper.data?.bufferedImgs]);

  if (!scraper.data?.bufferedImgs || !imgMap) return <p>No image</p>;

  return (
    <main className="flex h-screen w-full items-center justify-around gap-4 p-4 max-sm:flex-col">
      <section className="flex border-[0.5px] max-sm:flex-col-reverse sm:h-[90vh] ">
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
              onMouseEnter={() => setSelectedImgs(imgMap.get(title)!)}
              className="flex h-full items-center justify-between border-b-[1px] p-2 accent-gray-200 hover:bg-gray-100 hover:text-gray-900 hover:accent-gray-900"
            >
              <div className="w-52 overflow-hidden text-ellipsis whitespace-nowrap">
                <input
                  className=" "
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
          <Image
            src={`data:image/png;base64,${selectedImgs}`}
            alt=""
            className="h-full object-contain"
          />
        </div>
      </section>
      <section className="flex h-[90vh] w-full min-w-[10vw] items-end justify-between gap-2 max-sm:py-4">
        <button
          onClick={() => getEpub.mutate(form)}
          className="w-max border-[0.5px] p-4 hover:bg-gray-100 hover:text-gray-900"
        >
          Download EPUB
        </button>
        <button
          onClick={() => {
            sendEpubToKindle.mutate(form);
          }}
          className="w-max border-[0.5px] p-4 hover:bg-gray-100 hover:text-gray-900"
        >
          Mail to Kindle
        </button>
      </section>
    </main>
  );
}
