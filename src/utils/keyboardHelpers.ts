import {
  MutableRefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
} from 'react';
import {
  Keyboard,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  TextInput,
} from 'react-native';

const REVEAL_MARGIN = 16;

export const clampScrollOffset = (
  scrollY: number,
  viewportHeight: number,
  contentHeight: number,
) =>
  Math.min(Math.max(scrollY, 0), Math.max(0, contentHeight - viewportHeight));

/** Scroll offset that shows [itemTop, itemTop + itemHeight] with a small margin. */
export const revealScrollOffset = ({
  scrollY,
  viewportHeight,
  contentHeight,
  itemTop,
  itemHeight,
}: {
  scrollY: number;
  viewportHeight: number;
  contentHeight: number;
  itemTop: number;
  itemHeight: number;
}) => {
  let target = scrollY;
  const itemBottom = itemTop + itemHeight + REVEAL_MARGIN;
  if (itemBottom > scrollY + viewportHeight) {
    target = itemBottom - viewportHeight;
  }
  if (itemTop - REVEAL_MARGIN < target) {
    target = itemTop - REVEAL_MARGIN;
  }
  return clampScrollOffset(target, viewportHeight, contentHeight);
};

/**
 * For a ScrollView inside a KeyboardAvoidingView. The focused input is scrolled
 * into view before the KeyboardAvoidingView shrinks the ScrollView, so it can end
 * up behind the keyboard; and when the keyboard closes the old offset is kept,
 * leaving a gap at the bottom. Re-check both whenever the ScrollView's height
 * changes. Spread the returned props onto the ScrollView.
 *
 * `hiddenBottom` is the strip at the bottom of the shrunk ScrollView that the
 * keyboard still covers. keyboardVerticalOffset={-bottomSpace} leaves bottomSpace
 * under the keyboard on both platforms (on Android it is needed so the view
 * returns to full height when the keyboard closes), so pass bottomSpace there.
 */
export const useKeepFocusedInputVisible = (
  scrollRef: MutableRefObject<any>,
  hiddenBottom = 0,
) => {
  const viewportHeight = useRef(0);
  const contentHeight = useRef(0);
  const scrollY = useRef(0);
  const hiddenBottomRef = useRef(hiddenBottom);
  hiddenBottomRef.current = hiddenBottom;

  const scrollToY = useCallback(
    (y: number) => {
      if (y !== scrollY.current) {
        scrollRef.current?.scrollTo({y, animated: true});
      }
    },
    [scrollRef],
  );

  const revealFocusedInput = useCallback(() => {
    const input: any = TextInput.State.currentlyFocusedInput();
    const innerView = scrollRef.current?.getInnerViewRef?.();
    if (!input || !innerView || !viewportHeight.current) {
      return;
    }
    input.measureLayout(
      innerView,
      (_x: number, itemTop: number, _w: number, itemHeight: number) =>
        scrollToY(
          revealScrollOffset({
            scrollY: scrollY.current,
            viewportHeight: viewportHeight.current - hiddenBottomRef.current,
            contentHeight: contentHeight.current,
            itemTop,
            itemHeight,
          }),
        ),
      () => {},
    );
  }, [scrollRef, scrollToY]);

  // iOS scrolls the focused field to the very edge of the visible area while
  // the keyboard animates, which cancels the scroll above; check again once the
  // keyboard is fully shown.
  useEffect(() => {
    const subscription = Keyboard.addListener(
      'keyboardDidShow',
      revealFocusedInput,
    );
    return () => subscription.remove();
  }, [revealFocusedInput]);

  const onLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const previous = viewportHeight.current;
      const height = event.nativeEvent.layout.height;
      viewportHeight.current = height;
      if (!previous || height === previous) {
        return;
      }
      if (height > previous) {
        scrollToY(
          clampScrollOffset(scrollY.current, height, contentHeight.current),
        );
        return;
      }
      revealFocusedInput();
    },
    [scrollToY, revealFocusedInput],
  );

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      scrollY.current = event.nativeEvent.contentOffset.y;
    },
    [],
  );

  const onContentSizeChange = useCallback((_w: number, height: number) => {
    contentHeight.current = height;
  }, []);

  return {onLayout, onScroll, onContentSizeChange, scrollEventThrottle: 16};
};

/**
 * KeyboardAvoidingView only reacts to keyboard show/hide events. A screen that
 * mounts while the previous screen's keyboard is still open (SignIn right after
 * Import) never gets one, so its form stays behind the keyboard. Close it and
 * focus the input again once it is hidden, so the screen sees a fresh show event.
 */
export const useReopenKeyboardOnMount = (
  inputRef: MutableRefObject<TextInput | null>,
) => {
  useEffect(() => {
    if (!Keyboard.isVisible()) {
      return;
    }
    const subscription = Keyboard.addListener('keyboardDidHide', () => {
      subscription.remove();
      inputRef.current?.focus();
    });
    Keyboard.dismiss();
    return () => subscription.remove();
  }, [inputRef]);
};

export const useScrollBottomOnKeyboard = (scrollRef: MutableRefObject<any>) => {
  useLayoutEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      if (Platform.OS === 'android') {
        setTimeout(() => {
          scrollRef?.current?.scrollToEnd({animated: true});
        }, 600);
      }
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      if (Platform.OS === 'android') {
        scrollRef?.current?.scrollToEnd({animated: true});
      }
    });
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);
};

export const useInputBlurOnKeyboard = (inputRef: MutableRefObject<any>) => {
  useLayoutEffect(() => {
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      if (Platform.OS === 'android') {
        inputRef?.current?.blur();
      }
    });
    return () => {
      hideSubscription.remove();
    };
  }, []);
};
