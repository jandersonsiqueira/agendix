"use client";

import { SubmitButton } from "@/components/submit-button";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, switchOrganization } from "@/app/actions";
import type { Membership } from "@/lib/auth";
import { roleLabel } from "@/lib/roles";

const items = [
  { href: "/app", label: "Visão geral", icon: "▦" },
  {
    href: "/app/equipe",
    label: "Equipe e acessos",
    icon: "♙",
    privileged: true,
  },
  { href: "/app/empresa", label: "Estabelecimentos", icon: "▤" },
];

export function Sidebar({
  memberships,
  current,
  userEmail,
}: {
  memberships: Membership[];
  current: Membership | null;
  userEmail: string;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const links = items.filter(
    (item) =>
      !item.privileged ||
      (current && ["owner", "admin"].includes(current.role)),
  );
  return (
    <>
      <header className="mobile-topbar">
        <button
          aria-label="Abrir menu"
          aria-expanded={mobileOpen}
          aria-controls="main-sidebar"
          className="icon-button"
          onClick={() => setMobileOpen(true)}
        >
          ☰
        </button>
        <img src="/logo.png" alt="Agendix" />
        <span className="avatar">{userEmail.slice(0, 1).toUpperCase()}</span>
      </header>
      {mobileOpen && (
        <button
          aria-label="Fechar menu"
          className="sidebar-overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside
        id="main-sidebar"
        onKeyDown={(event) => {
          if (event.key === "Escape") setMobileOpen(false);
        }}
        className={`sidebar ${collapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`}
      >
        <div className="sidebar-header">
          <Link href="/app" onClick={() => setMobileOpen(false)}>
            <img src="/logo.png" alt="Agendix" className="sidebar-logo" />
            <img
              src="/icons/icon-192.png"
              alt=""
              className="sidebar-logo-small"
            />
          </Link>
          <button
            className="collapse-toggle"
            aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
            onClick={() => {
              if (window.matchMedia("(max-width: 760px)").matches)
                setMobileOpen(false);
              else setCollapsed(!collapsed);
            }}
          >
            {collapsed ? "›" : "‹"}
          </button>
        </div>
        <div className="sidebar-content">
          {current && (
            <div className="current-org">
              <span className="org-icon">⌂</span>
              <div className="org-details">
                <strong title={current.organization.name}>
                  {current.organization.name}
                </strong>
                <small>{roleLabel(current.role)}</small>
              </div>
            </div>
          )}
          {memberships.length > 1 && (
            <div className="org-switch">
              <div className="nav-caption">TROCAR ESTABELECIMENTO</div>
              {memberships.map((item) => (
                <form key={item.organization_id} action={switchOrganization}>
                  <input
                    type="hidden"
                    name="organizationId"
                    value={item.organization_id}
                  />
                  <button
                    title={item.organization.name}
                    className={
                      item.organization_id === current?.organization_id
                        ? "switch-item selected"
                        : "switch-item"
                    }
                  >
                    <span className="nav-icon">
                      {item.organization_id === current?.organization_id
                        ? "✓"
                        : "↪"}
                    </span>
                    <span className="nav-label">{item.organization.name}</span>
                  </button>
                </form>
              ))}
            </div>
          )}
          <div className="nav-caption">MENU PRINCIPAL</div>
          <nav className="sidebar-nav">
            {links.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                aria-current={pathname === item.href ? "page" : undefined}
                onClick={() => setMobileOpen(false)}
                className={`nav-link ${pathname === item.href ? "active" : ""}`}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
        <div className="sidebar-bottom">
          <div className="account-info">
            <span className="avatar">
              {userEmail.slice(0, 1).toUpperCase()}
            </span>
            <span className="account-email" title={userEmail}>
              {userEmail}
            </span>
          </div>
          <form action={signOut}>
            <SubmitButton
              className="logout"
              title="Sair"
              pendingLabel="Saindo..."
            >
              <span className="nav-icon">⇥</span>
              <span className="nav-label">Sair da conta</span>
            </SubmitButton>
          </form>
        </div>
      </aside>
    </>
  );
}
