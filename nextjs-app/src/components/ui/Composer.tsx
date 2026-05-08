"use client";

import { useAppStore } from "@/lib/store";

interface ComposerProps {
  placeholder?: string;
  interactive?: boolean;
}

export function Composer({
  placeholder = "发消息或者按住说话…",
  interactive = false,
}: ComposerProps) {
  const composerDraft = useAppStore((s) => s.composerDraft);
  const focusComposer = useAppStore((s) => s.focusComposer);
  const setComposerDraft = useAppStore((s) => s.setComposerDraft);

  return (
    <div className="composer">
      <div className="composer__row">
        <button className="composer__icon" aria-label="语音" />
        <input
          className="composer__input"
          type="text"
          placeholder={placeholder}
          value={interactive ? composerDraft : ""}
          readOnly={!interactive}
          onClick={interactive ? focusComposer : undefined}
          onChange={
            interactive
              ? (event) => setComposerDraft(event.target.value)
              : undefined
          }
        />
        <button className="composer__icon" aria-label="相机" />
        <button className="composer__icon" aria-label="更多" />
      </div>
    </div>
  );
}
