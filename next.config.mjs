/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      // Serve the Claude Design standalone export at the clean product URL.
      // The actual file lives at public/osdocs/dogtagv1.html.
      { source: "/osdocs/dogtagv1", destination: "/osdocs/dogtagv1.html" },
    ];
  },
};

export default nextConfig;
