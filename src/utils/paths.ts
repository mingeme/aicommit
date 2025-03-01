import { homedir } from 'os';
import { join } from 'path';

// Follow XDG Base Directory Specification
// https://specifications.freedesktop.org/basedir-spec/basedir-spec-latest.html

/**
 * Get the XDG config home directory
 * Defaults to ~/.config on Unix systems
 */
function getXdgConfigHome(): string {
  const xdgConfigHome = process.env.XDG_CONFIG_HOME;
  if (xdgConfigHome) {
    return xdgConfigHome;
  }
  return join(homedir(), '.config');
}

// Config directory: $XDG_CONFIG_HOME/aicommit
export const CONFIG_DIR = join(getXdgConfigHome(), 'aicommit');
export const CONFIG_FILE = join(CONFIG_DIR, 'config.json');
