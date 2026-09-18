"use client";

import { useState } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Footer } from "@/components/landing/Footer";
import { CreateRoomModal } from "@/components/modals/CreateRoomModal";
import { JoinRoomModal } from "@/components/modals/JoinRoomModal";
import { MemoriesModal } from "@/components/modals/MemoriesModal";
import { useMemories } from "@/lib/store/use-memories";
import { EnvironmentId } from "@/types";

export default function LandingPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [isMemoriesOpen, setIsMemoriesOpen] = useState(false);
  const [preselectedEnv, setPreselectedEnv] = useState<EnvironmentId>("garagem");

  const { memories, saveMemory, deleteMemory } = useMemories();

  return (
    <main className="min-h-screen bg-[#090807] text-[#ede7df] selection:bg-amber-500/20 selection:text-amber-200">
      {/* Navigation */}
      <Navbar
        onCreateClick={() => setIsCreateOpen(true)}
        onJoinClick={() => setIsJoinOpen(true)}
        onMemoriesClick={() => setIsMemoriesOpen(true)}
      />

      {/* Hero Section */}
      <Hero
        onCreateClick={() => setIsCreateOpen(true)}
        onJoinClick={() => setIsJoinOpen(true)}
      />

      {/* Footer */}
      <Footer />

      {/* Modals */}
      <CreateRoomModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        defaultEnvId={preselectedEnv}
      />

      <JoinRoomModal
        isOpen={isJoinOpen}
        onClose={() => setIsJoinOpen(false)}
      />

      <MemoriesModal
        isOpen={isMemoriesOpen}
        onClose={() => setIsMemoriesOpen(false)}
        memories={memories}
        onSaveNewMemory={(title, note) => {
          saveMemory({
            roomId: "landing",
            roomName: "Nosso Lugar",
            environmentName: "Garagem",
            title,
            note,
            participants: ["Alvaro", "Jeniffer"],
          });
        }}
        onDeleteMemory={deleteMemory}
        currentRoomName="Nosso Lugar"
        currentEnvName="Garagem"
        participants={["Alvaro", "Jeniffer"]}
      />
    </main>
  );
}
