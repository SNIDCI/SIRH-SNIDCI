"use client";

export function DeleteButton({
  action,
  confirmMessage,
}: {
  action: () => Promise<void>;
  confirmMessage: string;
}) {
  return (
    <form
      action={async () => {
        if (confirm(confirmMessage)) {
          await action();
        }
      }}
    >
      <button type="submit" className="text-xs text-rose hover:underline">
        Supprimer
      </button>
    </form>
  );
}
