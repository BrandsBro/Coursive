export default function robots() {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/admin", "/api"] },
    ],
    sitemap: "https://1course-six.vercel.app/sitemap.xml",
  };
}
