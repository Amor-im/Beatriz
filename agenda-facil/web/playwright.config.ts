import { defineConfig, devices } from "@playwright/test";

/**
 * Testes de ponta a ponta: abrem o navegador de verdade e usam a API de verdade.
 * Antes de rodar: banco no ar (docker compose up -d) e API no perfil dev, com o seed do Studio Exemplo:
 *   cd api && ./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
 * O front sobe sozinho (npm run build antes, uma vez).
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:3000",
    locale: "pt-BR",
    timezoneId: "America/Sao_Paulo",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "cliente no celular (390px)",
      testMatch: /cliente.*\.spec\.ts/,
      use: { ...devices["Desktop Chrome"], viewport: { width: 390, height: 844 }, isMobile: false, hasTouch: true },
    },
    {
      name: "dono no computador (1440px)",
      testMatch: /dono.*\.spec\.ts/,
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
  ],
  webServer: {
    command: "npm run start",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
