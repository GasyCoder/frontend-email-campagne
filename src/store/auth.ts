import { create } from 'zustand';
import Cookies from 'js-cookie';

interface User {
  id: number;
  name: string;
  email: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  workspaceId: string | null;
  setAuth: (token: string, user: User, workspaceId: string | null) => void;
  setWorkspaceId: (workspaceId: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: Cookies.get('token') || null,
  user: null, // User info usually fetched on app load or post-login
  workspaceId: Cookies.get('workspaceId') || null,

  setAuth: (token, user, workspaceId) => {
    Cookies.set('token', token, { expires: 7 });
    if (workspaceId) {
      const wsIdStr = String(workspaceId);
      Cookies.set('workspaceId', wsIdStr, { expires: 7 });
      set({ token, user, workspaceId: wsIdStr });
    } else {
      set({ token, user, workspaceId: null });
    }
  },

  setWorkspaceId: (workspaceId) => {
    Cookies.set('workspaceId', workspaceId, { expires: 7 });
    set({ workspaceId });
  },

  logout: () => {
    Cookies.remove('token');
    Cookies.remove('workspaceId');
    set({ token: null, user: null, workspaceId: null });
  },
}));
