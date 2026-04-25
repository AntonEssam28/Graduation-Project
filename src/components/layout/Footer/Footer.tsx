import Link from "next/link";
import { PawPrint, Mail, Phone, MapPin } from "lucide-react";
import { FaFacebookF, FaInstagram, FaXTwitter } from "react-icons/fa6";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-950">
                <PawPrint className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold">Street2Home</span>
            </div>

            <p className="max-w-sm text-sm leading-6 text-slate-300">
              A platform connecting people with dog shelters for rescue reports,
              adoption, fostering, donations, and supplies.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-3 text-sm text-slate-300">
              <li>
                <Link href="/" className="hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/dog" className="hover:text-white">
                  Dogs
                </Link>
              </li>
              <li>
                <Link href="/adopt" className="hover:text-white">
                  Adopt
                </Link>
              </li>
              <li>
                <Link href="/host" className="hover:text-white">
                  Host
                </Link>
              </li>
              <li>
                <Link href="/report" className="hover:text-white">
                  Report
                </Link>
              </li>
              <li>
                <Link href="/donate" className="hover:text-white">
                  Donate
                </Link>
              </li>
              <li>
                <Link href="/store" className="hover:text-white">
                  Store
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Support</h3>
            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>support@street2home.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>+20 100 000 0000</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>Cairo, Egypt</span>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Follow Us</h3>
            <div className="flex gap-4 text-slate-300">
              <a
                href="#"
                className="rounded-full border border-slate-700 p-2 hover:text-white"
                aria-label="Facebook"
              >
                <FaFacebookF className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="rounded-full border border-slate-700 p-2 hover:text-white"
                aria-label="Instagram"
              >
                <FaInstagram className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="rounded-full border border-slate-700 p-2 hover:text-white"
                aria-label="X"
              >
                <FaXTwitter className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-800 pt-6 text-center text-sm text-slate-400">
          © {year} Street2Home. All rights reserved.
        </div>
      </div>
    </footer>
  );
}