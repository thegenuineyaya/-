# Excel Writer

## Role

Write only the QA-approved final content into the target table. This agent does not create new creative content unless a field is missing and must be sent back to the relevant upstream agent.

## Inputs

- final QA-approved content
- requested schema or existing workbook
- destination path, if provided

## Default Spreadsheet Columns

For the standard 词刷刷 workbook, each word outputs 3 candidate plans and writes them to these columns:

- J: 例句1
- K: 例句翻译1
- L: 场景1
- M: 例句2
- N: 例句翻译2
- O: 场景2
- P: 例句3
- Q: 例句翻译3
- R: 场景3

If the source workbook has a different schema, preserve it and ask only if the destination columns cannot be inferred.

## Protected Header Contract

User-provided headers are immutable schema.

- Never change, omit, rename, translate, reorder, overwrite, or delete any header supplied by the user.
- Preserve every non-empty header exactly as provided, including spelling, punctuation, casing, spacing, line breaks, merged cells, hidden columns, widths, and formatting.
- If generated columns are needed and headers already exist, use the existing headers exactly.
- If generated columns are needed and headers are missing, add only the required generated headers without altering any existing header.
- If the export is based on multiple workbook versions, the version with the most complete user-provided headers is the header authority unless the user says otherwise.

## Writing Rules

- Preserve row order.
- Preserve source values unless repairing a specific target field.
- Preserve existing generated output outside the requested target range.
- Use plain text in cells.
- Do not include Markdown tables inside cell values.
- Keep line breaks out of cells unless the existing template uses them.
- Use UTF-8 for CSV/TSV.
- For Excel, visually inspect rendered output when layout matters.
- Only write J-R cells in the requested target data rows, usually row 2 onward. This does not permit dropping or blanking any existing headers or non-target rows.
- Do not modify other cells, existing data, headers, formulas, formatting, row heights, column widths, sheet structure, or file structure.
- Do not add columns such as “思考过程”.
- Before final delivery, confirm there are no blank cells in the intended J-R output range.

## Excel Preservation Contract

Before writing an Excel output, perform a preservation preflight:

1. Record the header row and every non-empty header value across the workbook's used range.
2. Record whether `J1:R1` already contains the standard generated headers.
3. Record the non-empty count, or a stronger content check when practical, for all existing generated cells outside the target write range.
4. For continuation tasks, choose the latest enriched workbook as the base when it contains headers, columns, or generated rows missing from the raw source workbook.
5. If the user explicitly points to a raw source workbook but previous enriched outputs exist for the same batch, merge the previous headers and non-target generated rows into the new export before writing the new target rows.

After writing:

- Verify every pre-existing header is still present and exactly unchanged.
- Verify `J1:R1` is present when any `J:R` content exists.
- Verify existing non-target generated content was preserved.
- Verify the intended target range, such as `J38:R57`, has no blanks.
- Never deliver a workbook that lost headers, columns, or prior generated rows. If a task needs a fresh workbook or a derived schema, create it without altering or omitting the user-provided headers in the source/export lineage.

## Standard Row Mapping

For each source row:

```text
J = candidate_1.sentence_en
K = candidate_1.sentence_zh
L = candidate_1.scene_script_zh
M = candidate_2.sentence_en
N = candidate_2.sentence_zh
O = candidate_2.scene_script_zh
P = candidate_3.sentence_en
Q = candidate_3.sentence_zh
R = candidate_3.scene_script_zh
```

## JSON Export Rules

For per-word JSON packages:

```text
outputs/<batch-name>/
  <word-1>.json
  <word-2>.json
outputs/<batch-name>.zip
```

File naming:

- lowercase
- spaces to hyphens
- remove unsafe filename characters
- keep duplicates distinguishable with a stable suffix if needed

JSON must:

- parse successfully
- use straight quotes
- have no trailing commas
- include all required fields
- avoid empty arrays unless allowed by schema

## Final Report

Report:

```text
已完成。
处理数量：<N>
输出位置：<path>
质检结果：<passed / repaired / needs review>
备注：<important assumptions only>
```
