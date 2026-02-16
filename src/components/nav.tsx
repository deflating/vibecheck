"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";

interface Notification {
  id: number;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read: number;
  created_at: string;
}

export function Nav({ user }: { user: { name: string; avatar_url?: string | null; role?: string } | null }) {
  const [loggingOut, setLoggingOut] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const [messageUnread, setMessageUnread] = useState(0);

  const fetchNotifications = useCallback(() => {
    if (!user) return;
    fetch("/api/notifications")
      .then(r => r.json())
      .then(d => {
        setNotifications(d.notifications || []);
        setUnreadCount(d.unreadCount || 0);
      })
      .catch(() => {});
  }, [user]);

  const fetchMessageUnread = useCallback(() => {
    if (!user) return;
    fetch("/api/messages/conversations")
      .then(r => r.json())
      .then(d => setMessageUnread(d.totalUnread || 0))
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    fetchNotifications();
    fetchMessageUnread();
    const interval = setInterval(() => { fetchNotifications(); fetchMessageUnread(); }, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications, fetchMessageUnread]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    await signOut({ callbackUrl: "/" });
  }

  async function handleSwitchRole() {
    setSwitching(true);
    await fetch("/api/auth/switch-role", { method: "POST" });
    router.push(user?.role === "reviewer" ? "/dashboard" : "/reviewer");
    router.refresh();
    setSwitching(false);
  }

  async function handleMarkAllRead() {
    await fetch("/api/notifications/read-all", { method: "POST" });
    setNotifications(prev => prev.map(n => ({ ...n, read: 1 })));
    setUnreadCount(0);
  }

  function handleNotificationClick(notif: Notification) {
    if (!notif.read) {
      fetch("/api/notifications/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [notif.id] }),
      });
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: 1 } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    setDropdownOpen(false);
    if (notif.link) router.push(notif.link);
  }

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr + "Z").getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }

  const NotificationDropdown = () => (
    <div className="absolute right-0 top-full mt-2 w-80 bg-surface border border-border rounded-xl shadow-lg z-50 overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <span className="text-sm font-semibold">Notifications</span>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} className="text-xs text-accent hover:text-accent-hover transition-colors">
            Mark all read
          </button>
        )}
      </div>
      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-text-muted">No notifications yet</div>
        ) : (
          notifications.map(notif => (
            <button
              key={notif.id}
              onClick={() => handleNotificationClick(notif)}
              className={`w-full text-left px-4 py-3 border-b border-border last:border-0 hover:bg-surface-hover transition-colors ${!notif.read ? "bg-accent/5" : ""}`}
            >
              <div className="flex items-start gap-2">
                {!notif.read && <span className="mt-1.5 w-2 h-2 rounded-full bg-accent flex-shrink-0" />}
                <div className={!notif.read ? "" : "ml-4"}>
                  <p className={`text-sm ${!notif.read ? "font-semibold" : "text-text-secondary"}`}>{notif.title}</p>
                  {notif.body && <p className="text-xs text-text-muted mt-0.5 line-clamp-1">{notif.body}</p>}
                  <p className="text-xs text-text-muted mt-1">{timeAgo(notif.created_at)}</p>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );

  return (
    <nav className="border-b border-border px-4 sm:px-6 py-4">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          <span className="text-accent">~</span>
          <span>vibecheck</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <>
              {user.role === "reviewer" ? (
                <>
                  <Link href="/reviewer" className="text-sm text-text-secondary hover:text-text transition-colors">Dashboard</Link>
                  <Link href="/reviewer/browse" className="text-sm text-text-secondary hover:text-text transition-colors">Browse</Link>
                  <Link href="/reviewer/profile" className="text-sm text-text-secondary hover:text-text transition-colors">Profile</Link>
                </>
              ) : (
                <>
                  <Link href="/dashboard" className="text-sm text-text-secondary hover:text-text transition-colors">Dashboard</Link>
                  <Link href="/reviewers" className="text-sm text-text-secondary hover:text-text transition-colors">Find a Reviewer</Link>
                  <Link href="/requests/new" className="text-sm bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-lg transition-colors">New Request</Link>
                </>
              )}

              <Link href="/messages" className="relative text-sm text-text-secondary hover:text-text transition-colors">
                Messages
                {messageUnread > 0 && (
                  <span className="absolute -top-1.5 -right-3 bg-accent text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                    {messageUnread > 9 ? "9+" : messageUnread}
                  </span>
                )}
              </Link>

              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="relative p-1.5 text-text-secondary hover:text-text transition-colors rounded-lg hover:bg-surface-hover"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-accent text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>
                {dropdownOpen && <NotificationDropdown />}
              </div>

              <div className="w-px h-5 bg-border mx-1" />
              <div className="flex items-center gap-2">
                {user.avatar_url && (
                  <img src={user.avatar_url} alt={user.name} className="w-7 h-7 rounded-full border border-border" />
                )}
                <span className="text-sm text-text-muted">{user.name}</span>
              </div>
              <button
                onClick={handleSwitchRole}
                disabled={switching}
                className="text-xs text-text-muted hover:text-accent transition-colors border border-border rounded px-2 py-1"
              >
                {switching ? "..." : `Switch to ${user.role === "reviewer" ? "Coder" : "Reviewer"}`}
              </button>
              <button onClick={handleLogout} disabled={loggingOut} className="text-sm text-text-muted hover:text-danger transition-colors">
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-text-secondary hover:text-text transition-colors">Log in</Link>
              <Link href="/login" className="text-sm bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-lg transition-colors">Get Started</Link>
            </>
          )}
        </div>

        {/* Mobile: icons + hamburger */}
        <div className="flex md:hidden items-center gap-1">
          {user && (
            <>
              <Link href="/messages" className="relative p-2 text-text-secondary hover:text-text">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                {messageUnread > 0 && (
                  <span className="absolute top-0.5 right-0.5 bg-accent text-white text-[10px] font-bold rounded-full min-w-[14px] h-3.5 flex items-center justify-center px-0.5">
                    {messageUnread > 9 ? "9+" : messageUnread}
                  </span>
                )}
              </Link>
              <div className="relative" ref={dropdownRef}>
                <button onClick={() => setDropdownOpen(!dropdownOpen)} className="relative p-2 text-text-secondary hover:text-text">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute top-0.5 right-0.5 bg-accent text-white text-[10px] font-bold rounded-full min-w-[14px] h-3.5 flex items-center justify-center px-0.5">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>
                {dropdownOpen && <NotificationDropdown />}
              </div>
            </>
          )}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 text-text-secondary hover:text-text transition-colors">
            {mobileOpen ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h18M3 6h18M3 18h18" /></svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border mt-4 pt-4 pb-2 space-y-1">
          {user ? (
            <>
              <div className="flex items-center gap-2 px-2 py-2 mb-2">
                {user.avatar_url && <img src={user.avatar_url} alt={user.name} className="w-8 h-8 rounded-full border border-border" />}
                <div>
                  <div className="text-sm font-medium">{user.name}</div>
                  <div className="text-xs text-text-muted capitalize">{user.role}</div>
                </div>
              </div>
              {user.role === "reviewer" ? (
                <>
                  <Link href="/reviewer" onClick={() => setMobileOpen(false)} className="block px-2 py-2.5 text-sm text-text-secondary hover:text-text hover:bg-surface-hover rounded-lg transition-colors">Dashboard</Link>
                  <Link href="/reviewer/browse" onClick={() => setMobileOpen(false)} className="block px-2 py-2.5 text-sm text-text-secondary hover:text-text hover:bg-surface-hover rounded-lg transition-colors">Browse Requests</Link>
                  <Link href="/reviewer/profile" onClick={() => setMobileOpen(false)} className="block px-2 py-2.5 text-sm text-text-secondary hover:text-text hover:bg-surface-hover rounded-lg transition-colors">Profile</Link>
                </>
              ) : (
                <>
                  <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="block px-2 py-2.5 text-sm text-text-secondary hover:text-text hover:bg-surface-hover rounded-lg transition-colors">Dashboard</Link>
                  <Link href="/reviewers" onClick={() => setMobileOpen(false)} className="block px-2 py-2.5 text-sm text-text-secondary hover:text-text hover:bg-surface-hover rounded-lg transition-colors">Find a Reviewer</Link>
                  <Link href="/requests/new" onClick={() => setMobileOpen(false)} className="block px-2 py-2.5 text-sm font-medium text-accent hover:bg-accent/5 rounded-lg transition-colors">New Request</Link>
                </>
              )}
              <Link href="/messages" onClick={() => setMobileOpen(false)} className="block px-2 py-2.5 text-sm text-text-secondary hover:text-text hover:bg-surface-hover rounded-lg transition-colors">
                Messages {messageUnread > 0 && <span className="ml-1 bg-accent text-white text-[10px] font-bold rounded-full px-1.5 py-0.5">{messageUnread}</span>}
              </Link>
              <div className="border-t border-border mt-2 pt-2">
                <button
                  onClick={() => { handleSwitchRole(); setMobileOpen(false); }}
                  disabled={switching}
                  className="w-full text-left px-2 py-2.5 text-sm text-text-muted hover:text-accent hover:bg-surface-hover rounded-lg transition-colors"
                >
                  {switching ? "Switching..." : `Switch to ${user.role === "reviewer" ? "Coder" : "Reviewer"}`}
                </button>
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="w-full text-left px-2 py-2.5 text-sm text-text-muted hover:text-danger hover:bg-surface-hover rounded-lg transition-colors"
                >
                  Log out
                </button>
              </div>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setMobileOpen(false)} className="block px-2 py-2.5 text-sm text-text-secondary hover:text-text rounded-lg transition-colors">Log in</Link>
              <Link href="/login" onClick={() => setMobileOpen(false)} className="block px-2 py-2.5 text-sm font-medium text-accent rounded-lg transition-colors">Get Started</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
