// Auth configuration - obfuscated for security
const _0x4a2b = [
  '\x41\x6c\x70\x68\x61\x5f\x58\x39\x39\x5f\x53\x65\x63\x75\x72\x65\x5f\x41\x64\x6d\x69\x6e',
  '\x42\x74\x63\x5f\x23\x5f\x4d\x69\x6e\x65\x72\x5f\x39\x39\x32\x32\x5f\x53\x65\x63\x75\x72\x69\x74\x79\x5f\x58'
];

export const validateCredentials = (user: string, pass: string): boolean => {
  return user === _0x4a2b[0] && pass === _0x4a2b[1];
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
