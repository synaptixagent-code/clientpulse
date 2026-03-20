/**
 * Professional branded email templates for ClientPulse follow-up sequences.
 * Uses inline CSS for maximum email client compatibility.
 */

interface TemplateVars {
  clientName: string;
  serviceRequested?: string;
  businessName?: string;
  replyEmail?: string;
}

export interface BrandingVars {
  companyName?: string;
  brandColor?: string;
  replyEmail?: string;
  footerText?: string;
}

function baseTemplate(content: string, vars: TemplateVars, branding?: BrandingVars): string {
  const business    = vars.businessName || 'Us';
  const service     = vars.serviceRequested || 'your request';
  const company     = branding?.companyName || 'ClientPulse';
  const color       = branding?.brandColor  || '#3b82f6';
  const footerText  = branding?.footerText  || 'You received this email because you submitted an inquiry. If you have any questions, simply reply to this email.';
  const initials    = company.split(' ').map((w: string) => w[0] || '').join('').slice(0, 2).toUpperCase() || 'CP';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${company}</title>
</head>
<body style="margin:0;padding:0;background-color:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">

  <!-- Outer wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#0f172a;">
    <tr>
      <td align="center" style="padding:40px 16px;">

        <!-- Email card -->
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:#1e293b;border-radius:16px;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="background-color:${color};padding:32px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="background-color:${color};border-radius:8px;width:36px;height:36px;text-align:center;vertical-align:middle;">
                          <span style="color:#ffffff;font-weight:700;font-size:14px;line-height:36px;">${initials}</span>
                        </td>
                        <td style="padding-left:10px;">
                          <span style="color:#ffffff;font-size:18px;font-weight:700;letter-spacing:-0.5px;">${company}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              ${content.replace('{{name}}', vars.clientName).replace('{{service}}', service).replace('{{business}}', business).replace(/\{\{replyEmail\}\}/g, branding?.replyEmail || '')}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #334155;">
              <p style="margin:0;color:#64748b;font-size:12px;line-height:1.6;">
                ${footerText}
              </p>
              <p style="margin:8px 0 0;color:#475569;font-size:12px;">
                &copy; ${new Date().getFullYear()} ${company}. All rights reserved.
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

function bodyHtml(paragraphs: string[], ctaText?: string, ctaNote?: string): string {
  const paras = paragraphs
    .map(p => `<p style="margin:0 0 16px;color:#cbd5e1;font-size:15px;line-height:1.7;">${p}</p>`)
    .join('');

  const cta = ctaText
    ? `<table cellpadding="0" cellspacing="0" border="0" style="margin:32px 0 16px;">
        <tr>
          <td style="background-color:#3b82f6;border-radius:10px;">
            <a href="mailto:{{replyEmail}}" style="display:inline-block;padding:14px 28px;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;">${ctaText}</a>
          </td>
        </tr>
       </table>`
    : '';

  const note = ctaNote
    ? `<p style="margin:0;color:#64748b;font-size:13px;">${ctaNote}</p>`
    : '';

  return paras + cta + note;
}

// ─── Day 1: Thank you ─────────────────────────────────────────────
export function day1Template(vars: TemplateVars, branding?: BrandingVars): string {
  const content = `
    <h1 style="margin:0 0 8px;color:#f1f5f9;font-size:24px;font-weight:700;letter-spacing:-0.5px;">
      Thanks for reaching out, {{name}}!
    </h1>
    <p style="margin:0 0 28px;color:#94a3b8;font-size:14px;">We received your inquiry about {{service}}</p>
    ${bodyHtml([
      `Hi {{name}}, thank you for getting in touch with us about <strong style="color:#93c5fd;">{{service}}</strong>. We've received your inquiry and wanted to make sure you know we're on it.`,
      `One of our team members will be reviewing your request and will be in touch shortly with all the details you need.`,
      `In the meantime, if you have any urgent questions or additional information you'd like to share, feel free to reply to this email — we're here to help.`,
    ],
    'Reply to This Email',
    'Or simply hit reply — we read every message.'
  )}`;
  return baseTemplate(content, vars, branding);
}

// ─── Day 3: Follow-up ─────────────────────────────────────────────
export function day3Template(vars: TemplateVars, branding?: BrandingVars): string {
  const content = `
    <h1 style="margin:0 0 8px;color:#f1f5f9;font-size:24px;font-weight:700;letter-spacing:-0.5px;">
      Just checking in, {{name}}
    </h1>
    <p style="margin:0 0 28px;color:#94a3b8;font-size:14px;">Following up on your inquiry about {{service}}</p>
    ${bodyHtml([
      `Hi {{name}}, we wanted to follow up on your inquiry about <strong style="color:#93c5fd;">{{service}}</strong> from a few days ago.`,
      `We'd love to connect and answer any questions you might have. Whether you're ready to move forward or just need more information, we're happy to help at whatever pace works best for you.`,
      `Is there a good time to chat, or any specific questions we can answer for you?`,
    ],
    'Get in Touch',
    'Just hit reply — we\'ll get back to you quickly.'
  )}`;
  return baseTemplate(content, vars, branding);
}

// ─── Day 7: Final nudge ───────────────────────────────────────────
export function day7Template(vars: TemplateVars, branding?: BrandingVars): string {
  const content = `
    <h1 style="margin:0 0 8px;color:#f1f5f9;font-size:24px;font-weight:700;letter-spacing:-0.5px;">
      Still interested, {{name}}?
    </h1>
    <p style="margin:0 0 28px;color:#94a3b8;font-size:14px;">Your inquiry about {{service}} is still open</p>
    ${bodyHtml([
      `Hi {{name}}, we noticed your inquiry about <strong style="color:#93c5fd;">{{service}}</strong> is still open, and we wanted to reach out one more time.`,
      `We understand life gets busy. If the timing isn't right or your needs have changed, no worries at all — we just want to make sure you have everything you need to make the best decision for you.`,
      `If you're still interested, we'd love to hear from you. Even a quick reply letting us know where you stand would be incredibly helpful.`,
    ],
    'Let\'s Connect',
    `If you're no longer interested, no action needed — this is our last follow-up.`
  )}`;
  return baseTemplate(content, vars, branding);
}

// ─── Day 14: Re-engagement ────────────────────────────────────────
export function day14Template(vars: TemplateVars, branding?: BrandingVars): string {
  const content = `
    <h1 style="margin:0 0 8px;color:#f1f5f9;font-size:24px;font-weight:700;letter-spacing:-0.5px;">
      We'd still love to help, {{name}}
    </h1>
    <p style="margin:0 0 28px;color:#94a3b8;font-size:14px;">Two weeks since your inquiry about {{service}}</p>
    ${bodyHtml([
      `Hi {{name}}, it's been about two weeks since you reached out about <strong style="color:#93c5fd;">{{service}}</strong>, and we wanted to check in one more time.`,
      `Sometimes the timing just isn't right, and that's completely okay. But if you're still considering it — or if anything has changed — we're still here and ready to help whenever you are.`,
      `Even if you have a quick question or want to revisit the conversation, just reply and we'll pick up right where we left off.`,
    ],
    'Reconnect With Us',
    'No pressure — just here if you need us.'
  )}`;
  return baseTemplate(content, vars, branding);
}

// ─── Day 30: Final check-in ───────────────────────────────────────
export function day30Template(vars: TemplateVars, branding?: BrandingVars): string {
  const content = `
    <h1 style="margin:0 0 8px;color:#f1f5f9;font-size:24px;font-weight:700;letter-spacing:-0.5px;">
      One last check-in, {{name}}
    </h1>
    <p style="margin:0 0 28px;color:#94a3b8;font-size:14px;">30 days since your inquiry about {{service}}</p>
    ${bodyHtml([
      `Hi {{name}}, it's been about a month since you inquired about <strong style="color:#93c5fd;">{{service}}</strong>. We wanted to reach out one final time.`,
      `If life got in the way or you decided to go a different direction, we completely understand — no hard feelings at all. We just want to make sure we didn't drop the ball on our end.`,
      `If you're still interested or want to revisit the conversation at any point in the future, we'd genuinely love to hear from you. We'll keep your inquiry on file.`,
    ],
    'Get Back in Touch',
    `This is our final follow-up. We won't reach out again unless you do.`
  )}`;
  return baseTemplate(content, vars, branding);
}

// ─── Template selector ────────────────────────────────────────────
export function getTemplate(dayIndex: number, vars: TemplateVars, branding?: BrandingVars): string {
  switch (dayIndex) {
    case 0: return day1Template(vars, branding);
    case 1: return day3Template(vars, branding);
    case 2: return day7Template(vars, branding);
    case 3: return day14Template(vars, branding);
    case 4: return day30Template(vars, branding);
    default: return day3Template(vars, branding);
  }
}
