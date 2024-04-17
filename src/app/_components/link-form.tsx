"use client";

import { useRouter, usePathname } from "next/navigation";
import type { FormEvent } from "react";
import { useUrlStore } from "../store/urlStore";
import Image from "next/image";

export default function LinkForm() {
  const router = useRouter();
  const currentPath = usePathname();
  const url = useUrlStore((state) => state.url)
  const updateUrl = useUrlStore((state) => state.updateUrl);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!url) return;
    if (currentPath !== "/scraper") router.push(`/scraper`);
  };

  return (
    <form onSubmit={onSubmit} className="flex w-full items-center gap-2">
      <div className="flex w-full flex-col">
        <input
          name="link"
          id="link"
          className="rounded-full bg-neutral-800 p-2 placeholder:text-neutral-300"
          placeholder="Your link goes here"
          value={url}
          onChange={(e) => updateUrl(e.target.value)}
        />
      </div>
      <button
        className="aspect-square h-10 text-nowrap rounded-full bg-neutral-700 p-2 hover:bg-neutral-200 hover:text-black"
        disabled={!url?.length}
      >
        <Image
          src="/magnify.svg"
          alt=""
          height="32"
          width="32"
          className="h-full"
        />
      </button>
    </form>
  );
}
