import type { RestaurantClient, AuthSession } from '../types';

const STORAGE_KEY_CLIENTS = 'restosaas_restaurant_clients_v1';
const STORAGE_KEY_AUTH = 'restosaas_auth_session_v1';
const STORAGE_KEY_CREDENTIALS = 'restosaas_account_credentials_v1';
const STORAGE_KEY_DISPLAY_OWNER = 'restosaas_customer_display_owner_v1';

interface StoredCredential {
  salt: string;
  passwordHash: string;
}

const bytesToHex = (bytes: Uint8Array): string =>
  Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');

const hexToBytes = (hex: string): Uint8Array =>
  new Uint8Array(hex.match(/.{1,2}/g)?.map((byte) => Number.parseInt(byte, 16)) ?? []);

const derivePasswordHash = async (password: string, salt: Uint8Array): Promise<Uint8Array> => {
  const saltBuffer = new ArrayBuffer(salt.byteLength);
  new Uint8Array(saltBuffer).set(salt);
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: saltBuffer, iterations: 210_000 },
    key,
    256
  );
  return new Uint8Array(bits);
};

// Seed inicial caso ainda não haja dados no LocalStorage
const INITIAL_CLIENTS: RestaurantClient[] = [
  {
    id: 'client-1',
    name: 'Carlos Oliveira',
    restaurantName: 'Burger Artisan',
    email: 'carlos@burgerartisan.com',
    phone: '(11) 98765-4321',
    status: 'ACTIVE',
    expirationDate: '2026-12-31',
    plan: 'MONTHLY',
    createdAt: '2026-10-01',
  },
  {
    id: 'client-2',
    name: 'Fernanda Lima',
    restaurantName: 'Pizzaria Bella Napoli',
    email: 'fernanda@bellanapoli.com',
    phone: '(21) 99123-8877',
    status: 'ACTIVE',
    expirationDate: '2026-11-20',
    plan: 'TRIAL',
    createdAt: '2026-10-15',
  },
  {
    id: 'client-3',
    name: 'Rodrigo Santos',
    restaurantName: 'Cantina do Rodrigo',
    email: 'rodrigo@cantina.com',
    phone: '(47) 98844-3322',
    status: 'EXPIRED',
    expirationDate: '2026-10-25',
    plan: 'TRIAL',
    createdAt: '2026-09-25',
  },
];

