import type { Session } from "next-auth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { DEFAULT_ADMIN_EMAIL, normalizeUserEmail } from "@/lib/userRoles";
import { getUserRoleByEmail, loadUsers } from "@/lib/userStore";

type AdminProfileRow = {
  created_at?: string | null;
  current_period_end?: string | null;
  email: string;
  membership_status?: string | null;
  subscription_status?: string | null;
};

type PageViewRow = {
  created_at: string;
  visitor_id: string;
};

export type AdminDashboardStats = {
  conversionRate: string;
  paidUsersTotal: number;
  registeredUsersTotal: number;
  sevenDayNewUsers: number;
  todayNewUsers: number;
  todayVisitors: number;
  totalVisitors: number;
  yesterdayVisitors: number;
};

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function isIsoInRange(value: string | null | undefined, start: Date, end: Date) {
  if (!value) return false;

  const time = new Date(value).getTime();
  return time >= start.getTime() && time < end.getTime();
}

function isFutureIso(value: string | null | undefined) {
  if (!value) return false;

  return new Date(value).getTime() > Date.now();
}

function isPaidProfile(profile: AdminProfileRow) {
  const subscriptionStatus = profile.subscription_status?.trim().toLowerCase();
  const membershipStatus = profile.membership_status?.trim().toLowerCase();

  return (
    subscriptionStatus === "active" ||
    subscriptionStatus === "pro" ||
    subscriptionStatus === "cancels_at_period_end" ||
    membershipStatus === "active" ||
    isFutureIso(profile.current_period_end)
  );
}

function getUniqueVisitorCount(rows: PageViewRow[]) {
  return new Set(rows.map((row) => row.visitor_id).filter(Boolean)).size;
}

function calculateProfileStats(profiles: AdminProfileRow[]) {
  const uniqueProfiles = new Map<string, AdminProfileRow>();

  profiles.forEach((profile) => {
    const email = profile.email.trim().toLowerCase();
    if (!email) return;
    uniqueProfiles.set(email, profile);
  });

  const rows = [...uniqueProfiles.values()];
  const todayStart = startOfToday();
  const tomorrowStart = addDays(todayStart, 1);
  const sevenDaysStart = addDays(todayStart, -6);
  const registeredUsersTotal = rows.length;
  const paidUsersTotal = rows.filter(isPaidProfile).length;
  const todayNewUsers = rows.filter((row) =>
    isIsoInRange(row.created_at, todayStart, tomorrowStart)
  ).length;
  const sevenDayNewUsers = rows.filter((row) =>
    isIsoInRange(row.created_at, sevenDaysStart, tomorrowStart)
  ).length;

  return {
    conversionRate: registeredUsersTotal
      ? `${((paidUsersTotal / registeredUsersTotal) * 100).toFixed(1)}%`
      : "0%",
    paidUsersTotal,
    registeredUsersTotal,
    sevenDayNewUsers,
    todayNewUsers,
  };
}

async function loadProfilesFromSupabase(): Promise<AdminProfileRow[] | null> {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("profiles")
      .select(
        "email, created_at, subscription_status, membership_status, current_period_end"
      )
      .range(0, 99999);

    if (!error) {
      return (data || []) as AdminProfileRow[];
    }

    const fallback = await supabase
      .from("profiles")
      .select("email, created_at, subscription_status, current_period_end")
      .range(0, 99999);

    if (fallback.error) return null;

    return (fallback.data || []) as AdminProfileRow[];
  } catch {
    return null;
  }
}

async function loadProfilesForStats() {
  const supabaseProfiles = await loadProfilesFromSupabase();
  if (supabaseProfiles) return supabaseProfiles;

  const localUsers = await loadUsers().catch(() => []);

  return localUsers.map((user) => ({
    created_at: user.createdAt,
    current_period_end: user.currentPeriodEnd,
    email: user.email,
    subscription_status: user.subscriptionStatus,
  }));
}

async function loadPageViewsFromSupabase() {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("page_views")
      .select("visitor_id, created_at")
      .range(0, 99999);

    if (error) return [];

    return (data || []) as PageViewRow[];
  } catch {
    return [];
  }
}

function calculateVisitorStats(pageViews: PageViewRow[]) {
  const todayStart = startOfToday();
  const tomorrowStart = addDays(todayStart, 1);
  const yesterdayStart = addDays(todayStart, -1);

  return {
    todayVisitors: getUniqueVisitorCount(
      pageViews.filter((row) =>
        isIsoInRange(row.created_at, todayStart, tomorrowStart)
      )
    ),
    totalVisitors: getUniqueVisitorCount(pageViews),
    yesterdayVisitors: getUniqueVisitorCount(
      pageViews.filter((row) =>
        isIsoInRange(row.created_at, yesterdayStart, todayStart)
      )
    ),
  };
}

export async function getAdminAccessFromSession(session: Session | null) {
  const email = normalizeUserEmail(session?.user?.email || "");
  if (!email) {
    return { email: "", isAdmin: false, role: "user" as const };
  }

  const role = await getUserRoleByEmail(email);

  return {
    email,
    isAdmin: email === DEFAULT_ADMIN_EMAIL,
    role,
  };
}

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const [profiles, pageViews] = await Promise.all([
    loadProfilesForStats(),
    loadPageViewsFromSupabase(),
  ]);

  return {
    ...calculateVisitorStats(pageViews),
    ...calculateProfileStats(profiles),
  };
}
