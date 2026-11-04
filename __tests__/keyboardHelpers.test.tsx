import React, {useRef} from 'react';
import {Keyboard, TextInput} from 'react-native';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {afterEach, beforeEach, describe, expect, it, jest} from '@jest/globals';
import {
  clampScrollOffset,
  revealScrollOffset,
  useKeepFocusedInputVisible,
  useReopenKeyboardOnMount,
} from '../src/utils/keyboardHelpers';

describe('revealScrollOffset', () => {
  const base = {viewportHeight: 500, contentHeight: 1200, itemHeight: 50};

  it('keeps the offset when the item is already visible', () => {
    expect(revealScrollOffset({...base, scrollY: 0, itemTop: 100})).toBe(0);
  });

  it('scrolls down so an item below the viewport ends just above its bottom', () => {
    // item bottom 950 + 16 margin - 500 viewport = 466
    expect(revealScrollOffset({...base, scrollY: 0, itemTop: 900})).toBe(466);
  });

  it('scrolls up so an item above the viewport starts below its top', () => {
    expect(revealScrollOffset({...base, scrollY: 600, itemTop: 300})).toBe(284);
  });

  it('never scrolls past the end of the content', () => {
    expect(revealScrollOffset({...base, scrollY: 0, itemTop: 1150})).toBe(700);
  });

  it('never scrolls above the top of the content', () => {
    expect(revealScrollOffset({...base, scrollY: 100, itemTop: 0})).toBe(0);
  });
});

describe('clampScrollOffset', () => {
  it('pulls an offset left past the end back to the last valid offset', () => {
    // keyboard closed: viewport grew to 900, content is 1000, offset was 300
    expect(clampScrollOffset(300, 900, 1000)).toBe(100);
  });

  it('returns 0 when the content fits the viewport', () => {
    expect(clampScrollOffset(150, 900, 800)).toBe(0);
  });

  it('keeps a valid offset', () => {
    expect(clampScrollOffset(50, 500, 1000)).toBe(50);
  });
});

const layout = (height: number) =>
  ({nativeEvent: {layout: {x: 0, y: 0, width: 400, height}}}) as any;
const contentSize = (height: number) => [400, height] as const;
const scrolled = (y: number) =>
  ({nativeEvent: {contentOffset: {x: 0, y}}}) as any;

