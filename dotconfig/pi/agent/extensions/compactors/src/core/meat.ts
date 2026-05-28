import type { Message } from "@mariozechner/pi-ai";
import type { NormalizedBlock } from "../types";
import { normalize } from "./normalize";
import { filterNoise } from "./filter-noise";
import { redact } from "./redact";

export interface CompileMeatInput {
  messages: Message[];
  previousSummary?: string;
}

type Header = "[user]" | "[assistant]";

interface Section {
  header: Header;
  lines: string[];
  sourceIndex?: number;
}

const SEPARATOR = "\n\n---\n\n";
const TOOL_LINE_RE = /^\* [A-Za-z][\w-]*(?:\s+"[^"]*")?(?:\s+\(#\d+(?:, #\d+)*\))?(?: x\d+)?$/;
const REF_SUFFIX_RE = /\s+\(#\d+\)$/;

const trimSectionLines = (lines: string[]): string[] => {
  const trimmed = [...lines];
  while (trimmed.length > 0 && !trimmed[0].trim()) trimmed.shift();
  while (trimmed.length > 0 && !trimmed[trimmed.length - 1].trim()) trimmed.pop();
  return trimmed;
};

const pushSection = (sections: Section[], header: Header, lines: string[], sourceIndex?: number) => {
  const cleaned = trimSectionLines(lines);
  if (cleaned.length === 0) return;

  sections.push({ header, lines: cleaned, sourceIndex });
};

const stringifySections = (sections: Section[]): string =>
  sections
    .map((section) => `${section.header}\n${section.lines.join("\n")}`)
    .join("\n\n");

const buildMeatSections = (blocks: NormalizedBlock[]): Section[] => {
  const sections: Section[] = [];

  for (const block of blocks) {
    if (block.kind !== "user" && block.kind !== "assistant") continue;
    if (!block.text.trim()) continue;

    const header = block.kind === "user" ? "[user]" : "[assistant]";
    const cleaned = trimSectionLines([block.text]);
    if (cleaned.length === 0) continue;

    const last = sections[sections.length - 1];
    if (last?.header === header && last.sourceIndex === block.sourceIndex) {
      last.lines.push(...cleaned);
      continue;
    }

    pushSection(sections, header, cleaned, block.sourceIndex);
  }

  return sections;
};

export const extractMeatTranscript = (text: string): string => {
  if (!text.trim()) return "";

  const separatorIdx = text.indexOf(SEPARATOR);
  const candidate = (separatorIdx >= 0 ? text.slice(separatorIdx + SEPARATOR.length) : text).trim();
  if (!candidate) return "";

  const sections: Section[] = [];
  let currentHeader: Header | null = null;
  let currentLines: string[] = [];

  const flush = () => {
    if (!currentHeader) {
      currentLines = [];
      return;
    }
    pushSection(sections, currentHeader, currentLines);
    currentLines = [];
  };

  for (const line of candidate.split("\n")) {
    const trimmed = line.trim();

    if (trimmed === "[user]" || trimmed === "[assistant]") {
      flush();
      currentHeader = trimmed;
      continue;
    }

    if (/^\[[^\]]+\]/.test(trimmed)) {
      flush();
      currentHeader = null;
      continue;
    }

    if (!currentHeader) continue;
    if (currentHeader === "[assistant]" && TOOL_LINE_RE.test(trimmed)) continue;

    currentLines.push(line.replace(REF_SUFFIX_RE, ""));
  }

  flush();
  return stringifySections(sections);
};

const mergeMeat = (previousSummary: string | undefined, fresh: string): string => {
  const previous = previousSummary ? extractMeatTranscript(previousSummary) : "";
  if (!previous) return fresh;
  if (!fresh) return previous;
  return `${previous}\n\n${fresh}`;
};

export const compileMeat = (input: CompileMeatInput): string => {
  const blocks = filterNoise(normalize(input.messages));
  const fresh = stringifySections(buildMeatSections(blocks));
  return redact(mergeMeat(input.previousSummary, fresh));
};
