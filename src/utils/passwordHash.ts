const SALT = 'fiorella_salt';
const PREFIX = 'sha256:';

const sha256Hex = async (text: string): Promise<string> => {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
};

export const hashPassword = async (senha: string): Promise<string> => {
  return PREFIX + (await sha256Hex(senha + SALT));
};

// Compara a senha informada com o hash salvo. Aceita o formato legado
// (base64, reversível e inseguro) só para não deslogar contas antigas;
// `upgradedHash` vem preenchido quando o caller deve regravar o hash novo.
export const verifyPassword = async (
  senha: string,
  storedHash: string
): Promise<{ valid: boolean; upgradedHash?: string }> => {
  if (storedHash?.startsWith(PREFIX)) {
    const valid = (await hashPassword(senha)) === storedHash;
    return { valid };
  }

  // Formato legado: btoa(senha + salt)
  const legacyValid = btoa(senha + SALT) === storedHash;
  if (!legacyValid) return { valid: false };

  return { valid: true, upgradedHash: await hashPassword(senha) };
};
