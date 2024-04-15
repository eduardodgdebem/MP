"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function LinkForm() {
  const router = useRouter();
  const [url, setUrl] = useState<string>();

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!url) return;
    const temp = encodeURIComponent(url);
    router.push(`/scraper/${temp}`);
  };

  return (
    <form onSubmit={onSubmit} className="flex items-center gap-2">
      <div className="flex flex-col">
        <label htmlFor="link">Link</label>
        <input
          name="link"
          id="link"
          className="border-[0.5px] bg-gray-900 placeholder:text-gray-600"
          placeholder="https://shoulooklike.these/something/somenthing"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
      </div>
      <button className="w-max border-[0.5px] p-4 hover:bg-gray-100 hover:text-gray-900 disabled:text-gray-400 disabled:border-gray-400 disabled:hover:bg-transparent" disabled={!url?.length}>
        Seguir
      </button>
    </form>
  );
}
