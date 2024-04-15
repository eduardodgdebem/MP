// import { getServerAuthSession } from "~/server/auth";
import LinkForm from "./_components/link-form";

export default async function Home() {
  // const session = await getServerAuthSession();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <LinkForm />
    </main>
  );
}
