import serverPkg from '../../package.json';

/**
 * Single source of truth for application version across Wonderlab.
 * Sourced directly from package.json within the server package.
 */
export const APP_VERSION: string = serverPkg.version || '0.4.0';
