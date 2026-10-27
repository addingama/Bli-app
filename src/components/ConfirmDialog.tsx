/**
 * ConfirmDialog Component - BliApp
 * Reusable confirmation dialog for destructive actions
 */

import React from 'react';
import { StyleSheet } from 'react-native';
import { Portal, Dialog, Button, Text, useTheme } from 'react-native-paper';
import { spacing } from '../theme/theme';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  visible,
  title,
  message,
  confirmText = 'Ya',
  cancelText = 'Batal',
  confirmColor,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const theme = useTheme();

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onCancel}>
        <Dialog.Title>{title}</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium">{message}</Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onCancel} textColor={theme.colors.onSurfaceVariant}>
            {cancelText}
          </Button>
          <Button
            onPress={onConfirm}
            textColor={confirmColor || theme.colors.error}
            mode="contained"
            buttonColor={confirmColor || theme.colors.error}
            style={styles.confirmButton}
          >
            {confirmText}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  confirmButton: {
    marginLeft: spacing.sm,
  },
});
