import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ArrowLeft, ArrowRight, Calendar, Check, Clock, Sparkles, Wallet, X, type LucideIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import {
  buildTripFinderQuestions,
  type TripFinderAnswers,
  type TripFinderChip,
  type TripFinderQuestion,
  type TripFinderQuestionId,
} from "../content/trip-finder";
import FilterChipIcon from "./FilterChipIcon";

type TripFinderDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The listing's filter chips; theme and transport answers are picked from them. */
  chips: TripFinderChip[];
  onComplete: (answers: TripFinderAnswers, questions: TripFinderQuestion[]) => void;
  /** Runs once the dialog is gone; prevent the event to move focus somewhere else than back to the opener. */
  onCloseAutoFocus?: (event: Event) => void;
};

const QUESTION_ICONS: Partial<Record<TripFinderQuestionId, LucideIcon>> = {
  duration: Clock,
  timing: Calendar,
  budget: Wallet,
};

/** "Segíts választani": a few skippable questions that narrow the offer list down. */
export default function TripFinderDialog({
  open,
  onOpenChange,
  chips,
  onComplete,
  onCloseAutoFocus,
}: TripFinderDialogProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-[#07111f]/60 backdrop-blur-sm" />
        <DialogPrimitive.Content
          onCloseAutoFocus={onCloseAutoFocus}
          className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-8 fixed inset-x-0 bottom-0 z-50 flex max-h-[92dvh] flex-col overflow-hidden rounded-t-[28px] bg-white shadow-[0_30px_80px_rgba(7,17,31,0.35)] duration-200 sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:w-[calc(100%-2rem)] sm:max-w-xl sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[32px]"
        >
          {/* Mounted only while open, so every opening starts from the first question. */}
          <TripFinderSteps chips={chips} onComplete={onComplete} />
          <DialogPrimitive.Close
            aria-label="Bezárás"
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-[#f4f7fb] hover:text-[#0f172a]"
          >
            <X className="h-5 w-5" />
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

function TripFinderSteps({
  chips,
  onComplete,
}: Pick<TripFinderDialogProps, "chips" | "onComplete">) {
  // Fixed for the opening, so a chip reload behind the dialog cannot shift the steps.
  const [questions] = useState(() => buildTripFinderQuestions(chips));
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<TripFinderAnswers>({});
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const isFirstStep = useRef(true);

  useEffect(() => {
    // Radix focuses the first control on open; later steps announce their question.
    if (isFirstStep.current) {
      isFirstStep.current = false;
      return;
    }
    titleRef.current?.focus();
  }, [stepIndex]);

  const question = questions[stepIndex];
  const isLastStep = stepIndex === questions.length - 1;
  const selected = answers[question.id];
  const QuestionIcon = QUESTION_ICONS[question.id] ?? Sparkles;

  const finish = (finalAnswers: TripFinderAnswers) => onComplete(finalAnswers, questions);

  const goForward = (nextAnswers: TripFinderAnswers) => {
    if (isLastStep) {
      finish(nextAnswers);
      return;
    }
    setStepIndex((current) => current + 1);
  };

  const choose = (value: string) => {
    const isDeselecting = selected === value;
    const nextAnswers = { ...answers, [question.id]: isDeselecting ? undefined : value };

    setAnswers(nextAnswers);

    // A pick moves on by itself, except on the last question, where the visitor sends the search.
    if (!isDeselecting && !isLastStep) {
      goForward(nextAnswers);
    }
  };

  return (
    <>
      <div className="px-6 pb-2 pt-6 sm:px-8 sm:pt-8">
        <div className="mb-5 flex items-center gap-3 pr-10">
          <span className="text-xs font-bold tracking-wide text-[#00a878]">
            {stepIndex + 1}. KÉRDÉS / {questions.length}
          </span>
          <div
            className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#f4f7fb]"
            role="progressbar"
            aria-label="Haladás"
            aria-valuemin={1}
            aria-valuemax={questions.length}
            aria-valuenow={stepIndex + 1}
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#00c389] to-[#16b8ff] transition-[width] duration-300"
              style={{ width: `${((stepIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#00c389]/10 text-[#00c389]">
          <QuestionIcon className="h-5 w-5" aria-hidden="true" />
        </div>
        <DialogPrimitive.Title asChild>
          <h2 ref={titleRef} tabIndex={-1} className="text-2xl font-bold text-[#0f172a] outline-none">
            {question.title}
          </h2>
        </DialogPrimitive.Title>
        <DialogPrimitive.Description className="mt-1 text-sm text-slate-500">
          {question.hint} Ha mindegy, nyugodtan hagyd ki.
        </DialogPrimitive.Description>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4 sm:px-8">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2" role="group" aria-label={question.title}>
          {question.options.map((option) => {
            const isSelected = selected === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => choose(option.value)}
                aria-pressed={isSelected}
                className={
                  isSelected
                    ? "flex items-center gap-3 rounded-2xl border-2 border-[#00c389] bg-[#00c389]/8 px-4 py-3.5 text-left text-sm font-semibold text-[#0f172a]"
                    : "flex items-center gap-3 rounded-2xl border-2 border-gray-100 bg-white px-4 py-3.5 text-left text-sm font-semibold text-gray-700 transition-colors hover:border-[#00c389]/40"
                }
              >
                {option.icon ? (
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f4f7fb] text-[#00c389]">
                    <FilterChipIcon icon={option.icon} />
                  </span>
                ) : null}
                <span className="flex-1">{option.label}</span>
                {isSelected ? <Check className="h-4 w-4 shrink-0 text-[#00c389]" aria-hidden="true" /> : null}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-gray-100 px-6 py-4 sm:px-8">
        {stepIndex > 0 ? (
          <button
            type="button"
            onClick={() => setStepIndex((current) => current - 1)}
            className="inline-flex items-center gap-2 rounded-full px-3 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:text-[#0f172a]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Vissza
          </button>
        ) : (
          <span />
        )}

        <div className="flex items-center gap-2">
          {!isLastStep ? (
            <button
              type="button"
              onClick={() => goForward(answers)}
              className="rounded-full border border-gray-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-[#00c389]/30 hover:text-[#00a878]"
            >
              {selected ? "Tovább" : "Kihagyom"}
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => finish(answers)}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#00c389] to-[#16b8ff] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(0,195,137,0.25)]"
          >
            Mutasd az utakat
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </>
  );
}
