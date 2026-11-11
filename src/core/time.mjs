// Small time helpers so "now" is produced the same way everywhere.
export const nowIso = () => new Date().toISOString();

export const addSeconds = (seconds) => new Date(Date.now() + seconds * 1000).toISOString();

export const isPast = (isoString) => Boolean(isoString) && isoString < nowIso();
