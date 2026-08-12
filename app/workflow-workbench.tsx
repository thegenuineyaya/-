"use client";

import { useState } from "react";

type ModuleId = "scene" | "director" | "compress";

type ImportedRow = {
  bookname: string;
  word: string;
  meaning: string;
};

const SCENE_SKILL_PATH = "/Users/admin/Documents/词刷刷量产/.agents/skills/cishua-content-agency";
const DIRECTOR_SKILL_PATH = "/Users/admin/.codex/skills/cishuashua-seedance-director-2-0";
const PACKAGE_SCRIPT_PATH = "/Users/admin/Documents/词刷刷量产/tools/package_cishuashua_json.py";

type UploadedFile = {
  name: string;
  size: number;
  kind: "spreadsheet" | "text" | "unknown";
  parseStatus: string;
};

type RunOutput = {
  fileName: string;
  module: ModuleId;
  createdAt: string;
  payload: unknown;
};

const modules: Array<{
  id: ModuleId;
  index: string;
  title: string;
  label: string;
  summary: string;
  usage: string[];
  inputs: string[];
  outputs: string[];
}> = [
  {
    id: "scene",
    index: "1",
    title: "场景生成 Skill",
    label: "Excel → 场景",
    summary: "使用项目内的 cishua-content-agency，把词表变成例句、视频方案和场景脚本。",
    usage: [
      "上传含 Bookname / word / Meaning-each 的词表。",
      "运行后下载场景生成执行包，交给 $cishua-content-agency。",
      "它会按 00—08 references 流程跑语义、文化联想、视频方案、例句、场景脚本、QA 和表格输出。",
    ],
    inputs: ["Bookname", "word", "Meaning-each", "可选：常见搭配、辅助梗、目标难度"],
    outputs: ["3 candidate plans", "example_sentence", "example_translation", "scene_script", "qa_notes"],
  },
  {
    id: "director",
    index: "2",
    title: "导演2.0 Skill",
    label: "场景 → Seedance脚本",
    summary: "使用全局 cishuashua-seedance-director-2-0，把场景脚本升级成 Seedance 2.0 双语教学视频脚本。",
    usage: [
      "上传包含单词、释义、例句和场景想法/现有脚本的表格。",
      "运行后下载导演2.0执行包，交给 $cishuashua-seedance-director-2-0。",
      "它会按九步流程锁输入、选风格、编译口播、导演表演、整合空间连续性并输出最终 Seedance 脚本。",
    ],
    inputs: ["word", "Meaning-each", "example_sentence", "scene idea / existing script", "可选：reference audio / feedback"],
    outputs: ["style candidates", "selected style", "closed dialogue set", "final Seedance script", "QA gates"],
  },
  {
    id: "compress",
    index: "3",
    title: "JSON 打包脚本",
    label: "Excel → JSON Zip",
    summary: "使用 package_cishuashua_json.py，把成片表格按模板打包成逐词 JSON 文件和 zip。",
    usage: [
      "上传含 topicId、word、Meaning-each、MeaningId、例句、音频、翻译、视频链接等字段的 Excel。",
      "运行后下载脚本执行包，后端调用 Python 生成逐词 JSON 和 zip。",
      "它会保留样例 JSON 的 tagId、componentName、componentKey，并填充 attrs 与 styles 字段。",
    ],
    inputs: ["xlsx", "sample_json", "out_dir", "zip", "style", "video_column", "poster_column"],
    outputs: ["per-word json files", "zip package", "row-level errors", "package report"],
  },
];

function parseRows(text: string): ImportedRow[] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) return [];

  const separator = lines[0].includes("\t") ? "\t" : ",";
  const headers = lines[0].split(separator).map((item) => item.trim().toLowerCase());

  return lines.slice(1).map((line, index) => {
    const cells = line.split(separator).map((item) => item.trim());
    const value = (names: string[], fallback = "") => {
      const hit = names
        .map((name) => headers.indexOf(name))
        .find((position) => position >= 0);
      return hit === undefined ? fallback : cells[hit] || fallback;
    };

    return {
      bookname: value(["bookname", "book", "词书名"], "Imported"),
      word: value(["word", "单词"], `word-${index + 1}`),
      meaning: value(["meaning-each", "meaning", "释义", "词性+释义"], "待补充释义"),
    };
  });
}

