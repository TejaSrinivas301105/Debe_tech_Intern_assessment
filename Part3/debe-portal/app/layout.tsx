import type { Metadata } from "next";
import "./globals.css";
import styles from "./layout.module.css";

export const metadata: Metadata = {
  title: "Debe Parent Portal",
  description: "Manage your child's upcoming tutoring sessions",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className={styles.header}>
          <div className={styles.headerInner}>
            <span className={styles.logo}>📚 Debe</span>
            <span className={styles.portalLabel}>Parent Portal</span>
          </div>
        </header>

        <div className={styles.content}>{children}</div>

        <footer className={styles.footer}>
          <p>© {new Date().getFullYear()} Debe Tutoring. All rights reserved.</p>
        </footer>
      </body>
    </html>
  );
}