describe('useKeepFocusedInputVisible', () => {
  let handlers: ReturnType<typeof useKeepFocusedInputVisible>;
  const scrollTo = jest.fn();
  const innerView = {};
  let renderer: ReactTestRenderer.ReactTestRenderer;

  const Probe = ({hiddenBottom}: {hiddenBottom?: number}) => {
    const scrollRef = useRef<any>({
      scrollTo,
      getInnerViewRef: () => innerView,
    });
    handlers = useKeepFocusedInputVisible(scrollRef, hiddenBottom);
    return null;
  };

  beforeEach(async () => {
    scrollTo.mockClear();
    await act(async () => {
      renderer = ReactTestRenderer.create(<Probe />);
    });
    handlers.onContentSizeChange(...contentSize(1200));
    handlers.onLayout(layout(900));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('scrolls the focused input into view when the keyboard shrinks the scroll view', () => {
    const measureLayout = jest.fn(
      (relativeTo: unknown, onSuccess: (...n: number[]) => void) => {
        expect(relativeTo).toBe(innerView);
        onSuccess(0, 900, 100, 50);
      },
    );
    jest
      .spyOn(TextInput.State, 'currentlyFocusedInput')
      .mockReturnValue({measureLayout} as any);

    handlers.onLayout(layout(500));

    expect(scrollTo).toHaveBeenCalledWith({y: 466, animated: true});
  });

  it('treats the bottom strip the keyboard still covers as hidden', async () => {
    // The KeyboardAvoidingView (offset -bottomSpace) leaves bottomSpace of the
    // scroll view behind the keyboard, on Android and iOS alike.
    await act(async () => {
      renderer.update(<Probe hiddenBottom={24} />);
    });
    jest.spyOn(TextInput.State, 'currentlyFocusedInput').mockReturnValue({
      measureLayout: (_r: unknown, onSuccess: (...n: number[]) => void) =>
        onSuccess(0, 900, 100, 50),
    } as any);

    handlers.onLayout(layout(500));

    expect(scrollTo).toHaveBeenCalledWith({y: 490, animated: true});
  });

  it('does nothing when no input is focused', () => {
    jest
      .spyOn(TextInput.State, 'currentlyFocusedInput')
      .mockReturnValue(null as any);

    handlers.onLayout(layout(500));

    expect(scrollTo).not.toHaveBeenCalled();
  });

  it('pulls the content back down when the keyboard closes', () => {
    jest
      .spyOn(TextInput.State, 'currentlyFocusedInput')
      .mockReturnValue(null as any);
    handlers.onLayout(layout(500));
    handlers.onScroll(scrolled(600));

    handlers.onLayout(layout(900));

    expect(scrollTo).toHaveBeenCalledWith({y: 300, animated: true});
  });
});

describe('useKeepFocusedInputVisible once the keyboard has shown', () => {
  it('scrolls the focused input back into view when the system scroll overrode it', async () => {
    // iOS: UIKit scrolls the focused field to the edge of the visible area while
    // the keyboard animates, cancelling our animated scroll.
    let showListener: (() => void) | undefined;
    jest.spyOn(Keyboard, 'addListener').mockImplementation(((
      event: string,
      cb: () => void,
    ) => {
      if (event === 'keyboardDidShow') {
        showListener = cb;
      }
      return {remove: jest.fn()} as any;
    }) as any);
    jest.spyOn(TextInput.State, 'currentlyFocusedInput').mockReturnValue({
      measureLayout: (_r: unknown, onSuccess: (...n: number[]) => void) =>
        onSuccess(0, 900, 100, 50),
    } as any);
    const scrollTo = jest.fn();
    let handlers!: ReturnType<typeof useKeepFocusedInputVisible>;
    const Probe = () => {
      const scrollRef = useRef<any>({scrollTo, getInnerViewRef: () => ({})});
      handlers = useKeepFocusedInputVisible(scrollRef, 24);
      return null;
    };
    await act(async () => {
      ReactTestRenderer.create(<Probe />);
    });
    handlers.onContentSizeChange(...contentSize(1200));
    handlers.onLayout(layout(900));
    handlers.onLayout(layout(500));
    handlers.onScroll(scrolled(450)); // system scroll left the input at the edge
    scrollTo.mockClear();

    showListener?.();

    expect(scrollTo).toHaveBeenCalledWith({y: 490, animated: true});
    jest.restoreAllMocks();
  });
});

describe('useReopenKeyboardOnMount', () => {
  const focus = jest.fn();
  let hideListener: (() => void) | undefined;
  const remove = jest.fn();

  const Probe = () => {
    const inputRef = useRef<any>({focus});
    useReopenKeyboardOnMount(inputRef);
    return null;
  };

  beforeEach(() => {
    focus.mockClear();
    remove.mockClear();
    hideListener = undefined;
    jest.spyOn(Keyboard, 'dismiss').mockImplementation(() => {});
    jest.spyOn(Keyboard, 'addListener').mockImplementation(((
      event: string,
      cb: () => void,
    ) => {
      if (event === 'keyboardDidHide') {
        hideListener = cb;
      }
      return {remove} as any;
    }) as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('closes a keyboard left open by the previous screen and refocuses the input once it is hidden', async () => {
    jest.spyOn(Keyboard, 'isVisible').mockReturnValue(true);

    await act(async () => {
      ReactTestRenderer.create(<Probe />);
    });

    expect(Keyboard.dismiss).toHaveBeenCalledTimes(1);
    expect(focus).not.toHaveBeenCalled();
    hideListener?.();
    expect(focus).toHaveBeenCalledTimes(1);
    expect(remove).toHaveBeenCalled();
  });

  it('leaves the keyboard alone when it is not open', async () => {
    jest.spyOn(Keyboard, 'isVisible').mockReturnValue(false);

    await act(async () => {
      ReactTestRenderer.create(<Probe />);
    });

    expect(Keyboard.dismiss).not.toHaveBeenCalled();
    expect(hideListener).toBeUndefined();
  });
});
