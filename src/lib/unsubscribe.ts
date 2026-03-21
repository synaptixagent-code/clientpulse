import { createHmac } from 'crypto';

function getSecret(): string {
  const secret = process.env.ENCRYPTION_KEY;
  if (!secret) throw new Error('ENCRYPTION_KEY not set');
  return secret;
}

export function generateUnsubscribeToken(submissionId: string): string {
  return createHmac('sha256', getSecret()).update(submissionId).digest('hex');
}

export function verifyUnsubscribeToken(submissionId: string, token: string): boolean {
  const expected = generateUnsubscribeToken(submissionId);
  return expected === token;
}

export function getUnsubscribeUrl(submissionId: string): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const token = generateUnsubscribeToken(submissionId);
  return `${appUrl}/unsubscribe?id=${submissionId}&token=${token}`;
}
