/**
 * GET /api/ag/auth/login — redirect to GitHub App install URL
 *
 * The GitHub App's install URL is:
 *   https://github.com/apps/<app-slug>/installations/new
 *
 * For a public GitHub App, this prompts the user to select which repos
 * to grant access to. After installation, GitHub redirects to the
 * callback URL configured in the GitHub App settings.
 */

import { Env, json } from "../_shared";

export const onRequest: PagesFunction<Env> = async (context) => {
  const { env, request } = context;
  const url = new URL(request.url);

  const appSlug = env.GITHUB_CLIENT_ID
    ? "opencodewebsag"
    : "";

  if (!appSlug) {
    return json({ error: "AG bot not configured" }, 503);
  }

  // Install URL for the GitHub App
  // The app's configured redirect_uri handles the installation callback
  const installUrl = new URL(`https://github.com/apps/${appSlug}/installations/new`);

  // Optional: point redirect_uri to our callback
  installUrl.searchParams.set(
    "redirect_uri",
    `${url.origin}/api/ag/auth/callback`
  );

  return Response.redirect(installUrl.toString(), 302);
};
