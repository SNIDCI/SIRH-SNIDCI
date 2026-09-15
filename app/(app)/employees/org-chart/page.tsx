import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

interface OrgNode {
  id: string;
  first_name: string;
  last_name: string;
  position_title: string | null;
  manager_id: string | null;
  children: OrgNode[];
}

function buildTree(rows: any[]): OrgNode[] {
  const nodesById = new Map<string, OrgNode>();

  rows.forEach((r) => {
    nodesById.set(r.id, {
      id: r.id,
      first_name: r.first_name,
      last_name: r.last_name,
      position_title: r.position?.title ?? null,
      manager_id: r.manager_id,
      children: [],
    });
  });

  const roots: OrgNode[] = [];
  nodesById.forEach((node) => {
    if (node.manager_id && nodesById.has(node.manager_id)) {
      nodesById.get(node.manager_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}

function OrgChartBranch({ node, depth }: { node: OrgNode; depth: number }) {
  return (
    <div style={{ marginLeft: depth === 0 ? 0 : 24 }} className="mt-2">
      <Link
        href={`/employees/${node.id}`}
        className="panel inline-flex flex-col px-4 py-2 hover:border-accent"
      >
        <span className="text-sm font-medium text-ink">
          {node.first_name} {node.last_name}
        </span>
        {node.position_title && <span className="text-xs text-slate">{node.position_title}</span>}
      </Link>

      {node.children.length > 0 && (
        <div className="border-l border-line pl-4">
          {node.children.map((child) => (
            <OrgChartBranch key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default async function OrgChartPage() {
  const supabase = createClient();

  const { data: employees } = await supabase
    .from("employees")
    .select("id, first_name, last_name, manager_id, position:positions(title)")
    .eq("status", "actif")
    .order("last_name");

  const tree = buildTree(employees ?? []);

  return (
    <div>
      <h1 className="font-serif text-2xl text-ink">Organigramme</h1>
      <p className="mt-1 text-sm text-slate">
        Généré automatiquement à partir des rattachements hiérarchiques.
      </p>

      <div className="mt-6">
        {tree.length ? (
          tree.map((root) => <OrgChartBranch key={root.id} node={root} depth={0} />)
        ) : (
          <p className="mt-6 text-sm text-slate">
            Aucun employé actif à afficher pour le moment.
          </p>
        )}
      </div>
    </div>
  );
}
