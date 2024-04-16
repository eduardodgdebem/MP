"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";
import { useUrlStore } from "../store/urlStore";

export default function LinkForm() {
  const router = useRouter();
  const currentPath = usePathname();
  const [url, setUrl] = useState<string>();
  const updateUrl = useUrlStore((state) => state.updateUrl);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!url) return;
    updateUrl(url);
    if (currentPath !== "/scraper") router.push(`/scraper`);
  };

  return (
    <form onSubmit={onSubmit} className="flex items-center gap-2 w-full">
      <div className="flex flex-col w-full">
        <label htmlFor="link">Link:</label>
        <input
          name="link"
          id="link"
          className="border-[0.5px] bg-gray-900 placeholder:text-gray-600 w-full max-w-[30rem]"
          placeholder="https://shoulooklike.these/something/somenthing"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
      </div>
      <button
        className="w-max border-[0.5px] p-4 hover:bg-gray-100 hover:text-gray-900 disabled:border-gray-400 disabled:text-gray-400 disabled:hover:bg-transparent"
        disabled={!url?.length}
      >
        Seguir
      </button>
    </form>
  );
}
