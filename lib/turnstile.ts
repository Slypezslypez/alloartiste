// Vérifie côté serveur un jeton Cloudflare Turnstile avant d'accepter un envoi de formulaire public.
// Doc : https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
export async function verifyTurnstile(token: string | undefined | null, remoteIp?: string | null): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // clé non configurée : on ne bloque jamais l'envoi (évite de casser le site)
  if (!token) return false;

  try {
    const body = new URLSearchParams({ secret, response: token });
    if (remoteIp) body.set("remoteip", remoteIp);

    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body
    });
    const data = await res.json();
    return data.success === true;
  } catch {
    return false;
  }
}
