"use client";

import { useEffect, useRef } from "react";
import { useAppStore } from "@/lib/store";
import { homeSamples, intakeQuestions, plans } from "@/lib/data";
import { PlanCarousel } from "@/components/views/PlanCarousel";
import { Composer } from "@/components/ui/Composer";
import { IconMenu, IconMore } from "@/components/Icons";

export function ChatView() {
  const conversation = useAppStore((s) => s.conversation);
  const intakeAnswers = useAppStore((s) => s.intakeAnswers);
  const startIntake = useAppStore((s) => s.startIntake);
  const answerIntake = useAppStore((s) => s.answerIntake);
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const feed = feedRef.current;
    if (!feed) return;
    requestAnimationFrame(() => {
      const items = feed.children;
      const last = items[items.length - 1];
      if (
        last &&
        (last.classList.contains("plans-carousel") ||
          last.classList.contains("perks-card"))
      ) {
        const intro = feed.querySelector(".plans-intro");
        const target = intro || last;
        if (target instanceof HTMLElement) {
          feed.scrollTop = Math.max(0, target.offsetTop - 8);
        }
      } else if (last?.classList?.contains("qa-block")) {
        if (last instanceof HTMLElement) {
          feed.scrollTop = Math.max(0, last.offsetTop - 24);
        }
      } else {
        feed.scrollTop = feed.scrollHeight;
      }
    });
  }, [conversation]);

  const hasPlans = conversation.some((m) => m.type === "plans");
  const hasQa = conversation.some(
    (m) => m.type === "qa" || m.type === "user"
  );

  return (
    <>
      <header className="appbar">
        <button className="appbar__icon" aria-label="菜单">
          <IconMenu size={22} />
        </button>
        <div className="appbar__title">出行助手</div>
        <button className="appbar__icon" aria-label="更多">
          <IconMore size={22} />
        </button>
      </header>

      <div className="feed" id="feed" ref={feedRef}>
        {conversation.map((item, index) => (
          <ConversationItem
            key={index}
            item={item}
            intakeAnswers={intakeAnswers}
            onStartIntake={startIntake}
            onAnswerIntake={answerIntake}
          />
        ))}
      </div>

      {!hasPlans && hasQa && <ChatSmartSuggestions />}
      <Composer />
    </>
  );
}

function ChatSmartSuggestions() {
  const applyModification = useAppStore((s) => s.applyModification);
  const suggestions = [
    "想去性价比最高",
    "希望中转少一点",
    "想要早班机出发",
  ];
  return (
    <div
      className="smart-suggestions smart-suggestions--inline"
      aria-label="智能建议"
    >
      {suggestions.map((label) => (
        <button
          key={label}
          className="smart-suggestion-chip"
          onClick={() => applyModification(null, label)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

interface ConversationItemProps {
  item: { type: string; [key: string]: unknown };
  intakeAnswers: Record<string, string>;
  onStartIntake: (text: string) => void;
  onAnswerIntake: (qid: string, optId: string) => void;
}

function ConversationItem({
  item,
  intakeAnswers,
  onStartIntake,
  onAnswerIntake,
}: ConversationItemProps) {
  switch (item.type) {
    case "greeting":
      return (
        <div className="greeting">
          <h1 className="greeting__hi">HI, 今天想去哪儿呢？</h1>
          <p className="greeting__sub">
            把这趟出行说清楚，我帮你从头规划到尾
          </p>
          <div className="home-samples">
            {homeSamples.map((text, index) => (
              <button
                key={index}
                className="home-sample"
                onClick={() => onStartIntake(String(text))}
              >
                {text}
              </button>
            ))}
          </div>
        </div>
      );

    case "user":
      return (
        <div
          className={`bubble bubble--user ${item.tone === "soft" ? "bubble--user-soft" : "bubble--user-solid"}`}
        >
          {item.text as string}
        </div>
      );

    case "assistant":
      return (
        <div className="bubble bubble--assistant">{item.text as string}</div>
      );

    case "thinking":
      return (
        <div className="bubble bubble--assistant bubble--thinking">
          <span className="thinking-dots">
            <span />
            <span />
            <span />
          </span>
        </div>
      );

    case "qa": {
      const qid = item.qid as string;
      const question = intakeQuestions.find(
        (q: { id: string }) => q.id === qid
      ) as { id: string; prompt?: string; hint?: string; options?: { id: string; label: string; sub?: string; default?: boolean }[] } | undefined;
      if (!question || !question.options) return null;
      const answered = intakeAnswers[qid];
      return (
        <div className="qa-block" data-answered={answered || undefined}>
          <p className="qa-prompt">{question.prompt}</p>
          {question.hint && <p className="qa-hint">{question.hint}</p>}
          <div className="qa-options">
            {question.options.map((opt) => (
              <button
                key={opt.id}
                className={`qa-option ${answered === opt.id ? "is-selected" : ""} ${opt.default ? "is-default" : ""}`}
                onClick={() => !answered && onAnswerIntake(qid, opt.id)}
                disabled={!!answered}
              >
                <span className="qa-option__label">{opt.label}</span>
                {opt.sub && (
                  <span className="qa-option__sub">{opt.sub}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      );
    }

    case "plans-intro":
      return (
        <div className="plans-intro bubble bubble--assistant">
          {item.text as string}
        </div>
      );

    case "plans":
      return <PlanCarousel />;

    default:
      return null;
  }
}
