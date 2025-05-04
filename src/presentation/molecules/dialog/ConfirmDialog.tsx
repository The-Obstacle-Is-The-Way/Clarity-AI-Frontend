// src/presentation/molecules/ConfirmDialog.tsx
import React from 'react';
// Use namespace import for Radix UI components
import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog';
import { Button } from '@/presentation/atoms'; // Corrected import

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
 * Refactored to use correct Radix UI import patterns.
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
    // Use AlertDialogPrimitive.Root and sub-components
    <AlertDialogPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      {/* Portal is recommended for Modals/Dialogs */}
      <AlertDialogPrimitive.Portal>
        {/* Overlay darkens the background */}
        <AlertDialogPrimitive.Overlay className="fixed inset-0 bg-black/30 data-[state=open]:animate-overlayShow" />
        <AlertDialogPrimitive.Content className="fixed left-[50%] top-[50%] max-h-[85vh] w-[90vw] max-w-[500px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none data-[state=open]:animate-contentShow">
          <AlertDialogPrimitive.Title className="m-0 text-[17px] font-medium text-mauve12">
            {title}
          </AlertDialogPrimitive.Title>
          <AlertDialogPrimitive.Description className="mb-5 mt-4 text-[15px] leading-normal text-mauve11">
            {description}
          </AlertDialogPrimitive.Description>
          <div className="flex justify-end gap-[25px]">
            <AlertDialogPrimitive.Cancel asChild>
              <Button variant="outline" disabled={isConfirming}>
                {cancelText}
              </Button>
            </AlertDialogPrimitive.Cancel>
            <AlertDialogPrimitive.Action asChild>
              <Button
                onClick={onConfirm}
                disabled={isConfirming}
                variant="destructive" // Destructive action style
                aria-label={confirmText} // Improve accessibility
              >
                {isConfirming ? 'Processing...' : confirmText}
              </Button>
            </AlertDialogPrimitive.Action>
          </div>
        </AlertDialogPrimitive.Content>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  );
};
