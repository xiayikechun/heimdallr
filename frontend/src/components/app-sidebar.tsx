import * as React from "react"
import { NavLink, useLocation } from 'react-router-dom'
import { useTranslation } from "react-i18next"
import { useVersion } from "../hooks/useVersion"
import {
  LayoutDashboard,
  Bell,
  Users,
  Settings,
  User,
  LogOut,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarFooter,
} from "@/components/ui/sidebar"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ROUTES } from '../utils/constants'
import { useAuth } from "../contexts/AuthContext"

// Navigation data will be generated dynamically using i18n
const getNavigationData = (t: (key: string) => string) => ({
  navMain: [
    {
      title: t("sidebar.mainFeatures"),
      items: [
        {
          title: t("navigation.dashboard"),
          url: ROUTES.DASHBOARD,
          icon: LayoutDashboard,
        },
        {
          title: t("navigation.channels"),
          url: ROUTES.CHANNELS,
          icon: Bell,
        },
        {
          title: t("navigation.groups"),
          url: ROUTES.GROUPS,
          icon: Users,
        },
      ],
    },
    {
      title: t("sidebar.personalSettings"),
      items: [
        {
          title: t("navigation.profile"),
          url: ROUTES.PROFILE,
          icon: User,
        },
        {
          title: t("navigation.settings"),
          url: ROUTES.SETTINGS,
          icon: Settings,
        },
      ],
    },
  ],
})

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { t } = useTranslation()
  const { logout } = useAuth()
  const location = useLocation()
  const { currentVersion } = useVersion()
  const data = getNavigationData(t)

  const handleLogout = () => {
    logout()
  }

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <LayoutDashboard className="size-4" />
          </div>
          <div className="flex flex-col gap-0.5 leading-none">
            <span className="font-semibold">Heimdallr</span>
            <span className="text-xs text-muted-foreground">
              {t("sidebar.notificationGateway")}
            </span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {data.navMain.map((group, groupIndex) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive =
                    location.pathname === item.url ||
                    (item.url !== ROUTES.DASHBOARD &&
                      location.pathname.startsWith(item.url))

                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <NavLink to={item.url}>
                          <item.icon className="size-4" />
                          <span>{item.title}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
                {/* Add logout button under personal settings group */}
                {groupIndex === 1 && (
                  <SidebarMenuItem>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <SidebarMenuButton className="text-destructive hover:bg-destructive/10 hover:text-destructive">
                          <LogOut className="size-4" />
                          <span>{t("auth.logout")}</span>
                        </SidebarMenuButton>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            {t("auth.logout")}
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            {t("auth.logoutConfirm")}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>
                            {t("common.cancel")}
                          </AlertDialogCancel>
                          <AlertDialogAction onClick={handleLogout}>
                            {t("auth.logout")}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </SidebarMenuItem>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <div className="p-1">
          <div className="text-xs text-muted-foreground text-center">
            Heimdallr v{currentVersion || "unknown version"}
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
