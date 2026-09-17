"use client";

import { useFormState } from "react-dom";
import { inviteUser, updateUserRole, deleteUserAccount } from "@/lib/actions/users";
import { SubmitButton } from "@/components/submit-button";
import { DeleteButton } from "@/components/delete-button";

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrateur", rh: "RH", manager: "Manager", employe: "Employé",
};

interface AccountRow {
  id: string;
  full_name: string;
  email: string | null;
  role: string;
  employee: { id: string; first_name: string; last_name: string } | null;
}

interface EmployeeOption {
  id: string;
  first_name: string;
  last_name: string;
  work_email: string | null;
}

export function UsersAdmin({
  accounts,
  employeesWithoutAccount,
}: {
  accounts: AccountRow[];
  employeesWithoutAccount: EmployeeOption[];
}) {
  const [state, formAction] = useFormState(inviteUser, {});

  return (
    <div>
      <h1 className="font-serif text-2xl text-ink">Comptes & rôles</h1>
      <p className="mt-1 text-sm text-slate">
        Crée un accès à l&apos;application pour un employé et définis ce qu&apos;il peut voir.
      </p>

      <form action={formAction} className="panel mt-6 space-y-4 p-5">
        <p className="font-serif text-base text-ink">Inviter un utilisateur</p>
        {state.error && <p className="text-sm text-rose">{state.error}</p>}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="field-label" htmlFor="employee_id">Employé</label>
            <select
              id="employee_id"
              name="employee_id"
              required
              className="field-input"
              onChange={(e) => {
                const opt = e.target.selectedOptions[0];
                const email = opt?.dataset.email;
                const emailInput = document.getElementById("invite_email") as HTMLInputElement | null;
                if (emailInput && email) emailInput.value = email;
              }}
            >
              <option value="">Choisir…</option>
              {employeesWithoutAccount.map((e) => (
                <option key={e.id} value={e.id} data-email={e.work_email ?? ""}>
                  {e.last_name} {e.first_name}
                </option>
              ))}
            </select>
            {!employeesWithoutAccount.length && (
              <p className="mt-1 text-xs text-slate">
                Tous les employés ont déjà un compte, ou aucun employé n&apos;existe encore.
              </p>
            )}
          </div>
          <div>
            <label className="field-label" htmlFor="invite_email">E-mail</label>
            <input id="invite_email" name="email" type="email" required className="field-input" />
          </div>
          <div>
            <label className="field-label" htmlFor="role">Rôle</label>
            <select id="role" name="role" defaultValue="employe" className="field-input">
              {Object.entries(ROLE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
        </div>
        <p className="text-xs text-slate">
          Un e-mail d&apos;invitation est envoyé automatiquement pour que la personne choisisse son mot de passe.
        </p>
        <div className="flex justify-end">
          <SubmitButton label="Envoyer l'invitation" />
        </div>
      </form>

      <div className="mt-6 panel divide-y divide-line">
        {accounts.map((a) => (
          <div key={a.id} className="flex items-center justify-between gap-4 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-ink">{a.full_name}</p>
              <p className="text-xs text-slate">{a.email}</p>
            </div>
            <div className="flex items-center gap-3">
              <form action={updateUserRole.bind(null, a.id)}>
                <select
                  name="role"
                  defaultValue={a.role}
                  className="field-input py-1 text-xs"
                  onChange={(e) => e.currentTarget.form?.requestSubmit()}
                >
                  {Object.entries(ROLE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </form>
              <DeleteButton
                action={deleteUserAccount.bind(null, a.id)}
                confirmMessage={`Supprimer le compte de "${a.full_name}" ? La personne ne pourra plus se connecter.`}
              />
            </div>
          </div>
        ))}
        {!accounts.length && (
          <p className="px-4 py-6 text-center text-sm text-slate">Aucun compte créé pour le moment.</p>
        )}
      </div>
    </div>
  );
}
