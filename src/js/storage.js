export const storage = {
  async getAll() {
    return JSON.parse(localStorage.getItem('jeeTracker') || '[]');
  },
  async saveAll(entries) {
    localStorage.setItem('jeeTracker', JSON.stringify(entries));
  },
  async deleteByDate(date) {
    const entries = JSON.parse(localStorage.getItem('jeeTracker') || '[]').filter(e => e.date !== date);
    localStorage.setItem('jeeTracker', JSON.stringify(entries));
  }
};
