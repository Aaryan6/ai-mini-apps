import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";
import { ArrowLeft } from "lucide-react";
import { auth, signOut } from "@/app/(auth)/auth";
import { cn } from "@/lib/utils";
import { buttonVariants } from "./ui/button";

export async function Header() {
  const session = await auth();
  return (
    <header className="sticky top-0 left-0 w-full z-50 flex items-center justify-between border-b bg-background h-16 px-4">
      <Link
        href="/"
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft size={20} />
        <span>Back</span>
      </Link>

      <div className="flex items-center gap-2">
        {session ? (
          <div className="group py-1 px-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer relative">
            <div className="text-sm dark:text-zinc-400 z-10">
              {session.user?.email}
            </div>
            <div className="flex-col absolute top-6 right-0 w-full pt-5 group-hover:flex hidden">
              <form
                action={async () => {
                  "use server";
                  await signOut();
                }}
              >
                <button
                  type="submit"
                  className="text-sm w-full p-1 rounded-md bg-red-500 text-red-50 hover:bg-red-600"
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>
        ) : (
          <Link
            href="login"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Login
          </Link>
        )}
        <ThemeToggle />
      </div>
    </header>
  );
}
