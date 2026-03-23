#!/usr/bin/env node
/**
 * Blog Index Generator for Website48
 *
 * Scans all .html article files in the blog/ folder,
 * extracts metadata from <meta> tags and <title>,
 * and regenerates index.html with all articles sorted newest-first.
 *
 * Usage: node blog/build-index.js
 */

const fs = require('fs');
const path = require('path');

const BLOG_DIR = __dirname;
const INDEX_FILE = path.join(BLOG_DIR, 'index.html');

function extractMeta(html, property) {
  // Match content="..." using double quotes only (avoids apostrophe issues in content)
  const propMatch = html.match(new RegExp(`<meta\\s+property="${property}"\\s+content="([^"]+)"`, 'i'));
  if (propMatch) return propMatch[1];
  const nameMatch = html.match(new RegExp(`<meta\\s+name="${property}"\\s+content="([^"]+)"`, 'i'));
  if (nameMatch) return nameMatch[1];
  const revMatch = html.match(new RegExp(`<meta\\s+content="([^"]+)"\\s+property="${property}"`, 'i'));
  if (revMatch) return revMatch[1];
  return null;
}

function extractTitle(html) {
  const match = html.match(/<title>([^<]+)<\/title>/i);
  if (!match) return null;
  // Strip " | Website48" suffix
  return match[1].replace(/\s*\|\s*Website48$/i, '').trim();
}

function extractSchemaDate(html) {
  const match = html.match(/"datePublished"\s*:\s*"(\d{4}-\d{2}-\d{2})"/);
  return match ? match[1] : null;
}

function extractTag(html) {
  // Look for the article-tag div in the article's own "related articles" or hero section
  const match = html.match(/<div class="article-tag">([^<]+)<\/div>/);
  return match ? match[1].trim() : 'Article';
}

function extractReadTime(html) {
  const match = html.match(/(\d+)\s*min\s*read/i);
  return match ? `${match[1]} min read` : '5 min read';
}

