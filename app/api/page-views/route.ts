import { authOptions } from "@/auth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function sanitizeVisitorId(value: unknown) {
  if (typeof value !== "string") return "";

  const visitorId = value.trim();
  return /^[a-zA-Z0-9_-]{8,128}$/.test(visitorId) ? visitorId : "";
}

function sanitizePath(value: unknown) {
  if (typeof value !== "string") return "";

  const path = value.trim().split("?")[0]?.split("#")[0] || "";
  if (!path.startsWith("/") || path.startsWith("//")) return "";
  if (path.startsWith("/api/")) return "";

  return path.slice(0, 256);
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { path?: unknown; visitorId?: unknown }
    | null;
  const visitorId = sanitizeVisitorId(body?.visitorId);
  const path = sanitizePath(body?.path);

  if (!visitorId || !path) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  try {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email?.trim().toLowerCase() || null;
    const supabase = getSupabaseAdmin();

    await supabase.from("page_views").insert({
      path,
      user_id: email,
      visitor_id: visitorId,
    });
  } catch {
    return NextResponse.json({ ok: true, tracked: false });
  }

  return NextResponse.json({ ok: true, tracked: true });
}
