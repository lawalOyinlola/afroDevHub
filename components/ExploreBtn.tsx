"use client";

import Image from "next/image";
import { A11Y } from "@/lib/constants";

const ExploreBtn = () => {
  const handleClick = () => {
    const eventsSection = document.getElementById("events");
    if (eventsSection) {
      eventsSection.scrollIntoView({ behavior: "smooth", block: "start" });
      eventsSection.focus();
    }
  };

  return (
    <button
      type="button"
      id="explore-btn"
      className="mt-7 mx-auto"
      onClick={handleClick}
      aria-label={A11Y.EXPLORE_EVENTS}
    >
      <span className="flex items-center gap-2">
        Explore Events
        <Image
          src="/icons/arrow-down.svg"
          alt={A11Y.ALT.ARROW_DOWN}
          width={24}
          height={24}
          aria-hidden="true"
        />
      </span>
    </button>
  );
};

export default ExploreBtn;
