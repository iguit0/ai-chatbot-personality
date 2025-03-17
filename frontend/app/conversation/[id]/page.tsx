import { ChatWrapper } from "@/components/chat-wrapper";
import { PersonalityProvider } from "@/components/personality-provider";
import { notFound } from "next/navigation";

async function getConversation(id: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/conversations/${id}`,
    { cache: "no-store" }
  );

  if (!response.ok) {
    return null;
  }

  return response.json();
}

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const conversation = await getConversation(id);

  if (!conversation) {
    notFound();
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm">
        <PersonalityProvider>
          <ChatWrapper conversationId={id} />
        </PersonalityProvider>
      </div>
    </main>
  );
}
