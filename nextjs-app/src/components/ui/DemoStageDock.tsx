"use client";

/**
 * DemoStageDock — 右下角浮动快捷定位面板。
 * 点击 FAB 打开面板，面板内展示链接列表。
 */

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";

interface DockLink {
  href: string;
  label: string;
}

interface DemoStageDockProps {
  links: DockLink[];
}

export function DemoStageDock({ links }: DemoStageDockProps) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const toggleOpen = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    setIsOpen((prev) => !prev);
  }, []);

  useEffect(() => {
    function handleClickOutside() {
      setIsOpen(false);
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div
      ref={rootRef}
      className={`demo-stage-dock-root${isOpen ? " open" : ""}`}
      onClick={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        className="demo-stage-dock-fab"
        onClick={toggleOpen}
        aria-haspopup="true"
        aria-expanded={isOpen}
        title="快速定位"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path d="M12 14.5a2.5 2.5 0 1 1 2.5-2.5a2.5 2.5 0 0 1-2.5 2.5m0-4a1.5 1.5 0 1 0 1.5 1.5a1.5 1.5 0 0 0-1.5-1.5" />
          <path d="M21.435 11.505h-1.46a7.98 7.98 0 0 0-7.48-7.48v-1.46a.51.51 0 0 0-.5-.5a.515.515 0 0 0-.5.5v1.46a8 8 0 0 0-7.48 7.48h-1.45a.5.5 0 1 0 0 1h1.45a8.01 8.01 0 0 0 7.48 7.48v1.45a.51.51 0 0 0 .5.5a.5.5 0 0 0 .5-.5v-1.45a8 8 0 0 0 7.48-7.48h1.46a.5.5 0 0 0 0-1M12 19.005a7 7 0 1 1 7-7a7.02 7.02 0 0 1-7 7" />
        </svg>
      </button>
      <div
        className="demo-stage-dock-panel"
        role="menu"
        aria-label="快速定位"
      >
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="demo-stage-dock-item"
            role="menuitem"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
