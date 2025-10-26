import Link from "next/link";
import { SiFacebook, SiInstagram, SiX } from "@icons-pack/react-simple-icons";

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-300 py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Traubling</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  探す
                </Link>
              </li>
              <li>
                <Link
                  href="/map"
                  className="hover:text-white transition-colors"
                >
                  地図から探す
                </Link>
              </li>
              <li>
                <Link
                  href="/post"
                  className="hover:text-white transition-colors"
                >
                  トラブルを共有する
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">
              旅行の注意点
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/cities/international"
                  className="hover:text-white transition-colors"
                >
                  海外で気をつけること
                </Link>
              </li>
              <li>
                <Link
                  href="/cities/japan"
                  className="hover:text-white transition-colors"
                >
                  国内で気をつけること
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">法的情報</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  利用規約
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  免責事項
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">
              フォローする
            </h3>
            <div className="flex space-x-4">
              <a
                href="/"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <span className="sr-only">X（旧Twitter）</span>
                <SiX />
              </a>
              <a
                href="/"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <span className="sr-only">Facebook</span>
                <SiFacebook />
              </a>
              <a
                href="/"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <span className="sr-only">Instagram</span>
                <SiInstagram />
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm">&copy; 2025 Traubling. All rights reserved.</p>
          <nav className="mt-4 md:mt-0">
            <ul className="flex space-x-4 text-sm">
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-white transition-colors"
                >
                  プライバシーポリシー
                </Link>
              </li>
              <li>
                <Link
                  href="/cookies"
                  className="hover:text-white transition-colors"
                >
                  クッキーポリシー
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}
