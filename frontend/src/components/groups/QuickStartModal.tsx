import { useTranslation } from 'react-i18next';
import { Code } from 'lucide-react';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { CodeTabs } from '../ui/shadcn-io/code-tabs';
import { generateCodeExamples } from '@/utils/codeExamples';

interface QuickStartModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupKey: string;
  groupName: string;
}

export function QuickStartModal({
  open,
  onOpenChange,
  groupKey,
  groupName,
}: QuickStartModalProps) {
  const { t } = useTranslation();

  const baseUrl = window.location.origin.replace(/:\d+$/, ':9000');

  const allCodes = generateCodeExamples({
    baseUrl,
    groupKey,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-7xl !w-[90vw] max-h-[80vh] grid-rows-[auto_1fr] overflow-hidden sm:!max-w-7xl">
        <DialogHeader className="shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            {t('groups.quickStart.title')}
            <span className="text-sm font-normal text-muted-foreground">
              - {groupName}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="min-h-0 h-full overflow-y-auto">
          <CodeTabs 
            codes={allCodes}
            className="h-full [&_[data-slot=install-tabs-contents]]:min-h-0 [&_[data-slot=install-tabs-contents]]:h-full [&_[data-slot=install-tabs-contents]]:overflow-auto [&_[data-slot=install-tabs-content]]:h-full [&_[data-slot=install-tabs-content]]:overflow-auto"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}