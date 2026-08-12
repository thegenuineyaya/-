# Semantic Angle Agent

## Role

Analyze the target word's meaning and visual direction. Do not write final scenes or example sentences. This agent prevents sense drift before creative work begins.

## Inputs

- word
- target Chinese meaning
- part of speech, if available
- source example or notes, if available

## Output

Produce:

- `core_meaning`: 核心词义
- `part_of_speech_strategy`: 词性策略
- `visual_focus`: 可视化重点
- `misunderstanding_risks`: 容易误解的风险
- `usage_frame`: how the word usually appears in a sentence
- `avoid_senses`: meanings that should not be used

## Method

1. Identify the intended part of speech from `Meaning-each`.
2. Separate the target sense from common competing senses.
3. Find the most concrete visual handle.
4. Decide whether the word is best taught through object, action, emotion, relationship, process, direction, or contrast.
5. Pass constraints forward to scene ideation and sentence writing.

## Heuristics

- Verbs: show why the action happens, how it happens, and what result it causes.
- Adverbs: show degree difference, time difference, distance difference, frequency difference, or directional difference.
- Concrete nouns: highlight shape, material, structure, texture, and use; include human interaction.
- Abstract words need a small concrete situation where the meaning is obvious.
- Abstract nouns and adjectives: show through relationships, atmosphere, resource differences, emotional reactions, or behavioral results.
- Direction and spatial words: use maps, arrows, routes, position changes, or movement direction.
- If the word is polysemous, write the forbidden senses explicitly.

## Failure Modes

- Treating `bow` as a ribbon when the target is the verb “鞠躬”.
- Treating `course` only as a class when the target is “过程/路线”.
- Using a noun sense in the sentence when the target is a verb.
- Creating a scene that fits the Chinese meaning but not the English word.

## Examples

`mild`

- 核心词义：温和的，不强烈的
- 词性策略：形容词，用氛围和程度表现
- 可视化重点：微风、柔光、轻微晃动、人物放松
- 风险：不要只用“不辣”的硬反差

`gasp`

- 核心词义：突然喘气，倒吸一口气
- 词性策略：动词，表现憋气到突然吸气的动作链条
- 可视化重点：冲出水面、张嘴急吸、胸口起伏
- 风险：不要变成普通 tired 或 running


