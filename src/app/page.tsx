import GreetingSplash from "@/components/GreetingSplash";
export default function Home() {
  // Check for ?loginOnly=1 in the URL
  let showLoginOnly = false;
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    showLoginOnly = params.get("loginOnly") === "1";
  }
  return (
    <main className='flex min-h-screen items-center justify-center bg-black transition-colors'>
      <GreetingSplash showLoginOnly={showLoginOnly} />
    </main>
  );
}
