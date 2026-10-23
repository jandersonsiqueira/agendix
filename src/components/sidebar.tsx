"use client";

import Image from "next/image";
import { ThemeToggle } from "@/components/theme-toggle";
import { SubmitButton } from "@/components/submit-button";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, switchOrganization } from "@/app/actions";
import type { Membership } from "@/lib/auth";
import { roleLabel } from "@/lib/roles";

const menuIcon = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    aria-hidden="true"
  >
    <path d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

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
  useEffect(() => {
    if (!mobileOpen) return;

    const media = window.matchMedia("(max-width: 760px)");
    let unlock: (() => void) | undefined;

    function updateScrollLock() {
      unlock?.();
      unlock = undefined;
      if (!media.matches) return;

      const body = document.body;
      const root = document.documentElement;
      const scrollY = window.scrollY;
      const previous = {
        position: body.style.position,
        top: body.style.top,
        width: body.style.width,
        overflow: body.style.overflow,
        rootOverflow: root.style.overflow,
      };

      body.style.position = "fixed";
      body.style.top = `-${scrollY}px`;
      body.style.width = "100%";
      body.style.overflow = "hidden";
      root.style.overflow = "hidden";

      unlock = () => {
        body.style.position = previous.position;
        body.style.top = previous.top;
        body.style.width = previous.width;
        body.style.overflow = previous.overflow;
        root.style.overflow = previous.rootOverflow;
        window.scrollTo({ top: scrollY, behavior: "instant" });
      };
    }

    updateScrollLock();
    media.addEventListener("change", updateScrollLock);
    return () => {
      media.removeEventListener("change", updateScrollLock);
      unlock?.();
    };
  }, [mobileOpen]);

  const currentOrganization = current && (
    <>
      <span className="org-icon" aria-hidden="true">
        ⌂
      </span>
      <span className="org-details">
        <strong title={current.organization.name}>
          {current.organization.name}
        </strong>
        <small>{roleLabel(current.role)}</small>
      </span>
    </>
  );

  return (
    <>
      <header className={`app-topbar ${collapsed ? "is-collapsed" : ""}`}>
        <div className="topbar-brand">
          <button
            type="button"
            aria-label="Abrir menu"
            aria-expanded={mobileOpen}
            aria-controls="main-sidebar"
            className="icon-button mobile-menu-toggle"
            onClick={() => setMobileOpen(true)}
          >
            {menuIcon}
          </button>
          <button
            type="button"
            aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
            aria-expanded={!collapsed}
            aria-controls="main-sidebar"
            className="icon-button desktop-menu-toggle"
            onClick={() => setCollapsed(!collapsed)}
          >
            {menuIcon}
          </button>
          <Link
            href="/app"
            className="topbar-logo"
            aria-label="Agendix — Visão geral"
          >
            <Image
              width={1401}
              height={360}
              sizes="160px"
              src="/logo.png"
              alt="Agendix"
              priority
            />
          </Link>
        </div>
        <ThemeToggle />
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
            <Image
              width={1401}
              height={360}
              sizes="310px"
              src="/logo.png"
              alt="Agendix"
              className="sidebar-logo"
            />
            <Image
              width={192}
              height={192}
              sizes="39px"
              src="/icons/icon-192.png"
              alt=""
              className="sidebar-logo-small"
            />
          </Link>
        </div>
        <div className="sidebar-content">
          {current &&
            (memberships.length > 1 ? (
              <details className="org-switch" key={current.organization_id}>
                <summary
                  className="current-org org-toggle"
                  title={`Trocar estabelecimento: ${current.organization.name}`}
                  onClick={() => {
                    if (!window.matchMedia("(max-width: 760px)").matches) {
                      setCollapsed(false);
                    }
                  }}
                >
                  {currentOrganization}
                  <span className="org-chevron" aria-hidden="true">
                    ⌄
                  </span>
                </summary>
                <div
                  className="org-options"
                  role="group"
                  aria-label="Trocar estabelecimento"
                >
                  <div className="nav-caption">TROCAR ESTABELECIMENTO</div>
                  {memberships.map((item) => (
                    <form
                      key={item.organization_id}
                      action={switchOrganization}
                    >
                      <input
                        type="hidden"
                        name="organizationId"
                        value={item.organization_id}
                      />
                      <button
                        title={item.organization.name}
                        disabled={
                          item.organization_id === current.organization_id
                        }
                        className={
                          item.organization_id === current.organization_id
                            ? "switch-item selected"
                            : "switch-item"
                        }
                      >
                        <span className="org-details">
                          <strong>{item.organization.name}</strong>
                          <small>{roleLabel(item.role)}</small>
                        </span>
                        {item.organization_id === current.organization_id && (
                          <span aria-label="Estabelecimento atual">✓</span>
                        )}
                      </button>
                    </form>
                  ))}
                </div>
              </details>
            ) : (
              <div className="current-org">{currentOrganization}</div>
            ))}
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
