"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";

const IOS_URL = "https://apps.apple.com/app/id6478711957";
const ANDROID_URL = "https://play.google.com/store/apps/details?id=com.onur.hellofgym";

export default function AffiliatePage() {
  const params = useParams();
  const slug = params.slug as string;

  useEffect(() => {
    if (!slug) return;

    // Tıklamayı Supabase'e kaydet
    fetch("/api/click", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug }) }).catch(() => {});

    // Clipboard'a ref kodunu yaz (yeni kullanıcılar için)
    try {
      navigator.clipboard.writeText(`hog-ref:${slug}`);
    } catch (_) {}

    // Deep link dene (uygulama yüklüyse açar)
    window.location.href = `hellofgym://join?ref=${slug}`;

    // 2 saniye sonra store'a yönlendir
    const ua = navigator.userAgent;
    const isAndroid = /Android/i.test(ua);
    const storeUrl = isAndroid ? `${ANDROID_URL}&referrer=ref_${slug}` : IOS_URL;

    const timer = setTimeout(() => {
      window.location.href = storeUrl;
    }, 2000);

    return () => clearTimeout(timer);
  }, [slug]);

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", minHeight: "100vh",
      backgroundColor: "#0B0B0B", color: "#fff", fontFamily: "sans-serif"
    }}>
      <div style={{ fontSize: 48, fontWeight: 900, color: "#FF7A00", marginBottom: 8 }}>HOG</div>
      <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Hell of Gym</div>
      <div style={{ color: "#888", marginBottom: 32 }}>Uygulama mağazasına yönlendiriliyorsunuz...</div>
      <div style={{ width: 40, height: 40, border: "4px solid #FF7A00", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
