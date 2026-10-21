/**
 * Host half of dsh-model-provider-prefix.
 *
 * The plugin is pure browser UI: this module exists so the profile's layer
 * stack can mount the bundle row, which is what makes the `dsh.client`
 * declaration discoverable by the client module registry. It contributes
 * nothing to the Host.
 */

/** Cordis plugin name. */
export const name = 'dsh-model-provider-prefix'

/** Mount nothing on the Host side. */
export function apply() {}
