import { type KeyBindingOptions, keybindings } from './keybindings.js';
import { shouldRejectKeystrokes } from './shouldRejectKeystrokes.js';
/**
 * Reference: https://github.com/jamiebuilds/tinykeys/issues/37
 *
 * Fixes an issue where simultaneous key commands for shortcuts;
 * ie given two actions with shortcuts ['t','s'] and ['s'], pressing
 * 't' and 's' consecutively will cause both shortcuts to fire.
 *
 * `wrap` sets each keystroke event in a WeakSet, and ensures that
 * if ['t', 's'] are pressed, then the subsequent ['s'] event will
 * be ignored. This depends on the order in which we register the
 * shortcuts to tinykeys, which is handled below.
 */
const handled = new WeakSet();

function wrap(handler: (event: KeyboardEvent) => void) {
  return (event: KeyboardEvent) => {
    if (handled.has(event)) return;
    handler(event);
    handled.add(event);
  };
}

export type Action = {
  /**
   * Unique identifier for the action
   */
  id: string;
  /**
   * `Shift+d`: The 'Shift' and 'd' keys were pressed at the same time
   * `y e e t`: The keys 'y', 'e', 'e', and 't' were pressed in order
   * `$mod+d`: Either 'Control+d' or 'Meta+d' were pressed
   */
  shortcut?: string[];
};

export type UseTinykeysProps<T extends Action> = {
  actionTree: Record<string, T>;
  onActionSelect: (action: T) => void;
  options?: KeyBindingOptions;
};

/**
 * `useTinykeys` registers and listens to keyboard strokes and
 * performs actions for patterns that match the user defined `shortcut`.
 *
 * @example
 * ```tsx
 * const bindingEvents = useTinykeys({
 *  actionTree: {
 *    search: {
 *      id: 'search',
 *      shortcut: ['$mod+k'],
 *    },
 *  },
 *  onActionSelect: (action) => {
 *    console.log(action);
 *  },
 *  options: {
 *    timeout: 400,
 *  },
 * });
 * ```
 */
export function useTinykeys<T extends Action>(props: UseTinykeysProps<T>) {
  const { actionTree, onActionSelect } = props;
  const actionsWithShortcuts: T[] = [];
  const actionsList = Object.keys(actionTree).map((key) => actionTree[key]);

  for (const action of actionsList) {
    if (!action.shortcut?.length) {
      continue;
    }
    actionsWithShortcuts.push(action);
  }

  actionsWithShortcuts.sort(
    (a, b) => b.shortcut!.join(' ').length - a.shortcut!.join(' ').length
  );

  const shortcutsMap: Record<string, (event: KeyboardEvent) => void> = {};
  for (const action of actionsWithShortcuts) {
    const shortcut = action.shortcut!.join(' ');

    shortcutsMap[shortcut] = wrap((event: KeyboardEvent) => {
      if (shouldRejectKeystrokes()) return;
      event.preventDefault();
      onActionSelect(action);
    });
  }

  return () =>
    keybindings(window, shortcutsMap, {
      ...props.options,
      timeout: props.options?.timeout ?? 400,
    });
}
