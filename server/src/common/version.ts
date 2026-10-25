import rootPkg from '../../../package.json';

/**
 * Single source of truth for application version across Wonderlab.
 * Sourced directly from root package.json.
 */
export const APP_VERSION: string = rootPkg.version || '0.3.0';
