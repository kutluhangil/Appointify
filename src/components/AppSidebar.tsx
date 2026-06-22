import {
  LayoutDashboard, CalendarDays, Users, Scissors,
  UserCheck, CreditCard, Settings, LogOut, CalendarClock,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { initials } from "@/lib/format";
import { useTranslation } from "react-i18next";

export const navItems = [
  { icon: LayoutDashboard, labelKey: "nav.dashboard", path: "/dashboard" },
  { icon: CalendarDays, labelKey: "nav.appointments", path: "/appointments" },
  { icon: Users, labelKey: "nav.customers", path: "/customers" },
  { icon: Scissors, labelKey: "nav.services", path: "/services" },
  { icon: UserCheck, labelKey: "nav.staff", path: "/staff" },
  { icon: CreditCard, labelKey: "nav.payments", path: "/payments" },
  { icon: Settings, labelKey: "nav.settings", path: "/settings" },
];

export function SidebarContent({ collapsed = false, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) {
  const location = useLocation();
  const { profile, signOut } = useAuth();
  const { t } = useTranslation();

  const userInitials = profile?.full_name ? initials(profile.full_name) : "U";

  return (
    <>
      <div className="flex items-center gap-2.5 px-3 h-12 border-b border-sidebar-border">
        <CalendarClock className="h-5 w-5 text-sidebar-primary shrink-0" />
        {!collapsed && (
          <span className="font-semibold text-[15px] text-sidebar-accent-foreground tracking-tight">
            Appointify
          </span>
        )}
      </div>

      <nav className="flex-1 py-2 px-2 space-y-0.5">
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (item.path !== "/" && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{t(item.labelKey)}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-2">
        <div className="flex items-center gap-2 px-1.5 py-1">
          <Avatar className="h-6 w-6">
            <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-[10px] leading-none">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <span className="text-[12px] text-sidebar-foreground truncate flex-1">
              {profile?.full_name || "Kullanıcı"}
            </span>
          )}
          {!collapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={signOut}
              className="text-sidebar-foreground hover:bg-sidebar-accent h-6 w-6"
              title={t("nav.logout")}
            >
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>
    </>
  );
}

export function AppSidebar() {
  return (
    <aside className="hidden md:flex flex-col bg-sidebar border-r border-sidebar-border h-screen sticky top-0 w-52">
      <div className="flex flex-col flex-1 overflow-hidden">
        <SidebarContent />
      </div>
    </aside>
  );
}
