/** Pulls a human-readable message from HttpClient / API errors. */
export function resolveApiMessage(err: unknown, fallback: string): string {
  if (err == null) return fallback;
  const e = err as Record<string, unknown>;
  const body = e['error'] as unknown;

  if (typeof body === 'string' && body.trim()) return body.trim();

  if (body && typeof body === 'object') {
    const o = body as Record<string, unknown>;
    if (typeof o['message'] === 'string' && (o['message'] as string).trim()) {
      return (o['message'] as string).trim();
    }
    if (typeof o['error'] === 'string' && (o['error'] as string).trim()) {
      return (o['error'] as string).trim();
    }
    const errors = o['errors'];
    if (Array.isArray(errors) && errors.length) {
      return errors
        .map((x) =>
          x && typeof x === 'object' && typeof (x as { message?: string }).message === 'string'
            ? (x as { message: string }).message
            : String(x)
        )
        .filter(Boolean)
        .join(' ');
    }
  }

  const msg = e['message'];
  if (typeof msg === 'string' && msg.trim() && !msg.startsWith('Http failure')) {
    return msg.trim();
  }

  const status = e['status'];
  if (status === 0) return 'Network error. Check your connection.';
  if (status === 401) return 'You are not authorized. Sign in again.';
  if (status === 403) return 'You do not have permission for this action.';
  if (status === 404) return 'The requested resource was not found.';
  if (typeof status === 'number' && status >= 500) {
    return 'Server error. Please try again later.';
  }

  return fallback;
}
