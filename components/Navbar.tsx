import Link from "next/link";
import Image from "next/image";
import { BRAND, NAV_LINKS, A11Y } from "@/lib/constants";

const Navbar = () => {
  return (
    <header role="banner" className="header">
      <nav aria-label={A11Y.NAV_LABEL}>
        <Link
          href="/"
          className="logo"
          aria-label={`${BRAND.NAME} - Go to homepage`}
        >
          <Image
            src="/icons/logo.png"
            alt={A11Y.ALT.LOGO}
            width={24}
            height={24}
            priority
          />
          <p>{BRAND.NAME}</p>
        </Link>

        <ul role="list">
          {NAV_LINKS.map((link) => (
            <li key={link.href} role="listitem">
              <Link href={link.href} aria-label={link.ariaLabel || link.label}>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
};

export default Navbar;
