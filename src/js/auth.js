export function initAuth(storage, onModeChange) {
  const loginBtn = document.getElementById('loginBtn');
  const loginModal = document.getElementById('loginModal');
  const passInput = document.getElementById('passcodeInput');
  const loginSubmit = document.getElementById('loginSubmit');
  const logoutBtn = document.getElementById('logoutBtn');

  function showModal() { if (loginModal) loginModal.classList.add('show'); }
  function hideModal() { if (loginModal) loginModal.classList.remove('show'); }

  if (loginBtn) loginBtn.addEventListener('click', showModal);
  if (loginSubmit) loginSubmit.addEventListener('click', async () => {
    const passcode = passInput.value;
    if (!passcode) return;
    try {
      const res = await fetch((import.meta.env.VITE_API_BASE || 'http://localhost:4000') + '/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ passcode }) });
      if (!res.ok) { alert('Invalid passcode'); return; }
      const { token } = await res.json();
      storage.setToken(token);
      // after setting token, reconcile local and remote entries
      try {
        const remote = await storage.fetchRemoteAll();
        const local = JSON.parse(localStorage.getItem('jeeTracker') || '[]');
        // if both have data and differ, ask user how to merge
        const bothHave = Array.isArray(remote) && remote.length > 0 && Array.isArray(local) && local.length > 0;
        const differ = JSON.stringify(remote) !== JSON.stringify(local);
        if (bothHave && differ) {
          hideModal();
          showMergeModal(remote, local, storage, onModeChange);
          return;
        }
      } catch (e) {
        // ignore and continue
      }
      hideModal();
      if (onModeChange) onModeChange('remote');
    } catch (e) { alert('Login failed'); }
  });

  if (logoutBtn) logoutBtn.addEventListener('click', () => {
    storage.setToken(null);
    if (onModeChange) onModeChange('local');
  });
}

function showMergeModal(remote, local, storage, onModeChange) {
  const mergeModal = document.getElementById('mergeModal');
  const uploadBtn = document.getElementById('mergeUpload');
  const replaceBtn = document.getElementById('mergeReplace');
  const cancelBtn = document.getElementById('mergeCancel');
  if (!mergeModal) return;
  mergeModal.classList.add('show');

  const cleanup = () => { mergeModal.classList.remove('show'); uploadBtn.onclick = null; replaceBtn.onclick = null; cancelBtn.onclick = null; };

  uploadBtn.onclick = async () => {
    // push local entries to server
    try { await storage.pushAll(local); storage.replaceLocal(local); cleanup(); if (onModeChange) onModeChange('remote'); }
    catch (e) { alert('Upload failed'); }
  };

  replaceBtn.onclick = () => {
    // replace local with remote
    storage.replaceLocal(remote);
    cleanup();
    if (onModeChange) onModeChange('remote');
  };

  cancelBtn.onclick = () => {
    // cancel login and revert token
    storage.setToken(null);
    cleanup();
    if (onModeChange) onModeChange('local');
  };
}
