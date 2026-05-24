import type { Chapter } from '../types/knowledge';

const CHAPTER_TITLE_PATTERN =
  /^(?:\s*(?:第[零一二三四五六七八九十百千万\d]+[章节回卷集部]|Chapter\s+\d+|CHAPTER\s+\d+|\d+[、.．]\s*)[^\n\r]*)$/gim;

export async function parseTXT(file: File): Promise<Chapter[]> {
  const buffer = await readFileAsArrayBuffer(file);
  const text = decodeNovelText(buffer);
  return splitChaptersFromText(text);
}

export async function parseEPUB(): Promise<Chapter[]> {
  throw new Error('EPUB 解析暂未开放，请先导入 TXT 或 DOCX。');
}

export async function parseDOCX(file: File): Promise<Chapter[]> {
  const mammoth = await import('mammoth');
  const arrayBuffer = await readFileAsArrayBuffer(file);
  const result = await mammoth.extractRawText({ arrayBuffer });
  return splitChaptersFromText(result.value);
}

export async function parseFile(file: File): Promise<Chapter[]> {
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith('.txt')) {
    return parseTXT(file);
  }

  if (fileName.endsWith('.epub')) {
    return parseEPUB();
  }

  if (fileName.endsWith('.docx')) {
    return parseDOCX(file);
  }

  throw new Error('不支持该文件格式，请导入 TXT 或 DOCX。');
}

function splitChaptersFromText(text: string): Chapter[] {
  const normalizedText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
  if (!normalizedText) {
    return [];
  }

  const matches = Array.from(normalizedText.matchAll(CHAPTER_TITLE_PATTERN));
  if (matches.length === 0) {
    return splitByCharacterCount(normalizedText);
  }

  const chapters: Chapter[] = [];

  for (let index = 0; index < matches.length; index++) {
    const match = matches[index];
    const titleStart = match.index ?? 0;
    const title = match[0].trim();
    const contentStart = titleStart + match[0].length;
    const contentEnd = index < matches.length - 1 ? matches[index + 1].index ?? normalizedText.length : normalizedText.length;
    const content = normalizedText.slice(contentStart, contentEnd).trim();

    chapters.push({
      chapter_index: index + 1,
      title: title || `第${index + 1}章`,
      text: content,
      word_count: content.length,
    });
  }

  return chapters.filter(chapter => chapter.title || chapter.text);
}

function splitByCharacterCount(text: string, charsPerChapter = 3000): Chapter[] {
  const chapters: Chapter[] = [];

  for (let start = 0; start < text.length; start += charsPerChapter) {
    const content = text.slice(start, start + charsPerChapter).trim();
    if (!content) {
      continue;
    }

    chapters.push({
      chapter_index: chapters.length + 1,
      title: `第${chapters.length + 1}章`,
      text: content,
      word_count: content.length,
    });
  }

  return chapters;
}

function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = event => {
      const result = event.target?.result;
      if (result instanceof ArrayBuffer) {
        resolve(result);
      } else {
        reject(new Error('Failed to read DOCX file.'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsArrayBuffer(file);
  });
}

function decodeNovelText(buffer: ArrayBuffer): string {
  const candidates = [
    decodeWithEncoding(buffer, 'utf-8'),
    decodeWithEncoding(buffer, 'gb18030'),
  ];

  return candidates
    .map(text => ({
      text,
      score: scoreDecodedText(text),
    }))
    .sort((left, right) => right.score - left.score)[0].text;
}

function decodeWithEncoding(buffer: ArrayBuffer, encoding: string): string {
  try {
    return new TextDecoder(encoding).decode(buffer);
  } catch {
    return new TextDecoder('utf-8').decode(buffer);
  }
}

function scoreDecodedText(text: string): number {
  const replacementPenalty = (text.match(/\uFFFD/g) || []).length * 50;
  const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
  const chapterMarkers = (text.match(/第[零一二三四五六七八九十百千万\d]+[章节回卷集部]/g) || []).length;

  return chineseChars + chapterMarkers * 200 - replacementPenalty;
}
