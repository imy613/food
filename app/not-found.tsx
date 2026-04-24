import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <section className="paper-panel texture-overlay w-full max-w-xl rounded-2xl p-10 text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-cinnabar/80">404</p>
        <h1 className="ink-title mt-2 text-3xl">未找到该页面</h1>
        <p className="mt-4 text-sm text-ink/75">
          当前省份内容尚未纳入此版本，返回首页继续探索。
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex rounded-full border border-cinnabar/45 px-5 py-2 text-sm transition hover:bg-cinnabar hover:text-paper"
        >
          返回首页
        </Link>
      </section>
    </main>
  );
}
