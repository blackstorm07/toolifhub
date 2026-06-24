'use client';

import { useState } from 'react';
import { Copy, Check, RefreshCw } from 'lucide-react';
import { copyToClipboard } from '@/lib/utils';
import { trackToolUsage } from '@/lib/analytics';
import toast from 'react-hot-toast';

const LOREM_WORDS = 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip commodo consequat duis aute irure reprehenderit voluptate velit esse cillum fugiat nulla pariatur excepteur sint occaecat cupidatat proident sunt culpa qui officia deserunt mollit anim laborum'.split(' ');

function getWords(count) {
  const result = [];
  for (let i = 0; i < count; i++) result.push(LOREM_WORDS[i % LOREM_WORDS.length]);
  return result;
}

function generateLoremSentence(wordCount = 8) {
  const words = getWords(wordCount);
  words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
  return words.join(' ') + '.';
}

function generateLoremParagraph(sentenceCount = 5) {
  return Array.from({ length: sentenceCount }, () => generateLoremSentence(Math.floor(Math.random() * 8) + 6)).join(' ');
}

export default function LoremIpsumGenerator() {
  const [type, setType] = useState('paragraphs');
  const [count, setCount] = useState(3);
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);

  const generate = () => {
    trackToolUsage('lorem-ipsum-generator', 'Lorem Ipsum Generator');
    let result = '';
    if (type === 'words') result = getWords(count).join(' ');
    else if (type === 'sentences') result = Array.from({ length: count }, () => generateLoremSentence()).join(' ');
    else result = Array.from({ length: count }, () => generateLoremParagraph()).join('\n\n');
    setOutput(result);
    toast.success('Lorem ipsum generated!');
  };

  const copy = async () => {
    await copyToClipboard(output);
    setCopied(true);
    toast.success('Copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm font-medium mb-1.5">Generate</label>
          <input type="number" value={count} onChange={e => setCount(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))} min="1" max="100"
            className="w-24 h-11 px-4 rounded-xl border border-border bg-background focus:outline-none focus:border-brand-500 text-center font-mono" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Type</label>
          <div className="flex rounded-xl border border-border overflow-hidden">
            {['words', 'sentences', 'paragraphs'].map(t => (
              <button key={t} onClick={() => setType(t)}
                className={`px-4 py-2.5 text-sm font-medium capitalize transition-colors ${type === t ? 'bg-brand-500 text-white' : 'hover:bg-muted text-muted-foreground'}`}>
                {t}
              </button>
            ))}
          </div>
        </div>
        <button onClick={generate} className="flex items-center gap-2 px-6 h-11 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-colors">
          <RefreshCw className="w-4 h-4" /> Generate
        </button>
      </div>

      {output && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{output.split(/\s+/).length} words</span>
            <button onClick={copy} className="flex items-center gap-2 px-4 py-2 bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 text-sm font-medium rounded-xl hover:bg-brand-100 transition-colors">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <div className="p-5 bg-muted/30 border border-border rounded-xl text-sm leading-relaxed whitespace-pre-wrap">{output}</div>
        </div>
      )}
    </div>
  );
}
