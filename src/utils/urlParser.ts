import { Platform } from '../types/problem';

/**
 * Detect platform from URL
 */
export function detectPlatform(url: string): Platform {
  const lower = url.toLowerCase().trim();
  if (lower.includes('leetcode.com')) return 'leetcode';
  if (lower.includes('neetcode.io')) return 'neetcode';
  if (lower.includes('geeksforgeeks.org')) return 'gfg';
  if (lower.includes('codeforces.com')) return 'codeforces';
  if (lower.includes('hackerrank.com')) return 'hackerrank';
  return 'other';
}

/**
 * Convert a kebab-case or snake-case slug into Title Case
 * e.g., "trapping-rain-water" -> "Trapping Rain Water"
 * e.g., "lru-cache" -> "LRU Cache"
 */
export function formatSlugToTitle(slug: string): string {
  // Common DSA abbreviations that should stay uppercase
  const abbreviations: Record<string, string> = {
    lru: 'LRU',
    lfu: 'LFU',
    bst: 'BST',
    bfs: 'BFS',
    dfs: 'DFS',
    dp: 'DP',
    ll: 'LL',
    kth: 'Kth',
    ii: 'II',
    iii: 'III',
    iv: 'IV',
    v: 'V',
    vi: 'VI',
    vii: 'VII',
    viii: 'VIII',
  };

  return slug
    .split(/[-_]+/)
    .filter(Boolean)
    .map((word) => {
      const lower = word.toLowerCase();
      if (abbreviations[lower]) {
        return abbreviations[lower];
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}

/**
 * Extract problem info from URL
 */
export function extractProblemInfoFromUrl(url: string): {
  platform: Platform;
  extractedTitle?: string;
  problemNumber?: string;
} {
  const cleanUrl = url.trim();
  const platform = detectPlatform(cleanUrl);

  try {
    const urlObj = new URL(cleanUrl);
    const pathname = urlObj.pathname;

    if (platform === 'leetcode') {
      // Format 1: /problems/lru-cache/description/
      // Format 2: /problems/lru-cache/
      const match = pathname.match(/\/problems\/([a-zA-Z0-9-]+)/);
      if (match && match[1]) {
        const slug = match[1];
        const formattedTitle = formatSlugToTitle(slug);
        return {
          platform,
          extractedTitle: formattedTitle,
        };
      }
    }

    if (platform === 'neetcode') {
      // Format: /problems/two-integer-sum
      const match = pathname.match(/\/problems\/([a-zA-Z0-9-]+)/);
      if (match && match[1]) {
        return {
          platform,
          extractedTitle: formatSlugToTitle(match[1]),
        };
      }
    }

    if (platform === 'gfg') {
      // Format: /problems/kadanes-algorithm-1587115620/1
      const parts = pathname.split('/').filter(Boolean);
      const probIndex = parts.indexOf('problems');
      if (probIndex !== -1 && parts[probIndex + 1]) {
        // Remove trailing number identifiers e.g. -1587115620
        const rawSlug = parts[probIndex + 1].replace(/-\d+$/, '');
        return {
          platform,
          extractedTitle: formatSlugToTitle(rawSlug),
        };
      }
    }

    if (platform === 'codeforces') {
      // Format: /problemset/problem/158/A or /contest/158/problem/A
      const probMatch = pathname.match(/problem(?:set\/problem)?\/(\d+)\/([A-Za-z0-9]+)/);
      if (probMatch) {
        return {
          platform,
          extractedTitle: `Problem ${probMatch[1]}${probMatch[2]}`,
          problemNumber: probMatch[1],
        };
      }
    }
  } catch {
    // Invalid URL structure, fallback to simple detection
  }

  return { platform };
}

/**
 * Platform meta: display name, colors, icon helper
 */
export const PLATFORM_CONFIG: Record<
  Platform,
  { name: string; color: string; bg: string; border: string }
> = {
  leetcode: {
    name: 'LeetCode',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
  },
  neetcode: {
    name: 'NeetCode',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
  },
  gfg: {
    name: 'GeeksforGeeks',
    color: 'text-green-500',
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
  },
  codeforces: {
    name: 'Codeforces',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
  },
  hackerrank: {
    name: 'HackerRank',
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
  },
  other: {
    name: 'Custom',
    color: 'text-zinc-400',
    bg: 'bg-zinc-800/40',
    border: 'border-zinc-700/30',
  },
};
