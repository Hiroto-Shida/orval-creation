import { defineConfig } from "orval";

export default defineConfig({
  api: {
    input: "schemas.yaml",
    output: {
      mode: "tags-split",
      client: "hono",
      target: "app/api/",
      schemas: "schemas/",
      override: {
        hono: {
          compositeRoute: "app/api/[[...route]]/route.ts", // next.jsのAPI routeで使うためのPATH名を設定
          validatorOutputPath: "app/api/validator.ts",
        },
      },
    },
    hooks: {
      afterAllFilesWrite: "npx @biomejs/biome format --write",
    },
  },
  mcp: {
    input: "schemas.yaml",
    output: {
      target: "mcp/handlers.ts",
      schemas: "schemas/",
      mode: "single",
      client: "mcp",
      baseUrl: "http://localhost:3000", // APIサーバーのbaseUrl
      clean: true,
    },
    hooks: {
      afterAllFilesWrite: "npx @biomejs/biome format --write",
    },
  },
  client: {
    input: "schemas.yaml",
    output: {
      target: "client/",
      schemas: "schemas/",
      mode: "split",
      client: "fetch",
      httpClient: "fetch",
      baseUrl: "http://localhost:3000", // APIサーバーのbaseUrl
      clean: true,
    },
    hooks: {
      afterAllFilesWrite: "npx @biomejs/biome format --write",
    },
  },
});
