"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, User, Flame, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_LINKS } from "@/lib/constants";

const icons = {
  Home: Home,
  Courses: BookOpen,
  Challenges: Trophy,
};

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 w-full bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-1">
          <span className="text-2xl font-bold text-primary italic">✦ Coursiv</span>
        </Link>

        <div className="flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const Icon = icons[link.label];
            const isActive = pathname === link.href;
            return (
              <Link key={link.href} href={link.href}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive ? "bg-primary-light text-primary" : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                )}>
                {Icon && <Icon size={16} />}
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-orange-50 text-orange-500 px-3 py-1.5 rounded-xl text-sm font-semibold">
            <Flame size={16} />
            <span>1</span>
          </div>
          <Link href="/profile"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-all">
            <div className="w-7 h-7 rounded-full bg-primary-light flex items-center justify-center">
              <User size={14} className="text-primary" />
            </div>
            <span>Profile</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
