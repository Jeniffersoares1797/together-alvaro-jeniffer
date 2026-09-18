"use client";

import { useState, useRef, useEffect } from "react";
import { X, Sparkles, MessageCircle, Film, HeartHandshake, PenTool, Shuffle, Check, Copy, Share2, RotateCcw } from "lucide-react";
import { ActiveActivity, ConversationCard } from "@/types";
import { CONVERSATION_CARDS, MOVIE_SUGGESTIONS, MOOD_PRESETS } from "@/lib/data/activities";

interface ActivitiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: ActiveActivity;
  onSelectActivity: (activity: ActiveActivity) => void;
  onSelectMovieToWatch?: (title: string) => void;
  onShareMood?: (moodText: string, emoji: string) => void;
  onSaveMoment?: (title: string, activityName: string) => void;
}

export function ActivitiesModal({
  isOpen,
  onClose,
  activeTab = "conversations",
  onSelectActivity,
  onSelectMovieToWatch,
  onShareMood,
  onSaveMoment,
}: ActivitiesModalProps) {
  const [currentTab, setCurrentTab] = useState<ActiveActivity>(activeTab === "none" ? "conversations" : activeTab);
  
  // Conversations state
  const [cardIndex, setCardIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Movie suggestions copy/share state
  const [copiedMovieId, setCopiedMovieId] = useState<string | null>(null);
  const [suggestedMovieId, setSuggestedMovieId] = useState<string | null>(null);

  // Mood state
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [moodNote, setMoodNote] = useState("");
  const [moodSharedSuccess, setMoodSharedSuccess] = useState(false);

  // Doodle state
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState("#fbbf24");
  const [brushSize, setBrushSize] = useState(4);

  useEffect(() => {
    if (activeTab !== "none") {
      setCurrentTab(activeTab);
    }
  }, [activeTab]);

  if (!isOpen) return null;

  const filteredCards = selectedCategory === "all"
    ? CONVERSATION_CARDS
    : CONVERSATION_CARDS.filter((c) => c.category === selectedCategory);

  const currentCard = filteredCards[cardIndex % filteredCards.length];

  const handleNextCard = () => {
    setCardIndex((prev) => (prev + 1) % filteredCards.length);
  };

  const handleShuffleCard = () => {
    const nextIdx = Math.floor(Math.random() * filteredCards.length);
    setCardIndex(nextIdx);
  };

  // Movie suggestions actions
  const handleCopyMovieTitle = (id: string, title: string) => {
    try {
      navigator.clipboard.writeText(title);
      setCopiedMovieId(id);
      setTimeout(() => setCopiedMovieId(null), 2500);
    } catch (e) {}
  };

  const handleSuggestMovie = (id: string, movieTitle: string, movieGenre: string) => {
    if (onShareMood) {
      onShareMood(`sugeriu assistirem o filme "${movieTitle}" (${movieGenre})`, "🎬");
    }
    setSuggestedMovieId(id);
    setTimeout(() => setSuggestedMovieId(null), 3000);
  };

  // Doodle Canvas handlers with accurate touch / resolution scaling
  const getCoordinates = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
    canvas: HTMLCanvasElement
  ) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e && e.touches.length > 0 ? e.touches[0].clientX : "clientX" in e ? e.clientX : 0;
    const clientY = "touches" in e && e.touches.length > 0 ? e.touches[0].clientY : "clientY" in e ? e.clientY : 0;

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCoordinates(e, canvas);

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCoordinates(e, canvas);

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleShareMoodSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMood) return;
    const preset = MOOD_PRESETS.find((m) => m.id === selectedMood);
    const fullText = `${preset?.emoji} ${preset?.label}${moodNote ? ` — "${moodNote}"` : ""}`;
    if (onShareMood) {
      onShareMood(fullText, preset?.emoji || "✨");
    }
    setMoodSharedSuccess(true);
    setTimeout(() => setMoodSharedSuccess(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-3xl glass-panel border border-white/[0.12] shadow-2xl p-6 sm:p-8 overflow-hidden text-[#f6f0e8] flex flex-col max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full text-stone-400 hover:text-stone-100 hover:bg-white/5 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-300">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-medium text-[#f6f0e8]">
              Vamos fazer alguma coisa?
            </h2>
            <p className="text-xs text-stone-400">
              Momentos interativos para nós aproveitarmos na sala.
            </p>
          </div>
        </div>

        {/* Activity Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none mb-6 border-b border-white/[0.08]">
          <button
            onClick={() => {
              setCurrentTab("conversations");
              onSelectActivity("conversations");
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all shrink-0 cursor-pointer ${
              currentTab === "conversations"
                ? "bg-amber-400/15 text-amber-200 border border-amber-400/40 shadow-sm"
                : "text-stone-400 hover:text-stone-200 hover:bg-white/[0.04]"
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            <span>Perguntas para Conversar</span>
          </button>

          <button
            onClick={() => {
              setCurrentTab("movies");
              onSelectActivity("movies");
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all shrink-0 cursor-pointer ${
              currentTab === "movies"
                ? "bg-amber-400/15 text-amber-200 border border-amber-400/40 shadow-sm"
                : "text-stone-400 hover:text-stone-200 hover:bg-white/[0.04]"
            }`}
          >
            <Film className="w-4 h-4" />
            <span>Sugestões de Filmes</span>
          </button>

          <button
            onClick={() => {
              setCurrentTab("mood");
              onSelectActivity("mood");
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all shrink-0 cursor-pointer ${
              currentTab === "mood"
                ? "bg-amber-400/15 text-amber-200 border border-amber-400/40 shadow-sm"
                : "text-stone-400 hover:text-stone-200 hover:bg-white/[0.04]"
            }`}
          >
            <HeartHandshake className="w-4 h-4" />
            <span>Como foi seu dia?</span>
          </button>

          <button
            onClick={() => {
              setCurrentTab("doodle");
              onSelectActivity("doodle");
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all shrink-0 cursor-pointer ${
              currentTab === "doodle"
                ? "bg-amber-400/15 text-amber-200 border border-amber-400/40 shadow-sm"
                : "text-stone-400 hover:text-stone-200 hover:bg-white/[0.04]"
            }`}
          >
            <PenTool className="w-4 h-4" />
            <span>Mural de Rabiscos</span>
          </button>
        </div>

        {/* Tab 1: Conversations */}
        {currentTab === "conversations" && (
          <div className="flex-1 overflow-y-auto space-y-6">
            {/* Category Filter */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
              {[
                { id: "all", label: "Todas as Perguntas" },
                { id: "profundo", label: "Profundas" },
                { id: "nos", label: "Sobre Nós" },
                { id: "leve", label: "Para Sorrir" },
                { id: "nostalgia", label: "Nostalgia" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setCardIndex(0);
                  }}
                  className={`px-3 py-1 rounded-full text-[11px] font-medium transition-colors cursor-pointer ${
                    selectedCategory === cat.id
                      ? "bg-amber-300 text-stone-950 font-semibold shadow-sm"
                      : "bg-stone-900/60 text-stone-400 hover:text-white"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Question Card Deck */}
            {currentCard && (
              <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-stone-900/90 via-stone-900/60 to-stone-950 border border-amber-500/30 shadow-2xl flex flex-col justify-between min-h-[200px]">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] uppercase tracking-wider font-mono text-amber-300 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
                    {currentCard.categoryLabel}
                  </span>
                  <span className="text-xs text-stone-400 font-mono">
                    Carta {(cardIndex % filteredCards.length) + 1} de {filteredCards.length}
                  </span>
                </div>

                <p className="text-lg sm:text-xl font-light text-[#f6f0e8] leading-relaxed my-3">
                  &ldquo;{currentCard.question}&rdquo;
                </p>

                {currentCard.followUp && (
                  <p className="text-xs text-amber-300/80 italic mt-2">
                    💡 Para aprofundar: {currentCard.followUp}
                  </p>
                )}

                <div className="flex items-center justify-between pt-6 mt-4 border-t border-white/5">
                  <button
                    onClick={handleShuffleCard}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs text-stone-300 transition-colors cursor-pointer"
                  >
                    <Shuffle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Aleatória</span>
                  </button>

                  <button
                    onClick={handleNextCard}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-300 to-amber-400 hover:from-amber-200 hover:to-amber-300 text-stone-950 text-xs font-semibold shadow-md transition-transform active:scale-95 cursor-pointer"
                  >
                    Próxima Pergunta &rarr;
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Movie Suggestions */}
        {currentTab === "movies" && (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            <div className="p-3.5 rounded-2xl bg-amber-500/[0.07] border border-amber-500/20 text-xs text-amber-100/90 leading-relaxed flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Sugestões curadas para inspirar o que assistir no streaming ou via compartilhamento de tela:</span>
              </div>
            </div>

            <div className="space-y-3">
              {MOVIE_SUGGESTIONS.map((movie) => {
                const isCopied = copiedMovieId === movie.id;
                const isSuggested = suggestedMovieId === movie.id;
                return (
                  <div
                    key={movie.id}
                    className="p-4 sm:p-5 rounded-2xl bg-stone-900/60 border border-white/[0.06] hover:border-amber-400/25 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
                  >
                    <div className="space-y-1.5 max-w-lg">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-[#f6f0e8]">
                          {movie.title}
                        </span>
                        <span className="text-[11px] text-stone-400 font-mono">
                          ({movie.year})
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-amber-300 font-mono">
                          {movie.genre}
                        </span>
                        <span className="text-[10px] text-stone-500 font-mono">
                          • {movie.duration}
                        </span>
                      </div>
                      <p className="text-xs text-stone-400 leading-relaxed">
                        {movie.description}
                      </p>
                      <div className="text-[11px] text-amber-300/80 italic">
                        ✨ Clima: {movie.mood}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleCopyMovieTitle(movie.id, movie.title)}
                        className="px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-stone-300 border border-white/5 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
                        title="Copiar nome para buscar no seu streaming"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-300">Copiado</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-stone-400" />
                            <span>Copiar Título</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleSuggestMovie(movie.id, movie.title, movie.genre)}
                        className="px-3.5 py-2 rounded-xl bg-amber-400/15 hover:bg-amber-400/25 text-amber-300 border border-amber-400/35 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                        title="Sugerir este filme para quem está na sala"
                      >
                        {isSuggested ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-300">Sugerido!</span>
                          </>
                        ) : (
                          <>
                            <Share2 className="w-3.5 h-3.5 text-amber-400" />
                            <span>Sugerir na Sala</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: Mood Tracker */}
        {currentTab === "mood" && (
          <div className="flex-1 overflow-y-auto space-y-6">
            <form onSubmit={handleShareMoodSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-medium text-stone-300 mb-3">
                  Como você está se sentindo neste momento?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {MOOD_PRESETS.map((m) => {
                    const isSelected = selectedMood === m.id;
                    return (
                      <button
                        type="button"
                        key={m.id}
                        onClick={() => setSelectedMood(m.id)}
                        className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                          isSelected
                            ? "bg-amber-400/15 border-amber-400 text-amber-100 shadow-md"
                            : "bg-stone-900/50 border-white/5 hover:bg-white/[0.04] text-stone-300"
                        }`}
                      >
                        <span className="text-2xl">{m.emoji}</span>
                        <span className="text-xs font-medium">{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-300 mb-2">
                  Quer deixar uma frase ou desabafo curto? (opcional)
                </label>
                <textarea
                  rows={3}
                  value={moodNote}
                  onChange={(e) => setMoodNote(e.target.value)}
                  placeholder="Ex: Foi um dia corrido no trabalho, mas agora estou em paz aqui com você..."
                  className="w-full px-4 py-3 rounded-2xl bg-stone-900/90 border border-white/10 text-xs text-[#f6f0e8] placeholder:text-stone-500 focus:outline-none focus:border-amber-400/50"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                {moodSharedSuccess ? (
                  <span className="text-xs text-emerald-400 flex items-center gap-1.5">
                    <Check className="w-4 h-4" /> Sentimento compartilhado no chat!
                  </span>
                ) : <span />}

                <button
                  type="submit"
                  disabled={!selectedMood}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-300 to-amber-400 text-stone-950 text-xs font-semibold disabled:opacity-40 transition-all cursor-pointer shadow-md"
                >
                  Compartilhar na Sala
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 4: Doodle Canvas */}
        {currentTab === "doodle" && (
          <div className="flex-1 flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {["#fbbf24", "#f43f5e", "#38bdf8", "#34d399", "#ffffff"].map((c) => (
                  <button
                    key={c}
                    onClick={() => setBrushColor(c)}
                    className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer ${
                      brushColor === c ? "scale-125 border-white shadow-md" : "border-transparent opacity-60"
                    }`}
                    style={{ background: c }}
                  />
                ))}
              </div>

              <button
                onClick={clearCanvas}
                className="flex items-center gap-1 text-xs text-stone-400 hover:text-stone-200 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Limpar</span>
              </button>
            </div>

            {/* Drawing Canvas */}
            <div className="w-full h-64 sm:h-72 rounded-2xl bg-stone-950 border border-stone-800 relative overflow-hidden shadow-inner touch-none">
              <canvas
                ref={canvasRef}
                width={560}
                height={280}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-full cursor-crosshair"
              />
              <span className="absolute bottom-2 right-3 text-[10px] text-stone-600 pointer-events-none">
                Desenhe com o dedo ou mouse
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
