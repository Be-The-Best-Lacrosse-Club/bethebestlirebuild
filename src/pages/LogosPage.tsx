import { useState } from "react"
import { Download, FileCode2, FileImage, LockKeyhole, ShieldCheck } from "lucide-react"
import { PageHero } from "@/components/shared/PageHero"
import { SEO } from "@/components/shared/SEO"

const LOGO_LIBRARY_PASSWORD = "BTBVECTOR"
const LOGO_LIBRARY_ACCESS_KEY = "btb-logo-library-access"

type LogoFormat = "PNG" | "SVG"
type LogoFilter = "all" | "png" | "svg"

interface LogoAsset {
  fileName: string
  format: LogoFormat
  name: string
  previewUrl: string
  downloadUrl: string
}

const pngLogos: LogoAsset[] = Array.from({ length: 51 }, (_, index) => {
  const number = String(index + 5).padStart(2, "0")
  const fileName = `BTB_Logo_${number}_Higgsfield_4K_Preserved.png`

  return {
    fileName,
    format: "PNG",
    name: `BTB Logo ${number}`,
    previewUrl: `/assets/brand/logos/previews/${fileName.replace(".png", ".jpg")}`,
    downloadUrl: `/assets/brand/logos/png/${fileName}`,
  }
})

const vectorFileNames = [
  "BTB_Core_B_Black_Vector.svg",
  "BTB_Core_B_Red_Vector.svg",
  "BTB_Core_B_White_Vector.svg",
  "BTB_Logo_07_Standalone_B_Vector.svg",
  "BTB_Logo_09_Winged_B_Webmark_Vector.svg",
  "BTB_Logo_12_Round_Winged_B_Seal_Vector.svg",
  "BTB_Logo_21_Domain_Wordmark_Vector.svg",
  "BTB_Logo_22_Stacked_Club_Lockup_Vector.svg",
  "BTB_Logo_25_Italic_Full_Club_Lockup_Vector.svg",
  "BTB_Logo_27_Script_Wordmark_Vector.svg",
  "BTB_Logo_28_LI_NY_Shield_Vector.svg",
  "BTB_Logo_32_B_Lacrosse_Lockup_Vector.svg",
  "BTB_Logo_37_Circular_B_Icon_Vector.svg",
  "BTB_Logo_39_Circular_B_Club_Badge_Vector.svg",
  "BTB_Logo_40_Heritage_Round_Seal_Vector.svg",
  "BTB_Logo_41_Red_Lacrosse_Head_Seal_Vector.svg",
  "BTB_Logo_42_Black_Lacrosse_Head_Seal_Vector.svg",
  "BTB_Logo_44_Lion_Seal_Vector.svg",
  "BTB_Logo_45_Wide_Slanted_Brand_Bar_Vector.svg",
  "BTB_Logo_46_Segmented_Horizontal_Wordmark_Vector.svg",
  "BTB_Logo_49_Stacked_Star_Wordmark_Vector.svg",
  "BTB_Logo_51_Wide_Red_Brand_Bar_Vector.svg",
  "BTB_Logo_53_Script_Star_Wordmark_Vector.svg",
  "BTB_Logo_54_Supreme_Red_Wordmark_Vector.svg",
] as const

function vectorName(fileName: string): string {
  return fileName
    .replace(/^BTB_(?:Logo_\d+_)?/, "")
    .replace(/_Vector\.svg$/, "")
    .replace(/_/g, " ")
}

const vectorLogos: LogoAsset[] = vectorFileNames.map((fileName) => ({
  fileName,
  format: "SVG",
  name: vectorName(fileName),
  previewUrl: `/assets/brand/logos/svg/${fileName}`,
  downloadUrl: `/assets/brand/logos/svg/${fileName}`,
}))

const allLogos = [...pngLogos, ...vectorLogos]

function hasSessionAccess(): boolean {
  if (typeof window === "undefined") return false

  try {
    return window.sessionStorage.getItem(LOGO_LIBRARY_ACCESS_KEY) === "granted"
  } catch {
    return false
  }
}

