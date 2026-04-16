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
  Lock,
  Trophy,
  Check,
  RotateCcw,
} from "lucide-react";
import clsx from "clsx";
import { learnService, ConceptSummary, ConceptDetail, QuizQuestion } from "@/shared/services/learn";
import {
  useLearnProgressStore,
  CONCEPT_ORDER,
  CONCEPTS_WITHOUT_QUIZ,
} from "@/shared/stores/learnProgressStore";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { useToast } from "@/shared/hooks/useToast";

// ─── Constants ────────────────────────────────────────────────

const DOCKER_BASIC_SLUGS = CONCEPT_ORDER.slice(0, 10);
const SWARM_SLUGS = CONCEPT_ORDER.slice(10);

// ─── Progress Bar ─────────────────────────────────────────────

function ProgressBar({ completed, total }: { completed: number; total: number }) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  if (completed === total && total > 0) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-950/30 border border-yellow-800/40">
        <Trophy className="w-4 h-4 text-yellow-400 shrink-0" />
        <span className="text-xs font-medium text-yellow-300">
          Parabéns! Você completou todos os {total} conceitos! 🎉
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-zinc-500">Progresso</span>
        <span className="text-[11px] text-zinc-400 tabular-nums">
          {completed}/{total} conceitos
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
        <div
          className="h-full rounded-full bg-blue-500 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ─── Concept Card ─────────────────────────────────────────────

