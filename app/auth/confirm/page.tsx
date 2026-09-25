import { confirmInviteLink } from "@/lib/actions/auth-confirm";

export default function ConfirmPage({
  searchParams,
}: {
  searchParams: { token_hash?: string; type?: string; code?: string; next?: string };
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-sm text-center">
        <h1 className="font-serif text-2xl text-ink">Bienvenue</h1>
        <p className="mt-2 text-sm text-slate">
          Clique sur le bouton ci-dessous pour continuer. Cette étape volontaire évite qu&apos;un
          filtre de sécurité de ta messagerie n&apos;invalide le lien avant que tu ne l&apos;ouvres.
        </p>

        <form action={confirmInviteLink} className="panel mt-6 p-6">
          <input type="hidden" name="token_hash" value={searchParams.token_hash ?? ""} />
          <input type="hidden" name="type" value={searchParams.type ?? ""} />
          <input type="hidden" name="code" value={searchParams.code ?? ""} />
          <input type="hidden" name="next" value={searchParams.next ?? "/auth/set-password"} />
          <button type="submit" className="btn-primary w-full">Continuer</button>
        </form>
      </div>
    </div>
  );
}
