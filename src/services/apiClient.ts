/**
 * Client API TypeScript pour l'application mobile Ndai (React Native / Expo)
 * À importer dans le projet mobile (Ndai-main) pour communiquer avec ce backend.
 */

// Remplacez '10.0.2.2' par l'adresse IP locale de votre machine (ex: 192.168.1.XX) sur appareil physique
const API_BASE_URL = 'http://localhost:5000/api';

let userToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  userToken = token;
};

const getHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (userToken) {
    headers['Authorization'] = `Bearer ${userToken}`;
  }
  return headers;
};

export const ndaiApi = {
  // --- AUTH ---
  register: async (userData: {
    prenom?: string;
    nom?: string;
    fullName?: string;
    telephone: string;
    email?: string;
    password: string;
    role?: string;
  }) => {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(userData),
    });
    return res.json();
  },

  login: async (credentials: { telephone?: string; email?: string; password: string }) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(credentials),
    });
    return res.json();
  },

  getMe: async () => {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  updateProfile: async (fields: any) => {
    const res = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(fields),
    });
    return res.json();
  },

  switchRole: async (role: 'proprietaire' | 'locataire' | 'courtier') => {
    const res = await fetch(`${API_BASE_URL}/auth/switch-role`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ role }),
    });
    return res.json();
  },

  toggleFavorite: async (propertyId: string) => {
    const res = await fetch(`${API_BASE_URL}/auth/favorites/${propertyId}`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return res.json();
  },

  // --- LOGEMENTS (PROPERTIES) ---
  getProperties: async (filters: Record<string, any> = {}) => {
    const params = new URLSearchParams(filters).toString();
    const res = await fetch(`${API_BASE_URL}/properties?${params}`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  getFeaturedProperties: async () => {
    const res = await fetch(`${API_BASE_URL}/properties/featured`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  getMyProperties: async () => {
    const res = await fetch(`${API_BASE_URL}/properties/my`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  getPropertyById: async (id: string) => {
    const res = await fetch(`${API_BASE_URL}/properties/${id}`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  createProperty: async (propertyData: any) => {
    const res = await fetch(`${API_BASE_URL}/properties`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(propertyData),
    });
    return res.json();
  },

  updateProperty: async (id: string, propertyData: any) => {
    const res = await fetch(`${API_BASE_URL}/properties/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(propertyData),
    });
    return res.json();
  },

  deleteProperty: async (id: string) => {
    const res = await fetch(`${API_BASE_URL}/properties/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return res.json();
  },

  // --- DEMANDES DE CANDIDATS (LEADS) ---
  getRequests: async (filters: Record<string, any> = {}) => {
    const params = new URLSearchParams(filters).toString();
    const res = await fetch(`${API_BASE_URL}/requests?${params}`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  createRequest: async (requestData: any) => {
    const res = await fetch(`${API_BASE_URL}/requests`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(requestData),
    });
    return res.json();
  },

  unlockCandidatePhone: async (requestId: string) => {
    const res = await fetch(`${API_BASE_URL}/requests/${requestId}/unlock`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return res.json();
  },

  // --- CRÉDITS & MOBILE MONEY ---
  getCreditPacks: async () => {
    const res = await fetch(`${API_BASE_URL}/credits/packs`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  getCreditBalance: async () => {
    const res = await fetch(`${API_BASE_URL}/credits/balance`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  rechargeCredits: async (packId: string, paymentMethod: 'wave' | 'orange_money' | 'free_money') => {
    const res = await fetch(`${API_BASE_URL}/credits/recharge`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ packId, paymentMethod }),
    });
    return res.json();
  },

  // --- VISITES ---
  requestVisitSlot: async (visitData: {
    propertyId?: string;
    propertyTitle?: string;
    date: string;
    timeSlot: string;
    notes?: string;
  }) => {
    const res = await fetch(`${API_BASE_URL}/visits`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(visitData),
    });
    return res.json();
  },

  getMyVisits: async () => {
    const res = await fetch(`${API_BASE_URL}/visits/my`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  getOwnerVisits: async () => {
    const res = await fetch(`${API_BASE_URL}/visits/owner`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  updateVisitStatus: async (visitId: string, status: string) => {
    const res = await fetch(`${API_BASE_URL}/visits/${visitId}/status`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });
    return res.json();
  },

  // --- MESSAGES ---
  getMessageThreads: async () => {
    const res = await fetch(`${API_BASE_URL}/messages/threads`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  getConversation: async (otherUserId: string) => {
    const res = await fetch(`${API_BASE_URL}/messages/${otherUserId}`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  sendMessage: async (data: {
    receiverId: string;
    content: string;
    propertyId?: string;
    propertyTitle?: string;
  }) => {
    const res = await fetch(`${API_BASE_URL}/messages`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // --- NOTIFICATIONS ---
  getNotifications: async () => {
    const res = await fetch(`${API_BASE_URL}/notifications`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  markNotificationAsRead: async (id: string) => {
    const res = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
      method: 'PUT',
      headers: getHeaders(),
    });
    return res.json();
  },

  // --- DAKAR ZONES ---
  getDakarZones: async () => {
    const res = await fetch(`${API_BASE_URL}/dakar/zones`);
    return res.json();
  },
};
