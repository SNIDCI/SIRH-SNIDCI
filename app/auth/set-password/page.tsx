"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();

  const [checking, setChecking] = useState(true);
  const [sessionReady, setSessionReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Le lien d'invitation contient les jetons de session dans l'URL ; le client
    // Supabase les détecte automatiquement au chargement de la page et crée la
    // session. On vérifie ici que c'est bien arrivé avant d'afficher le formulaire.
    let cancelled = false;

    async function checkSession() {
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;

      if (data.session) {
        setSessionReady(true);
        setChecking(false);
        return;
      }

      // Sur certains navigateurs, la session met un instant à s'établir : on
      // réessaie une fois après un court délai avant de conclure à un échec.
      setTimeout(async () => {
        if (cancelled) return;
        const retry = await supabase.auth.getSession();
        setSessionReady(!!retry.data.session);
        setChecking(false);
      }, 1200);
    }

    checkSession();
    return () => { cancelled = true; };
  }, [supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (password !== confirm) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }

    setSubmitting(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setSubmitting(false);

    if (updateError) {
      setError("Échec : " + updateError.message);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="font-serif text-2xl text-ink">Bienvenue</h1>
          <p className="mt-1 text-sm text-slate">Choisis ton mot de passe pour activer ton compte</p>
        </div>

        <div className="panel p-6">
          {checking && <p className="text-center text-sm text-slate">Vérification du lien…</p>}

          {!checking && !sessionReady && (
            <p className="text-sm text-rose">
              Ce lien est invalide ou a expiré. Demande à ton administrateur RH de
              t&apos;envoyer une nouvelle invitation.
            </p>
          )}

          {!checking && sessionReady && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="field-label" htmlFor="password">Mot de passe</label>
                <input
                  id="password"
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="field-input"
                  placeholder="8 caractères minimum"
                />
              </div>
              <div>
                <label className="field-label" htmlFor="confirm">Confirmer le mot de passe</label>
                <input
                  id="confirm"
                  type="password"
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="field-input"
                />
              </div>

              {error && (
                <p role="alert" className="text-sm text-rose">{error}</p>
              )}

              <button type="submit" disabled={submitting} className="btn-primary w-full">
                {submitting ? "Activation…" : "Activer mon compte"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
