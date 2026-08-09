import type { Metadata } from "next";
import React from "react";
import "./globals.css";
import styles from "./layout.module.css";

export const metadata: Metadata = {
  title: "Debe Parent Portal",
  description: "Manage your child's upcoming tutoring sessions",
};

// Year is hardcoded at build time to avoid a server/client hydration mismatch.
// new Date().getFullYear() would produce different values if the server renders
// just before midnight and the client hydrates just after — causing a mismatch.
const CURRENT_YEAR = new Date().getFullYear();

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* role="banner" is the semantic landmark for site-level headers */}
        <header className={styles.header} role="banner">
          <div className={styles.headerInner}>
            <span className={styles.logo}>📚 Debe</span>
            <span className={styles.portalLabel}>Parent Portal</span>
          </div>
        </header>

        <div className={styles.content}>{children}</div>

        {/* role="contentinfo" is the semantic landmark for site-level footers */}
        <footer className={styles.footer} role="contentinfo">
          <p>© {CURRENT_YEAR} Debe Tutoring. All rights reserved.</p>
        </footer>
      </body>
    </html>
  );
}
