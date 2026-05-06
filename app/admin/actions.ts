"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getRepRoster } from "@/lib/data/contestData";
import {
  clampCount,
  readOverrides,
  writeOverrides,
  type ManualOverrides,
} from "@/lib/data/manualOverrides";

const REPO_OWNER = process.env.GITHUB_REPO_OWNER ?? "mitchgallant20";
const REPO_NAME = process.env.GITHUB_REPO_NAME ?? "may-showroom-showdown";
const REPO_BRANCH = process.env.GITHUB_REPO_BRANCH ?? "main";
const FILE_PATH = "data/overrides.json";

/**
 * Server action that accepts the admin form submission.
 *
 * Persistence: when GITHUB_TOKEN is set (production / Vercel), commits to
 * data/overrides.json in the repo via the GitHub Contents API — that push
 * triggers a redeploy and the new numbers go live on the Pit Wall.
 * Without a token (local dev), falls back to writing the file on disk.
 *
 * On failure the action redirects to /admin?error=<short> with the
 * detailed message in &detail=<encoded text> so the floor manager can
 * actually see what went wrong instead of a generic Next.js crash page.
 */
export async function saveOverrides(formData: FormData): Promise<void> {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (adminPassword) {
    const submitted = formData.get("password");
    if (typeof submitted !== "string" || submitted !== adminPassword) {
      redirect("/admin?error=auth");
    }
  }

  const current = await readOverrides();
  const roster = getRepRoster();

  const next: ManualOverrides = {
    perRep: {},
    lastUpdated: current.lastUpdated,
  };

  for (const rep of roster) {
    const apts = clampCount(formData.get(`apts:${rep.id}`));
    const deals = clampCount(formData.get(`deals:${rep.id}`));
    next.perRep[rep.id] = { psAppointments: apts, psDeals: deals };
  }

  const stamped: ManualOverrides = {
    ...next,
    lastUpdated: new Date().toISOString(),
  };

  const token = process.env.GITHUB_TOKEN;
  let mode: "github" | "fs";
  try {
    if (token) {
      await commitToGitHub(token, stamped);
      mode = "github";
    } else {
      await writeOverrides(stamped);
      mode = "fs";
    }
  } catch (err) {
    // `redirect()` throws too — let it propagate.
    if (
      err instanceof Error &&
      "digest" in err &&
      typeof (err as { digest?: unknown }).digest === "string" &&
      ((err as { digest: string }).digest.startsWith("NEXT_REDIRECT") ||
        (err as { digest: string }).digest.startsWith("NEXT_NOT_FOUND"))
    ) {
      throw err;
    }
    const message = err instanceof Error ? err.message : String(err);
    const code = token ? "github" : "fs";
    console.error(`[admin/saveOverrides] ${code} write failed:`, message);
    redirect(
      `/admin?error=${code}&detail=${encodeURIComponent(message.slice(0, 500))}`,
    );
  }

  revalidatePath("/");
  revalidatePath("/admin");
  redirect(`/admin?saved=1&via=${mode}`);
}

async function commitToGitHub(
  token: string,
  next: ManualOverrides,
): Promise<void> {
  const apiUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`;
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  // Need the existing file's blob SHA for an update; 404 means create.
  const getRes = await fetch(`${apiUrl}?ref=${REPO_BRANCH}`, {
    headers,
    cache: "no-store",
  });
  let sha: string | undefined;
  if (getRes.ok) {
    const body = (await getRes.json()) as { sha?: string };
    sha = body.sha;
  } else if (getRes.status !== 404) {
    const text = await getRes.text();
    throw new Error(
      `GET ${REPO_OWNER}/${REPO_NAME}/${FILE_PATH}@${REPO_BRANCH} → ${getRes.status} ${text.slice(0, 240)}`,
    );
  }

  const content = Buffer.from(
    JSON.stringify(next, null, 2) + "\n",
    "utf8",
  ).toString("base64");

  const putRes = await fetch(apiUrl, {
    method: "PUT",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({
      message: `chore(admin): update PS counts (${next.lastUpdated})`,
      content,
      sha,
      branch: REPO_BRANCH,
    }),
  });
  if (!putRes.ok) {
    const text = await putRes.text();
    throw new Error(
      `PUT ${REPO_OWNER}/${REPO_NAME}/${FILE_PATH}@${REPO_BRANCH} → ${putRes.status} ${text.slice(0, 240)}`,
    );
  }
}
