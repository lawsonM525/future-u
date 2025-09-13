export type StrengthItem = { title: string; description: string }
export type MilestoneItem = { title: string; details: string[] }
export type StrategyItem = { title: string; details: string[] }

export type ParsedReport = {
  visionParagraphs: string[]
  strengths: StrengthItem[]
  milestones: MilestoneItem[]
  strategies: StrategyItem[]
  outro?: string
}

function normalize(input: string): string {
  return input.replace(/\r\n?/g, '\n').trim()
}

function stripBullets(line: string): string {
  return line.replace(/^\s*[-•]\s+/, '').trim()
}

function isSectionHeader(line: string, pattern: RegExp): boolean {
  const cleaned = line.trim()
  return pattern.test(cleaned)
}

// Build permissive regexes that match optional markdown headings/bold and case differences
const visionRe = /^(?:##\s*)?(?:\*\*)?\s*vision\s*&\s*dream\s*state\s*(?:\*\*)?\s*$/i
const strengthsRe = /^(?:##\s*)?(?:\*\*)?\s*current\s*strengths?\s*&\s*talents?\s*(?:\*\*)?\s*$/i
const milestonesRe = /^(?:##\s*)?(?:\*\*)?\s*milestones\s*&\s*checkpoints(?:\s*\([^)]*\))?\s*(?:\*\*)?\s*$/i
const strategiesRe = /^(?:##\s*)?(?:\*\*)?\s*strategies\s*for\s*growth(?:\s*&\s*overcoming\s*obstacles)?\s*(?:\*\*)?\s*$/i

function findSectionRanges(lines: string[]): Record<string, { start: number; end: number }> {
  const idxs: { key: string; idx: number }[] = []
  lines.forEach((line, i) => {
    if (isSectionHeader(line, visionRe)) idxs.push({ key: 'vision', idx: i })
    if (isSectionHeader(line, strengthsRe)) idxs.push({ key: 'strengths', idx: i })
    if (isSectionHeader(line, milestonesRe)) idxs.push({ key: 'milestones', idx: i })
    if (isSectionHeader(line, strategiesRe)) idxs.push({ key: 'strategies', idx: i })
  })
  idxs.sort((a, b) => a.idx - b.idx)
  const ranges: Record<string, { start: number; end: number }> = {}
  for (let i = 0; i < idxs.length; i++) {
    const { key, idx } = idxs[i]
    const nextIdx = i + 1 < idxs.length ? idxs[i + 1].idx : lines.length
    ranges[key] = { start: idx + 1, end: nextIdx }
  }
  return ranges
}

function collectParagraphs(blockLines: string[]): string[] {
  const paras: string[] = []
  let buf: string[] = []
  const flush = () => {
    if (buf.length) {
      const para = buf.join(' ').replace(/\s+/g, ' ').trim()
      if (para) paras.push(para)
      buf = []
    }
  }
  for (const raw of blockLines) {
    const line = stripBullets(raw)
    if (!line.trim()) { flush(); continue }
    buf.push(line)
  }
  flush()
  return paras
}

function parseStrengths(blockLines: string[]): StrengthItem[] {
  const chunks = blockLines.join('\n').split(/\n\s*\n+/).map(s => s.trim()).filter(Boolean)
  const out: StrengthItem[] = []
  for (const chunk of chunks) {
    const lines = chunk.split(/\n+/).map(l => stripBullets(l))
    if (lines.length === 0) continue
    const title = lines[0].replace(/^"|"$/g, '').trim()
    const desc = lines.slice(1).join(' ').replace(/\s+/g, ' ').trim()
    if (title) out.push({ title, description: desc })
  }
  return out
}

function parseTitledList(blockLines: string[]): { title: string; details: string[] }[] {
  const items: { title: string; details: string[] }[] = []
  const lines = blockLines
  let i = 0
  while (i < lines.length) {
    // Skip blank lines
    while (i < lines.length && !lines[i].trim()) i++
    if (i >= lines.length) break

    // Title line is the next non-empty, non-bullet line
    let title = ''
    if (!/^\s*[-•]\s+/.test(lines[i]) && lines[i].trim()) {
      title = stripBullets(lines[i])
      i++
    }

    // Collect details until blank line or next title
    const details: string[] = []
    while (i < lines.length && lines[i].trim()) {
      const line = lines[i]
      if (/^\s*[-•]\s+/.test(line)) {
        details.push(stripBullets(line))
      } else {
        // Treat as paragraph continuation
        const last = details.length - 1
        if (last >= 0) details[last] = (details[last] + ' ' + line.trim()).replace(/\s+/g, ' ')
        else details.push(line.trim())
      }
      i++
    }
    if (title || details.length) items.push({ title: title.trim(), details: details.map(d => d.trim()).filter(Boolean) })
    // Skip blank line
    while (i < lines.length && !lines[i].trim()) i++
  }
  return items
}

export function parseReportContent(md: string): ParsedReport {
  const text = normalize(md)
  const lines = text.split('\n')
  const ranges = findSectionRanges(lines)

  const visionLines = lines.slice(ranges.vision?.start ?? 0, ranges.vision?.end ?? 0)
  const strengthsLines = lines.slice(ranges.strengths?.start ?? 0, ranges.strengths?.end ?? 0)
  const milestonesLines = lines.slice(ranges.milestones?.start ?? 0, ranges.milestones?.end ?? 0)
  const strategiesLines = lines.slice(ranges.strategies?.start ?? 0, ranges.strategies?.end ?? 0)

  // Collect paragraphs (no bullet points)
  const visionParagraphs = collectParagraphs(visionLines)
  const strengths = parseStrengths(strengthsLines)
  const milestones = parseTitledList(milestonesLines)
  const strategies = parseTitledList(strategiesLines)

  // Outro = anything after strategies block
  let outro: string | undefined
  if (ranges.strategies) {
    const tail = lines.slice(ranges.strategies.end).join('\n').trim()
    // Use the last non-empty paragraph as outro
    const tailParas = tail.split(/\n\s*\n+/).map(s => s.trim()).filter(Boolean)
    if (tailParas.length) outro = tailParas[tailParas.length - 1]
  }

  return { visionParagraphs, strengths, milestones, strategies, outro }
}
