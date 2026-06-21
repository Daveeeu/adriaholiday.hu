import type { ReactNode } from 'react';

import { EntitySidePanel } from '@/components/admin/entity-side-panel';

type SidePanelProps = {
  title: string;
  description?: string;
  eyebrow?: string;
  children: ReactNode;
  footer?: ReactNode;
  onClose?: () => void;
  className?: string;
  open?: boolean;
};

export function SidePanel({
  title,
  description,
  eyebrow,
  children,
  footer,
  onClose,
  className,
  open = true,
}: SidePanelProps) {
  return (
    <EntitySidePanel
      open={open}
      title={title}
      description={description}
      eyebrow={eyebrow}
      footer={footer}
      onOpenChange={() => {
        onClose?.();
      }}
      className={className}
    >
      {children}
    </EntitySidePanel>
  );
}
