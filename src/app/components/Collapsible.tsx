"use client";

import { useState } from "react";

type Props = {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
};

export default function Collapsible({ title, children, defaultOpen = true }: Props) {

  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-lg border bg-white shadow-sm">

      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between p-4 text-left font-semibold text-slate-700 transition hover:bg-slate-50"
      >
        <span>{title}</span>
        <span className="text-xs text-slate-400">{open ? "▼" : "▶"}</span>
      </button>

      {open && (
        <div className="border-t p-4">
          {children}
        </div>
      )}

    </div>
  );
}
