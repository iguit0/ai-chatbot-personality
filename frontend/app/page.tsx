import { PersonalitySelector } from "@/components/personality-selector";
import { ChatWrapper } from "@/components/chat-wrapper";
import { PersonalityProvider } from "@/components/personality-provider";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-center">
            AI Personality Profiles
          </h1>
          <ThemeToggle />
        </div>

        <PersonalityProvider>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <PersonalitySelector />
            </div>
            <div className="md:col-span-2">
              <ChatWrapper conversationId={null} />
            </div>
          </div>
        </PersonalityProvider>
      </div>
    </main>
  );
}
