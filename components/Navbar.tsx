import Link from "next/link";
import Image from "next/image";
import { PROJECT_INFO, NAV_LINKS } from "@/lib/constants";

const Navbar = () => {
  const { title } = PROJECT_INFO;

  return (
    <header>
      <nav>
        <Link href="/" className="logo">
          <Image src="/icons/logo.png" alt="logo" width={24} height={24} />

          <p>{title}</p>
        </Link>

        <ul>
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </ul>
      </nav>
    </header>
  );
};

export default Navbar;
