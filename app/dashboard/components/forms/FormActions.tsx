'use client';

import { Button } from '@/components/ui/button';

export function FormActions({
  onCancel,
  isSubmitting = false,
  submitLabel = 'Create Trip',
  cancelLabel = 'Cancel',
}: {
  onCancel: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
}) {
  return (
    <div className="mt-6 flex justify-end space-x-3">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={isSubmitting}
      >
        {cancelLabel}
      </Button>
      <Button
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Creating...' : submitLabel}
      </Button>
    </div>
  );
}
