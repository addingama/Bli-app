import { useEffect, useState } from 'react';
import { Dimensions, Keyboard, Platform } from 'react-native';

/** Distance from the bottom of the window to the top of the keyboard. */
export function useKeyboardHeight() {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, event => {
      const overlap = Dimensions.get('window').height - event.endCoordinates.screenY;
      setHeight(Math.max(0, overlap));
    });
    const hideSub = Keyboard.addListener(hideEvent, () => setHeight(0));

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return height;
}
