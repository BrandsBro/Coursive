export default function robots() {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/admin", "/api"] },
    ],
    sitemap: "https://coursiv-six.vercel.app/sitemap.xml",
  };
}
