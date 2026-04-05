export const siteConfig = {
  name: "My DSA Gallery",
  author: "Hitesh",
  githubRepo: process.env.NEXT_PUBLIC_GITHUB_REPO ?? "",
  githubBranch: process.env.NEXT_PUBLIC_GITHUB_BRANCH ?? "main",
};

export function githubEditUrl(pathFromRepoRoot: string) {
  const repo = siteConfig.githubRepo;
  if (!repo) return null;
  const branch = siteConfig.githubBranch || "main";
  const clean = pathFromRepoRoot.replace(/^\/+/, "");
  return `https://github.com/${repo}/edit/${branch}/${clean}`;
}

export function githubBlobUrl(pathFromRepoRoot: string) {
  const repo = siteConfig.githubRepo;
  if (!repo) return null;
  const branch = siteConfig.githubBranch || "main";
  const clean = pathFromRepoRoot.replace(/^\/+/, "");
  return `https://github.com/${repo}/blob/${branch}/${clean}`;
}

