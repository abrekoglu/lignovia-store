import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import SearchBar from "@/components/SearchBar";
import ThemeToggle from "@/components/ThemeToggle";
import { useToast } from "@/contexts/ToastContext";
import { useConfirmDialog } from "@/contexts/ConfirmDialogContext";

export default function AdminLayout({ children, title, description }) {
  const router = useRouter();
  const { data: session } = useSession();
  const { toastSuccess } = useToast();
  const { confirm } = useConfirmDialog();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [avatarDropdownOpen, setAvatarDropdownOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(3); // TODO: Fetch from API

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: "home", path: "/admin/dashboard" },
    { id: "orders", label: "Orders", icon: "shopping-bag", path: "/admin/orders" },
    { id: "products", label: "Products", icon: "box", path: "/admin/products" },
    { id: "categories", label: "Categories", icon: "folder", path: "/admin/categories" },
    { id: "customers", label: "Customers", icon: "users", path: "/admin/customers" },
    { id: "inventory", label: "Inventory", icon: "layers", path: "/admin/inventory" },
    { id: "calendar", label: "Calendar", icon: "calendar", path: "/admin/calendar" },
    { id: "notifications", label: "Notifications", icon: "bell", path: "/admin/notifications" },
    { id: "activity-log", label: "Activity Log", icon: "shield", path: "/admin/activity-log" },
    { id: "analytics", label: "Analytics", icon: "bar-chart", path: "/admin/analytics" },
    { id: "profile", label: "Profile", icon: "user", path: "/admin/profile" },
    { id: "settings", label: "Settings", icon: "settings", path: "/admin/settings" },
  ];

  const getIcon = (iconName) => {
    const icons = {
      home: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </svg>
      ),
      "shopping-bag": (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.25 10.5a.75.75 0 01-.75.75h1.5a.75.75 0 00.75-.75V8.25a.75.75 0 00-.75-.75H7.5a.75.75 0 00-.75.75v2.25zm6 0a.75.75 0 01-.75-.75V8.25a.75.75 0 00-.75-.75h-1.5a.75.75 0 00-.75.75v1.5c0 .414.336.75.75.75h1.5a.75.75 0 01.75-.75z" />
        </svg>
      ),
      box: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
        </svg>
      ),
      folder: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9h6a2.25 2.25 0 012.25 2.25v.75m-8.5 3A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-16.5 0v-7.5A2.25 2.25 0 015.25 9h6a2.25 2.25 0 012.25 2.25v7.5m-9 0V18.75a2.25 2.25 0 012.25-2.25h13.5a2.25 2.25 0 012.25 2.25v1.5m-16.5 0h16.5" />
        </svg>
      ),
      users: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
      ),
      layers: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3" />
        </svg>
      ),
      "bar-chart": (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
      ),
      calendar: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
      ),
      user: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
      ),
      bell: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
      ),
      shield: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
      ),
      settings: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    };
    return icons[iconName] || null;
  };

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [router.pathname]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".admin-header-dropdown")) {
        setNotificationsOpen(false);
        setAvatarDropdownOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Handle logout
  const handleLogout = async () => {
    const confirmed = await confirm({
      title: "Sign Out?",
      message: "Are you sure you want to sign out?",
      confirmText: "Sign Out",
      cancelText: "Cancel",
      iconType: "alert",
      variant: "normal",
    });

    if (confirmed) {
      await signOut({ callbackUrl: "/login" });
      toastSuccess("Signed out successfully");
    }
  };

  // Get user initials
  const getUserInitials = () => {
    if (session?.user?.name) {
      return session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (session?.user?.email) {
      return session.user.email.charAt(0).toUpperCase();
    }
    return "A";
  };

  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark">
      {/* Two-Column Layout */}
      <div className="flex">
        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Left Sidebar */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-50 w-64 min-h-screen bg-bg-light dark:bg-bg-dark border-r border-border-light dark:border-border-dark lg:sticky lg:top-0 lg:h-screen overflow-y-auto transition-transform duration-200 ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          {/* Logo */}
          <div className="p-6 border-b border-border-light dark:border-border-dark flex items-center justify-between">
            <Link href="/admin/dashboard" className="flex items-center" onClick={() => setMobileMenuOpen(false)}>
              <Image
                src="/images/logo/logo.png"
                alt="LIGNOVIA"
                width={180}
                height={48}
                className="h-10 w-auto"
                priority
              />
            </Link>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light dark:hover:text-text-primary-dark"
              aria-label="Close menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="p-4 space-y-1">
            {menuItems.map((item) => {
              const isActive = router.pathname === item.path || 
                (item.path === "/admin/dashboard" && router.pathname === "/admin") ||
                (item.path === "/admin/categories" && router.pathname.startsWith("/admin/categories"));
              return (
                <Link
                  key={item.id}
                  href={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-soft transition-all duration-200 ${
                    isActive
                      ? "bg-accent/20 text-accent border-l-4 border-accent"
                      : "text-text-secondary-light dark:text-text-secondary-dark hover:bg-hover-light dark:hover:bg-hover-dark hover:text-accent"
                  }`}
                >
                  {getIcon(item.icon)}
                  <span className="font-medium text-sm">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-h-screen">
          {/* Top Header Bar */}
          <header className="sticky top-0 z-30 bg-surface-light dark:bg-surface-dark border-b border-border-light dark:border-border-dark backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95">
            <div className="max-w-7xl mx-auto px-4 lg:px-6 py-4">
              <div className="flex items-center justify-between gap-4">
                {/* Left: Mobile Menu Toggle (Mobile Only) */}
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="lg:hidden text-text-primary-light dark:text-text-primary-dark p-2 rounded-[10px] hover:bg-hover-light dark:hover:bg-hover-dark transition-colors duration-200"
                  aria-label="Open menu"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                  </svg>
                </button>

                {/* Center: Search Bar */}
                <div className="flex-1 max-w-2xl">
                  <SearchBar />
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-3">
                  {/* Notifications */}
                  <Link
                    href="/admin/notifications"
                    className="relative p-2 rounded-[10px] text-text-secondary-light dark:text-text-secondary-dark hover:bg-hover-light dark:hover:bg-hover-dark hover:text-accent transition-all duration-200 admin-header-dropdown"
                    aria-label="Notifications"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                    </svg>
                    {unreadNotifications > 0 && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full border-2 border-surface-light dark:border-surface-dark" />
                    )}
                  </Link>

                  {/* Theme Toggle */}
                  <ThemeToggle />

                  {/* Admin Avatar Dropdown */}
                  <div className="relative admin-header-dropdown">
                    <button
                      onClick={() => setAvatarDropdownOpen(!avatarDropdownOpen)}
                      className="flex items-center gap-2 p-1.5 rounded-[10px] hover:bg-hover-light dark:hover:bg-hover-dark transition-colors duration-200"
                      aria-label="Admin menu"
                    >
                      {session?.user?.image ? (
                        <Image
                          src={session.user.image}
                          alt={session.user.name || "Admin"}
                          width={32}
                          height={32}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-accent/20 dark:bg-accent/30 flex items-center justify-center">
                          <span className="text-xs font-semibold text-accent">
                            {getUserInitials()}
                          </span>
                        </div>
                      )}
                      <svg
                        className={`w-4 h-4 text-text-secondary-light dark:text-text-secondary-dark transition-transform duration-200 ${
                          avatarDropdownOpen ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Avatar Dropdown Menu */}
                    {avatarDropdownOpen && (
                      <div className="absolute right-0 top-full mt-2 w-56 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-[14px] shadow-soft dark:shadow-soft-dark z-50 overflow-hidden">
                        {/* User Info */}
                        <div className="px-4 py-3 border-b border-border-light dark:border-border-dark">
                          <p className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">
                            {session?.user?.name || "Admin"}
                          </p>
                          <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                            {session?.user?.email || "admin@example.com"}
                          </p>
                        </div>

                        {/* Menu Items */}
                        <div className="py-2">
                          <Link
                            href="/admin/profile"
                            onClick={() => setAvatarDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-primary-light dark:text-text-primary-dark hover:bg-hover-light dark:hover:bg-hover-dark transition-colors duration-200"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                            </svg>
                            Profile
                          </Link>
                          <Link
                            href="/admin/settings"
                            onClick={() => setAvatarDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-primary-light dark:text-text-primary-dark hover:bg-hover-light dark:hover:bg-hover-dark transition-colors duration-200"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Settings
                          </Link>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-border-light dark:border-border-dark" />

                        {/* Logout */}
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-error-light dark:text-error-dark hover:bg-hover-light dark:hover:bg-hover-dark transition-colors duration-200"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                          </svg>
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8 lg:py-12">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

