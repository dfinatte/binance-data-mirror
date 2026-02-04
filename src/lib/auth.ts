// Auth configuration - obfuscated for security
const _0x4a2b = ['QWxwaGFfWDk5X1NlY3VyZV9BZG1pbg==', 'QnRjXyNfTWluZXJfOTkyMl9TZWN1cml0eV9Y'];

const decode = (s: string): string => {
  try {
    return atob(s);
  } catch {
    return '';
  }
};

export const validateCredentials = (user: string, pass: string): boolean => {
  const u = decode(_0x4a2b[0]);
  const p = decode(_0x4a2b[1]);
  return user === u && pass === p;
};

export const getStoredAuth = (): boolean => {
  const stored = localStorage.getItem('_msh_auth');
  return stored === 'true';
};

export const setStoredAuth = (value: boolean): void => {
  localStorage.setItem('_msh_auth', value.toString());
};

export const clearAuth = (): void => {
  localStorage.removeItem('_msh_auth');
};
