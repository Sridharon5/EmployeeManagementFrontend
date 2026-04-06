import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, finalize, map, shareReplay, tap } from 'rxjs/operators';
import { TokenRefreshService, AuthTokenResponse } from './token-refresh.service';

/** How long the UI keeps you signed in without interaction (2 hours). */
export const SESSION_IDLE_MS = 2 * 60 * 60 * 1000;

const LAST_ACTIVITY_KEY = 'lastActivityAt';

/** Keys this app owns — never use {@code localStorage.clear()} (wipes unrelated data and looks like “everything vanished”). */
const SESSION_STORAGE_KEYS = [
  'jwtToken',
  'isAuthenticated',
  'role',
  'firstName',
  'userId',
  'username',
  LAST_ACTIVITY_KEY,
] as const;
/** If JWT expires within this window, call {@code /auth/refresh} while still valid. */
const REFRESH_WINDOW_MS = 10 * 60 * 1000;

function parseJwtExpMs(token: string): number | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const pad = base64.length % 4;
    if (pad) base64 += '='.repeat(4 - pad);
    const binary = atob(base64);
    let jsonStr: string;
    try {
      jsonStr = decodeURIComponent(
        binary
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
    } catch {
      jsonStr = binary;
    }
    const json = JSON.parse(jsonStr) as { exp?: number };
    return json.exp != null ? Number(json.exp) * 1000 : null;
  } catch {
    return null;
  }
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private isAuthenticated = false;
  private role = '';
  private jwtToken = '';
  private firstName = '';
  private userId: number | null = null;
  private username = '';
  private lastTouchWrite = 0;
  private refreshInFlight$: Observable<void> | null = null;

  constructor(private readonly tokenRefresh: TokenRefreshService) {
    const storedAuth = localStorage.getItem('isAuthenticated');
    const storedRole = localStorage.getItem('role');
    const storedToken = localStorage.getItem('jwtToken');
    const fn = localStorage.getItem('firstName');
    const storedUserId = localStorage.getItem('userId');
    const storedUsername = localStorage.getItem('username');
    this.isAuthenticated = storedAuth === 'true';
    this.role = AuthService.normalizeRole(storedRole);
    if (storedRole != null && this.role !== storedRole) {
      localStorage.setItem('role', this.role);
    }
    this.jwtToken = (storedToken ?? '').trim();
    this.firstName = fn || '';
    this.userId =
      storedUserId != null && storedUserId !== ''
        ? Number(storedUserId)
        : null;
    this.username = storedUsername || '';
    if (this.jwtToken.length > 0 && !localStorage.getItem(LAST_ACTIVITY_KEY)) {
      this.touchActivity();
    }
  }

  setFirstName(value: string) {
    this.firstName = value ?? '';
    if (this.firstName) {
      localStorage.setItem('firstName', this.firstName);
    } else {
      localStorage.removeItem('firstName');
    }
  }

  getFirstName(): string {
    return this.firstName;
  }

  setUserId(value: number | null) {
    this.userId = value;
    if (value != null && !Number.isNaN(value)) {
      localStorage.setItem('userId', String(value));
    } else {
      localStorage.removeItem('userId');
    }
  }

  getUserId(): number | null {
    return this.userId;
  }

  setUsername(value: string) {
    this.username = value || '';
    if (this.username) {
      localStorage.setItem('username', this.username);
    } else {
      localStorage.removeItem('username');
    }
  }

  getUsername(): string {
    return this.username;
  }

  setIsAuthenticated(value: boolean) {
    this.isAuthenticated = value;
    localStorage.setItem('isAuthenticated', String(value));
  }

  getIsAuthenticated(): boolean {
    return this.isAuthenticated;
  }

  private static normalizeRole(value: string | null): string {
    const r = (value ?? '').trim().toUpperCase();
    if (r === 'USER') return 'EMPLOYEE';
    return r;
  }

  setRole(value: string) {
    this.role = AuthService.normalizeRole(value);
    localStorage.setItem('role', this.role);
  }

  getRole(): string {
    return this.role;
  }

  isAdmin(): boolean {
    return this.role === 'ADMIN';
  }

  isManager(): boolean {
    return this.role === 'MANAGER';
  }

  isEmployee(): boolean {
    return this.role === 'EMPLOYEE';
  }

  /** Create/assign tasks, see org-wide task lists, edit tasks (not delete — admin only in UI). */
  canManageTasks(): boolean {
    return this.role === 'ADMIN' || this.role === 'MANAGER';
  }

  /** Departments, designations, employee directory (view for manager; admin can mutate). */
  canViewOrgStructure(): boolean {
    return this.role === 'ADMIN' || this.role === 'MANAGER';
  }

  /** KPI dashboard (ADMIN + MANAGER). */
  showOrgWideDashboard(): boolean {
    return this.role === 'ADMIN' || this.role === 'MANAGER';
  }

  setJwtToken(value: string) {
    const t = (value ?? '').trim();
    this.jwtToken = t;
    if (t.length > 0) {
      localStorage.setItem('jwtToken', t);
    } else {
      localStorage.removeItem('jwtToken');
    }
  }

  getJwtToken(): string {
    const mem = (this.jwtToken ?? '').trim();
    if (mem.length > 0) {
      return mem;
    }
    const stored = (localStorage.getItem('jwtToken') ?? '').trim();
    if (stored.length > 0) {
      this.jwtToken = stored;
      return stored;
    }
    this.jwtToken = '';
    return '';
  }

  /** Call on login, refresh, and user activity. */
  touchActivity(): void {
    const now = Date.now();
    localStorage.setItem(LAST_ACTIVITY_KEY, String(now));
    this.lastTouchWrite = now;
  }

  /** Avoid writing localStorage on every tiny event. */
  touchActivityThrottled(): void {
    const now = Date.now();
    if (now - this.lastTouchWrite < 30_000) {
      return;
    }
    this.touchActivity();
  }

  isIdleExpired(): boolean {
    const raw = localStorage.getItem(LAST_ACTIVITY_KEY);
    if (raw == null || raw === '') {
      if (this.getJwtToken().length > 0) {
        this.touchActivity();
        return false;
      }
      return true;
    }
    const last = Number(raw);
    if (Number.isNaN(last)) return true;
    return Date.now() - last > SESSION_IDLE_MS;
  }

  /**
   * Only true when we can read {@code exp} and it is past. If {@code exp} is missing or
   * the payload cannot be parsed, return false — do not log the user out on refresh.
   */
  isJwtFullyExpired(token: string): boolean {
    const exp = parseJwtExpMs(token);
    if (exp == null) return false;
    return exp <= Date.now();
  }

  shouldRefreshToken(token: string): boolean {
    const exp = parseJwtExpMs(token);
    if (exp == null) return false;
    const now = Date.now();
    if (exp <= now) return false;
    return exp - now <= REFRESH_WINDOW_MS;
  }

  private runSharedRefresh$(token: string): Observable<void> {
    if (this.refreshInFlight$ != null) {
      return this.refreshInFlight$;
    }
    this.refreshInFlight$ = this.tokenRefresh.postRefresh(token).pipe(
      tap((res) => this.applyAuthResponse(res)),
      map(() => undefined),
      catchError((err: unknown) => {
        if (
          err instanceof HttpErrorResponse &&
          (err.status === 401 || err.status === 403)
        ) {
          this.clearSession();
          return throwError(() => err);
        }
        // Network / CORS / 5xx — keep tokens in localStorage; let the real request run.
        return of(undefined);
      }),
      finalize(() => {
        this.refreshInFlight$ = null;
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );
    return this.refreshInFlight$;
  }

  applyAuthResponse(res: AuthTokenResponse): void {
    if (res.token) {
      this.setJwtToken(res.token);
    }
    if (res.role != null) {
      const r = res.role as unknown;
      const roleStr =
        typeof r === 'string'
          ? r
          : r && typeof r === 'object' && 'name' in (r as object)
            ? String((r as { name: unknown }).name)
            : String(r);
      this.setRole(roleStr);
    }
    if (res.name != null) {
      this.setFirstName(String(res.name));
    }
    if (res.userId != null) {
      this.setUserId(Number(res.userId));
    }
    if (res.username != null) {
      this.setUsername(String(res.username));
    }
    this.setIsAuthenticated(true);
    this.touchActivity();
  }

  hydrateAuthFlag(): void {
    if (this.getJwtToken().length > 0) {
      this.setIsAuthenticated(true);
    }
  }

  /** Used on login page: skip login if still signed in and not idle / not JWT-expired. */
  hasPersistedValidSession(): boolean {
    const token = this.getJwtToken();
    if (token.length === 0) return false;
    if (this.isIdleExpired()) return false;
    if (this.isJwtFullyExpired(token)) return false;
    this.hydrateAuthFlag();
    return true;
  }

  /**
   * Before guarded routes: sync checks only. Token refresh runs in the HTTP interceptor
   * so a failed {@code /auth/refresh} cannot block navigation after F5.
   */
  canActivateProtectedRoute$(): Observable<boolean> {
    const token = this.getJwtToken();
    if (token.length === 0) {
      return of(false);
    }
    if (this.isIdleExpired()) {
      this.logout();
      return of(false);
    }
    if (this.isJwtFullyExpired(token)) {
      this.logout();
      return of(false);
    }
    this.hydrateAuthFlag();
    this.touchActivityThrottled();
    return of(true);
  }

  /**
   * Before outbound API calls (via interceptor). Skips auth endpoints.
   */
  ensureValidSessionForHttp$(requestUrl: string): Observable<void> {
    if (
      requestUrl.includes('/auth/login') ||
      requestUrl.includes('/auth/register')
    ) {
      return of(undefined);
    }
    const token = this.getJwtToken();
    if (token.length === 0) {
      return of(undefined);
    }
    if (this.isIdleExpired()) {
      this.logout();
      return throwError(() => new Error('Session timed out due to inactivity'));
    }
    if (this.isJwtFullyExpired(token)) {
      this.logout();
      return throwError(() => new Error('Session expired'));
    }
    if (this.shouldRefreshToken(token)) {
      return this.runSharedRefresh$(token);
    }
    this.touchActivityThrottled();
    return of(undefined);
  }

  /**
   * Clears only EMS session keys. Avoids {@code localStorage.clear()} so a failed
   * refresh or 401 does not wipe unrelated site data and debugging is easier.
   */
  clearSession(): void {
    this.isAuthenticated = false;
    this.role = '';
    this.jwtToken = '';
    this.firstName = '';
    this.userId = null;
    this.username = '';
    this.lastTouchWrite = 0;
    for (const k of SESSION_STORAGE_KEYS) {
      localStorage.removeItem(k);
    }
  }

  logout() {
    this.clearSession();
  }
}
