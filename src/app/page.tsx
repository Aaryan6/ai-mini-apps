import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

const aiApps = [
  { id: 1, name: "Simple Chatbot", url: "/chat" },
  { id: 2, name: "PDF Chat", url: "/pdf-chat" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-muted/60 p-8">
      <h1 className="text-4xl font-bold mb-8 text-center">AI Mini Apps</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {aiApps.map((app) => (
          <Link href={app.url} key={app.id}>
            <Card key={app.id} className="bg-card/70 group overflow-hidden">
              <CardContent className="p-6 flex gap-2 text-zinc-300 group-hover:bg-card/80 transition-all duration-300">
                <p className="text-xl font-bold">#{app.id}</p>
                <h2 className="text-xl font-semibold">{app.name}</h2>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
