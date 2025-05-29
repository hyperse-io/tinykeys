import { type ComponentType, useEffect } from 'react';
import { vi } from 'vitest';
import type { RenderResult } from '@testing-library/react';
import { fireEvent, render } from '@testing-library/react';
import { useTinykeys } from '../src/useTinykeys.js';

const mockOnActionSelect = vi.fn();

const actionTree = {
  search: {
    id: 'search',
    shortcut: ['$mod+k'],
  },
  sequence: {
    id: 'sequence',
    shortcut: ['a', 'b', 'c'],
  },
};

function Viewer() {
  const bindingEvents = useTinykeys({
    actionTree,
    onActionSelect: mockOnActionSelect,
  });

  useEffect(() => {
    const unsubscribe = bindingEvents();
    return () => {
      unsubscribe();
    };
  }, [bindingEvents]);

  return <div />;
}

type Utils = RenderResult;

const setup = (Component: ComponentType) => {
  const utils = render(<Component />);
  return {
    ...utils,
  } as Utils;
};

describe('useTinykeys tests', () => {
  let utils: Utils;

  beforeEach(() => {
    utils = setup(Viewer);
    mockOnActionSelect.mockClear();
  });

  it('should call onActionSelect when Command+K is pressed', () => {
    // For macOS, use metaKey for Command
    fireEvent.keyDown(utils.container, {
      key: 'k',
      code: 'KeyK',
      metaKey: true,
      ctrlKey: false,
      altKey: false,
      shiftKey: false,
    });

    // For Windows/Linux, use ctrlKey for Control
    fireEvent.keyDown(utils.container, {
      key: 'k',
      code: 'KeyK',
      metaKey: false,
      ctrlKey: true,
      altKey: false,
      shiftKey: false,
    });
    expect(mockOnActionSelect).toHaveBeenCalledWith(actionTree.search);
  });

  it('should call onActionSelect with sequence when keys are pressed in order', () => {
    fireEvent.keyDown(utils.container, { key: 'a', code: 'KeyA' });
    fireEvent.keyDown(utils.container, { key: 'b', code: 'KeyB' });
    fireEvent.keyDown(utils.container, { key: 'c', code: 'KeyC' });
    expect(mockOnActionSelect).toHaveBeenCalledWith(actionTree.sequence);
  });
});
