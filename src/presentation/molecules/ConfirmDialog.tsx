// src/presentation/molecules/ConfirmDialog.tsx
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@presentation/atoms/alert-dialog'; // Adjust path if needed
import { Button } from '@presentation/atoms/button'; // Adjust path if needed

interface ConfirmDialogProps {
  /** Whether the dialog is currently open */
  open: boolean;
  /** Function to call when the open state changes */
  onOpenChange: (open: boolean) => void;
  /** The title of the confirmation dialog */
  title: string;
  /** The descriptive text within the dialog */
  description: React.ReactNode;
  /** Function to call when the confirm button is clicked */
  onConfirm: () => void;
  /** Optional text for the confirm button (default: "Confirm") */
  confirmText?: string;
  /** Optional text for the cancel button (default: "Cancel") */
  cancelText?: string;
  /** Optional loading state for the confirm button */
  isConfirming?: boolean;
}

/**
 * A reusable confirmation dialog component using Shadcn UI's AlertDialog.
 */
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isConfirming = false,
}) => {
  // Prevent closing the dialog by clicking outside or pressing Escape when confirming
  const handleOpenChange = (newOpenState: boolean) => {
    if (!isConfirming) {
      onOpenChange(newOpenState);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isConfirming}>{cancelText}</AlertDialogCancel>
          {/* Use a Button component for the action to allow loading state */}
          <Button
            onClick={onConfirm}
            disabled={isConfirming}
            variant="destructive" // Destructive action style
          >
            {isConfirming ? 'Processing...' : confirmText}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
