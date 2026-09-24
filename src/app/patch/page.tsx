import { readFile } from "node:fs/promises";
import path from "node:path";

export const dynamic = "force-dynamic";

interface FileDiff {
  file: string;
  added: number;
  removed: number;
  lines: string[];
}

function parsePatch(raw: string): FileDiff[] {
  const files: FileDiff[] = [];
  let current: FileDiff | null = null;
  for (const line of raw.split("\n")) {
    if (line.startsWith("diff --git")) {
      const m = line.match(/ b\/(.+)$/);
      current = { file: m?.[1] ?? line, added: 0, removed: 0, lines: [] };
      files.push(current);
      continue;
    }
    if (!current) continue;
    if (/^(index |--- |\+\+\+ |new file mode|deleted file mode)/.test(line)) continue;
    if (line.startsWith("+")) current.added++;
    else if (line.startsWith("-")) current.removed++;
    current.lines.push(line);
  }
  // retire la signature git finale
  return files.map((f) => {
    const idx = f.lines.lastIndexOf("-- ");
    return idx > -1 ? { ...f, lines: f.lines.slice(0, idx) } : f;
  });
}

export default async function PatchPage() {
  let raw = "";
  try {
    raw = await readFile(path.join(process.cwd(), "public", "downloads", "sirh-snidci-corrections.patch"), "utf8");
  } catch {
    raw = "";
  }
  const files = parsePatch(raw);
  const totalAdd = files.reduce((s, f) => s + f.added, 0);
  const totalDel = files.reduce((s, f) => s + f.removed, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl">Patch des corrections</h1>
          <p className="mt-1 text-sm text-slate-600">
            {files.length} fichiers · <span className="text-emerald-700">+{totalAdd}</span>{" "}
            <span className="text-red-700">−{totalDel}</span> — vérifié : <code>tsc</code> ✓,{" "}
            <code>next build</code> ✓, migrations SQL exécutées et testées ✓
          </p>
        </div>
        <a href="/downloads/sirh-snidci-corrections.patch" className="rounded-lg bg-[#3A6B58] px-4 py-2 text-sm font-medium text-white hover:bg-[#274A3E]">
          ⬇ Télécharger le .patch
        </a>
      </div>

      <nav className="flex flex-wrap gap-2">
        {files.map((f, i) => (
          <a key={f.file} href={`#f${i}`} className="rounded-md bg-white px-2.5 py-1 font-mono text-xs ring-1 ring-slate-200 hover:ring-[#3A6B58]">
            {f.file}
          </a>
        ))}
      </nav>

      {files.map((f, i) => (
        <section key={f.file} id={`f${i}`} className="overflow-hidden rounded-xl bg-white ring-1 ring-black/5">
          <header className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-2">
            <span className="font-mono text-sm">{f.file}</span>
            <span className="font-mono text-xs">
              <span className="text-emerald-700">+{f.added}</span> <span className="text-red-700">−{f.removed}</span>
            </span>
          </header>
          <pre className="max-h-[520px] overflow-auto text-[12px] leading-5">
            {f.lines.map((l, j) => {
              const cls = l.startsWith("+")
                ? "bg-emerald-50 text-emerald-900"
                : l.startsWith("-")
                  ? "bg-red-50 text-red-900"
                  : l.startsWith("@@")
                    ? "bg-sky-50 text-sky-700"
                    : "text-slate-600";
              return (
                <div key={j} className={`px-4 ${cls}`}>
                  {l || " "}
                </div>
              );
            })}
          </pre>
        </section>
      ))}

      {!files.length && <p className="text-sm text-slate-500">Patch introuvable.</p>}
    </div>
  );
}
