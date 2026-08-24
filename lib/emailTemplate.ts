// Habillage HTML léger et commun à tous les emails AlloArtiste.
// Pas d'images externes ni de polices distantes : juste une mise en page en tableau
// (compatible avec la plupart des clients mail) et les couleurs du site.

export function escapeHtml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function nl2br(str: string) {
  return str.replace(/\n/g, "<br>");
}

export function renderEmail(opts: {
  title: string;
  bodyHtml: string;
  ctaLabel?: string;
  ctaUrl?: string;
}) {
  const { title, bodyHtml, ctaLabel, ctaUrl } = opts;

  return `<!DOCTYPE html>
<html lang="fr">
  <body style="margin:0;padding:0;background:#f3f1ec;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f1ec;padding:32px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;background:#fffdf9;border-radius:10px;overflow:hidden;border:1px solid #e8e2d6;">
            <tr>
              <td style="background:#1c1917;padding:20px 28px;">
                <span style="font-family:Georgia,'Times New Roman',serif;font-size:19px;font-weight:700;color:#fffdf9;letter-spacing:0.02em;">
                  ALLO<span style="color:#c9922c;">ARTISTE</span>
                </span>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 28px 8px;">
                <h1 style="margin:0 0 16px;font-size:18px;line-height:1.4;color:#1c1917;font-family:Georgia,'Times New Roman',serif;font-weight:700;">
                  ${title}
                </h1>
                <div style="font-size:14px;line-height:1.65;color:#524d45;">${bodyHtml}</div>
                ${
                  ctaLabel && ctaUrl
                    ? `<div style="margin:26px 0 6px;">
                  <a href="${ctaUrl}" style="display:inline-block;background:#c9922c;color:#fffdf9;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600;">${ctaLabel}</a>
                </div>`
                    : ""
                }
              </td>
            </tr>
            <tr>
              <td style="padding:18px 28px 22px;border-top:1px solid #e8e2d6;margin-top:10px;">
                <p style="margin:14px 0 0;font-size:11px;line-height:1.5;color:#8c8578;">
                  AlloArtiste — plateforme de mise en relation entre artistes et organisateurs en Belgique.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
