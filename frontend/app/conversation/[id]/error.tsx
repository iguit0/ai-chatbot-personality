"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const conversationId = window.location.pathname.split("/").pop();
    toast({
      title: "Error",
      description: `Unable to load conversation ${conversationId}`,
      variant: "destructive",
    });
    router.push("/");
  }, [router, toast]);

  return null;
}
