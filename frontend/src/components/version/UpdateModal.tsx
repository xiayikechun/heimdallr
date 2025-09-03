import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, ArrowUp } from 'lucide-react';
import { type VersionInfo } from '../../services/versionService';

interface UpdateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  versionInfo: VersionInfo;
}

const UpdateModal: React.FC<UpdateModalProps> = ({
  open,
  onOpenChange,
  versionInfo,
}) => {
  const { current, latest, release } = versionInfo;

  const handleViewRelease = () => {
    if (release?.html_url) {
      window.open(release.html_url, '_blank');
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const formatReleaseBody = (body: string) => {
    // Simple markdown-to-text conversion for display
    return body
      .replace(/^#{1,6}\s+/gm, '') // Remove headers
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
      .replace(/\*(.*?)\*/g, '$1') // Remove italic
      .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links, keep text
      .replace(/`(.*?)`/g, '$1') // Remove code formatting
      .trim();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowUp className="h-5 w-5 text-green-600" />
            New Version Available
          </DialogTitle>
          <DialogDescription>
            A newer version of Heimdallr is available for download.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Version Comparison */}
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Current Version</div>
              <Badge variant="outline" className="mt-1">
                v{current}
              </Badge>
            </div>
            <ArrowUp className="h-4 w-4 text-muted-foreground" />
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Latest Version</div>
              <Badge variant="default" className="mt-1 bg-green-600">
                v{latest}
              </Badge>
            </div>
          </div>

          {/* Release Information */}
          {release && (
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-sm mb-1">
                  {release.name || `Release ${release.tag_name}`}
                </h4>
                <p className="text-sm text-muted-foreground">
                  Released on {formatDate(release.published_at)}
                </p>
              </div>

              {release.body && (
                <div>
                  <h5 className="font-medium text-sm mb-2">What's New:</h5>
                  <div className="max-h-40 overflow-y-auto">
                    <pre className="text-sm whitespace-pre-wrap text-muted-foreground">
                      {formatReleaseBody(release.body)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Later
          </Button>
          <Button onClick={handleViewRelease} className="flex items-center gap-2">
            <ExternalLink className="h-4 w-4" />
            View Release
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateModal;