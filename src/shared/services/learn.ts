import { api } from "@/core/apis/api";

export interface ConceptSummary {
  slug: string;
  title: string;
  emoji: string;
  summary: string;
  relatedConcepts: string[];
}

export interface ConceptDetail extends ConceptSummary {
  explanation: string;
  analogy: string;
  commands: Array<{ cmd: string; desc: string }>;
  tips: string[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  conceptSlug: string;
}

export interface AnswerResult {
  correct: boolean;
  correctIndex: number;
  explanation: string;
}

export interface ContextTip {
  title: string;
  body: string;
  conceptSlug: string;
}

export interface EnvironmentContext {
  summary: {
    containersRunning: number;
    containersStopped: number;
    totalImages: number;
    danglingImages: number;
    totalVolumes: number;
    totalNetworks: number;
    customNetworks: number;
    composeProjects: string[];
  };
  tips: ContextTip[];
}

export const learnService = {
  listConcepts: () =>
    api.get<ConceptSummary[]>("/learn/concepts").then((r) => r.data),

  getConcept: (slug: string) =>
    api.get<ConceptDetail>(`/learn/concepts/${slug}`).then((r) => r.data),

  getQuiz: (conceptSlug?: string) =>
    api
      .get<QuizQuestion[]>("/learn/quiz", {
        params: conceptSlug ? { conceptSlug } : undefined,
      })
      .then((r) => r.data),

  checkAnswer: (questionId: string, answerIndex: number) =>
    api
      .post<AnswerResult>("/learn/quiz/answer", { questionId, answerIndex })
      .then((r) => r.data),

  getContext: () =>
    api.get<EnvironmentContext>("/learn/context").then((r) => r.data),
};
