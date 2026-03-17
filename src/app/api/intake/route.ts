import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { encrypt } from '@/lib/crypto';
import { checkRateLimit, sanitizeString, validateEmail, validatePhone, getClientIp, auditLog, errorResponse } from '@/lib/security';
import { v4 as uuid } from 'uuid';

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);

  const { allowed } = checkRateLimit(ip, 'intake');
  if (!allowed) return errorResponse(429);

  try {
    const body = await req.json();

    const businessId = sanitizeString(body.businessId || '');
    const clientName = sanitizeString(body.clientName || '');
    const clientEmail = sanitizeString(body.clientEmail || '').toLowerCase();
    const clientPhone = sanitizeString(body.clientPhone || '');
    const serviceRequested = sanitizeString(body.serviceRequested || '');
    const message = sanitizeString(body.message || '');

    if (!businessId) return errorResponse(400);
    if (!clientName || clientName.length < 2) return errorResponse(400);
    if (!validateEmail(clientEmail)) return errorResponse(400);
    if (clientPhone && !validatePhone(clientPhone)) return errorResponse(400);

    // Encrypt sensitive fields (AES-256-GCM)
    const encryptedEmail = encrypt(clientEmail);
    const encryptedPhone = clientPhone ? encrypt(clientPhone) : null;
    const encryptedName = encrypt(clientName);

    const db = getDb();
    const id = uuid();

    db.prepare(`
      INSERT INTO submissions (id, business_id, client_name, client_email, client_phone, service_requested, message, source)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'form')
    `).run(id, businessId, encryptedName, encryptedEmail, encryptedPhone, serviceRequested, message);

    // Schedule default follow-up sequence (1 day, 3 days, 7 days)
    const now = Date.now();
    const followups = [
      { delay: 1 * 24 * 60 * 60 * 1000, subject: 'Thanks for reaching out!', body: 'Hi {{name}}, thanks for contacting us. We\'ll be in touch soon with more details about {{service}}.' },
      { delay: 3 * 24 * 60 * 60 * 1000, subject: 'Following up on your inquiry', body: 'Hi {{name}}, just checking in. Do you have any questions about {{service}}? We\'d love to help.' },
      { delay: 7 * 24 * 60 * 60 * 1000, subject: 'Still interested?', body: 'Hi {{name}}, we noticed you inquired about {{service}}. Let us know if there\'s anything we can do to help.' },
    ];

    for (const fu of followups) {
      db.prepare(`
        INSERT INTO followups (id, submission_id, type, subject, body, scheduled_at, status)
        VALUES (?, ?, 'email', ?, ?, ?, 'pending')
      `).run(uuid(), id, fu.subject, fu.body, new Date(now + fu.delay).toISOString());
    }

    auditLog({ action: 'intake_submission', resource: 'submissions', resourceId: id, ip, details: `business: ${businessId}` });

    return NextResponse.json({ success: true, id });
  } catch {
    return errorResponse(500);
  }
}
