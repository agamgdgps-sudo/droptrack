const API_BASE = (import.meta.env.VITE_API_BASE) ? import.meta.env.VITE_API_BASE : '/api';

export const storage = {
  token: null,
  apiBase: API_BASE,
  async getAll() {
    if (this.token) {
      try {
        const res = await fetch(API_BASE + '/entries', { headers: { Authorization: `Bearer ${this.token}` } });
        if (res.ok) return await res.json();
      } catch (e) { /* fall back to local */ }
    }
    return JSON.parse(localStorage.getItem('jeeTracker') || '[]');
  },
  async fetchRemoteAll() {
    if (!this.token) throw new Error('not authenticated');
    const res = await fetch(this.apiBase + '/entries', { headers: { Authorization: `Bearer ${this.token}` } });
    if (!res.ok) throw new Error('failed');
    return res.json();
  },
  async pushEntry(entry) {
    if (!this.token) throw new Error('not authenticated');
    return fetch(this.apiBase + '/entries', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this.token}` }, body: JSON.stringify(entry) });
  },
  async pushAll(entries) {
    if (!this.token) throw new Error('not authenticated');
    for (const entry of entries) {
      await this.pushEntry(entry);
    }
  },
  replaceLocal(entries) {
    localStorage.setItem('jeeTracker', JSON.stringify(entries));
  },
  async saveAll(entries) {
    if (this.token) {
      try {
        // push each entry to server
        for (const entry of entries) {
          await fetch(API_BASE + '/entries', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this.token}` }, body: JSON.stringify(entry) });
        }
        return;
      } catch (e) { /* continue to local fallback */ }
    }
    localStorage.setItem('jeeTracker', JSON.stringify(entries));
  },
  async deleteByDate(date) {
    if (this.token) {
      try {
        await fetch(API_BASE + `/entries/${encodeURIComponent(date)}`, { method: 'DELETE', headers: { Authorization: `Bearer ${this.token}` } });
        return;
      } catch (e) { /* fall back */ }
    }
    const entries = JSON.parse(localStorage.getItem('jeeTracker') || '[]').filter(e => e.date !== date);
    localStorage.setItem('jeeTracker', JSON.stringify(entries));
  },
  setToken(token) {
    this.token = token;
    if (token) localStorage.setItem('droptrack_token', token); else localStorage.removeItem('droptrack_token');
  },
  loadToken() {
    const t = localStorage.getItem('droptrack_token'); if (t) this.token = t;
  }
};

// load token on import
storage.loadToken();
