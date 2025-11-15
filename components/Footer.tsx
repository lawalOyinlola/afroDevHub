import { headers } from "next/headers";
import { BRAND, CREATOR, URLS } from "@/lib/constants";

export default async function Footer() {
  await headers();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto py-8 text-center text-sm text-muted-foreground">
      <p className="mt-2">
        © {currentYear} {BRAND.NAME}. All rights reserved.
      </p>

      <a
        href={URLS.PORTFOLIO_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="underline hover:text-foreground transition-colors"
        aria-label={`Visit ${CREATOR.NAME}'s portfolio`}
      >
        {CREATOR.CREDIT_TEXT}
      </a>
    </footer>
  );
}
