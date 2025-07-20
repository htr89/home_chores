import React from 'react';
import { Button as PaperButton } from 'react-native-paper';

export default function AppButton({
  mode = 'contained',
  buttonColor = '#2196f3',
  textColor = '#fff',
  compact = true,
  children,
  ...props
}) {
  return (
    <PaperButton
      mode={mode}
      buttonColor={buttonColor}
      textColor={textColor}
      compact={compact}
      {...props}
    >
      {children}
    </PaperButton>
  );
}
