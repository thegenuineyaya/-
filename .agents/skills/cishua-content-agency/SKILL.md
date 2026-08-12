---
name: cishua-content-agency
description: Use this skill when producing, reviewing, repairing, or exporting 词刷刷 vocabulary-learning content at scale from word lists, screenshots, Excel/CSV/TSV files, JSON packages, or pasted table data. It orchestrates semantic analysis, cultural association, scene ideation, example sentences, short video scene scripts, QA editing, and spreadsheet-ready output.
---

# 词刷刷短视频内容生产 Agency

This skill turns vocabulary inputs into production-ready 词刷刷 short-video teaching content. Use it when the user asks to “按词刷刷流程跑”, “量产”, “生成场景例句”, “写短视频脚本”, “修 Excel/JSON”, or otherwise produce batch vocabulary content.

## Operating Mode

Default to batch production with checkpoints. If the user says “直接跑完”, “不用停”, “自动执行整套流程”, or gives an urgent/export-only request, complete the full workflow without pausing.

Keep the user-facing conversation short. Do not expose hidden thinking. Put only useful intermediate tables, QA notes, and output artifacts into files or messages.

## Core Workflow

1. Read [00-overview.md](references/00-overview.md) for product principles, quality bar, and fixed workflow.
2. Read [01-flow-orchestrator.md](references/01-flow-orchestrator.md) to lock inputs and choose the exact production path.
3. For each word, produce exactly 3 candidate plans unless the user requests otherwise. Run the agents in order:
   - [02-semantic-angle.md](references/02-semantic-angle.md)
   - [03-cultural-association.md](references/03-cultural-association.md)
   - [04-scene-ideation.md](references/04-scene-ideation.md)
   - [05-sentence-writer.md](references/05-sentence-writer.md)
   - [06-scene-script-writer.md](references/06-scene-script-writer.md)
   - [07-qa-scene-editor.md](references/07-qa-scene-editor.md)
   - [08-excel-writer.md](references/08-excel-writer.md)

## Checkpoints

For creative production, stop after scene ideation unless the user asked to run end to end. Show only a compact scene-direction preview: word, target meaning, 3 candidate scenes, and any uncertainty.

For repair, QA, or export tasks, do not stop after ideation. Run the smallest path needed to deliver the requested artifact.

## Non-Negotiables

- Preserve the target word sense from the source table. Do not drift to another part of speech or meaning.
- Treat `Meaning-each` as authoritative when present.
- Never change, omit, rename, overwrite, or delete any header provided by the user in a spreadsheet, CSV, TSV, pasted table, or existing output. Treat user-provided headers as a protected schema in every export.
- When continuing an existing workbook, preserve previously generated output and all headers. Do not switch to a raw source workbook as the export base if that would drop existing columns, headers, or generated content.
- Generate 3 candidates per word by default.
- The 3 candidates must differ in story situation, visual style, character type, memory mechanism, and sentence pattern.
- Prefer concrete, visual, everyday scenes over abstract teaching language.
- Do not write jokes first. Find the natural semantic field and real use case first, then add cultural motifs if helpful.
- English examples must sound natural to a native speaker and be easy for learners.
- Chinese translations must match the English sentence, not explain around it.
- Scene scripts must be executable, filmable, or usable for video generation.
- Avoid unsafe, explicit, hateful, illegal, medical, financial, or real-private-person content.
- Output must be easy to paste back into a spreadsheet or package into JSON.
