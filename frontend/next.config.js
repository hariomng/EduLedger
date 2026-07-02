/** @type {import('next').NextConfig} */

module.exports = {
  /* config options here */
  reactCompiler: true,
  turbopack: {
    // Ensure Turbopack resolves the real workspace root where `next` is installed
    root: __dirname,
  },
};
