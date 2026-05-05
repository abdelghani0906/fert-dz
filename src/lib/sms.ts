/**
 * SMS Utility for Fret-Dz
 * Integrated with Twilio API
 */

export async function sendSMS(to: string, message: string) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  // Fallback to logging if environment variables are missing
  if (!accountSid || !authToken || !fromNumber) {
    console.warn('[SMS] Twilio credentials missing. Logging to console instead.');
    console.log(`[MOCK SMS] To: ${to} | Message: ${message}`);
    return { success: true, mock: true };
  }

  try {
    // We use a Basic Auth header for Twilio: Base64(SID:Token)
    const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
    
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${auth}`,
        },
        body: new URLSearchParams({
          To: to,
          From: fromNumber,
          Body: message,
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to send SMS');
    }

    console.log(`[SMS] Successfully sent to ${to}. SID: ${result.sid}`);
    return { success: true, sid: result.sid };
  } catch (error) {
    console.error('[SMS] Twilio Error:', error);
    return { success: false, error };
  }
}

export function formatNewExpeditionSMS(data: {
  description: string,
  wilaya_depart: string,
  wilaya_arrivee: string,
  fournisseur: string
}) {
  return `FRET-DZ: Nouvelle course disponible!\n${data.description}\nDe: ${data.wilaya_depart}\nA: ${data.wilaya_arrivee}\nExpéditeur: ${data.fournisseur}\nConsultez votre dashboard.`;
}

