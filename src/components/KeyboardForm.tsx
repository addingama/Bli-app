/**
 * Keeps fillable fields above the keyboard on iOS and Android.
 * Edge-to-edge Android does not resize the window, so both platforms use padding.
 */

import React, { useCallback, useEffect, useRef } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
  StyleProp,
  StyleSheet,
  TextInput,
  View,
  ViewStyle,
} from 'react-native';
import { useHeaderHeight } from '@react-navigation/elements';

interface KeyboardScreenProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function KeyboardScreen({ children, style }: KeyboardScreenProps) {
  const headerHeight = useHeaderHeight();

  return (
    <KeyboardAvoidingView
      style={[styles.flex, style]}
      behavior="padding"
      keyboardVerticalOffset={headerHeight}
    >
      {children}
    </KeyboardAvoidingView>
  );
}

interface KeyboardFormProps {
  children: React.ReactNode;
  footer?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

export default function KeyboardForm({
  children,
  footer,
  style,
  contentContainerStyle,
}: KeyboardFormProps) {
  const headerHeight = useHeaderHeight();
  const scroll = useKeyboardAwareScroll();

  return (
    <KeyboardAvoidingView
      style={[styles.flex, style]}
      behavior="padding"
      keyboardVerticalOffset={headerHeight}
    >
      <View ref={scroll.frameRef} style={styles.flex} onLayout={scroll.onFrameLayout}>
        <ScrollView
          ref={scroll.scrollRef}
          style={styles.flex}
          contentContainerStyle={contentContainerStyle}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          onScroll={scroll.onScroll}
          onScrollBeginDrag={scroll.onScrollBeginDrag}
          onScrollEndDrag={scroll.onScrollEndDrag}
          scrollEventThrottle={16}
        >
          {children}
        </ScrollView>
      </View>
      {footer}
    </KeyboardAvoidingView>
  );
}

export function useKeyboardAwareScroll(bottomGap = 16) {
  const scrollRef = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const frameRef = useRef<React.ComponentRef<typeof View>>(null);
  const scrollY = useRef(0);
  const frameHeight = useRef(0);
  const dragging = useRef(false);

  const scrollFocusedIntoView = useCallback(() => {
    if (dragging.current) return;

    const input = TextInput.State.currentlyFocusedInput();
    const frame = frameRef.current;
    if (input == null || frame == null || frameHeight.current <= 0) return;

    input.measureLayout(
      frame,
      () => {
        frame.measureInWindow((_frameX, frameY, _frameWidth, frameH) => {
          input.measureInWindow((_inputX, inputY, _inputWidth, inputHeight) => {
            const overflow = inputY + inputHeight + bottomGap - (frameY + frameH);
            if (overflow > 8) {
              scrollRef.current?.scrollTo({
                y: scrollY.current + overflow,
                animated: true,
              });
            }
          });
        });
      },
      () => {
        // Focused input is outside this scroll view (for example inside a modal).
      },
    );
  }, [bottomGap]);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;

    const start = () => {
      if (timer != null) return;
      timer = setInterval(scrollFocusedIntoView, 250);
      setTimeout(scrollFocusedIntoView, 80);
    };
    const stop = () => {
      if (timer != null) clearInterval(timer);
      timer = null;
    };

    const showSub = Keyboard.addListener('keyboardDidShow', start);
    const hideSub = Keyboard.addListener('keyboardDidHide', stop);

    return () => {
      showSub.remove();
      hideSub.remove();
      stop();
    };
  }, [scrollFocusedIntoView]);

  const onScroll = useCallback((event: { nativeEvent: { contentOffset: { y: number } } }) => {
    scrollY.current = event.nativeEvent.contentOffset.y;
  }, []);

  const onFrameLayout = useCallback((event: { nativeEvent: { layout: { height: number } } }) => {
    frameHeight.current = event.nativeEvent.layout.height;
  }, []);

  const onScrollBeginDrag = useCallback(() => {
    dragging.current = true;
  }, []);

  const onScrollEndDrag = useCallback(() => {
    dragging.current = false;
  }, []);

  return {
    scrollRef,
    frameRef,
    onScroll,
    onFrameLayout,
    onScrollBeginDrag,
    onScrollEndDrag,
  };
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
});
