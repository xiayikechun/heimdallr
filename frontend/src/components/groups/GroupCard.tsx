import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Copy,
  RefreshCw,
  Users,
  Hammer,
  Check,
  Send,
} from "lucide-react"
import type { Group } from "../../types/group"
import { formatDate, copyToClipboard } from "../../utils/helpers"

import { Card, CardContent, CardHeader } from "../ui/card"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog"
import { TestGroupModal } from "./TestGroupModal"
import { QuickStartModal } from "./QuickStartModal"

interface GroupCardProps {
  group: Group
  channelCount?: number
  onEdit: (group: Group) => void
  onDelete: (groupId: number) => void
  onRegenerateToken: (groupId: number) => void
  isLoading?: boolean
}

export function GroupCard({
  group,
  channelCount = 0,
  onEdit,
  onDelete,
  onRegenerateToken,
  isLoading = false,
}: GroupCardProps) {
  const { t } = useTranslation();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showRegenerateDialog, setShowRegenerateDialog] = useState(false)
  const [showTestModal, setShowTestModal] = useState(false)
  const [showQuickStartModal, setShowQuickStartModal] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)

  const handleDelete = () => {
    onDelete(group.id)
    setShowDeleteDialog(false)
  }

  const handleRegenerateToken = () => {
    onRegenerateToken(group.id)
    setShowRegenerateDialog(false)
  }

  const handleCopyToken = async () => {
    const success = await copyToClipboard(group.token)
    if (success) {
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    }
  }

  const maskToken = (token: string) => {
    if (token.length <= 10) return token
    return `${token.slice(0, 5)}***${token.slice(-5)}`
  }

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-1">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <h3 className="font-semibold text-lg">{group.name}</h3>
                <Badge variant="outline" className="text-xs">
                  <Users className="mr-1 h-3 w-3" />
                  {channelCount}
                </Badge>
              </div>
              <div className="mt-2 min-h-[1.25rem]">
                {group.description && (
                  <p className="text-sm text-muted-foreground">
                    {group.description}
                  </p>
                )}
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" disabled={isLoading}>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(group)}>
                  <Edit className="mr-2 h-4 w-4" />
                  {t('common.edit')}
                </DropdownMenuItem>
                {channelCount > 0 && (
                  <DropdownMenuItem onClick={() => setShowTestModal(true)}>
                    <Hammer className="mr-2 h-4 w-4" />
                    {t('groups.testGroup')}
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => setShowRegenerateDialog(true)}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  {t('groups.regenerateToken')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-red-600 dark:text-red-400"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t('common.delete')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="-mt-4">
          <div className="space-y-4">
            {/* Token */}
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground mb-1">
                    {t('groups.tokenLabel')}
                  </p>
                  <p className="text-sm font-mono break-all text-foreground">
                    {maskToken(group.token)}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowQuickStartModal(true)}
                    className="transition-all duration-200 hover:bg-muted"
                    title={t('groups.quickStart.title')}
                  >
                    <Send className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyToken}
                    className={`transition-all duration-200 ${
                      copySuccess
                        ? "bg-green-50 border-green-200 text-green-600 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400"
                        : "hover:bg-muted"
                    }`}
                    title={copySuccess ? t('common.copied') : t('groups.copyToken')}
                  >
                    {copySuccess ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Metadata */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">
                  {t('common.createdAt')}:
                </span>
                <span className="font-medium">{formatDate(group.created_at, "yyyy-MM-dd HH:mm")}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">
                  {t('common.updatedAt')}:
                </span>
                <span className="font-medium">{formatDate(group.updated_at, "yyyy-MM-dd HH:mm")}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('groups.deleteConfirm')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('groups.deleteMessage', { name: group.name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Regenerate token confirmation dialog */}
      <AlertDialog
        open={showRegenerateDialog}
        onOpenChange={setShowRegenerateDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('groups.regenerateConfirm')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('groups.regenerateMessage', { name: group.name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleRegenerateToken}>
              {t('groups.regenerate')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Test group modal */}
      <TestGroupModal
        groupId={group.id}
        groupName={group.name}
        open={showTestModal}
        onOpenChange={setShowTestModal}
      />

      {/* Quick start modal */}
      <QuickStartModal
        open={showQuickStartModal}
        onOpenChange={setShowQuickStartModal}
        groupKey={group.token}
        groupName={group.name}
      />
    </>
  )
}