import { Fragment, useMemo } from "react";
import { Folder, FileText, FileCode, FileJson, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

type FileEntry = {
  name: string;
  language: string;
  readonly: boolean;
};

type TreeNode = {
  name: string;
  fullPath: string;
  isDir: boolean;
  language?: string;
  readonly?: boolean;
  children: TreeNode[];
};

function buildTree(files: FileEntry[]): TreeNode {
  const root: TreeNode = { name: "", fullPath: "", isDir: true, children: [] };

  for (const file of files) {
    const parts = file.name.split("/");
    let node = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;
      const fullPath = parts.slice(0, i + 1).join("/");

      let child = node.children.find((c) => c.name === part);
      if (!child) {
        child = {
          name: part,
          fullPath,
          isDir: !isLast,
          language: isLast ? file.language : undefined,
          readonly: isLast ? file.readonly : undefined,
          children: [],
        };
        node.children.push(child);
      }
      node = child;
    }
  }

  // Sort: directories first, then files, both alphabetically
  function sortNode(n: TreeNode) {
    n.children.sort((a, b) => {
      if (a.isDir !== b.isDir) return a.isDir ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    for (const c of n.children) {
      if (c.isDir) sortNode(c);
    }
  }
  sortNode(root);

  return root;
}

function fileIcon(language?: string) {
  if (!language) return FileText;
  if (language === "json") return FileJson;
  if (
    language === "javascript" ||
    language === "typescript" ||
    language === "python" ||
    language === "go" ||
    language === "dockerfile" ||
    language === "yaml"
  ) {
    return FileCode;
  }
  return FileText;
}

function languageAccent(language?: string): string {
  switch (language) {
    case "dockerfile":
      return "text-blue-400";
    case "yaml":
      return "text-green-400";
    case "javascript":
      return "text-yellow-400";
    case "typescript":
      return "text-sky-400";
    case "python":
      return "text-emerald-400";
    case "go":
      return "text-cyan-400";
    case "json":
      return "text-orange-400";
    default:
      return "text-zinc-400";
  }
}

type FileTreeProps = {
  files: FileEntry[];
  activeFile?: string;
  onSelect?: (name: string) => void;
};

export function FileTree({ files, activeFile, onSelect }: FileTreeProps) {
  const tree = useMemo(() => buildTree(files), [files]);

  return (
    <div className="font-mono text-xs leading-relaxed select-none">
      <Tree node={tree} depth={0} activeFile={activeFile} onSelect={onSelect} />
    </div>
  );
}

type TreeProps = {
  node: TreeNode;
  depth: number;
  activeFile?: string;
  onSelect?: (name: string) => void;
};

function Tree({ node, depth, activeFile, onSelect }: TreeProps) {
  return (
    <Fragment>
      {node.children.map((child) =>
        child.isDir ? (
          <Fragment key={child.fullPath}>
            <div
              className="flex items-center gap-1.5 py-0.5 text-zinc-300"
              style={{ paddingLeft: depth * 12 }}
            >
              <Folder className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
              <span className="font-medium">{child.name}/</span>
            </div>
            <Tree node={child} depth={depth + 1} activeFile={activeFile} onSelect={onSelect} />
          </Fragment>
        ) : (
          <FileRow
            key={child.fullPath}
            node={child}
            depth={depth}
            isActive={child.fullPath === activeFile}
            onSelect={onSelect}
          />
        ),
      )}
    </Fragment>
  );
}

function FileRow({
  node,
  depth,
  isActive,
  onSelect,
}: {
  node: TreeNode;
  depth: number;
  isActive: boolean;
  onSelect?: (name: string) => void;
}) {
  const Icon = fileIcon(node.language);
  const accent = languageAccent(node.language);
  const clickable = !!onSelect;

  return (
    <button
      type="button"
      disabled={!clickable}
      onClick={() => onSelect?.(node.fullPath)}
      data-testid={`file-tree-item-${node.fullPath}`}
      className={cn(
        "flex items-center gap-1.5 py-0.5 w-full text-left transition-colors",
        clickable && "hover:bg-zinc-800/50 rounded-sm cursor-pointer",
        !clickable && "cursor-default",
        isActive
          ? "text-primary bg-primary/10 rounded-sm"
          : "text-zinc-300",
      )}
      style={{ paddingLeft: depth * 12 + 4, paddingRight: 6 }}
    >
      <Icon className={cn("w-3.5 h-3.5 shrink-0", isActive ? "text-primary" : accent)} />
      <span className="truncate flex-1">{node.name}</span>
      {node.readonly && (
        <Lock className="w-3 h-3 text-zinc-600 shrink-0" aria-label="read-only" />
      )}
    </button>
  );
}
