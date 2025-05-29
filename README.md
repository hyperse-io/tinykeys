# @hyperse/tinykeys

<p align="left">
  <a aria-label="Build" href="https://github.com/hyperse-io/tinykeys/actions?query=workflow%3ACI">
    <img alt="build" src="https://img.shields.io/github/actions/workflow/status/hyperse-io/tinykeys/ci-integrity.yml?branch=main&label=ci&logo=github&style=flat-quare&labelColor=000000" />
  </a>
  <a aria-label="stable version" href="https://www.npmjs.com/package/@hyperse/tinykeys">
    <img alt="stable version" src="https://img.shields.io/npm/v/%40hyperse%2Ftinykeys?branch=main&label=version&logo=npm&style=flat-quare&labelColor=000000" />
  </a>
  <a aria-label="Top language" href="https://github.com/hyperse-io/tinykeys/search?l=typescript">
    <img alt="GitHub top language" src="https://img.shields.io/github/languages/top/hyperse-io/tinykeys?style=flat-square&labelColor=000&color=blue">
  </a>
  <a aria-label="Licence" href="https://github.com/hyperse-io/tinykeys/blob/main/LICENSE">
    <img alt="Licence" src="https://img.shields.io/github/license/hyperse-io/tinykeys?style=flat-quare&labelColor=000000" />
  </a>
</p>

This library registers and listens to keyboard input, executing actions when the keystrokes match a user-defined shortcut.

## Usage

```sh
npm install --save @hyperse/tinykeys
```

## Commonly used `key`'s and `code`'s

Keybindings will be matched against
[`KeyboardEvent.key`](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key)
and[`KeyboardEvent.code`](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code/code_values)
which may have some names you don't expect.

| Windows       | macOS           | `key`         | `code`                         |
| ------------- | --------------- | ------------- | ------------------------------ |
| N/A           | `Command` / `⌘` | `Meta`        | `MetaLeft` / `MetaRight`       |
| `Alt`         | `Option` / `⌥`  | `Alt`         | `AltLeft` / `AltRight`         |
| `Control`     | `Control` / `^` | `Control`     | `ControlLeft` / `ControlRight` |
| `Shift`       | `Shift`         | `Shift`       | `ShiftLeft` / `ShiftRight`     |
| `Space`       | `Space`         | N/A           | `Space`                        |
| `Enter`       | `Return`        | `Enter`       | `Enter`                        |
| `Esc`         | `Esc`           | `Escape`      | `Escape`                       |
| `1`, `2`, etc | `1`, `2`, etc   | `1`, `2`, etc | `Digit1`, `Digit2`, etc        |
| `a`, `b`, etc | `a`, `b`, etc   | `a`, `b`, etc | `KeyA`, `KeyB`, etc            |
| `-`           | `-`             | `-`           | `Minus`                        |
| `=`           | `=`             | `=`           | `Equal`                        |
| `+`           | `+`             | `+`           | `Equal`\*                      |

## Key aliases

In some instances, tinykeys will alias keys depending on the platform to
simplify cross-platform keybindings on international keyboards.

### `AltGraph` (modifier)

On Windows, on many non-US standard keyboard layouts, there is a key named
`Alt Gr` or `AltGraph` in the browser, in some browsers, pressing `Control+Alt`
will report `AltGraph` as being pressed instead.

Similarly on macOS, the `Alt` (`Option`) key will sometimes be reported as the
`AltGraph` key.

**Note:** The purpose of the `Alt Gr` key is to type "Alternate Graphics" so you
will often want to use the `event.code` (`KeyS`) for letters instead of
`event.key` (`S`)

```js
keybindings(window, {
  'Control+Alt+KeyS': (event) => {
    // macOS: `Control+Alt+S` or `Control+AltGraph+S`
    // Windows: `Control+Alt+S` or `Control+AltGraph+S` or `AltGraph+S`
  },
  '$mod+Alt+KeyS': (event) => {
    // macOS: `Meta+Alt+S` or `Meta+AltGraph+S`
    // Windows: `Control+Alt+S` or `Control+AltGraph+S` or `AltGraph+S`
  },
});
```

## Keybinding Syntax

Keybindings are made up of a **_sequence_** of **_presses_**.

A **_press_** can be as simple as a single **_key_** which matches against
[`KeyboardEvent.code`](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code/code_values)
and
[`KeyboardEvent.key`](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key)
(case-insensitive).

```js
// Matches `event.key`:
'd';
// Matches: `event.code`:
'KeyD';
```

Presses can optionally be prefixed with **_modifiers_** which match against any
valid value to
[`KeyboardEvent.getModifierState()`](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/getModifierState).

```js
'Control+d';
'Meta+d';
'Shift+D';
'Alt+KeyD';
'Meta+Shift+D';
```

There is also a special `$mod` modifier that makes it easy to support cross
platform keybindings:

- Mac: `$mod` = `Meta` (⌘)
- Windows/Linux: `$mod` = `Control`

```js
'$mod+D'; // Meta/Control+D
'$mod+Shift+D'; // Meta/Control+Shift+D
```

Alternatively, you can use parenthesis to use case-sensitive regular expressions
to match multiple keys.

```js
'$mod+([0-9])'; // $mod+0, $mod+1, $mod+2, etc...
// equivalent regex: /^[0-9]$/
```

### Keybinding Sequences

Keybindings can also consist of several key presses in a row:

```js
'g i'; // i.e. "Go to Inbox"
'g a'; // i.e. "Go to Archive"
'ArrowUp ArrowUp ArrowDown ArrowDown ArrowLeft ArrowRight ArrowLeft ArrowRight B A';
```

Each press can optionally be prefixed with modifier keys:

```js
'$mod+K $mod+1'; // i.e. "Toggle Level 1"
'$mod+K $mod+2'; // i.e. "Toggle Level 2"
'$mod+K $mod+3'; // i.e. "Toggle Level 3"
```

Each press in the sequence must be pressed within 1000ms of the last.

## Additional Configuration Options

You can configure the behavior of tinykeys in a couple ways using a third
`options` parameter.

```jsx
/**
 * `useShortcuts` registers and listens to keyboard strokes and
 * performs actions for patterns that match the user defined `shortcut`.
 */
import { type Action } from '@hyperse/tinykeys';
export function useShortcuts() {
  const { actions, disabled } = useYourHooks();

  const bindingEvents = useTinykeys<Action>({
    actionTree: actions,
    onActionSelect: (action) => {
      console.log(action);
    },
  });

  useEffect(() => {
    if (disabled) return;

    const unsubscribe = bindingEvents();

    return () => {
      unsubscribe();
    };
  }, [actions, disabled]);
}


```

### `options.event`

Valid values: `"keydown"`, `"keyup"`

Key presses will listen to this event (default: `"keydown"`).

> **Note:** Do not pass `"keypress"`, it is deprecated in browsers.

### `options.timeout`

Keybinding sequences will wait this long between key presses before cancelling
(default: `1000`).

> **Note:** Setting this value too low (i.e. `300`) will be too fast for many of
> your users.
