import { defineStore } from 'pinia';
import { useAuthStore } from './authStore';

export const useOrgStore = defineStore('org', {
  state: () => ({
    org: null as any,
    members: [] as any[],
    inviteCodes: [] as any[],
    activeInviteCode: null as any,
    loading: false,
    error: null as string | null,
  }),

  actions: {
    getHeaders() {
      const auth = useAuthStore();
      const token = auth.token || localStorage.getItem('tasky_token');
      console.log('OrgStore getHeaders - token exists:', !!token);
      return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      };
    },

    async fetchOrgDetails() {
      this.loading = true;
      try {
        const response = await fetch('http://localhost:3001/api/pm/org', {
          headers: this.getHeaders(),
        });
        const data = await response.json();
        if (data.success) {
          this.org = data.org;
          this.activeInviteCode = data.activeInviteCode;
        }
      } catch (err: any) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },

    async fetchMembers() {
      try {
        const response = await fetch('http://localhost:3001/api/users/all', {
          headers: this.getHeaders(),
        });
        const data = await response.json();
        if (data.success) this.members = data.users;
      } catch (err: any) {
        this.error = err.message;
      }
    },

    async fetchInviteCodes() {
      try {
        const response = await fetch('http://localhost:3001/api/pm/org/invite-codes', {
          headers: this.getHeaders(),
        });
        const data = await response.json();
        if (data.success) this.inviteCodes = data.codes;
      } catch (err: any) {
        this.error = err.message;
      }
    },

    async generateInviteCode(maxUses = 50, expiryDays = 30) {
      try {
        const response = await fetch('http://localhost:3001/api/pm/org/invite-code', {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify({ max_uses: maxUses, expiry_days: expiryDays }),
        });
        const data = await response.json();
        if (data.success) {
          this.activeInviteCode = data.code;
          this.inviteCodes.unshift(data.code);
          return data.code;
        }
        throw new Error(data.error);
      } catch (err: any) {
        throw err;
      }
    },

    async deactivateInviteCode(id: string) {
      try {
        const response = await fetch(`http://localhost:3001/api/pm/org/invite-code/${id}`, {
          method: 'DELETE',
          headers: this.getHeaders(),
        });
        const data = await response.json();
        if (data.success) {
          if (this.activeInviteCode && this.activeInviteCode.id == id) {
            this.activeInviteCode = null;
          }
          const idx = this.inviteCodes.findIndex((c) => c.id == id);
          if (idx !== -1) this.inviteCodes[idx].is_active = 0;
        }
      } catch (err: any) {
        console.error(err);
      }
    },
  },
});
