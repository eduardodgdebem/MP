// import { getServerAuthSession } from "~/server/auth";
import LinkForm from "./_components/link-form";
// import Link from "next/link";

export default async function Home() {
  // const session = await getServerAuthSession();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <div className="flex w-full max-w-xl flex-col h-min gap-2">
        <LinkForm />
        {/* <Link
          href={session ? "/api/auth/signout" : "/api/auth/signin"}
          className="w-fit rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
        >
          {session ? "Sign out" : "Sign in"}
        </Link> */}
      </div>
    </main>
  );
}
