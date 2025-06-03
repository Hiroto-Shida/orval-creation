import { defineConfig } from "orval";

export default defineConfig({
  api: {
    input: "schemas.yaml", // 使用するOpenAPIスキーマ
    output: {
      target: "endpoints/",
      schemas: "schemas/",
      client: "hono", // 生成するコードの種類
      mode: "tags-split",
      override: {
        hono: {
          compositeRoute: "app/api/[[...route]]/route.ts", // Next.jsのRoute Handlersで使うためのPATH名
          validatorOutputPath: "endpoints/validator.ts",
        },
      },
    },
    hooks: {
      afterAllFilesWrite: "npx prettier . --write",
    },
  },
  mcp: {
    input: "schemas.yaml",
    output: {
      target: "mcp/handlers.ts",
      schemas: "schemas/",
      client: "mcp", // 生成するコードの種類
      mode: "single",
      baseUrl: "http://localhost:3000/api", // APIサーバーのbaseUrl
      clean: true,
    },
    hooks: {
      afterAllFilesWrite: "npx prettier . --write",
    },
  },
  client: {
    input: "schemas.yaml",
    output: {
      target: "client/",
      schemas: "schemas/",
      client: "fetch", // 生成するコードの種類
      mode: "split",
      baseUrl: "http://localhost:3000/api", // APIサーバーのbaseUrl
      clean: true,
    },
    hooks: {
      afterAllFilesWrite: "npx prettier . --write",
    },
  },
});
