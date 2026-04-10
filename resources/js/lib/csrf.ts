/**
 * Laravel stores the CSRF token in the XSRF-TOKEN cookie (URL-encoded).
 */
export function xsrfToken(): string {
    const match = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]*)/);

    return match ? decodeURIComponent(match[1]) : '';
}