function downloadJson(output: RunOutput) {
  const blob = new Blob([JSON.stringify(output.payload, null, 2)], {
    type: "application/json;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = output.fileName;
  link.click();
  URL.revokeObjectURL(url);
}

function formatFileSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

export function WorkflowWorkbench() {
  const [activeModule, setActiveModule] = useState<ModuleId>("scene");
  const [fileName, setFileName] = useState("");
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [rows, setRows] = useState<ImportedRow[]>([]);
  const [compressText, setCompressText] = useState("");
  const [lastOutput, setLastOutput] = useState<RunOutput | null>(null);

  const active = modules.find((item) => item.id === activeModule) ?? modules[0];

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setFileName(file.name);
    setLastOutput(null);

    const kind = /\.(xlsx|xls|csv|tsv)$/i.test(file.name)
      ? "spreadsheet"
      : /\.(txt|md)$/i.test(file.name)
        ? "text"
        : "unknown";

    if (/\.(csv|tsv|txt)$/i.test(file.name)) {
      const text = await file.text();
      if (activeModule === "compress") {
        setCompressText(text);
        setRows([]);
        setUploadedFile({
          name: file.name,
          size: file.size,
          kind,
          parseStatus: "已载入文本，可作为打包备注或参数说明",
        });
        return;
      }

      const parsed = parseRows(text);
      if (parsed.length > 0) {
        setRows(parsed);
        setUploadedFile({
          name: file.name,
          size: file.size,
          kind,
          parseStatus: `已解析 ${parsed.length} 行，可预览前 5 行`,
        });
        return;
      }
    }

    setRows([]);
    setUploadedFile({
      name: file.name,
      size: file.size,
      kind,
      parseStatus: /\.(xlsx|xls)$/i.test(file.name)
        ? "Excel 已放入执行包，等待后端/skill 解析表头"
        : "已放入执行包，等待后端/skill 解析",
    });
  };

  const runSceneSkill = () => {
    const payload = {
      skill: "$cishua-content-agency",
      skill_path: SCENE_SKILL_PATH,
      mode: "scene-generation",
      input_file: fileName || "未上传文件",
      source_files: [
        `${SCENE_SKILL_PATH}/SKILL.md`,
        `${SCENE_SKILL_PATH}/references/00-overview.md`,
        `${SCENE_SKILL_PATH}/references/01-flow-orchestrator.md`,
        `${SCENE_SKILL_PATH}/references/02-semantic-angle.md`,
        `${SCENE_SKILL_PATH}/references/03-cultural-association.md`,
        `${SCENE_SKILL_PATH}/references/04-scene-ideation.md`,
        `${SCENE_SKILL_PATH}/references/05-sentence-writer.md`,
        `${SCENE_SKILL_PATH}/references/06-scene-script-writer.md`,
        `${SCENE_SKILL_PATH}/references/07-qa-scene-editor.md`,
        `${SCENE_SKILL_PATH}/references/08-excel-writer.md`,
      ],
      output_contract: {
        format: "xlsx_or_json",
        fields: [
          "word",
          "meaning_each",
          "3_candidate_plans",
          "example_sentence",
          "example_translation",
          "scene_script",
          "qa_notes",
        ],
      },
      run_steps: [
        "读取 Excel 表头并保护原字段",
        "识别词义风险和教学台词模板",
        "生成场景/视频方案、例句和场景脚本",
        "QA 后导出可下载结果",
      ],
      parsed_preview_available: rows.length > 0,
      preview_rows: rows.map((row) => ({
        ...row,
        suggested_template: /project|cotton|loan|request/i.test(row.word) ? "语境引入口播" : "直接教学口播",
        status: "ready_to_run",
      })),
    };

    setLastOutput({
      module: "scene",
      fileName: "scene-skill-run-package.json",
      createdAt: new Date().toISOString(),
      payload,
    });
  };

  const runDirectorSkill = () => {
    const payload = {
      skill: "$cishuashua-seedance-director-2-0",
      skill_path: DIRECTOR_SKILL_PATH,
      mode: "seedance-director-2.0",
      input_file: fileName || "未上传文件",
      source_files: [
        `${DIRECTOR_SKILL_PATH}/SKILL.md`,
        `${DIRECTOR_SKILL_PATH}/references/00-core-contract.md`,
        `${DIRECTOR_SKILL_PATH}/references/stage-review-protocol.md`,
        `${DIRECTOR_SKILL_PATH}/references/01-input-freeze.md`,
        `${DIRECTOR_SKILL_PATH}/references/02-meaning-and-scene.md`,
        `${DIRECTOR_SKILL_PATH}/references/03-style-selection.md`,
        `${DIRECTOR_SKILL_PATH}/references/04-story-and-intent.md`,
        `${DIRECTOR_SKILL_PATH}/references/05-dialogue-compiler.md`,
        `${DIRECTOR_SKILL_PATH}/references/06-performance-direction.md`,
        `${DIRECTOR_SKILL_PATH}/references/07-visual-spatial-compiler.md`,
        `${DIRECTOR_SKILL_PATH}/references/08-quality-repair.md`,
        `${DIRECTOR_SKILL_PATH}/references/09-final-renderer.md`,
      ],
      output_contract: {
        format: "xlsx_or_json",
        fields: [
          "word",
          "selected_style",
          "closed_dialogue_set",
          "performance_direction",
          "visual_spatial_compiler",
          "final_seedance_script",
          "qa_gates",
        ],
      },
      run_steps: [
        "单独回复：现在运行导演2.0",
        "输入冻结并锁定审阅模式",
        "锁定词义、源场景和语义主峰",
        "选择三十一风格库候选并确认风格",
        "编译三句封闭对白与口播时间窗",
        "导演表演、空间连续性和最终 Seedance 脚本",
        "通过质量修复与验证脚本",
      ],
      parsed_preview_available: rows.length > 0,
      preview_rows: rows.map((row) => ({
        ...row,
        duration: "5-8s",
        aspect_ratio: "9:16",
        status: "ready_to_compile",
      })),
    };

    setLastOutput({
      module: "director",
      fileName: "director-skill-run-package.json",
      createdAt: new Date().toISOString(),
      payload,
    });
  };

  const runPackaging = () => {
    const payload = {
      tool: "package_cishuashua_json.py",
      script_path: PACKAGE_SCRIPT_PATH,
      mode: "xlsx-to-word-json-zip",
      input_file: fileName || "未上传 Excel",
      required_columns: [
        "topicId",
        "word",
        "Meaning-each",
        "MeaningId",
        "例句",
        "例句音频",
        "例句翻译",
        "压缩后视频链接",
      ],
      optional_columns: ["视频poster"],
      preserves_from_sample_json: ["tagId", "componentName", "componentKey"],
      fills: [
        "attrs.topicId",
        "attrs.word",
        "attrs.meanId",
        "attrs.mean",
        "attrs.styles.<style>.videoId",
        "attrs.styles.<style>.videoSrc",
        "attrs.styles.<style>.videoPoster",
        "attrs.styles.<style>.example",
        "attrs.styles.<style>.exampleAudio",
        "attrs.styles.<style>.exampleTranslation",
      ],
      command_template:
        `python3 ${PACKAGE_SCRIPT_PATH} --xlsx <uploaded.xlsx> --out-dir outputs/cishuashua-json --zip outputs/cishuashua-json.zip --style default --continue-on-error`,
      configurable_args: {
        sample_json: "默认使用脚本内 DEFAULT_SAMPLE_JSON，可用 --sample-json 覆盖",
        sheet: "可选：--sheet <sheet_name>",
        start_index: "默认 1，表示跳过表头后的第一条数据",
        count: "可选：--count <n>",
        video_column: "默认 压缩后视频链接",
        poster_column: "默认 视频poster，缺失则置空",
        clean: "可选：--clean 清理输出目录",
      },
      operator_notes: compressText.trim() || "无额外备注",
    };

    setLastOutput({
      module: "compress",
      fileName: "cishuashua-json-package-run.json",
      createdAt: new Date().toISOString(),
      payload,
    });
  };

  const runCurrent = () => {
    if (activeModule === "scene") runSceneSkill();
    if (activeModule === "director") runDirectorSkill();
    if (activeModule === "compress") runPackaging();
  };

  return (
    <main className="min-h-screen bg-[#f6f3ec] text-[#1d2521]">
      <section className="border-b border-[#d7d0c3] bg-[#fbfaf6]">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7b5f3a]">
              Cishua Production Workbench
            </p>
            <h1 className="mt-3 text-3xl font-semibold leading-tight md:text-5xl">词刷刷 Skill 生产工作台</h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-[#5b6761]">
              一个给团队共用的最小入口：说明用法、上传表格、生成场景执行包、生成导演提示词执行包，
              并把成片表格打包成逐词 JSON Zip。Skill 更新后，团队只需要同步同一套项目文件。
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-5 py-5 lg:grid-cols-[310px_1fr]">
        <aside className="space-y-4">
          <Panel title="1. 选择你要做执行的操作">
            <div className="space-y-2">
              {modules.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveModule(item.id)}
                  className={`w-full rounded-lg border px-4 py-3 text-left transition ${
                    activeModule === item.id
                      ? "border-[#236f67] bg-[#236f67] text-white"
                      : "border-[#d7d0c3] bg-white text-[#27332e] hover:border-[#236f67]"
                  }`}
                >
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] opacity-75">{item.index}</span>
                  <span className="mt-1 block text-sm font-semibold">{item.title}</span>
                  <span className="mt-1 block text-xs opacity-80">{item.label}</span>
                  {activeModule === item.id ? (
                    <span className="mt-3 block border-t border-white/25 pt-3 text-xs leading-5 opacity-90">
                      {item.summary}
                      <br />
                      {item.usage.join(" ")}
                      <br />
                      输入：{item.inputs.join(" / ")}
                      <br />
                      输出：{item.outputs.join(" / ")}
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
          </Panel>

          <Panel title="2. 拖动你要上传的文件">
            <label className="flex cursor-pointer flex-col items-center rounded-lg border border-dashed border-[#a7a092] bg-[#fffdf8] px-4 py-6 text-center transition hover:border-[#236f67] hover:bg-white">
              <span className="text-sm font-semibold">上传 Excel / CSV / TSV / TXT</span>
              <span className="mt-2 text-xs leading-5 text-[#68716d]">
                场景和导演模块使用表格；JSON 打包模块主要使用 Excel，也可粘贴备注。
              </span>
              <input
                className="sr-only"
                type="file"
                accept=".xlsx,.xls,.csv,.tsv,.txt,.md"
                onChange={(event) => void handleFile(event.target.files?.[0])}
              />
            </label>
            {uploadedFile ? (
              <div className="mt-3 rounded-lg border border-[#d7d0c3] bg-[#f8f4eb] p-3">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-white text-lg font-semibold text-[#236f67]">
                    {uploadedFile.kind === "text" ? "T" : "X"}
                  </span>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-[#1d2521]">{uploadedFile.name}</div>
                    <div className="mt-1 text-xs leading-5 text-[#68716d]">
                      {formatFileSize(uploadedFile.size)} · {uploadedFile.parseStatus}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-3 rounded-md bg-[#eee8dc] px-3 py-2 text-sm leading-6 text-[#5f5749]">
                还没有上传文件。CSV/TSV 可在前端预览；Excel 会作为执行包输入传递给 skill。
              </div>
            )}
          </Panel>

          {uploadedFile ? (
            <Panel title={rows.length > 0 ? "真实解析预览" : "文件已就绪"}>
              {rows.length > 0 ? (
                <div className="space-y-2">
                  {rows.slice(0, 5).map((row) => (
                    <div key={`${row.bookname}-${row.word}`} className="rounded-md border border-[#e2dbcf] bg-white p-3">
                      <div className="font-semibold">{row.word}</div>
                      <div className="mt-1 text-xs text-[#6a746e]">{row.meaning}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm leading-6 text-[#5d6662]">
                  当前文件不会在前端展示假数据。运行后，执行包会把文件名和解析要求传给对应 skill。
                </p>
              )}
            </Panel>
          ) : null}
        </aside>

        <section className="space-y-4">
          <Panel title={`${active.index}. ${active.title}`} action={active.label}>
            {activeModule === "scene" ? <RunnerModule kind="scene" onRun={runCurrent} /> : null}
            {activeModule === "director" ? <RunnerModule kind="director" onRun={runCurrent} /> : null}
            {activeModule === "compress" ? (
              <PackagingModule value={compressText} onChange={setCompressText} onRun={runCurrent} />
            ) : null}
          </Panel>

          <Panel title="运行结果">
            {lastOutput ? (
              <div className="grid gap-4 xl:grid-cols-[1fr_220px]">
                <pre className="max-h-[420px] overflow-auto rounded-lg bg-[#1f2825] p-4 text-xs leading-5 text-[#eaf2ee]">
                  {JSON.stringify(lastOutput.payload, null, 2)}
                </pre>
                <div className="rounded-lg border border-[#d7d0c3] bg-[#fffdf8] p-4">
                  <h3 className="text-sm font-semibold">可下载文件</h3>
                  <p className="mt-2 text-sm leading-6 text-[#5d6662]">{lastOutput.fileName}</p>
                  <button
                    onClick={() => downloadJson(lastOutput)}
                    className="mt-4 w-full rounded-lg bg-[#236f67] px-4 py-3 text-sm font-semibold text-white hover:bg-[#1b5a54]"
                  >
                    下载 JSON
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm leading-6 text-[#5d6662]">运行任一模块后，这里会显示结果预览和下载按钮。</p>
            )}
          </Panel>
        </section>
      </section>
    </main>
  );
}

function RunnerModule({ kind, onRun }: { kind: "scene" | "director"; onRun: () => void }) {
  const isScene = kind === "scene";

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_280px]">
      <div>
        <p className="text-base leading-7 text-[#4f5b55]">
          {isScene
            ? `上传词表后，工作台会生成交给 $cishua-content-agency 的执行包。Skill 路径：${SCENE_SKILL_PATH}`
            : `上传包含例句和场景脚本的表格后，工作台会生成交给 $cishuashua-seedance-director-2-0 的执行包。Skill 路径：${DIRECTOR_SKILL_PATH}`}
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <InfoBlock
            title="输入"
            items={
              isScene
                ? ["Bookname", "word", "Meaning-each", "可选：常见搭配、辅助梗、目标难度"]
                : ["word", "Meaning-each", "example_sentence", "scene idea / existing script", "可选：reference audio / feedback"]
            }
          />
          <InfoBlock
            title="输出"
            items={
              isScene
                ? ["3 candidate plans", "example_sentence", "example_translation", "scene_script", "qa_notes"]
                : ["selected_style", "closed_dialogue_set", "performance_direction", "final_seedance_script", "qa_gates"]
            }
          />
        </div>
      </div>
      <div className="rounded-lg border border-[#d7d0c3] bg-[#fffdf8] p-4">
        <h3 className="text-sm font-semibold">批处理控制</h3>
        <p className="mt-2 text-sm leading-6 text-[#5d6662]">
          先生成标准执行包，确认字段后再接真实运行。这个包可以给 Codex 新窗口直接使用。
        </p>
        <button
          onClick={onRun}
          className="mt-4 w-full rounded-lg bg-[#236f67] px-4 py-3 text-sm font-semibold text-white hover:bg-[#1b5a54]"
        >
          运行并生成下载包
        </button>
      </div>
    </div>
  );
}

function PackagingModule({
  value,
  onChange,
  onRun,
}: {
  value: string;
  onChange: (value: string) => void;
  onRun: () => void;
}) {
  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_280px]">
      <div>
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="可选：粘贴本次打包备注，例如 sheet 名、style 名、视频链接列名、是否 continue-on-error..."
          className="min-h-[320px] w-full resize-y rounded-lg border border-[#d7d0c3] bg-[#fffdf8] p-4 text-sm leading-6 outline-none focus:border-[#236f67]"
        />
      </div>
      <div className="rounded-lg border border-[#d7d0c3] bg-[#fffdf8] p-4">
        <h3 className="text-sm font-semibold">打包目标</h3>
        <p className="mt-2 text-sm leading-6 text-[#5d6662]">
          根据 Excel 行生成逐词 JSON 文件和 zip。脚本路径：{PACKAGE_SCRIPT_PATH}
        </p>
        <button
          onClick={onRun}
          className="mt-4 w-full rounded-lg bg-[#236f67] px-4 py-3 text-sm font-semibold text-white hover:bg-[#1b5a54]"
        >
          生成打包执行包
        </button>
      </div>
    </div>
  );
}

function InfoBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-lg border border-[#d7d0c3] bg-[#fffdf8] p-4">
      <h3 className="text-sm font-semibold">{title}</h3>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-sm leading-6 text-[#53605a]">
            <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#236f67]" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Panel({
  title,
  action,
  children,
}: {
  title: string;
  action?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-[#d7d0c3] bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold">{title}</h2>
        {action ? (
          <span className="rounded-md bg-[#eee8dc] px-2.5 py-1 text-xs font-semibold text-[#665843]">
            {action}
          </span>
        ) : null}
      </div>
      {children}
    </section>
  );
}
