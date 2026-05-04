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
  if (token) {
    await commitToGitHub(token, stamped);
  } else {
    await writeOverrides(stamped);
  }

  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin?saved=1");
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
    throw new Error(
      `GitHub fetch failed: ${getRes.status} ${await getRes.text()}`,
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
    throw new Error(
      `GitHub commit failed: ${putRes.status} ${await putRes.text()}`,
    );
  }
}
