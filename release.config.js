export default {
  branches: ["main", "next", "beta", "alpha", "*.x"],
  plugins: [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/npm",
    [
      "@semantic-release/github",
      {
        labels: [],
      },
    ],
  ],
};
