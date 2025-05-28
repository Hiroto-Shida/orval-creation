## Next.js インストール

```
npx create-next-app@latest --yes --empty orval-creation
```

## テスト実行

```
npm run dev
```

- 画面(http://localhost:3000)に「Hello world!」がでてくれば OK

## orval のインストール

```
npm i -D orval
```

## orval の設定ファイル `orval.config.ts` と OpenAPI のスキーマ `schemas.yaml` を用意

```diff
/
  ├─ app/
  ├─ node_modules
+ ├─ orval.config.ts
  ├─ package-lock.json
  ├─ package.json
+ ├─ schemas.yaml
  └─ tsconfig.json
```

### orval.config.ts

<details>
<summary>ファイル全貌</summary>

```ts
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
```

</details>

### `schemas.yaml`

<details>
<summary>ファイル全貌</summary>

```yaml
openapi: 3.0.0
info:
  title: カラフルモアイAPI
  description: カラフルなモアイのリストを管理するAPI。
  version: 1.0.0
paths:
  /api/colorful-moai:
    get:
      summary: カラフルモアイ一覧を取得
      operationId: getColorfulMoai
      tags:
        - colorful-moai
      responses:
        "200":
          description: カラフルモアイの一覧
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/GetColorfulMoaiResponse"
    post:
      summary: 新しいカラフルモアイを追加
      operationId: addColorfulMoai
      tags:
        - colorful-moai
      requestBody:
        description: 追加するカラフルモアイ。
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/AddColorfulMoaiBody"
      responses:
        "200":
          description: 更新されたカラフルモアイの一覧
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/AddColorfulMoaiResponse"
components:
  schemas:
    AddColorfulMoaiBody:
      type: object
      required:
        - name
      properties:
        name:
          type: string
          example: "黄モアイ"
    AddColorfulMoaiResponse:
      type: array
      items:
        type: string
      example: ["赤モアイ", "緑モアイ", "青モアイ", "黄モアイ"]
    GetColorfulMoaiResponse:
      type: array
      items:
        type: string
      example: ["赤モアイ", "緑モアイ", "青モアイ"]
```

</details>

## orval の生成コマンド実行

### `package.json`

```diff
{
  "scripts": {
+    "generate": "orval --config ./orval.config.ts"
  },
```

### コマンド実行

```
npm run generate
```

生成されるファイルの確認

```diff
/
  ├─ app/
+ │  ├─ api/
+ │  │  └─ [[...route]]/
+ │  │     └─ route.ts
  │  └─ page.tsx
+ ├─ client/
+ │  └─ api.ts
+ ├─ endpoints/
+ │  ├─ colorful-moai/
+ │  │  └─ ...
+ │  └─ validator.ts
+ ├─ mcp
+  │  ├─ handlers.ts
+  │  ├─ http-client.ts
+  │  ├─ server.ts
+  │  └─ tool-schemas.zod.ts
  ├─ node_modules
+ ├─ schemas/
+ │  ├─ index.ts
+ │  └─ ...
  ├─ orval.config.ts
  ├─ package-lock.json
  ├─ package.json
  ├─ schemas.yaml
  └─ tsconfig.json
```

## 必要なパッケージインストール

```
npm i hono zod @modelcontextprotocol/sdk @hono/zod-validator
```

## API 周りの処理をちょっとだけ実装

自動生成の hono はあくまで雛形(エンドポイント)ができるだけなので実際の実装は必要

### Next.js の API Route の hono 実装にちょっと追加

#### `app/api/[[...route]]/route.ts`

```diff:ts
...
...
- export default app;

+ export const GET = handle(app);
+ export const POST = handle(app);
```

### 簡易データベース

```diff
/
  ├─ app/
  ...
+ ├─ database.ts
  ├─ orval.config.ts
  ...
...
```

```ts
export const COLORFUL_MOAI_LIST = ["赤モアイ", "緑モアイ", "青モアイ"];
```

### API に繋ぎ込み

`endpoints/colorful-moai/colorful-moai.handlers.ts`

```diff:ts
...
+ import { COLORFUL_MOAI_LIST } from "@/database";

  const factory = createFactory();
  export const getColorfulMoaiHandlers = factory.createHandlers(
    zValidator("response", getColorfulMoaiResponse),
    async (c: GetColorfulMoaiContext) => {
+     return c.json(COLORFUL_MOAI_LIST);
    }
  );
  export const addColorfulMoaiHandlers = factory.createHandlers(
    zValidator("json", addColorfulMoaiBody),
    zValidator("response", addColorfulMoaiResponse),
    async (c: AddColorfulMoaiContext) => {
+     const body = await c.req.json();

+     COLORFUL_MOAI_LIST.push(body["name"]);

+     return c.json(COLORFUL_MOAI_LIST);
    }
  );

```

## Cursor と MCP を接続

### mcp.json を作成

```diff
/
+ ├─ .cursor/
+ │  └─ mcp.json
  ├─ app/
  │  ├─ api/
...
```

```json
{
  "mcpServers": {
    "colorsAPIServer": {
      "command": "npx",
      "args": [
        "tsx",
        "~~~~~~~~/mcp/server.ts" // 絶対パスにする
      ]
    }
  }
}
```

### mcp.json の設定を cursor に実際に接続する

`.cursor/mcp.json` を設定すると、Cursor Settings > MCP > MCP Servers にカードが現れ、enable にして緑に点灯すれば接続完了

![成功画像]("./images/mcp-connect-success.png" "成功例")

![失敗画像1]("./images/mcp-connect-fail-1.png" "失敗例1")

![失敗画像2]("./images/mcp-connect-fail-2.png" "失敗例2")

- うまくいかない時は server.ts が絶対パスになっているか確認
- cursor を再起動する等をする

## Next.js (API サーバ) を起動して MCP を通して 接続してみる

```
npm run dev
```

![MCP経由GETを呼ぶ]("./images/mcp-get.png" "MCP経由でGETを呼ぶ")

![MCP経由POSTを呼ぶ1]("./images/mcp-post-1.png" "MCP経由でPOSTを呼ぶ1")

![MCP経由POSTを呼ぶ2]("./images/mcp-post-1.png" "MCP経由でPOSTを呼ぶ2")

## 画面から API 呼び出し (API クライアント)

### `app/page.tsx`に API 呼び出しを追加

```diff:tsx
+ import { getColorfulMoai } from "@/client/api";

- export default function Home() {
+ export default async function Home() {
+   const res = await getColorfulMoai();

    return (
      <main>
-       <div>Hello world!</div>
+       <div>{JSON.stringify(res.data)}</div>
      </main>
    );
  }
```

### 起動して API を叩けているか確認

```
npm run dev
```

![画像]("./images/xxx.png" "画像")

### チャット-MCP 経由で API を叩き、画面で反映を確認できるか

![画像]("./images/xxx.png" "画像")

- チャットで色モアイを追加

![画像]("./images/xxx.png" "画像")

- 画面をリロードし追加を確認
