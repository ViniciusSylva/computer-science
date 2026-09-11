// prisma.config.ts

// Exportação de objeto simples sem depender de imports do Prisma
const config = {
  skills: {
    agents: ["claude", "cursor", "agents", "devin"],
  },
} as const;

export default config;