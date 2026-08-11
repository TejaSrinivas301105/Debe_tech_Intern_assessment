import type { Metadata } from "next";
import React from "react";
import "./globals.css";
import styles from "./layout.module.css";

export const metadata: Metadata = {
  title: "Debe Parent Portal",
  description: "Manage your child's upcoming tutoring sessions",
};


const CURRENT_YEAR = new Date().getFullYear();

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        
        <header className={styles.header} role="banner">
          <div className={styles.headerInner}>
            <span className={styles.logo}>📚 Debe</span>
            <span className={styles.portalLabel}>Parent Portal</span>
          </div>
        </header>

        <div className={styles.content}>{children}</div>

        
        <footer className={styles.footer} role="contentinfo">
          <p>© {CURRENT_YEAR} Debe Tutoring. All rights reserved.</p>
        </footer>

      </body>
    </html>
  );
}
