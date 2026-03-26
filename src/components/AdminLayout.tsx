import { useMemo, useState, ReactNode } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useTheme } from "@/contexts/ThemeContext";
import { useIsMobile } from "@/hooks/useMobile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { 
  Users, 
  FileCheck, 
  MessageSquareText, 
  DollarSign, 
  FolderKanban,
  BarChart3,
  Calendar,
  Clock,
  X,
  Menu,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Shield,
  Home,
  Search,
  Bell,
  Activity,
  Settings,
  Mail,
  FileText,
  Plus,
  MessageSquare,
  LifeBuoy,
  User
} from "lucide-react";
import { Link, useLocation, Redirect } from "wouter";
import { trpc } from "@/lib/trpc";
import { useRealtime } from "@/_core/hooks/useRealtime";
import { toast } from "sonner";
import { GlobalChatWidget } from "./GlobalChatWidget";
import { FeedbackDialog } from "./FeedbackDialog";

interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isMobile = useIsMobile();
  const [location] = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const currentUserId = user?.id ? String(user.id) : null;
  useRealtime();
  const logoSrc = theme === "dark" ? "/i-dream-logo.png" : "/i-dream-logo.png";
  const showCollapsed = isMobile ? false : sidebarCollapsed;

  const { data: chatMessages } = trpc.chat.getMessages.useQuery(
    { limit: 100 },
    { refetchInterval: 10000 }
  );
  const { data: notifications = [] } = trpc.notifications.getAll.useQuery();

  const unreadChatCount = useMemo(() => {
    if (!currentUserId || !chatMessages) return 0;
    return chatMessages.filter((msg: any) => {
      if (msg.isRead) return false;
      if (String(msg.senderId) === currentUserId) return false;
      const recipientId = msg.recipientId ? String(msg.recipientId) : null;
      return !recipientId || recipientId === currentUserId;
    }).length;
  }, [chatMessages, currentUserId]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
    } catch (error: any) {
      toast.error(error?.message || "Please clock out before logging out");
    }
  };

  // Check if user is admin
  if (user && user.role !== "admin") {
    return <Redirect to="/dashboard" />;
  }

  const menuItems = [
    { icon: Home, label: "Overview", path: "/admin" },
    { icon: Users, label: "Employees", path: "/admin/employees" },
    { icon: FileCheck, label: "Leaves", path: "/admin/leaves" },
    { icon: MessageSquareText, label: "Forms", path: "/admin/forms" },
    { icon: DollarSign, label: "Payslips", path: "/admin/payslips" },
    { icon: FolderKanban, label: "Projects", path: "/admin/projects" },
    { icon: Calendar, label: "Calendar", path: "/calendar" },
    { icon: Users, label: "Schedule Meeting", path: "/schedule-meeting" },
    { icon: Bell, label: "Announcements", path: "/admin/announcements" },
    { icon: BarChart3, label: "Reports", path: "/admin/reports" },
    { icon: BarChart3, label: "Employee Reports", path: "/reports" },
    { icon: Clock, label: "Clock-Out Reports", path: "/admin/reports" },
    { icon: Mail, label: "Email", path: "/chat" },
    { icon: FileText, label: "Notes", path: "/forms" },
  ];

  const isActive = (path: string) => location === path;
  const isCentralActive = () => location === "/admin" || location === "/dashboard";

  const bottomNavItems = [
    { icon: Home, label: "Central", path: "/dashboard", isActive: isCentralActive() },
    { icon: MessageSquare, label: "Chat", path: "/chat", isActive: location === "/chat" },
    { icon: BarChart3, label: "Reports", path: "/admin/reports", isActive: location.startsWith("/admin/reports") },
    { icon: FolderKanban, label: "Projects", path: "/admin/projects", isActive: location.startsWith("/admin/projects") },
    { icon: User, label: "Account", path: "/account", isActive: location === "/account" },
  ];

  const recentNotifications = [
    ...(unreadChatCount > 0
      ? [
          {
            id: "chat",
            type: "chat",
            message: `You have ${unreadChatCount} unread chat message${unreadChatCount > 1 ? "s" : ""}.`,
            time: "Just now",
          },
        ]
      : []),
    ...notifications.slice(0, 5).map((n: any) => ({
      id: n.id,
      type: n.type,
      message: n.title ? `${n.title} â€” ${n.message}` : n.message,
      time: n.createdAt ? new Date(n.createdAt).toLocaleString() : "",
    })),
  ];

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {isMobile && mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}
      {/* Sidebar */}
      <aside
        className={`${
          isMobile
            ? `fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transition-transform duration-300 ${
                mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
              }`
            : `${showCollapsed ? "w-20" : "w-64"} bg-card border-r transition-all duration-300 shrink-0 h-screen sticky top-0`
        } flex flex-col`}
        onMouseEnter={() => {
          if (!isMobile) setSidebarCollapsed(false);
        }}
        onMouseLeave={() => {
          if (!isMobile) setSidebarCollapsed(true);
        }}
      >
        {/* Logo & Toggle */}
        <div className="p-4 border-b flex items-center justify-between">
          {!showCollapsed && (
            <img
              src={logoSrc}
              alt="IDream Entertainment"
              className="h-20 w-auto max-w-[180px] object-contain"
            />
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (isMobile) {
                setMobileSidebarOpen(false);
              } else {
                setSidebarCollapsed(!sidebarCollapsed);
              }
            }}
          >
            {isMobile ? <X className="h-5 w-5" /> : showCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </Button>
        </div>

        {/* Search */}
        {!showCollapsed && (
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-2 overflow-y-auto">
          <div className="space-y-1">
            {menuItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <Button
                  variant={isActive(item.path) ? "secondary" : "ghost"}
                  className={`relative w-full ${showCollapsed ? "justify-center" : "justify-start"}`}
                  onClick={() => {
                    if (isMobile) setMobileSidebarOpen(false);
                  }}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {!showCollapsed && <span className="ml-3 text-sm">{item.label}</span>}
                </Button>
              </Link>
            ))}
          </div>
        </nav>

        {/* User Section */}
        <div className="p-2 border-t space-y-1">
          <Link href="/dashboard">
            <Button
              variant="outline"
              size="sm"
              className={`w-full ${showCollapsed ? "justify-center" : "justify-start"}`}
              onClick={() => {
                if (isMobile) setMobileSidebarOpen(false);
              }}
            >
              <Home className="h-4 w-4 shrink-0" />
              {!showCollapsed && <span className="ml-2 text-sm">Employee View</span>}
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className={`w-full ${showCollapsed ? "justify-center" : "justify-start"}`}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!showCollapsed && <span className="ml-2 text-sm">Logout</span>}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-screen w-full">
        {/* Compact Header */}
        <div className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b">
          <div className="flex items-center justify-between px-4 py-3">
            {/* Mobile Header */}
            <div className="md:hidden flex items-center w-full">
              <div className="w-10 flex items-center justify-start">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setMobileSidebarOpen(true)}
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <img
                  src={logoSrc}
                  alt="IDream Entertainment"
                  className="h-7 w-auto max-w-[120px] object-contain"
                />
              </div>
              <div className="w-16 flex items-center justify-end gap-2">
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => setShowNotifications(!showNotifications)}
                  >
                    <Bell className="h-4 w-4" />
                    {(unreadChatCount > 0 || recentNotifications.length > 0) && (
                      <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                    )}
                  </Button>

                  {showNotifications && (
                    <Card className="absolute right-0 top-12 w-72 p-4 shadow-lg">
                      <h3 className="font-semibold mb-3 text-sm">Recent Activity</h3>
                      <div className="space-y-3">
                        {recentNotifications.map((notif) => (
                          <div key={notif.id} className="flex gap-2 text-xs">
                            <Activity className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-sm">{notif.message}</p>
                              <p className="text-muted-foreground">{notif.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <Button variant="link" className="w-full mt-3 h-8 text-xs">
                        View All Notifications
                      </Button>
                    </Card>
                  )}
                </div>
                <Button variant="ghost" size="icon" className="h-9 w-9" onClick={toggleTheme}>
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Desktop Header */}
            <div className="hidden md:flex items-center justify-between w-full">
              <div>
                <p className="text-sm text-muted-foreground">Welcome back, {user?.name}</p>
              </div>

              <div className="flex items-center gap-2">
                {/* Universal Search */}
                <div className="relative hidden md:block">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search employees, reports..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 w-72 h-9 rounded-full bg-muted/40"
                  />
                </div>

                {/* Notification Center */}
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => setShowNotifications(!showNotifications)}
                  >
                    <Bell className="h-4 w-4" />
                    {(unreadChatCount > 0 || recentNotifications.length > 0) && (
                      <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                    )}
                  </Button>

                  {showNotifications && (
                    <Card className="absolute right-0 top-12 w-80 p-4 shadow-lg">
                      <h3 className="font-semibold mb-3 text-sm">Recent Activity</h3>
                      <div className="space-y-3">
                        {recentNotifications.map((notif) => (
                          <div key={notif.id} className="flex gap-2 text-xs">
                            <Activity className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-sm">{notif.message}</p>
                              <p className="text-muted-foreground">{notif.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <Button variant="link" className="w-full mt-3 h-8 text-xs">
                        View All Notifications
                      </Button>
                    </Card>
                  )}
                </div>

                <Button variant="ghost" size="icon" className="h-9 w-9" onClick={toggleTheme}>
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-4 pb-24 md:pb-4">
          {children}
        </div>
      </main>

      <GlobalChatWidget open={chatOpen} onOpenChange={setChatOpen} hideLauncher />
      <FeedbackDialog open={feedbackOpen} onOpenChange={setFeedbackOpen} />

      {/* Mobile Bottom Nav */}
      <div className="fixed bottom-4 left-4 right-4 z-40 md:hidden">
        <div className="rounded-2xl border border-white/10 bg-[#101010]/95 shadow-premium-lg backdrop-blur px-3 py-2">
          <div className="flex items-center justify-between">
            {bottomNavItems.map((item) => (
              <Link key={item.label} href={item.path}>
                <button
                  className={`flex flex-col items-center gap-1 px-2 py-1 text-[11px] ${
                    item.isActive ? "text-[#ff2801]" : "text-muted-foreground"
                  }`}
                >
                  <item.icon className={`h-4 w-4 ${item.isActive ? "text-[#ff2801]" : ""}`} />
                  <span>{item.label}</span>
                </button>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Support Menu (match v2 behavior) */}
      <div className="fixed bottom-6 right-6 z-50 hidden md:flex items-center gap-3">
        <Button
          onClick={() => {
            setChatOpen(true);
            setFabOpen(false);
          }}
          className={`h-12 w-12 rounded-full shadow-premium-lg bg-[#ff2801] hover:bg-[#e62401] text-white transition-all ${
            fabOpen ? "opacity-100 translate-x-0" : "opacity-0 translate-x-6 pointer-events-none"
          }`}
          size="icon"
          title="Chat"
        >
          <MessageSquare className="h-5 w-5" />
        </Button>
        <Button
          onClick={() => {
            setFeedbackOpen(true);
            setFabOpen(false);
          }}
          className={`h-12 w-12 rounded-full shadow-premium-lg bg-[#ff8a00] hover:bg-[#ff7a00] text-white transition-all ${
            fabOpen ? "opacity-100 translate-x-0" : "opacity-0 translate-x-6 pointer-events-none"
          }`}
          size="icon"
          title="Feedback"
        >
          <LifeBuoy className="h-5 w-5" />
        </Button>
        <Button
          onClick={() => setFabOpen(!fabOpen)}
          className="h-14 w-14 rounded-full shadow-premium-lg bg-primary hover:bg-primary/90 text-white"
          size="icon"
          title="Quick Actions"
        >
          {fabOpen ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
        </Button>
      </div>
    </div>
  );
}



