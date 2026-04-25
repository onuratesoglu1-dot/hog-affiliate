import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../../lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const event = body?.event;
    const userId = event?.app_user_id;

    if (!userId) return NextResponse.json({ ok: false });

    if (event?.type === "CANCELLATION" || event?.type === "EXPIRATION") {
      await supabase
        .from("affiliate_clicks")
        .update({ paid: false, paid_at: null })
        .eq("user_id", userId)
        .eq("paid", true);
    }

    if (event?.type === "RENEWAL" || event?.type === "INITIAL_PURCHASE") {
      await supabase
        .from("affiliate_clicks")
        .update({ paid: true, paid_at: new Date().toISOString() })
        .eq("user_id", userId);
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.log("Webhook hatası:", e);
    return NextResponse.json({ ok: false });
  }
}
