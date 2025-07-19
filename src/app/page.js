export default function Home() {
  console.log(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold">Welcome to My Next.js App!</h1>
      <p className="mt-4 text-lg">
        This is a simple example of a Next.js application.
      </p>
      <p className="mt-4 text-sm text-gray-500">Enjoy building your app!</p>
    </main>
  );
}
