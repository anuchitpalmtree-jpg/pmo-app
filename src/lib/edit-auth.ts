export type EditCredential = {
  username: string;
  password: string;
};

// Add or append more credentials here if needed.
export const EDIT_MODE_CREDENTIALS: EditCredential[] = [
  { username: 'Admin', password: 'Pmo2026' },
];

export const validateEditCredential = (username: string, password: string): boolean => {
  return EDIT_MODE_CREDENTIALS.some(
    credential => credential.username === username && credential.password === password
  );
};
