"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  BookOpen,
  ChevronRight,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Lightbulb,
  Terminal,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import clsx from "clsx";
import { learnService, ConceptSummary, ConceptDetail, QuizQuestion } from "@/shared/services/learn";

// ─── Concept Card ─────────────────────────────────────────────

function ConceptCard({
  concept,
  active,
  onClick,
}: {
  concept: ConceptSummary;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "text-left w-full rounded-lg border p-4 transition-all",
        active
          ? "border-blue-600 bg-blue-950/30 shadow-sm shadow-blue-900/30"
          : "border-zinc-800 bg-zinc-900 hover:border-zinc-600 hover:bg-zinc-800/60"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">{concept.emoji}</span>
          <span className="text-sm font-medium text-white">{concept.title}</span>
        </div>
        <ChevronRight
          className={clsx(
            "w-4 h-4 transition-colors",
            active ? "text-blue-400" : "text-zinc-600"
          )}
        />
      </div>
      <p className="text-xs text-zinc-500 mt-2 leading-relaxed line-clamp-2">
        {concept.summary}
      </p>
    </button>
  );
}

// ─── Concept Detail ───────────────────────────────────────────

function ConceptDetailView({ slug }: { slug: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["learn-concept", slug],
    queryFn: () => learnService.getConcept(slug),
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 animate-pulse">
        <div className="h-8 bg-zinc-800 rounded w-1/3" />
        <div className="h-4 bg-zinc-800 rounded w-full" />
        <div className="h-4 bg-zinc-800 rounded w-5/6" />
        <div className="h-4 bg-zinc-800 rounded w-4/6" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">{data.emoji}</span>
          <h2 className="text-2xl font-bold text-white">{data.title}</h2>
        </div>
        <p className="text-sm text-zinc-400 leading-relaxed">{data.summary}</p>
      </div>

      {/* Explicação */}
      <Section title="O que é?" icon={<BookOpen className="w-4 h-4" />}>
        <p className="text-sm text-zinc-300 leading-relaxed">{data.explanation}</p>
      </Section>

      {/* Analogia */}
      <Section
        title="Analogia"
        icon={<Lightbulb className="w-4 h-4" />}
        color="amber"
      >
        <p className="text-sm text-amber-200/80 leading-relaxed italic">
          &ldquo;{data.analogy}&rdquo;
        </p>
      </Section>

      {/* Comandos */}
      {data.commands.length > 0 && (
        <Section title="Comandos essenciais" icon={<Terminal className="w-4 h-4" />} color="emerald">
          <div className="flex flex-col gap-3">
            {data.commands.map((c) => (
              <div key={c.cmd} className="flex flex-col gap-1">
                <code className="text-xs font-mono text-emerald-300 bg-zinc-900/80 px-3 py-2 rounded border border-zinc-800">
                  {c.cmd}
                </code>
                <p className="text-xs text-zinc-500 pl-1">{c.desc}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Tips */}
      {data.tips.length > 0 && (
        <Section title="Pro tips" icon={<Sparkles className="w-4 h-4" />} color="purple">
          <ul className="flex flex-col gap-2">
            {data.tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-zinc-400 leading-relaxed">
                <span className="text-purple-400 mt-0.5 shrink-0">✦</span>
                {tip}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Related concepts */}
      {data.relatedConcepts.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
            Conceitos relacionados
          </p>
          <div className="flex flex-wrap gap-2">
            {data.relatedConcepts.map((slug) => (
              <span
                key={slug}
                className="text-xs px-2 py-1 rounded-full border border-zinc-700 text-zinc-400"
              >
                {slug}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Section({
  title,
  icon,
  color = "blue",
  children,
}: {
  title: string;
  icon: React.ReactNode;
  color?: "blue" | "amber" | "emerald" | "purple";
  children: React.ReactNode;
}) {
  const colorMap = {
    blue: "text-blue-400 border-blue-800/40 bg-blue-950/10",
    amber: "text-amber-400 border-amber-800/40 bg-amber-950/10",
    emerald: "text-emerald-400 border-emerald-800/40 bg-emerald-950/10",
    purple: "text-purple-400 border-purple-800/40 bg-purple-950/10",
  };

  return (
    <div className={clsx("rounded-lg border p-4", colorMap[color])}>
      <div className={clsx("flex items-center gap-2 mb-3", colorMap[color].split(" ")[0])}>
        {icon}
        <p className="text-xs font-semibold uppercase tracking-wider">{title}</p>
      </div>
      {children}
    </div>
  );
}

// ─── Quiz ─────────────────────────────────────────────────────

function QuizSection({ conceptSlug }: { conceptSlug?: string }) {
  const { data: questions, isLoading } = useQuery({
    queryKey: ["learn-quiz", conceptSlug],
    queryFn: () => learnService.getQuiz(conceptSlug),
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<{
    correct: boolean;
    correctIndex: number;
    explanation: string;
  } | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const { mutate: checkAnswer, isPending } = useMutation({
    mutationFn: ({ questionId, answerIndex }: { questionId: string; answerIndex: number }) =>
      learnService.checkAnswer(questionId, answerIndex),
    onSuccess: (data) => {
      setResult(data);
      if (data.correct) setScore((s) => s + 1);
    },
  });

  function handleSelect(index: number) {
    if (selected !== null || !questions) return;
    setSelected(index);
    checkAnswer({ questionId: questions[currentIndex].id, answerIndex: index });
  }

  function handleNext() {
    if (!questions) return;
    if (currentIndex + 1 >= questions.length) {
      setFinished(true);
    } else {
      setCurrentIndex((i) => i + 1);
      setSelected(null);
      setResult(null);
    }
  }

  function handleRestart() {
    setCurrentIndex(0);
    setSelected(null);
    setResult(null);
    setScore(0);
    setFinished(false);
  }

  if (isLoading) {
    return (
      <div className="h-40 bg-zinc-800 rounded-lg animate-pulse" />
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-6 py-10 text-center">
        <p className="text-zinc-500 text-sm">Nenhuma pergunta disponível.</p>
      </div>
    );
  }

  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6 flex flex-col items-center gap-4 text-center">
        <div className="text-5xl">{pct >= 70 ? "🎉" : pct >= 40 ? "📚" : "💪"}</div>
        <div>
          <p className="text-xl font-bold text-white">
            {score}/{questions.length} corretas
          </p>
          <p className="text-sm text-zinc-500 mt-1">
            {pct >= 70
              ? "Ótimo resultado! Você domina esses conceitos."
              : pct >= 40
              ? "Bom começo! Continue explorando os conceitos."
              : "Continue estudando — você vai chegar lá!"}
          </p>
        </div>
        <button
          onClick={handleRestart}
          className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Tentar novamente
        </button>
      </div>
    );
  }

  const question = questions[currentIndex];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-zinc-500">
          Pergunta {currentIndex + 1} de {questions.length}
        </p>
        <p className="text-xs text-zinc-500">{score} corretas até agora</p>
      </div>

      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
        <p className="text-sm font-medium text-white leading-relaxed mb-4">
          {question.question}
        </p>

        <div className="flex flex-col gap-2">
          {question.options.map((option, i) => {
            let style = "border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:bg-zinc-800/50";
            if (selected !== null) {
              if (result && i === result.correctIndex) {
                style = "border-green-600 bg-green-950/30 text-green-300";
              } else if (i === selected && result && !result.correct) {
                style = "border-red-600 bg-red-950/30 text-red-300";
              } else {
                style = "border-zinc-800 text-zinc-500 opacity-60";
              }
            }

            return (
              <button
                key={i}
                disabled={selected !== null || isPending}
                onClick={() => handleSelect(i)}
                className={clsx(
                  "text-left w-full rounded-md border px-4 py-3 text-sm transition-all",
                  style
                )}
              >
                <span className="font-mono text-xs mr-2 opacity-60">
                  {String.fromCharCode(65 + i)})
                </span>
                {option}
              </button>
            );
          })}
        </div>

        {result && (
          <div
            className={clsx(
              "mt-4 rounded-md p-3 text-xs leading-relaxed flex items-start gap-2",
              result.correct
                ? "bg-green-950/30 border border-green-800/40 text-green-300"
                : "bg-red-950/30 border border-red-800/40 text-red-300"
            )}
          >
            {result.correct ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
            )}
            <span>{result.explanation}</span>
          </div>
        )}
      </div>

      {selected !== null && (
        <div className="flex justify-end">
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
          >
            {currentIndex + 1 >= questions.length ? "Ver resultado" : "Próxima"}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Environment Context ──────────────────────────────────────

function EnvironmentContextSection() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["learn-context"],
    queryFn: learnService.getContext,
  });

  if (isLoading) {
    return <div className="h-32 bg-zinc-800 rounded-lg animate-pulse" />;
  }

  if (isError || !data) return null;

  return (
    <div className="flex flex-col gap-3">
      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { label: "Containers rodando", value: data.summary.containersRunning, color: "text-green-400" },
          { label: "Containers parados", value: data.summary.containersStopped, color: "text-zinc-400" },
          { label: "Imagens", value: data.summary.totalImages, color: "text-blue-400" },
          { label: "Volumes", value: data.summary.totalVolumes, color: "text-purple-400" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2"
          >
            <p className={clsx("text-xl font-bold", stat.color)}>{stat.value}</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tips */}
      {data.tips.length > 0 && (
        <div className="flex flex-col gap-2">
          {data.tips.map((tip, i) => (
            <div
              key={i}
              className="rounded-lg border border-amber-800/30 bg-amber-950/10 px-4 py-3 flex items-start gap-3"
            >
              <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-amber-300">{tip.title}</p>
                <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">{tip.body}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {data.tips.length === 0 && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-center">
          <p className="text-zinc-500 text-sm">Seu ambiente está organizado! Nenhuma dica no momento.</p>
        </div>
      )}
    </div>
  );
}

// ─── Main Screen ──────────────────────────────────────────────

type Tab = "concepts" | "quiz" | "context";

function LearnScreenInner() {
  const searchParams = useSearchParams();
  const initialConcept = searchParams.get("concept");

  const [activeTab, setActiveTab] = useState<Tab>(initialConcept ? "concepts" : "concepts");
  const [selectedConcept, setSelectedConcept] = useState<string | null>(initialConcept);

  const { data: concepts, isLoading: loadingConcepts } = useQuery({
    queryKey: ["learn-concepts"],
    queryFn: learnService.listConcepts,
  });

  const tabs: Array<{ id: Tab; label: string }> = [
    { id: "concepts", label: "Conceitos" },
    { id: "quiz", label: "Quiz" },
    { id: "context", label: "Seu Ambiente" },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-400" />
          Aprender Docker
        </h1>
        <p className="text-sm text-zinc-500 mt-0.5">
          Conceitos, comandos e dicas baseadas no seu ambiente Docker atual
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-zinc-800 pb-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              "px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px",
              activeTab === tab.id
                ? "border-blue-500 text-white"
                : "border-transparent text-zinc-500 hover:text-zinc-300"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Concepts Tab */}
      {activeTab === "concepts" && (
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          {/* Lista de conceitos */}
          <div className="flex flex-col gap-2">
            {loadingConcepts && (
              <>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-20 bg-zinc-800 rounded-lg animate-pulse" />
                ))}
              </>
            )}
            {concepts?.map((concept) => (
              <ConceptCard
                key={concept.slug}
                concept={concept}
                active={selectedConcept === concept.slug}
                onClick={() => setSelectedConcept(concept.slug)}
              />
            ))}
          </div>

          {/* Detalhe do conceito */}
          <div>
            {selectedConcept ? (
              <>
                <button
                  onClick={() => setSelectedConcept(null)}
                  className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 mb-4 transition-colors lg:hidden"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Voltar
                </button>
                <ConceptDetailView slug={selectedConcept} />
              </>
            ) : (
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-6 py-16 text-center">
                <BookOpen className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
                <p className="text-zinc-500 text-sm">
                  Selecione um conceito ao lado para ver a explicação detalhada
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quiz Tab */}
      {activeTab === "quiz" && (
        <div className="max-w-2xl">
          <p className="text-sm text-zinc-400 mb-4">
            Teste seus conhecimentos sobre Docker. As perguntas cobrem todos os conceitos do app.
          </p>
          <QuizSection />
        </div>
      )}

      {/* Context Tab */}
      {activeTab === "context" && (
        <div className="max-w-2xl">
          <p className="text-sm text-zinc-400 mb-4">
            Dicas personalizadas baseadas no estado atual do seu ambiente Docker.
          </p>
          <EnvironmentContextSection />
        </div>
      )}
    </div>
  );
}

export function LearnScreen() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-4 animate-pulse">
          <div className="h-8 bg-zinc-800 rounded w-1/4" />
          <div className="h-40 bg-zinc-800 rounded" />
        </div>
      }
    >
      <LearnScreenInner />
    </Suspense>
  );
}
