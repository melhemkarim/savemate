"use client";
import { useRef } from "react";
import { SubmitButton } from "./SubmitButton";

export function ConfirmForm({ action, id, label, title, message, confirmLabel, small }: {
  action: (fd: FormData) => Promise<void>; id: string; label: string; title: string; message: string; confirmLabel: string; small?: boolean;
}) {
  const dlg = useRef<HTMLDialogElement>(null);
  return (
    <>
      <button type="button" className={small ? "text-sm font-semibold text-brand-deep underline underline-offset-4" : "btn btn-ghost text-red-700"} onClick={() => dlg.current?.showModal()}>{label}</button>
      <dialog ref={dlg} className="w-[calc(100%-2rem)] max-w-sm rounded-2xl p-6 backdrop:bg-ink/40">
        <h3 className="text-xl font-bold">{title}</h3>
        <p className="mt-2 text-ink2">{message}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" className="btn btn-ghost" onClick={() => dlg.current?.close()}>Cancel</button>
          <form action={action} onSubmit={() => setTimeout(() => dlg.current?.close(), 0)}>
            <input type="hidden" name="id" value={id} />
            <SubmitButton className="btn btn-danger" pendingText="Working…">{confirmLabel}</SubmitButton>
          </form>
        </div>
      </dialog>
    </>
  );
}
