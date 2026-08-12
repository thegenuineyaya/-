import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the skill workbench shell", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /词刷刷 Skill 生产工作台/);
  assert.match(html, /1\. 选择你要做执行的操作/);
  assert.match(html, /2\. 拖动你要上传的文件/);
  assert.match(html, /场景生成 Skill/);
  assert.match(html, /导演2\.0 Skill/);
  assert.match(html, /JSON 打包脚本/);
  assert.doesNotMatch(html, /0-Readme|Readme/);
  assert.doesNotMatch(html, /project|well|explain/);
});

test("keeps the legacy workbench URL as a redirect", async () => {
  const html = await readFile(new URL("../public/workbench.html", import.meta.url), "utf8");
  assert.match(html, /window\.location\.replace\("\/"\)/);
  assert.match(html, /词刷刷 Skill 生产工作台/);
});
