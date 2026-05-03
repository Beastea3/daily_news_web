import { getAllDigests } from "../lib/news";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

const BRAND_CARDS = [
  { bg: "bg-brand-pink", text: "text-white", label: "text-white/80" },
  { bg: "bg-brand-teal", text: "text-white", label: "text-white/80" },
  { bg: "bg-brand-lavender", text: "text-ink", label: "text-ink/70" },
  { bg: "bg-brand-peach", text: "text-ink", label: "text-ink/70" },
  { bg: "bg-brand-ochre", text: "text-ink", label: "text-ink/70" },
  { bg: "bg-brand-mint", text: "text-ink", label: "text-ink/70" },
];

const FALLBACK_CARD = { bg: "bg-surface-card", text: "text-ink", label: "text-muted" };

function getCardStyle(category: string, index: number) {
  const map: Record<string, number> = {
    AI: 0,
    研究: 0,
    创投: 1,
    科技: 3,
    政策: 4,
    财经: 3,
    硬件: 5,
    其他: 2,
    综合: 2,
  };
  const idx = map[category] ?? (index % BRAND_CARDS.length);
  return BRAND_CARDS[idx] ?? FALLBACK_CARD;
}

export default function HomePage() {
  const digests = getAllDigests();

  return (
    <div>
      {/* Hero */}
      <div className="mb-16">
        <h1
          className="text-[clamp(36px,5vw,56px)] font-medium leading-[1.05] tracking-[-2px] text-ink"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          每日科技商业新闻
        </h1>
        <p className="mt-3 text-lg text-body max-w-xl leading-relaxed">
          覆盖 AI、创投、政策与硬件领域的每日精选
        </p>
      </div>

      {digests.length === 0 ? (
        <div className="text-center py-20 text-muted">暂无新闻内容</div>
      ) : (
        <div className="space-y-8">
          {digests.map((digest, idx) => {
            const formattedDate = format(
              new Date(digest.date),
              "yyyy年MM月dd日 EEEE",
              { locale: zhCN }
            );
            const card = getCardStyle(digest.category, idx);

            return (
              <section
                key={digest.slug}
                className={`${card.bg} rounded-3xl overflow-hidden`}
              >
                {/* Daily Header */}
                <div className="px-8 pt-8 pb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className={`text-xs font-semibold tracking-[1.5px] uppercase ${card.label}`}
                    >
                      {digest.category}
                    </span>
                    <span className={`text-xs ${card.label}`}>·</span>
                    <span className={`text-xs ${card.label}`}>
                      {digest.articles.length} 条精选 · 扫描{" "}
                      {digest.totalScanned} 篇
                    </span>
                  </div>
                  <time
                    className={`text-sm font-medium ${card.label}`}
                  >
                    {formattedDate}
                  </time>
                </div>

                {/* Articles List */}
                <div className="px-2 pb-2">
                  <div className="bg-canvas rounded-2xl overflow-hidden">
                    {digest.articles.map((article, aidx) => (
                      <article
                        key={aidx}
                        className={`px-6 py-4 ${
                          aidx > 0 ? "border-t border-hairline-soft" : ""
                        } hover:bg-surface-soft/50 transition-colors`}
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className={`mt-0.5 text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                              article.importance >= 4
                                ? "bg-brand-coral text-white"
                                : "bg-surface-card text-muted"
                            }`}
                          >
                            {article.importance}
                          </span>
                          <div className="flex-1 min-w-0">
                            <a
                              href={article.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[15px] font-semibold text-ink hover:text-primary-active transition-colors line-clamp-1"
                            >
                              {article.title}
                            </a>
                            <p className="mt-1 text-sm text-body line-clamp-2 leading-relaxed">
                              {article.summary}
                            </p>
                            <div className="mt-1.5 flex items-center gap-2 text-xs text-muted">
                              <span>{article.source}</span>
                              <span>·</span>
                              <span className="px-1.5 py-0.5 rounded-full bg-surface-card text-muted">
                                {article.category}
                              </span>
                            </div>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
