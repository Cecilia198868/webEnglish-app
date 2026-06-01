import { authOptions } from "@/auth";
import {
  getAdminAccessFromSession,
  getAdminDashboardStats,
} from "@/lib/adminDashboard";
import { createLoginUrl } from "@/lib/loginRedirect";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const statLabels = [
  ["todayVisitors", "今日访问人数"],
  ["yesterdayVisitors", "昨日访问人数"],
  ["totalVisitors", "总访问人数"],
  ["registeredUsersTotal", "注册用户总数"],
  ["paidUsersTotal", "付费用户总数"],
  ["todayNewUsers", "今日新增注册"],
  ["sevenDayNewUsers", "最近7天新增注册"],
  ["conversionRate", "付费转化率"],
] as const;

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  const access = await getAdminAccessFromSession(session);

  if (!access.email) {
    redirect(createLoginUrl("/admin"));
  }

  if (!access.isAdmin) {
    return (
      <main className="min-h-screen bg-[#f7f4ff] px-6 py-10 text-[#19162d]">
        <section className="mx-auto max-w-3xl rounded-3xl bg-white p-8 shadow-[0_22px_60px_rgba(72,54,132,0.14)]">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#8b77d8]">
            403 Forbidden
          </p>
          <h1 className="mt-3 text-3xl font-black">无权访问后台</h1>
          <p className="mt-3 text-base font-semibold leading-7 text-[#5f5877]">
            当前账号没有 admin 权限。SpeakFlow 后台只允许管理员查看。
          </p>
        </section>
      </main>
    );
  }

  const stats = await getAdminDashboardStats();

  return (
    <main className="min-h-screen bg-[#f7f4ff] px-6 py-10 text-[#19162d]">
      <section className="mx-auto max-w-5xl">
        <div className="rounded-3xl bg-white p-8 shadow-[0_22px_60px_rgba(72,54,132,0.14)]">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#8b77d8]">
            Admin
          </p>
          <h1 className="mt-3 text-4xl font-black">SpeakFlow 后台</h1>
          <p className="mt-3 text-base font-semibold leading-7 text-[#5f5877]">
            只读运营数据。不会显示学习内容、麦克风内容或用户输入。
          </p>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statLabels.map(([key, label]) => (
            <article
              key={key}
              className="rounded-3xl bg-white p-6 shadow-[0_18px_48px_rgba(72,54,132,0.1)] ring-1 ring-[#ece7ff]"
            >
              <p className="text-sm font-bold text-[#71698f]">{label}</p>
              <p className="mt-4 text-3xl font-black text-[#241b52]">
                {stats[key]}
              </p>
            </article>
          ))}
        </div>

        <p className="mt-8 text-center text-sm font-bold text-[#7f7896]">
          Admin Dashboard V1 · Read Only
        </p>
      </section>
    </main>
  );
}
