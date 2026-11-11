export function peekPostAuthRedirect(stateFrom) {
    let target = stateFrom || '/account';
    try {
        target = localStorage.getItem('auth_redirect') || stateFrom || '/account';
        if (!target || target === '/checkout') target = '/account';
    } catch {
        target = stateFrom || '/account';
    }
    return target || '/account';
}

export function consumePostAuthRedirect(stateFrom) {
    const target = peekPostAuthRedirect(stateFrom);
    try { localStorage.removeItem('auth_redirect'); } catch { /* ignore */ }
    return target;
}
