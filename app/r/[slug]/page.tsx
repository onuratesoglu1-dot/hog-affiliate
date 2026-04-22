import { redirect } from "next/navigation";
import { supabase } from "../../../lib/supabase";

const IOS_URL = "https://apps.apple.com/app/id6478711957";
const ANDROID_URL = "https://play.google.com/store/apps/details?id=com.onur.hellofgym";

function getUserAgent(headers: Headers): "ios" | "android" | "other" {
  const ua = headers.get("user-agent") || "";
  if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
  if (/Android/i.test(ua)) return "android";
  return "other";
}

export default async function AffiliatePage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;

  const { data: link } = await supabase
    .from("affiliate_links")
    .select("id, slug, influencer_name")
    .eq("slug", slug)
    .maybeSingle();

  if (link) {
    await supabase.from("affiliate_clicks").insert({
      slug,
      clicked_at: new Date().toISOString(),
    });
  }

  const { headers } = await import("next/headers");
  const headersList = headers();
  const platform = getUserAgent(headersList);

  const storeUrl =
    platform === "ios" ? IOS_URL : platform === "android" ? ANDROID_URL : IOS_URL;

  redirect(`${storeUrl}&ref=${slug}`);
}
