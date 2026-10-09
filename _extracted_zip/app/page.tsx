'use client'

import { useState } from 'react'
import {
  Activity,
  Bell,
  ChevronRight,
  Droplets,
  Gauge,
  Leaf,
  Lightbulb,
  Menu,
  Power,
  Sprout,
  Thermometer,
  Waves,
  Zap,
} from 'lucide-react'

const sensors = [
  { label: 'Suhu air', value: '24.8', unit: '°C', icon: Thermometer, tone: 'mint', note: 'Ideal' },
  { label: 'pH air', value: '6.2', unit: 'pH', icon: Droplets, tone: 'blue', note: 'Stabil' },
  { label: 'TDS', value: '840', unit: 'ppm', icon: Waves, tone: 'amber', note: 'Baik' },
  { label: 'Kelembapan', value: '72', unit: '%', icon: Gauge, tone: 'violet', note: 'Optimal' },
]

const chart = [45, 52, 48, 61, 58, 70, 65, 78, 74, 84, 80, 91, 88, 95]

export default function Page() {
  const [pumpOn, setPumpOn] = useState(true)
  const [lightOn, setLightOn] = useState(true)

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-6xl">
        <aside className="hidden w-60 shrink-0 flex-col border-r border-border/70 bg-card/60 px-5 py-7 lg:flex">
          <div className="flex items-center gap-2.5 px-2">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Sprout className="size-5" />
            </div>
            <div>
              <p className="font-semibold tracking-tight">Hydro<span className="text-primary">Sense</span></p>
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Smart farming</p>
            </div>
          </div>
          <nav className="mt-12 space-y-1.5">
            <a className="flex items-center gap-3 rounded-xl bg-primary/10 px-3 py-2.5 text-sm font-medium text-primary" href="#overview"><Activity className="size-4" /> Overview</a>
            <a className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted" href="#sensors"><Gauge className="size-4" /> Sensor</a>
            <a className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted" href="#control"><Zap className="size-4" /> Kontrol</a>
          </nav>
          <div className="mt-auto rounded-2xl bg-primary p-4 text-primary-foreground">
            <Leaf className="mb-8 size-5 opacity-80" />
            <p className="text-sm font-medium">Tanaman tumbuh baik</p>
            <p className="mt-1 text-xs leading-relaxed text-primary-foreground/70">Semua parameter berada di zona optimal.</p>
          </div>
        </aside>

        <section className="min-w-0 flex-1 px-4 py-5 sm:px-7 sm:py-8 lg:px-10">
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-3 lg:hidden">
              <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground"><Sprout className="size-5" /></div>
              <span className="font-semibold">Hydro<span className="text-primary">Sense</span></span>
            </div>
            <div className="hidden lg:block">
              <p className="text-sm text-muted-foreground">Senin, 12 Mei 2025</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight">Selamat pagi, Andi</h1>
            </div>
            <div className="flex items-center gap-2">
              <button aria-label="Notifikasi" className="relative rounded-xl border border-border bg-card p-2.5 text-muted-foreground transition hover:text-foreground"><Bell className="size-4" /><span className="absolute right-2 top-2 size-1.5 rounded-full bg-primary" /></button>
              <button aria-label="Menu" className="rounded-xl border border-border bg-card p-2.5 text-muted-foreground lg:hidden"><Menu className="size-4" /></button>
              <div className="hidden size-9 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground sm:flex">AR</div>
            </div>
          </header>

          <div className="mt-7 lg:hidden"><p className="text-sm text-muted-foreground">Senin, 12 Mei 2025</p><h1 className="mt-1 text-2xl font-semibold tracking-tight">Selamat pagi, Andi</h1></div>

          <div id="overview" className="mt-7 grid gap-4 md:grid-cols-[1.35fr_1fr]">
            <div className="overflow-hidden rounded-3xl bg-primary p-6 text-primary-foreground sm:p-7">
              <div className="flex items-start justify-between">
                <div><p className="text-sm text-primary-foreground/70">Status kebun hari ini</p><h2 className="mt-2 max-w-xs text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">Semua sistem berjalan sempurna.</h2></div>
                <div className="flex items-center gap-1.5 rounded-full bg-primary-foreground/15 px-2.5 py-1 text-[11px] font-medium"><span className="size-1.5 rounded-full bg-emerald-200" /> Online</div>
              </div>
              <div className="mt-10 flex items-end justify-between"><div><p className="text-xs text-primary-foreground/60">Pertumbuhan minggu ini</p><p className="mt-1 text-3xl font-semibold">+18.4%</p></div><div className="flex items-end gap-1" aria-label="Grafik pertumbuhan"><div className="h-7 w-2 rounded-full bg-primary-foreground/20" /><div className="h-10 w-2 rounded-full bg-primary-foreground/30" /><div className="h-8 w-2 rounded-full bg-primary-foreground/30" /><div className="h-14 w-2 rounded-full bg-primary-foreground/50" /><div className="h-20 w-2 rounded-full bg-primary-foreground/80" /><div className="h-16 w-2 rounded-full bg-primary-foreground/60" /><div className="h-24 w-2 rounded-full bg-primary-foreground" /></div></div>
            </div>
            <div className="rounded-3xl border border-border bg-card p-6 sm:p-7"><div className="flex items-center justify-between"><div className="flex size-10 items-center justify-center rounded-2xl bg-accent text-accent-foreground"><Leaf className="size-5" /></div><ChevronRight className="size-4 text-muted-foreground" /></div><p className="mt-8 text-sm text-muted-foreground">Tanaman aktif</p><p className="mt-1 text-3xl font-semibold tracking-tight">24 <span className="text-base font-normal text-muted-foreground">tanaman</span></p><div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full w-[78%] rounded-full bg-primary" /></div><p className="mt-2 text-xs text-muted-foreground">78% menuju panen pertama</p></div>
          </div>

          <div id="sensors" className="mt-8 flex items-end justify-between"><div><p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">Realtime</p><h2 className="mt-1 text-xl font-semibold tracking-tight">Kondisi lingkungan</h2></div><button className="hidden text-sm font-medium text-primary sm:flex sm:items-center sm:gap-1">Lihat riwayat <ChevronRight className="size-4" /></button></div>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">{sensors.map(({ label, value, unit, icon: Icon, tone, note }) => <div key={label} className="rounded-2xl border border-border bg-card p-4"><div className="flex items-center justify-between"><div className={`flex size-8 items-center justify-center rounded-xl bg-${tone}`}><Icon className="size-4" /></div><span className="text-[10px] font-medium text-primary">{note}</span></div><p className="mt-4 text-xs text-muted-foreground">{label}</p><p className="mt-1 text-xl font-semibold tracking-tight">{value} <span className="text-xs font-normal text-muted-foreground">{unit}</span></p></div>)}</div>

          <div className="mt-8 grid gap-4 lg:grid-cols-[1.35fr_1fr]">
            <div className="rounded-3xl border border-border bg-card p-5 sm:p-6"><div className="flex items-center justify-between"><div><h2 className="font-semibold">Aktivitas tanaman</h2><p className="mt-1 text-xs text-muted-foreground">Tinggi rata-rata · 14 hari terakhir</p></div><button className="rounded-lg bg-muted px-2.5 py-1.5 text-xs font-medium">14 hari</button></div><div className="mt-7 flex h-36 items-end gap-1.5 sm:gap-3">{chart.map((height, index) => <div key={index} className="group flex flex-1 flex-col items-center gap-2"><div className={`w-full rounded-t-md transition-all group-hover:bg-primary ${index > 10 ? 'bg-primary' : 'bg-primary/20'}`} style={{ height: `${height}%` }} /></div>)}</div><div className="mt-3 flex justify-between text-[10px] text-muted-foreground"><span>1 Mei</span><span>7 Mei</span><span>12 Mei</span></div></div>
            <div id="control" className="rounded-3xl border border-border bg-card p-5 sm:p-6"><h2 className="font-semibold">Kontrol perangkat</h2><p className="mt-1 text-xs text-muted-foreground">Atur perangkat secara manual</p><div className="mt-5 space-y-3"><button onClick={() => setPumpOn(!pumpOn)} className="flex w-full items-center justify-between rounded-2xl bg-muted/70 p-3.5 text-left transition hover:bg-muted"><span className="flex items-center gap-3"><span className="flex size-9 items-center justify-center rounded-xl bg-blue-100 text-blue-600"><Droplets className="size-4" /></span><span><span className="block text-sm font-medium">Pompa nutrisi</span><span className="block text-[11px] text-muted-foreground">{pumpOn ? 'Aktif sekarang' : 'Tidak aktif'}</span></span></span><span className={`relative h-6 w-10 rounded-full transition ${pumpOn ? 'bg-primary' : 'bg-border'}`}><span className={`absolute top-1 size-4 rounded-full bg-card transition-all ${pumpOn ? 'left-5' : 'left-1'}`} /></span></button><button onClick={() => setLightOn(!lightOn)} className="flex w-full items-center justify-between rounded-2xl bg-muted/70 p-3.5 text-left transition hover:bg-muted"><span className="flex items-center gap-3"><span className="flex size-9 items-center justify-center rounded-xl bg-amber-100 text-amber-600"><Lightbulb className="size-4" /></span><span><span className="block text-sm font-medium">Grow light</span><span className="block text-[11px] text-muted-foreground">{lightOn ? 'Jadwal otomatis' : 'Tidak aktif'}</span></span></span><span className={`relative h-6 w-10 rounded-full transition ${lightOn ? 'bg-primary' : 'bg-border'}`}><span className={`absolute top-1 size-4 rounded-full bg-card transition-all ${lightOn ? 'left-5' : 'left-1'}`} /></span></button></div></div>
          </div>

          <footer className="mt-8 flex items-center justify-between border-t border-border py-5 text-xs text-muted-foreground"><span className="flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-primary" /> Data diperbarui 2 menit lalu</span><span className="hidden sm:block">HydroSense v1.0</span></footer>
        </section>
      </div>
    </main>
  )
}
