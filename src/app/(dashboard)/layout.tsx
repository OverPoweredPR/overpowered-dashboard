'use client'

import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  ShoppingCart,
  CreditCard,
  Package,
  Truck,
  FileText,
  ShieldCheck,
  MessageSquareWarning,
  Menu,
  X,
  ChevronDown,

  LogOut,
} from 'lucide-react'
import { GlobalSearch } from '@/components/GlobalSearch'
import { KeyboardShortcuts } from '@/components/KeyboardShortcuts'
import { OnboardingTour } from '@/components/OnboardingTour'
import { NotificationCenter } from '@/components/NotificationCenter'

const NAV_ITEMS = [
  { href: '/home',        label: 'Home',        icon: LayoutDashboard },
  { href: '/ordenes',     label: 'Órdenes',     icon: ShoppingCart    },
  { href: '/pagos',       label: 'Pagos',        icon: CreditCard      },
  { href: '/inventario',  label: 'Inventario',   icon: Package         },
  { href: '/compras',     label: 'Compras',      icon: Truck           },
  { href: '/facturas',    label: 'Facturas',     icon: FileText        },
  { href: '/auditoria',   label: 'Auditoría',    icon: ShieldCheck     },
  { href: '/resoluciones',label: 'Resoluciones', icon: MessageSquareWarning },
]

function NavLink({
  item,
  onClick,
}: {
  item: (typeof NAV_ITEMS)[number]
  onClick?: () => void
}) {
  const pathname = usePathname()
  const active = pathname === item.href || pathname.startsWith(item.href + '/')
  const Icon = item.icon

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`
        flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
        transition-colors duration-150
        ${
          active
            ? 'bg-primary text-white'
            : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-white'
        }
      `}
    >
      <Icon size={18} className="shrink-0" />
      {item.label}
    </Link>
  )
}

function Sidebar({ onClose }: { onClose?: () => void }) {
  return (
    <aside className="flex flex-col h-full bg-[#0F1117] text-white">
      {/* Logo / Brand */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-sidebar-border">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            OverPowered
          </p>
          <p className="text-base font-bold text-white leading-tight">
            Baguettes de PR
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden text-sidebar-foreground/60 hover:text-white p-1 rounded"
            aria-label="Cerrar menú"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.href} item={item} onClick={onClose} />
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-sidebar-border">
        <button
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm
            text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-white transition-colors"
        >
          <LogOut size={18} className="shrink-0" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}

function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 shrink-0">
      {/* Left — mobile hamburger */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-md text-slate-500 hover:bg-slate-100"
        aria-label="Abrir menú"
      >
        <Menu size={20} />
      </button>

      {/* Tenant badge (desktop) */}
      <div className="hidden lg:flex items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-widest text-sidebar-foreground/60">
          Tenant
        </span>
        <span className="text-sm font-semibold text-slate-700">
          Baguettes de PR
        </span>
      </div>

      {/* Global search */}
      <div className="hidden sm:flex flex-1 max-w-sm mx-4">
        <GlobalSearch />
      </div>

      {/* Right — notifications + user */}
      <div className="flex items-center gap-2 ml-auto">
        <NotificationCenter />

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen((v) => !v)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-slate-100 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
              JE
            </div>
            <span className="hidden sm:block text-sm font-medium text-slate-700">
              Jose E.
            </span>
            <ChevronDown size={14} className="text-sidebar-foreground/60" />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-500">Rol</p>
                <p className="text-sm text-slate-700">Owner</p>
              </div>
              <button
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600
                  hover:bg-red-50 transition-colors"
              >
                <LogOut size={14} />
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
})

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <QueryClientProvider client={queryClient}>
    <KeyboardShortcuts />
    {/* <OnboardingTour /> */}
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Desktop sidebar — always visible on lg+ */}
      <div className="hidden lg:flex lg:w-56 xl:w-60 shrink-0">
        <div className="w-full">
          <Sidebar />
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          {/* Drawer */}
          <div className="absolute left-0 top-0 bottom-0 w-60">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main content area */}
      <div className="flex flex-col flex-1 min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
    </QueryClientProvider>
  )
}
