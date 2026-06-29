// Join a site-relative asset path to the configured base path with exactly
// one slash between them. Works in dev (BASE_URL = "/") and when deployed
// under a sub-path (BASE_URL = "/resume").
export function withBase(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const clean = path.replace(/^\//, "");
  return `${base}/${clean}`;
}
