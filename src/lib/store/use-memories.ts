"use client";

import { useEffect, useState } from "react";
import { Memory } from "@/types";

const STORAGE_KEY = "together_saved_memories";

export function useMemories() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setMemories(JSON.parse(stored));
      } else {
        // Initial sample memories to show how it works
        const sample: Memory[] = [
          {
            id: "mem-demo-1",
            roomId: "demo-room",
            roomName: "Nosso Cantinho",
            environmentName: "Chuva na Janela",
            timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
            dateFormatted: "16 de Setembro",
            timeFormatted: "22:15",
            title: "Noite chuvosa conversando sobre sonhos",
            note: "Ouvimos o som da chuva e passamos horas rindo de histórias da infância.",
            activityName: "Pensamentos Profundos",
            participants: ["Alvaro", "Jeniffer"],
          },
          {
            id: "mem-demo-2",
            roomId: "demo-room",
            roomName: "Cinema a Dois",
            environmentName: "Garagem",
            timestamp: new Date(Date.now() - 86400000 * 5).toISOString(),
            dateFormatted: "13 de Setembro",
            timeFormatted: "21:40",
            title: "Sessão de filme e pipoca virtual",
            note: "Assistimos Before Sunrise juntos e conversamos até tarde.",
            activityName: "Sessão de Cinema",
            participants: ["Alvaro", "Jeniffer"],
          }
        ];
        setMemories(sample);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sample));
      }
    } catch (e) {
      console.error("Failed to load memories from localStorage", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const saveMemory = (newMem: Omit<Memory, "id" | "timestamp" | "dateFormatted" | "timeFormatted">) => {
    const now = new Date();
    const dateFormatted = now.toLocaleDateString("pt-BR", {
      day: "numeric",
      month: "long",
    });
    const timeFormatted = now.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const memory: Memory = {
      ...newMem,
      id: `mem-${Date.now()}`,
      timestamp: now.toISOString(),
      dateFormatted,
      timeFormatted,
    };

    setMemories((prev) => {
      const updated = [memory, ...prev];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.error("Failed to persist memory", err);
      }
      return updated;
    });

    return memory;
  };

  const addExternalMemory = (externalMem: Memory) => {
    setMemories((prev) => {
      if (prev.some((m) => m.id === externalMem.id)) return prev;
      const updated = [externalMem, ...prev];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.error("Failed to persist external memory", err);
      }
      return updated;
    });
  };

  const deleteMemory = (id: string) => {
    setMemories((prev) => {
      const updated = prev.filter((m) => m.id !== id);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {}
      return updated;
    });
  };

  return { memories, isLoaded, saveMemory, addExternalMemory, deleteMemory };
}