function ConceptCard({
  concept,
  active,
  locked,
  completed,
  onClick,
}: {
  concept: ConceptSummary;
  active: boolean;
  locked: boolean;
  completed: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={locked}
      className={clsx(
        "text-left w-full rounded-lg border p-4 transition-all relative",
        locked
          ? "border-zinc-800/50 bg-zinc-900/30 cursor-not-allowed opacity-60"
          : active
          ? "border-blue-600 bg-blue-950/30 shadow-sm shadow-blue-900/30"
          : completed
          ? "border-zinc-700 bg-zinc-900/60 hover:border-zinc-600"
          : "border-zinc-800 bg-zinc-900 hover:border-zinc-600 hover:bg-zinc-800/60"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={clsx("text-xl", locked && "grayscale")}>{concept.emoji}</span>
          <span className={clsx("text-sm font-medium", locked ? "text-zinc-600" : "text-white")}>
            {concept.title}
          </span>
        </div>
        {locked ? (
          <Lock className="w-3.5 h-3.5 text-zinc-700" />
        ) : completed ? (
          <Check className="w-3.5 h-3.5 text-green-500" />
        ) : (
          <ChevronRight
            className={clsx("w-4 h-4 transition-colors", active ? "text-blue-400" : "text-zinc-600")}
          />
        )}
      </div>
      {!locked && (
        <p className="text-xs text-zinc-500 mt-2 leading-relaxed line-clamp-2">
          {concept.summary}
        </p>
      )}
      {locked && (
        <p className="text-xs text-zinc-700 mt-2">Complete o conceito anterior para desbloquear.</p>
      )}
    </button>
  );
}

// ─── Section helper ───────────────────────────────────────────

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

// ─── Quiz Section ─────────────────────────────────────────────

function QuizSection({
  conceptSlug,
  onCompleted,
}: {
  conceptSlug?: string;
  onCompleted?: (passed: boolean) => void;
}) {
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
      setFinished(true); // useEffect handles onCompleted when finished=true
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

  // When finished, notify parent with final pass/fail
  useEffect(() => {
    if (finished && questions) {
      onCompleted?.(score === questions.length);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);

  if (isLoading) {
    return <div className="h-40 bg-zinc-800 rounded-lg animate-pulse" />;
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-6 py-10 text-center">
        <p className="text-zinc-500 text-sm">Nenhuma pergunta disponível.</p>
      </div>
    );
  }

  if (finished) {
    const passed = score === questions.length;
    return (
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6 flex flex-col items-center gap-4 text-center">
        <div className="text-5xl">{passed ? "🎉" : "📚"}</div>
        <div>
          <p className="text-xl font-bold text-white">
            {score}/{questions.length} corretas
          </p>
          <p className="text-sm text-zinc-400 mt-1">
            {passed
              ? "Perfeito! Próximo conceito desbloqueado."
              : "Você precisa acertar todas as questões para desbloquear o próximo conceito."}
          </p>
        </div>
        {!passed && (
          <button
            onClick={handleRestart}
            className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Tentar novamente
          </button>
        )}
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

// ─── Quiz Gate ────────────────────────────────────────────────

function QuizGate({ slug, onUnlocked }: { slug: string; onUnlocked: () => void }) {
  const { completedSlugs, markCompleted } = useLearnProgressStore();
  const isCompleted = completedSlugs.includes(slug);
  const noQuiz = CONCEPTS_WITHOUT_QUIZ.has(slug);
  const isLast = slug === CONCEPT_ORDER[CONCEPT_ORDER.length - 1];

  if (isCompleted) {
    return (
      <div className="rounded-lg border border-green-800/40 bg-green-950/20 px-4 py-3 flex items-center gap-3">
        <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium text-green-300">Conceito concluído</p>
          {!isLast && (
            <p className="text-xs text-green-400/60 mt-0.5">Próximo conceito desbloqueado.</p>
          )}
        </div>
        {!isLast && (
          <button
            onClick={onUnlocked}
            className="flex items-center gap-1.5 text-xs text-green-400 hover:text-green-200 transition-colors shrink-0"
          >
            Próximo
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    );
  }

  if (noQuiz) {
    return (
      <div className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-4 flex flex-col gap-3">
        <p className="text-sm text-zinc-300 font-medium">Pronto para continuar?</p>
        <p className="text-xs text-zinc-500">
          Este conceito não possui quiz. Marque como lido para desbloquear o próximo.
        </p>
        <button
          onClick={() => { markCompleted(slug); onUnlocked(); }}
          className="self-start flex items-center gap-2 px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
        >
          <Check className="w-4 h-4" />
          Marcar como lido → Desbloquear próximo
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-px bg-zinc-800" />
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest px-2">
          Quiz de Progressão
        </p>
        <div className="flex-1 h-px bg-zinc-800" />
      </div>
      <p className="text-xs text-zinc-500">
        Acerte todas as questões para desbloquear o próximo conceito.
      </p>
      <QuizSection
        conceptSlug={slug}
        onCompleted={(passed) => {
          if (passed) {
            markCompleted(slug);
            onUnlocked();
          }
        }}
      />
    </div>
  );
}

// ─── Concept Detail ───────────────────────────────────────────

function ConceptDetailView({
  slug,
  onUnlocked,
}: {
  slug: string;
  onUnlocked: () => void;
}) {
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
      <Section title="Analogia" icon={<Lightbulb className="w-4 h-4" />} color="amber">
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
            {data.relatedConcepts.map((rel) => (
              <span
                key={rel}
                className="text-xs px-2 py-1 rounded-full border border-zinc-700 text-zinc-400"
              >
                {rel}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Quiz Gate */}
      <QuizGate slug={slug} onUnlocked={onUnlocked} />
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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { label: "Containers rodando", value: data.summary.containersRunning, color: "text-green-400" },
          { label: "Containers parados", value: data.summary.containersStopped, color: "text-zinc-400" },
          { label: "Imagens", value: data.summary.totalImages, color: "text-blue-400" },
          { label: "Volumes", value: data.summary.totalVolumes, color: "text-purple-400" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2">
            <p className={clsx("text-xl font-bold", stat.color)}>{stat.value}</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

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

type Tab = "concepts" | "context";

function LearnScreenInner() {
  const searchParams = useSearchParams();
  const initialConcept = searchParams.get("concept");

  const [activeTab, setActiveTab] = useState<Tab>("concepts");
  const [selectedConcept, setSelectedConcept] = useState<string | null>(initialConcept);
  const [confirmReset, setConfirmReset] = useState(false);

  const { completedSlugs, unlockedSlugs, resetProgress } = useLearnProgressStore();
  const { toast } = useToast();

  const { data: concepts, isLoading: loadingConcepts } = useQuery({
    queryKey: ["learn-concepts"],
    queryFn: learnService.listConcepts,
  });

  // On first load, auto-select the first unlocked-but-not-completed concept
  useEffect(() => {
    if (initialConcept || selectedConcept) return;
    const firstPending = CONCEPT_ORDER.find(
      (s) => unlockedSlugs.includes(s) && !completedSlugs.includes(s)
    );
    if (firstPending) setSelectedConcept(firstPending);
    else if (unlockedSlugs.length > 0) setSelectedConcept(unlockedSlugs[0]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleConceptClick(slug: string) {
    if (!unlockedSlugs.includes(slug)) {
      toast({ title: "Conceito bloqueado", description: "Complete o quiz do conceito anterior para desbloquear este." });
      return;
    }
    setSelectedConcept(slug);
  }

  function handleUnlocked() {
    // Auto-select the next unlocked concept
    const currentIdx = selectedConcept ? CONCEPT_ORDER.indexOf(selectedConcept as typeof CONCEPT_ORDER[number]) : -1;
    const nextSlug = currentIdx >= 0 && currentIdx + 1 < CONCEPT_ORDER.length
      ? CONCEPT_ORDER[currentIdx + 1]
      : null;
    if (nextSlug) setSelectedConcept(nextSlug);
  }

  const tabs: Array<{ id: Tab; label: string }> = [
    { id: "concepts", label: "Conceitos" },
    { id: "context", label: "Seu Ambiente" },
  ];

  function renderConceptGroup(
    groupConcepts: readonly string[],
    label: string,
    allConcepts: ConceptSummary[]
  ) {
    const items = groupConcepts
      .map((slug) => allConcepts.find((c) => c.slug === slug))
      .filter(Boolean) as ConceptSummary[];

    if (items.length === 0) return null;

    return (
      <div className="flex flex-col gap-1">
        <p className="px-1 pt-1 pb-0.5 text-[10px] font-semibold text-zinc-600 uppercase tracking-widest">
          {label}
        </p>
        {items.map((concept) => (
          <ConceptCard
            key={concept.slug}
            concept={concept}
            active={selectedConcept === concept.slug}
            locked={!unlockedSlugs.includes(concept.slug)}
            completed={completedSlugs.includes(concept.slug)}
            onClick={() => handleConceptClick(concept.slug)}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-400" />
            Aprender Docker
          </h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            Complete os quizzes para desbloquear novos conceitos.
          </p>
        </div>
        <button
          onClick={() => setConfirmReset(true)}
          className="flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-400 transition-colors shrink-0 mt-1"
          title="Reiniciar progresso"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reiniciar
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-zinc-800">
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
          <div className="flex flex-col gap-4">
            <ProgressBar
              completed={completedSlugs.length}
              total={CONCEPT_ORDER.length}
            />

            {loadingConcepts && (
              <>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-20 bg-zinc-800 rounded-lg animate-pulse" />
                ))}
              </>
            )}

            {concepts && (
              <>
                {renderConceptGroup(DOCKER_BASIC_SLUGS, "Docker Básico", concepts)}
                {renderConceptGroup(SWARM_SLUGS, "Docker Swarm", concepts)}
              </>
            )}
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
                <ConceptDetailView
                  slug={selectedConcept}
                  onUnlocked={handleUnlocked}
                />
              </>
            ) : (
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-6 py-16 text-center">
                <BookOpen className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
                <p className="text-zinc-500 text-sm">
                  Selecione um conceito ao lado para começar.
                </p>
              </div>
            )}
          </div>
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

      {/* Confirm Reset */}
      <ConfirmDialog
        open={confirmReset}
        onOpenChange={setConfirmReset}
        title="Reiniciar progresso"
        description="Todo o seu progresso será apagado e você voltará ao início. Tem certeza?"
        confirmLabel="Reiniciar"
        onConfirm={() => {
          resetProgress();
          setSelectedConcept("container");
          setConfirmReset(false);
        }}
      />
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
