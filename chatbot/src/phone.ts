export function extractPhoneFromJid(jid: string): string {
  return jid.split(':')[0].split('@')[0].substring(2);
}
