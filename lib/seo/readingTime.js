export function calculateReadingTime(htmlOrText = '', wordsPerMinute = 200) {
  const text = htmlOrText.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const wordCount = text ? text.split(' ').length : 0;
  const minutes = Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  return { minutes, wordCount };
}

export function formatReadingTime(minutes) {
  return `${minutes} min read`;
}