function formatDate(dateStr) {
  if (!dateStr) return 'Mar 2026';
  const d = new Date(dateStr + 'T00:00:00');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[d.getMonth()]} ${d.getFullYear()}`;
}

function escapeHtml(str) {
  // First decode any existing HTML entities, then re-encode
  const decoded = str.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'").replace(/&quot;/g, '"');
  return decoded.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Scan for article files
const files = fs.readdirSync(BLOG_DIR)
  .filter(f => f.endsWith('.html') && f !== 'index.html')
  .sort();

const articles = [];

for (const file of files) {
  const html = fs.readFileSync(path.join(BLOG_DIR, file), 'utf8');
  const title = extractTitle(html) || file.replace('.html', '').replace(/-/g, ' ');
  const description = extractMeta(html, 'description') || extractMeta(html, 'og:description') || '';
  const date = extractSchemaDate(html);
  const tag = extractTag(html);
  const readTime = extractReadTime(html);

  articles.push({ file, title, description, date, tag, readTime });
}

// Sort newest first (by date, then alphabetically)
articles.sort((a, b) => {
  if (a.date && b.date) return b.date.localeCompare(a.date);
  if (a.date) return -1;
  if (b.date) return 1;
  return a.title.localeCompare(b.title);
});

// Generate article cards HTML
const cardsHtml = articles.map(a => `
        <article class="article-card">
          <div class="article-tag">${escapeHtml(a.tag)}</div>
          <h2 class="article-title"><a href="${a.file}">${escapeHtml(a.title)}</a></h2>
          <p class="article-excerpt">${escapeHtml(a.description)}</p>
          <div class="article-meta">
            <span>${a.readTime}</span>
            <span>${formatDate(a.date)}</span>
          </div>
        </article>`).join('\n');

// Build full index.html
const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Blog — Website48 | Web Design Tips for Singapore SMEs</title>
  <meta name="description" content="Web design tips, pricing guides, and business advice for Singapore SMEs. Learn how to get your business online affordably.">
  <meta name="keywords" content="web design blog Singapore, website tips SME, Singapore business website guide, affordable web design tips">
  <link rel="canonical" href="https://website48.com/blog/">
  <meta name="geo.region" content="SG">
  <meta name="geo.placename" content="Singapore">
  <meta property="og:title" content="Website48 Blog — Web Design Tips for Singapore SMEs">
  <meta property="og:description" content="Web design tips, pricing guides, and business advice for Singapore SMEs.">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="en_SG">
  <meta property="og:site_name" content="Website48">
  <meta property="og:url" content="https://website48.com/blog/">
  <meta property="og:image" content="https://website48.com/assets/og-image.png">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Website48 Blog — Web Design Tips for Singapore SMEs">
  <meta name="twitter:description" content="Web design tips, pricing guides, and business advice for Singapore SMEs.">
  <meta name="twitter:image" content="https://website48.com/assets/og-image.png">
  <link rel="icon" type="image/svg+xml" href="../assets/favicon.svg">

  <!-- Meta Pixel -->
  <script>
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', '1235043381968190');
  fbq('track', 'PageView');
  </script>
  <noscript><img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=1235043381968190&ev=PageView&noscript=1"/></noscript>

  <!-- Google Analytics GA4 -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-VD9R457CJ4"></script>
  <script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-VD9R457CJ4');
  </script>

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    :root {
      --color-primary: #6366f1;
      --color-secondary: #06b6d4;
      --gradient-accent: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
      --color-bg: #0a0a0f;
      --color-bg-card: rgba(255,255,255,0.05);
      --color-border: rgba(255,255,255,0.1);
      --color-border-hover: rgba(255,255,255,0.18);
      --color-text: #ffffff;
      --color-text-secondary: #a1a1aa;
      --color-text-muted: #71717a;
      --glass-border: 1px solid var(--color-border);
      --glass-radius: 16px;
      --transition: 0.3s ease;
      --font-family: 'Inter', system-ui, -apple-system, sans-serif;
    }
    *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
    html { scroll-behavior:smooth; }
    body { font-family:var(--font-family); background:var(--color-bg); color:var(--color-text); line-height:1.6; -webkit-font-smoothing:antialiased; }
    a { text-decoration:none; color:inherit; }

    .nav { position:fixed; top:0; left:0; right:0; z-index:100; padding:20px 0; background:rgba(10,10,15,0.9); backdrop-filter:blur(12px); border-bottom:1px solid rgba(255,255,255,0.05); }
    .nav .container { max-width:1200px; margin:0 auto; padding:0 20px; display:flex; justify-content:space-between; align-items:center; }
    .nav-logo { font-weight:800; font-size:1.25rem; }
    .nav-logo span { background:var(--gradient-accent); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
    .nav-back { color:var(--color-text-secondary); font-size:0.875rem; transition:color var(--transition); }
    .nav-back:hover { color:#fff; }

    .hero { padding:140px 20px 60px; text-align:center; }
    .hero-tag { display:inline-block; font-size:0.75rem; font-weight:600; text-transform:uppercase; letter-spacing:2px; color:var(--color-secondary); margin-bottom:16px; }
    .hero h1 { font-size:clamp(2rem,5vw,3rem); font-weight:900; line-height:1.1; margin-bottom:16px; }
    .hero p { color:var(--color-text-secondary); font-size:1.1rem; max-width:560px; margin:0 auto; }

    .container { max-width:900px; margin:0 auto; padding:0 20px; }

    .articles { padding:40px 0 80px; }
    .articles-grid { display:flex; flex-direction:column; gap:24px; }

    .article-card { position:relative; background:var(--color-bg-card); border:var(--glass-border); border-radius:var(--glass-radius); padding:32px; transition:border-color var(--transition), transform var(--transition); cursor:pointer; }
    .article-card:hover { border-color:var(--color-border-hover); transform:translateY(-2px); }
    .article-tag { display:inline-block; font-size:0.7rem; font-weight:600; text-transform:uppercase; letter-spacing:1.5px; color:var(--color-secondary); margin-bottom:12px; }
    .article-title { font-size:1.35rem; font-weight:700; margin-bottom:12px; line-height:1.3; }
    .article-title a { transition:color var(--transition); }
    .article-title a::after { content:''; position:absolute; inset:0; z-index:1; }
    .article-title a:hover { color:var(--color-secondary); }
    .article-excerpt { color:var(--color-text-secondary); font-size:0.95rem; margin-bottom:16px; line-height:1.7; }
    .article-meta { display:flex; gap:16px; font-size:0.8rem; color:var(--color-text-muted); }

    .footer { padding:40px 20px; text-align:center; border-top:1px solid rgba(255,255,255,0.05); color:var(--color-text-muted); font-size:0.8rem; }
    .footer a { color:var(--color-text-secondary); transition:color var(--transition); }
    .footer a:hover { color:#fff; }

    @media(max-width:600px) {
      .article-card { padding:24px; }
      .article-title { font-size:1.15rem; }
    }
  </style>
</head>
<body>

  <nav class="nav">
    <div class="container">
      <a href="../index.html" class="nav-logo">Website<span>48</span></a>
      <a href="../index.html" class="nav-back">&larr; Back to Home</a>
    </div>
  </nav>

  <section class="hero">
    <div class="hero-tag">Blog</div>
    <h1>Web Design Tips for Singapore SMEs</h1>
    <p>Practical advice on getting your business online — from pricing to DIY vs professional, and everything in between.</p>
  </section>

  <section class="articles">
    <div class="container">
      <div class="articles-grid">
${cardsHtml}
      </div>
    </div>
  </section>

  <footer class="footer">
    <p>&copy; ${new Date().getFullYear()} Website48. All rights reserved. &middot; <a href="../index.html">Home</a> &middot; <a href="../pricing.html">Pricing</a></p>
  </footer>

</body>
</html>
`;

fs.writeFileSync(INDEX_FILE, indexHtml);
console.log(`Blog index rebuilt with ${articles.length} articles:`);
articles.forEach((a, i) => console.log(`  ${i + 1}. ${a.title} (${a.tag}, ${formatDate(a.date)})`));
