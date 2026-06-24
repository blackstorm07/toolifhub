/**
 * Generate rich SEO content sections for tool pages.
 * Uses stored seoContent when available; otherwise builds from tool metadata.
 */

const FEATURE_TEMPLATES = [
  '100% free with no sign-up or account required',
  'Runs entirely in your browser — your data never leaves your device',
  'Works on desktop, tablet, and mobile devices',
  'Instant results with no waiting or processing delays',
  'Clean, intuitive interface designed for speed and ease of use',
  'No software installation or plugin downloads needed',
];

const BENEFIT_TEMPLATES = [
  'Save hours of manual work with automated processing',
  'Improve accuracy and eliminate human error',
  'Boost productivity without paying for expensive software',
  'Access professional-grade functionality at zero cost',
  'Perfect for students, professionals, freelancers, and businesses',
  'Use alongside other ToolifHub tools for a complete workflow',
];

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function generateToolSeoContent(tool, categoryName = 'Online Tools') {
  if (tool.seoContent?.features?.length) {
    return tool.seoContent;
  }

  const name = tool.title;
  const topic = tool.keywords?.[0] || name.toLowerCase();
  const category = categoryName || 'online tools';

  return {
    overview: `${name} is a free, browser-based ${category.toLowerCase().replace(/s$/, '')} utility available on ToolifHub. ${tool.shortDescription} Whether you're a beginner or a seasoned professional, this tool gives you fast, reliable results without any registration, download, or hidden fees. ToolifHub hosts hundreds of free online tools across YouTube, SEO, development, AI, productivity, and more — all designed to help you work smarter and faster.`,
    features: [
      `Purpose-built for ${topic} tasks with optimized algorithms`,
      ...FEATURE_TEMPLATES.slice(0, 4),
      `Part of ToolifHub's curated ${category} collection`,
    ],
    benefits: [
      `Streamline your ${topic} workflow in seconds instead of minutes`,
      ...BENEFIT_TEMPLATES.slice(0, 5),
    ],
    howToUse: [
      `Navigate to the ${name} page on ToolifHub`,
      'Enter or paste your input data into the tool interface',
      'Configure any available options or settings for your use case',
      'Click the action button to process your input instantly',
      'Review the results and copy, download, or use them directly',
      'Explore related tools in the same category for additional functionality',
    ],
    useCases: [
      {
        title: 'Content Creators & YouTubers',
        description: `Use ${name} to optimize your content workflow, improve discoverability, and save time on repetitive ${topic} tasks.`,
      },
      {
        title: 'Digital Marketers & SEO Professionals',
        description: `Leverage ${name} as part of your marketing toolkit to analyze, generate, and optimize ${topic} elements for better campaign performance.`,
      },
      {
        title: 'Developers & Technical Users',
        description: `Integrate ${name} into your development workflow for quick ${topic} processing without leaving the browser or installing dependencies.`,
      },
      {
        title: 'Students & Educators',
        description: `Access ${name} for free classroom projects, assignments, and learning exercises related to ${topic}.`,
      },
      {
        title: 'Small Business Owners',
        description: `Reduce operational costs by using ${name} instead of paid alternatives for everyday ${topic} needs.`,
      },
    ],
    faq: tool.faq?.length
      ? tool.faq
      : [
          {
            question: `Is ${name} really free?`,
            answer: `Yes, ${name} is completely free to use on ToolifHub. There are no hidden fees, subscriptions, or usage limits. Simply open the tool in your browser and start using it immediately.`,
          },
          {
            question: `Do I need to create an account to use ${name}?`,
            answer: `No account or sign-up is required. ToolifHub believes in frictionless access to useful tools. Your data is processed locally in your browser whenever possible.`,
          },
          {
            question: `Is my data safe when using ${name}?`,
            answer: `ToolifHub prioritizes user privacy. Most tools process data client-side in your browser, meaning your input is not sent to external servers. Always review the specific tool's behavior for details.`,
          },
          {
            question: `Can I use ${name} on mobile devices?`,
            answer: `Yes, ${name} is fully responsive and works on smartphones, tablets, and desktop computers with any modern web browser.`,
          },
          {
            question: `What other tools are similar to ${name}?`,
            answer: `Browse the ${category} category on ToolifHub to discover related tools that complement ${name}. Many users combine multiple ToolifHub tools for a complete workflow.`,
          },
        ],
  };
}

export function countWords(htmlOrText = '') {
  const text = htmlOrText.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  return text ? text.split(' ').length : 0;
}

export function estimateToolPageWordCount(tool, categoryName) {
  const content = generateToolSeoContent(tool, categoryName);
  let total = countWords(content.overview);
  total += content.features.join(' ').split(' ').length;
  total += content.benefits.join(' ').split(' ').length;
  total += content.howToUse.join(' ').split(' ').length;
  content.useCases.forEach((uc) => {
    total += countWords(uc.title + ' ' + uc.description);
  });
  content.faq.forEach((f) => {
    total += countWords(f.question + ' ' + f.answer);
  });
  total += countWords(tool.fullDescription || '');
  total += countWords(tool.shortDescription || '');
  return total;
}