export function LogosPage() {
  const [unlocked, setUnlocked] = useState(hasSessionAccess)
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [filter, setFilter] = useState<LogoFilter>("all")

  const unlockLibrary = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (password !== LOGO_LIBRARY_PASSWORD) {
      setError("That password is not correct. Please try again.")
      return
    }

    try {
      window.sessionStorage.setItem(LOGO_LIBRARY_ACCESS_KEY, "granted")
    } catch {
      // The page can still unlock when private browsing blocks storage.
    }

    setPassword("")
    setError("")
    setUnlocked(true)
  }

  const lockLibrary = () => {
    try {
      window.sessionStorage.removeItem(LOGO_LIBRARY_ACCESS_KEY)
    } catch {
      // The in-memory gate can still be reset when storage is unavailable.
    }

    setUnlocked(false)
    setFilter("all")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const visibleLogos = filter === "png"
    ? pngLogos
    : filter === "svg"
      ? vectorLogos
      : allLogos

  return (
    <>
      <SEO
        title="BTB Logo Library | Be The Best Lacrosse"
        description="Password-protected downloads of approved Be The Best Lacrosse Club logos and vector artwork."
        path="/logos"
      />

      {!unlocked ? (
        <main className="relative min-h-screen overflow-hidden bg-black px-5 pb-24 pt-40 text-white">
          <div
            className="pointer-events-none absolute inset-0 opacity-70"
            style={{
              backgroundImage: "radial-gradient(circle at 50% 15%, rgba(210,38,48,0.2), transparent 38%), repeating-linear-gradient(0deg, transparent, transparent 79px, rgba(255,255,255,0.025) 80px), repeating-linear-gradient(90deg, transparent, transparent 79px, rgba(255,255,255,0.025) 80px)",
            }}
          />

          <section className="relative mx-auto max-w-[480px]">
            <div className="mb-7 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--btb-red)]/30 bg-[var(--btb-red)]/10">
                <LockKeyhole aria-hidden="true" className="text-[var(--btb-red)]" size={28} />
              </div>
            </div>

            <div className="mb-8 text-center">
              <div className="mb-4 text-[0.75rem] font-black uppercase tracking-[4px] text-red-400">
                BTB Brand Resources
              </div>
              <h1 className="font-display text-[clamp(3.25rem,12vw,5rem)] uppercase leading-[0.9] tracking-wide">
                Logo <span className="text-[var(--btb-red)]">Library</span>
              </h1>
              <p className="mx-auto mt-5 max-w-[410px] text-[1rem] leading-7 text-white/60">
                Approved high-resolution and vector artwork for BTB families, staff, vendors, and partners.
              </p>
            </div>

            <form
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/40 sm:p-8"
              onSubmit={unlockLibrary}
            >
              <label className="mb-2 block text-[0.72rem] font-black uppercase tracking-[2px] text-white/70" htmlFor="logo-library-password">
                Access Password
              </label>
              <input
                id="logo-library-password"
                autoComplete="current-password"
                autoFocus
                className="w-full rounded-lg border border-white/15 bg-black px-4 py-3.5 text-base text-white outline-none transition-colors placeholder:text-white/25 focus:border-[var(--btb-red)]"
                onChange={(event) => {
                  setPassword(event.target.value)
                  if (error) setError("")
                }}
                placeholder="Enter password"
                type="password"
                value={password}
              />

              {error ? (
                <p className="mt-3 rounded-lg border border-[var(--btb-red)]/25 bg-[var(--btb-red)]/10 px-4 py-3 text-sm text-red-200" role="alert">
                  {error}
                </p>
              ) : null}

              <button
                className="btn-glow mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--btb-red)] px-5 py-4 text-[0.8rem] font-black uppercase tracking-[2px] text-white transition-all hover:bg-[var(--btb-red-dark)]"
                type="submit"
              >
                <ShieldCheck aria-hidden="true" size={17} />
                Unlock Logo Library
              </button>
            </form>
          </section>
        </main>
      ) : (
        <main className="min-h-screen bg-black text-white">
          <PageHero
            eyebrow="BTB Brand Library"
            title="Logo Downloads"
            subtitle="Approved high-resolution PNG and true vector SVG files for digital, print, apparel, signage, and more."
          />

          <section className="border-y border-white/10 bg-[#080808] px-5 py-8">
            <div className="mx-auto grid max-w-[1180px] gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[var(--btb-red)]/10 text-[var(--btb-red)]">
                  <FileImage aria-hidden="true" size={21} />
                </div>
                <div>
                  <h2 className="font-display text-2xl uppercase tracking-wide">4K PNG</h2>
                  <p className="mt-1 text-sm leading-6 text-white/65">Best for social posts, presentations, websites, and everyday design work.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[var(--btb-red)]/10 text-[var(--btb-red)]">
                  <FileCode2 aria-hidden="true" size={21} />
                </div>
                <div>
                  <h2 className="font-display text-2xl uppercase tracking-wide">Vector SVG</h2>
                  <p className="mt-1 text-sm leading-6 text-white/65">Best for printers, apparel companies, banners, signs, and large-scale artwork.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="px-5 py-12 sm:py-16">
            <div className="mx-auto max-w-[1180px]">
              <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="mb-2 text-[0.7rem] font-black uppercase tracking-[3px] text-red-400">Approved Artwork</div>
                  <h2 className="font-display text-[clamp(2.4rem,6vw,4rem)] uppercase leading-none tracking-wide">Choose Your File</h2>
                  <p className="mt-3 max-w-[620px] text-sm leading-6 text-white/65">Use the artwork as supplied and keep its original proportions. CO-LAB artwork is not included.</p>
                </div>

                <button
                  className="inline-flex w-fit items-center gap-2 text-[0.72rem] font-black uppercase tracking-[2px] text-white/65 transition-colors hover:text-white"
                  onClick={lockLibrary}
                  type="button"
                >
                  <LockKeyhole aria-hidden="true" size={14} />
                  Lock Library
                </button>
              </div>

              <div aria-label="Filter logo formats" className="mb-8 flex flex-wrap gap-2" role="group">
                {([
                  { id: "all", label: `All Assets (${allLogos.length})` },
                  { id: "png", label: `4K PNG (${pngLogos.length})` },
                  { id: "svg", label: `Vector SVG (${vectorLogos.length})` },
                ] as const).map((option) => (
                  <button
                    aria-pressed={filter === option.id}
                    className={`rounded-full border px-4 py-2.5 text-[0.7rem] font-black uppercase tracking-[1.5px] transition-all ${
                      filter === option.id
                        ? "border-[var(--btb-red)] bg-[var(--btb-red)] text-white"
                        : "border-white/10 bg-white/[0.03] text-white/70 hover:border-white/25 hover:text-white"
                    }`}
                    key={option.id}
                    onClick={() => setFilter(option.id)}
                    type="button"
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {visibleLogos.map((logo) => (
                  <article
                    className="group overflow-hidden rounded-xl border border-white/10 bg-[#0A0A0A] transition-all duration-300 hover:-translate-y-1 hover:border-[var(--btb-red)]/45 hover:bg-[#111]"
                    key={logo.fileName}
                  >
                    <div
                      className="flex h-56 items-center justify-center border-b border-white/10 p-5 sm:h-60"
                      style={{ background: "linear-gradient(135deg, #f3f3f1 0%, #f3f3f1 49.8%, #1a1a1a 50.2%, #1a1a1a 100%)" }}
                    >
                      <img
                        alt={`${logo.name} preview`}
                        className="max-h-full max-w-full object-contain drop-shadow-[0_8px_18px_rgba(0,0,0,0.2)] transition-transform duration-300 group-hover:scale-[1.03]"
                        decoding="async"
                        loading="lazy"
                        src={logo.previewUrl}
                      />
                    </div>

                    <div className="p-5">
                      <div className="mb-4 flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-display text-2xl uppercase leading-tight tracking-wide text-white">{logo.name}</h3>
                          <p className="mt-1 text-[0.68rem] font-bold uppercase tracking-[1.5px] text-white/65">
                            {logo.format === "PNG" ? "High-resolution artwork" : "True vector artwork"}
                          </p>
                        </div>
                        <span className="rounded-md border border-[var(--btb-red)]/35 bg-[var(--btb-red)]/10 px-2.5 py-1 text-[0.65rem] font-black uppercase tracking-[1px] text-red-300">
                          {logo.format}
                        </span>
                      </div>

                      <a
                        aria-label={`Download ${logo.name} as ${logo.format}`}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-3 text-[0.72rem] font-black uppercase tracking-[1.5px] text-black transition-colors hover:bg-[var(--btb-red)] hover:text-white"
                        download={logo.fileName}
                        href={logo.downloadUrl}
                      >
                        <Download aria-hidden="true" size={15} />
                        Download {logo.format}
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        </main>
      )}
    </>
  )
}
