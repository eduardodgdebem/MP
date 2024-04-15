import Link from "next/link";
import { FormEvent } from "react";

import { CreatePost } from "~/app/_components/create-post";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/trpc/server";
import LinkForm from "./_components/link-form";

export default async function Home() {
  const session = await getServerAuthSession();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <LinkForm />
    </main>
  );
}
