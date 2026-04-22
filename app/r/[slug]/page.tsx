import { supabase } from "../../../lib/supabase";

const IOS_URL = "https://apps.apple.com/app/id6760843561";
const ANDROID_URL = "https://play.google.com/store/apps/details?id=com.onur.hellofgym";

export default async function AffiliatePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  try {
    await supabase.from("affiliate_clicks").insert({ slug });
  } catch (_) {}

  const iosUrl = IOS_URL;
  const androidUrl = `${ANDROID_URL}&referrer=ref_${slug}`;
  const deepLink = `hellofgym://join?ref=${slug}`;

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script dangerouslySetInnerHTML={{
          __html: `
            var ua = navigator.userAgent;
            var isAndroid = /Android/i.test(ua);
            var storeUrl = isAndroid ? "${androidUrl}" : "${iosUrl}";

            // Uygulama yüklüyse deep link ile aç
            window.location.href = "${deepLink}";

            // 2 saniye sonra store'a yönlendir
            setTimeout(function() {
              window.location.href = storeUrl;
            }, 2000);
          `
        }} />
      </head>
      <body style={{ margin: 0, backgroundColor: "#0B0B0B", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", fontFamily: "sans-serif", color: "#fff" }}>
        <div style={{ fontSize: 48, fontWeight: 900, color: "#FF7A00", marginBottom: 8 }}>HOG</div>
        <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Hell of Gym</div>
        <div style={{ color: "#888" }}>Yönlendiriliyorsunuz...</div>
      </body>
    </html>
  );
}