export const authStorage = {
  hasPassword(email: string): boolean {
    const raw = localStorage.getItem(STORAGE_KEY_CREDENTIALS);
    if (!raw) return false;
    const credentials = JSON.parse(raw) as Record<string, StoredCredential>;
    return Boolean(credentials[email.trim().toLowerCase()]);
  },

  async setPassword(email: string, password: string): Promise<void> {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const passwordHash = await derivePasswordHash(password, salt);
    const raw = localStorage.getItem(STORAGE_KEY_CREDENTIALS);
    const credentials = raw ? (JSON.parse(raw) as Record<string, StoredCredential>) : {};
    credentials[email.trim().toLowerCase()] = {
      salt: bytesToHex(salt),
      passwordHash: bytesToHex(passwordHash),
    };
    localStorage.setItem(STORAGE_KEY_CREDENTIALS, JSON.stringify(credentials));
  },

  async verifyPassword(email: string, password: string): Promise<boolean> {
    const raw = localStorage.getItem(STORAGE_KEY_CREDENTIALS);
    if (!raw) return false;
    const credentials = JSON.parse(raw) as Record<string, StoredCredential>;
    const credential = credentials[email.trim().toLowerCase()];
    if (!credential) return false;

    const actualHash = await derivePasswordHash(password, hexToBytes(credential.salt));
    const expectedHash = hexToBytes(credential.passwordHash);
    if (actualHash.length !== expectedHash.length) return false;

    let difference = 0;
    for (let index = 0; index < actualHash.length; index += 1) {
      difference |= actualHash[index] ^ expectedHash[index];
    }
    return difference === 0;
  },

  getClients(): RestaurantClient[] {
    const raw = localStorage.getItem(STORAGE_KEY_CLIENTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_CLIENTS, JSON.stringify(INITIAL_CLIENTS));
      return INITIAL_CLIENTS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_CLIENTS;
    }
  },

  saveClients(clients: RestaurantClient[]) {
    localStorage.setItem(STORAGE_KEY_CLIENTS, JSON.stringify(clients));
  },

  addClient(client: Omit<RestaurantClient, 'id' | 'createdAt'>): RestaurantClient {
    const clients = this.getClients();
    const newClient: RestaurantClient = {
      ...client,
      id: `client-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    const updated = [newClient, ...clients];
    this.saveClients(updated);
    return newClient;
  },

  updateClient(id: string, updates: Partial<RestaurantClient>): RestaurantClient | null {
    const clients = this.getClients();
    const index = clients.findIndex((c) => c.id === id);
    if (index === -1) return null;
    const currentClient = clients[index];
    const nextEmail = updates.email?.trim() ?? currentClient.email;
    const nextEmailKey = nextEmail.toLowerCase();
    const currentEmailKey = currentClient.email.trim().toLowerCase();

    if (
      clients.some(
        (client) => client.id !== id && client.email.trim().toLowerCase() === nextEmailKey
      )
    ) {
      throw new Error('Já existe outra conta cadastrada com este e-mail.');
    }

    if (nextEmailKey !== currentEmailKey) {
      const rawCredentials = localStorage.getItem(STORAGE_KEY_CREDENTIALS);
      if (rawCredentials) {
        const credentials = JSON.parse(rawCredentials) as Record<string, StoredCredential>;
        if (credentials[nextEmailKey]) {
          throw new Error('Já existe uma senha associada a este e-mail.');
        }
        if (credentials[currentEmailKey]) {
          credentials[nextEmailKey] = credentials[currentEmailKey];
          delete credentials[currentEmailKey];
          localStorage.setItem(STORAGE_KEY_CREDENTIALS, JSON.stringify(credentials));
        }
      }
    }

    clients[index] = { ...currentClient, ...updates, email: nextEmail };
    this.saveClients(clients);
    return clients[index];
  },

  extendDeadlineDays(id: string, days: number): RestaurantClient | null {
    const clients = this.getClients();
    const client = clients.find((c) => c.id === id);
    if (!client) return null;

    const baseDate = new Date(client.expirationDate);
    const validBase = isNaN(baseDate.getTime()) ? new Date() : (baseDate < new Date() ? new Date() : baseDate);
    validBase.setDate(validBase.getDate() + days);

    const newExpiration = validBase.toISOString().split('T')[0];
    return this.updateClient(id, {
      expirationDate: newExpiration,
      status: 'ACTIVE',
    });
  },

  approveClient(id: string): RestaurantClient | null {
    const expiration = new Date();
    expiration.setDate(expiration.getDate() + 30);

    return this.updateClient(id, {
      status: 'ACTIVE',
      expirationDate: expiration.toISOString().split('T')[0],
    });
  },

  deleteClient(id: string): boolean {
    const clients = this.getClients();
    const filtered = clients.filter((c) => c.id !== id);
    this.saveClients(filtered);
    return true;
  },

  getSession(): AuthSession | null {
    const raw = localStorage.getItem(STORAGE_KEY_AUTH);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  getCustomerDisplayOwnerSession(): AuthSession | null {
    const raw = localStorage.getItem(STORAGE_KEY_DISPLAY_OWNER);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthSession;
    } catch {
      return null;
    }
  },

  setCustomerDisplaySession(ownerSession: AuthSession, customerSession: AuthSession) {
    localStorage.setItem(STORAGE_KEY_DISPLAY_OWNER, JSON.stringify(ownerSession));
    this.setSession(customerSession);
  },

  restoreCustomerDisplayOwnerSession(): AuthSession | null {
    const ownerSession = this.getCustomerDisplayOwnerSession();
    localStorage.removeItem(STORAGE_KEY_DISPLAY_OWNER);
    if (ownerSession) {
      this.setSession(ownerSession);
    } else {
      localStorage.removeItem(STORAGE_KEY_AUTH);
    }
    return ownerSession;
  },

  setSession(session: AuthSession) {
    localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(session));
  },

  clearSession() {
    localStorage.removeItem(STORAGE_KEY_AUTH);
    localStorage.removeItem(STORAGE_KEY_DISPLAY_OWNER);
  },
};
