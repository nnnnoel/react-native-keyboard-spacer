import * as React from 'react';
import { Animated, Keyboard, KeyboardEvent, KeyboardEventName, LayoutAnimation, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface KeyboardSpacerProps {
  safety?: boolean;
  excludeHeight?: boolean;
}

export interface KeyboardSpacerProviderProps {
  noSpaceHeight?: number;
}

export type KeyboardSpacerContextType = {
  setHeight: React.Dispatch<React.SetStateAction<number>>;
  height: number;

  keyboardFullHeight: number;
  setKeyboardFullHeight: React.Dispatch<React.SetStateAction<number>>;

  KeyboardHeight: Animated.Value;
};

export const KeyboardSpacerContext = React.createContext<KeyboardSpacerContextType | null>(null);

const createLayoutAnimation = (e: KeyboardEvent) => ({
  duration: e.duration,
  create: {
    type: LayoutAnimation.Types[e.easing],
    property: LayoutAnimation.Properties.scaleXY,
  },
  update: {
    type: LayoutAnimation.Types[e.easing],
  },
  delete: {
    type: LayoutAnimation.Types[e.easing],
    property: LayoutAnimation.Properties.scaleXY,
  },
});

export function useKeyboardSpacer(): KeyboardSpacerContextType {
  const keyboard = React.useContext(KeyboardSpacerContext);

  if (keyboard === null) {
    throw new Error(
      'No keyboard value available. Make sure you are rendering `<KeyboardSpacerProvider>` at the top of your app.',
    );
  }

  return keyboard;
}

export const KeyboardSpacerProvider: React.FC<KeyboardSpacerProviderProps> = ({ children, noSpaceHeight }) => {
  const [height, setHeight] = React.useState<number>(noSpaceHeight ?? 0);
  const [keyboardFullHeight, setKeyboardFullHeight] = React.useState<number>(0);

  const KeyboardHeight = React.useRef(new Animated.Value(0)).current;

  return (
    <KeyboardSpacerContext.Provider
      value={{
        height,
        setHeight,
        KeyboardHeight,
        keyboardFullHeight,
        setKeyboardFullHeight,
      }}
    >
      {children}
    </KeyboardSpacerContext.Provider>
  );
};

export const KeyboardSpacer: React.FC<KeyboardSpacerProps> = ({ safety = true, excludeHeight = false }) => {
  const safe = useSafeAreaInsets();

  const { height, setKeyboardFullHeight, keyboardFullHeight, KeyboardHeight } = useKeyboardSpacer();

  React.useEffect(() => {
    const updateKeyboardSpace = (e: KeyboardEvent) => {
      if (!e.endCoordinates || !e.startCoordinates) return;

      LayoutAnimation.configureNext(createLayoutAnimation(e));

      if (keyboardFullHeight !== e.endCoordinates.height) setKeyboardFullHeight(e.endCoordinates.height);

      KeyboardHeight.setValue(e.endCoordinates.height - (safety ? safe.bottom : 0) - (excludeHeight ? height : 0));
    };

    const resetKeyboardSpace = (e: KeyboardEvent) => {
      if (!e.endCoordinates || !e.startCoordinates) {
        return;
      }

      LayoutAnimation.configureNext(createLayoutAnimation(e));
      KeyboardHeight.setValue(0);
    };

    const { updateListener, resetListener }: Record<string, KeyboardEventName> = Platform.select({
      android: {
        updateListener: 'keyboardDidShow',
        resetListener: 'keyboardDidHide',
      },
      ios: {
        updateListener: 'keyboardWillShow',
        resetListener: 'keyboardWillHide',
      },
      default: {
        updateListener: 'keyboardDidShow',
        resetListener: 'keyboardDidHide',
      },
    });

    const listeners = [
      Keyboard.addListener(updateListener, updateKeyboardSpace),
      Keyboard.addListener(resetListener, resetKeyboardSpace),
    ];

    return () => {
      listeners.forEach(l => l.remove());
    };
  }, [KeyboardHeight, excludeHeight, height, keyboardFullHeight, safe, safety, setKeyboardFullHeight]);

  return <Animated.View style={{ height: KeyboardHeight, backgroundColor: 'transparent' }} />;
};

export function withKeyboardSpacer<T>({
  safety = true,
  excludeHeight = false,
}: KeyboardSpacerProps): (Component: React.ComponentType<T>) => React.FC<T> {
  return Component => props =>
    (
      <>
        <Component {...props} />
        <KeyboardSpacer {...{ safety, excludeHeight }} />
      </>
    );
}

export default {
  KeyboardSpacerContext,
  useKeyboardSpacer,
  KeyboardSpacerProvider,
  KeyboardSpacer,
  withKeyboardSpacer,
};
