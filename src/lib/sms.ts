export async function sendSms(params: {
  to: string;
  body: string;
}): Promise<{ ok: boolean; sid?: string; error?: string }> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken  = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    return { ok: false, error: 'Twilio not configured' };
  }

  const encoded = new URLSearchParams({
    To:   params.to,
    From: fromNumber,
    Body: params.body,
  });

  try {
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: encoded.toString(),
      }
    );
    const data = await res.json() as { sid?: string; message?: string };
    if (res.ok) return { ok: true, sid: data.sid };
    return { ok: false, error: data.message || 'SMS send failed' };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}
