import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";
import { Link } from "react-router-dom";
// import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    "Về Chúng Tôi": [
      { label: "Giới Thiệu", href: "#" },
      { label: "Tin Tức", href: "#" },
      { label: "Sự Kiện", href: "#" },
    ],
    "Hỗ Trợ": [
      { label: "Trung Tâm Trợ Giúp", href: "#" },
      { label: "Liên Hệ", href: "#" },
      { label: "FAQ", href: "#" },
    ],
    "Chính Sách": [
      { label: "Điều Khoản Sử Dụng", href: "#" },
      { label: "Chính Sách Riêng Tư", href: "#" },
      { label: "Chính Sách Cookie", href: "#" },
    ],
  };

  return (
    <footer className="bg-card border-t mt-12">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-lg mb-4">Phòng Trọ</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Nền tảng tìm kiếm phòng trọ, nhà nguyên căn và căn hộ cho thuê tại
              Việt Nam.
            </p>
            <div className="flex gap-3">
              <Link
                to="#"
                aria-label="Facebook"
                className="text-muted-foreground hover:text-primary"
              >
                <Facebook className="w-5 h-5" />
              </Link>
              <Link
                to="#"
                aria-label="Twitter"
                className="text-muted-foreground hover:text-primary"
              >
                <Twitter className="w-5 h-5" />
              </Link>
              <Link
                to="#"
                aria-label="Instagram"
                className="text-muted-foreground hover:text-primary"
              >
                <Instagram className="w-5 h-5" />
              </Link>
              <Link
                to="#"
                aria-label="LinkedIn"
                className="text-muted-foreground hover:text-primary"
              >
                <Linkedin className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h4 className="font-semibold mb-4">{section}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-muted-foreground text-sm hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted-foreground text-sm mb-4 md:mb-0">
            © {currentYear} Phòng Trọ. Tất cả quyền được bảo lưu.
          </p>
          <div className="flex gap-6 text-sm">
            <Link
              to="#"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Sitemap
            </Link>
            <Link
              to="#"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              RSS
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
