import { supabase } from "../../lib/supabase";

const APPLE_CUT = 0.30;
const COMMISSION_RATE = 0.20;

export default async function AdminPage() {
  const { data: links } = await supabase
    .from("affiliate_links")
    .select("slug, influencer_name, created_at")
    .order("created_at", { ascending: true });

  if (!links) {
    return (
      <html>
        <body style={{ backgroundColor: "#0B0B0B", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", fontFamily: "sans-serif", margin: 0 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 48, fontWeight: 900, color: "#FF7A00" }}>HOG</div>
            <div style={{ color: "#888", marginTop: 8 }}>Veri alınamadı.</div>
          </div>
        </body>
      </html>
    );
  }

  const { data: allClicks } = await supabase
    .from("affiliate_clicks")
    .select("slug, user_id, paid, paid_at, price, product_id");

  const PRODUCT_LABELS: Record<string, string> = {
    "com.onur.hellofgym.premium.monthly": "HOG Premium (49₺)",
    "com.onur.hellofgym.pt.starter": "PT Starter (149₺)",
    "com.onur.hellofgym.pt.pro": "PT Pro (299₺)",
    "com.onur.hellofgym.pt.elite": "PT Elite (599₺)",
  };

  const influencers = links.map((link) => {
    const clicks = allClicks?.filter((c) => c.slug === link.slug) || [];
    const total_click = clicks.length;
    const total_install = clicks.filter((c) => c.user_id).length;
    const active_paid = clicks.filter((c) => c.paid);
    const cancelled = clicks.filter((c) => c.user_id && !c.paid && c.paid_at).length;
    const gross = active_paid.reduce((sum, c) => sum + (c.price || 0), 0);
    const commission = gross * (1 - APPLE_CUT) * COMMISSION_RATE;
    return { ...link, total_click, total_install, active_paid: active_paid.length, cancelled, gross, commission };
  });

  const total_commission = influencers.reduce((sum, i) => sum + i.commission, 0);
  const total_active = influencers.reduce((sum, i) => sum + i.active_paid, 0);

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>HOG Admin</title>
      </head>
      <body style={{ margin: 0, backgroundColor: "#0B0B0B", color: "#fff", fontFamily: "sans-serif", padding: "24px", minHeight: "100vh" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>

          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ fontSize: 36, fontWeight: 900, color: "#FF7A00" }}>HOG</div>
            <div style={{ fontSize: 20, fontWeight: 700, marginTop: 4 }}>Admin Paneli</div>
            <div style={{ color: "#555", fontSize: 13, marginTop: 4 }}>Tüm affiliate ödemeleri</div>
          </div>

          {/* Özet kartlar */}
          <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
            {[
              { label: "Toplam Influencer", value: influencers.length, color: "#fff" },
              { label: "Toplam Aktif Abone", value: total_active, color: "#4CAF50" },
              { label: "Bu Ay Ödenecek", value: total_commission.toLocaleString("tr-TR", { maximumFractionDigits: 0 }) + " ₺", color: "#FF7A00" },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ background: "#151515", border: "1px solid #262626", borderRadius: 16, padding: "20px 28px", textAlign: "center", flex: 1, minWidth: 160 }}>
                <div style={{ fontSize: 28, fontWeight: 900, color }}>{value}</div>
                <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Tablo */}
          <div style={{ background: "#151515", border: "1px solid #262626", borderRadius: 16, overflow: "hidden" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid #262626", fontSize: 12, fontWeight: 800, color: "#888", letterSpacing: 1 }}>
              INFLUENCER LİSTESİ
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #1a1a1a" }}>
                  {["İsim", "Tıklama", "İndirme", "Aktif", "İptal", "Brüt Ciro", "Ödenecek"].map((h) => (
                    <th key={h} style={{ padding: "10px 16px", color: "#555", fontSize: 11, textAlign: "left", fontWeight: 700 }}>{h}</th>
                  ))}
                  <th style={{ padding: "10px 16px", color: "#555", fontSize: 11, textAlign: "left", fontWeight: 700 }}>Panel</th>
                </tr>
              </thead>
              <tbody>
                {influencers.map((inf) => (
                  <tr key={inf.slug} style={{ borderBottom: "1px solid #1a1a1a" }}>
                    <td style={{ padding: "14px 16px", fontWeight: 700, fontSize: 14 }}>{inf.influencer_name}</td>
                    <td style={{ padding: "14px 16px", color: "#888", fontSize: 13 }}>{inf.total_click}</td>
                    <td style={{ padding: "14px 16px", color: "#888", fontSize: 13 }}>{inf.total_install}</td>
                    <td style={{ padding: "14px 16px", color: "#4CAF50", fontWeight: 700, fontSize: 13 }}>{inf.active_paid}</td>
                    <td style={{ padding: "14px 16px", color: inf.cancelled > 0 ? "#FF4B4B" : "#555", fontSize: 13 }}>{inf.cancelled}</td>
                    <td style={{ padding: "14px 16px", color: "#aaa", fontSize: 13 }}>{inf.gross.toLocaleString("tr-TR")} ₺</td>
                    <td style={{ padding: "14px 16px", color: "#FF7A00", fontWeight: 900, fontSize: 15 }}>
                      {inf.commission.toLocaleString("tr-TR", { maximumFractionDigits: 0 })} ₺
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <a
                        href={`/panel/${inf.slug}`}
                        style={{ color: "#FF7A00", fontSize: 12, textDecoration: "none", border: "1px solid #FF7A00", borderRadius: 6, padding: "4px 10px" }}
                      >
                        Paneli Gör →
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: "2px solid #FF7A00" }}>
                  <td style={{ padding: "14px 16px", fontWeight: 900, fontSize: 14, color: "#fff" }}>TOPLAM</td>
                  <td colSpan={4} />
                  <td style={{ padding: "14px 16px", color: "#aaa", fontWeight: 700 }}>
                    {influencers.reduce((s, i) => s + i.gross, 0).toLocaleString("tr-TR")} ₺
                  </td>
                  <td style={{ padding: "14px 16px", color: "#FF7A00", fontWeight: 900, fontSize: 18 }}>
                    {total_commission.toLocaleString("tr-TR", { maximumFractionDigits: 0 })} ₺
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>

          <div style={{ textAlign: "center", marginTop: 24, color: "#333", fontSize: 12 }}>
            Apple %30 komisyon düşüldükten sonra %20 influencer payı.
          </div>
        </div>
      </body>
    </html>
  );
}
