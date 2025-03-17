"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";

export default function NotFound() {
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const conversationId = window.location.pathname.split("/").pop();
    toast({
      title: "Not Found",
      description: `Conversation ${conversationId} not found`,
      variant: "destructive",
    });
    router.push("/");
  }, [router, toast]);

  return null;
}
