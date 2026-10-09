import os, textwrap

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = "https://albertberthelsen.com"

ARROW_RIGHT = '<svg class="arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15M13.5 6.5 19 12l-5.5 5.5"/></svg>'
ARROW_LEFT = '<svg class="arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12H5M10.5 6.5 5 12l5.5 5.5"/></svg>'

def page(path, title, desc, body, home=False, wide=False):
    full_title = "Albert Berthelsen" if title is None else f"{title} · Albert Berthelsen"
    if home:
        topbar = ""
        canvas = '<canvas id="market" aria-hidden="true"></canvas>\n  '
        inner = textwrap.indent(textwrap.dedent(body).strip(), "    ")
        main_open, main_close = '<main class="hero">', "</main>"
    else:
        topbar = """<header class="topbar">
    <a class="brand" href="/">Albert <em>Berthelsen</em></a>
    <nav class="site-nav mono" aria-label="Main">
      <a href="/projects">Projects</a>
      <a href="/contact">Contact</a>
    </nav>
  </header>"""
        inner = ("  <div class=\"wrap wrap-wide\">\n" if wide else "  <div class=\"wrap\">\n") + textwrap.indent(textwrap.dedent(body).strip(), "      ") + "\n    </div>"
        main_open, main_close = "<main>", "</main>"
        canvas = ""
    canonical = SITE + ("/" if path == "" else "/" + path)
    html = f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{full_title}</title>
  <meta name="description" content="{desc}">
  <link rel="canonical" href="{canonical}">
  <meta property="og:title" content="{full_title}">
  <meta property="og:description" content="{desc}">
  <meta property="og:url" content="{canonical}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Albert Berthelsen">
  <meta property="og:image" content="{SITE}/og-portrait.jpg">
  <meta property="og:image:width" content="878">
  <meta property="og:image:height" content="1098">
  <meta property="og:image:alt" content="Hi, I\u2019m Albert. Finance student in Bergen.">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:image" content="{SITE}/og-portrait.jpg">
  <meta name="theme-color" content="#0c0e12">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="icon" href="/favicon-32.png" type="image/png" sizes="32x32">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT@0,9..144,100..900,0..100;1,9..144,100..900,0..100&family=JetBrains+Mono:wght@400&display=swap">
  <script>document.documentElement.classList.add("js");</script>
  <link rel="stylesheet" href="/css/style.css">
  <script defer src="/_vercel/insights/script.js"></script>
</head>
<body>
  {canvas}<div class="curtain" aria-hidden="true"><span class="curtain-label"></span></div>

  {topbar}

  {main_open}
  {inner}
  {main_close}

  <footer class="statusbar mono">
    <span class="foot-links"><a href="/contact">Contact</a><a href="https://www.linkedin.com/in/albert-berthelsen-7a202219b" target="_blank" rel="noopener">LinkedIn</a><a href="https://github.com/albertberthelsen" target="_blank" rel="noopener">GitHub</a></span>
    <span id="clock">Bergen</span>
  </footer>

  <script src="/js/main.js" defer></script>
</body>
</html>
"""
    # Draw arrows as SVG: some phones render the arrow characters as emoji.
    html = html.replace("&rarr;", ARROW_RIGHT).replace("&larr;", ARROW_LEFT)
    out = os.path.join(ROOT, path, "index.html") if path != "404" else os.path.join(ROOT, "404.html")
    os.makedirs(os.path.dirname(out), exist_ok=True)
    with open(out, "w") as f:
        f.write(html)

# ---------- Projects data ----------
projects = [
    dict(
        slug="anna-berthelsen",
        title="My mother&rsquo;s studio, online",
        meta="annaberthelsen.com &middot; 2026",
        summary="I built the website and online shop for my mother&rsquo;s art studio, and together we launched Print Club, a monthly print subscription.",
        facts=[("Client", "Anna Berthelsen, artist (my mother)"),
               ("Location", "Kristiansand, Norway"),
               ("Launched", "Print Club, October 2026"),
               ("Built with", "Lovable, Shopify"),
               ("Website", '<a class="ext" href="https://annaberthelsen.com/" target="_blank" rel="noopener">annaberthelsen.com</a>'),
               ("Print Club", '<a class="ext" href="https://annaberthelsen.com/print-club" target="_blank" rel="noopener">See the page</a>')],
        body="""
        <h2>Background</h2>
        <p>My mother, Anna Berthelsen, is an artist in Kristiansand. She makes lithographies, original works and bark boats, and exhibits along the Norwegian coast. She needed a place to sell her work online and tell the story behind it.</p>

        <h2>The website</h2>
        <p>I built annaberthelsen.com for her with Lovable, and set up the shop with Shopify. The site has a shop, a page about her, an overview of her exhibitions and a contact page. The design follows her work: calm, light and with plenty of room for the images.</p>

        <figure class="photo">
          <button class="photo-btn" type="button" aria-label="Show larger" data-lightbox="anna-home-full">
            <img src="/img/anna-home.jpg" alt="The front page of annaberthelsen.com" width="1600" height="1000" loading="lazy">
          </button>
          <figcaption class="mono">The front page of annaberthelsen.com.</figcaption>
        </figure>
        <dialog class="lightbox lightbox-wide" id="anna-home-full" aria-label="The front page of annaberthelsen.com">
          <img src="/img/anna-home.jpg" alt="The front page of annaberthelsen.com" width="1600" height="1000" loading="lazy">
          <button class="lightbox-close mono" type="button" aria-label="Close">Close</button>
        </dialog>

        <h2>Print Club</h2>
        <p>In October 2026 we launched Print Club, a monthly subscription to her work. Each month, members receive one original piece, hand printed and hand painted, 1/1 and signed. It costs 250 NOK a month with postage included. There is no commitment, and there are only 30 seats.</p>
        <p>The idea behind it is simple. For many people, an original artwork is a big first purchase. At 250 NOK a month, Print Club is an easy way in. Each print comes with a handwritten letter, so members get to know Anna and her work over time. Our hope is that some of them go on to buy larger pieces, and that the club brings in steady monthly income along the way.</p>

        <figure class="photo">
          <button class="photo-btn" type="button" aria-label="Show larger" data-lightbox="anna-printclub-full">
            <img src="/img/anna-printclub.jpg" alt="The Print Club page on annaberthelsen.com" width="1600" height="1000" loading="lazy">
          </button>
          <figcaption class="mono">The Print Club page, first edition.</figcaption>
        </figure>
        <dialog class="lightbox lightbox-wide" id="anna-printclub-full" aria-label="The Print Club page">
          <img src="/img/anna-printclub.jpg" alt="The Print Club page on annaberthelsen.com" width="1600" height="1000" loading="lazy">
          <button class="lightbox-close mono" type="button" aria-label="Close">Close</button>
        </dialog>
        """,
    ),
    dict(
        slug="ai-gtm-toolkit",
        title="AI tools for go-to-market",
        meta="Kora Fashion · 2026",
        summary="Lead-sourcing tools and a meeting-prep and onboarding platform, built for a B2B SaaS start-up.",
        facts=[("Context", "GTM Internship, Kora Fashion (Stockholm, remote)"),
               ("Period", "Since Jul 2026"),
               ("Role", "Commercial responsibility for Norway"),
               ("Company", '<a class="ext" href="https://www.kora.fashion/" target="_blank" rel="noopener">kora.fashion</a>')],
        body="""
        <h2>Background</h2>
        <p>Kora Fashion is an early-stage B2B SaaS start-up founded by two former Meta employees. Daniel Wellington is one of its pilot customers. I joined as the first external hire.</p>

        <figure class="photo">
          <button class="photo-btn" type="button" aria-label="Show full photo" data-lightbox="kora-visit-full">
            <img src="/img/kora-visit.jpg" alt="Albert and his brother sitting in front of the Meta logo" width="1000" height="1000" loading="lazy">
          </button>
          <figcaption class="mono">With my brother, visiting one of Kora&rsquo;s founders at Meta.</figcaption>
        </figure>
        <dialog class="lightbox" id="kora-visit-full" aria-label="Albert and his brother at Meta">
          <img src="/img/kora-visit-full.jpg" alt="Albert and his brother sitting in front of the Meta logo" width="1170" height="1480" loading="lazy">
          <button class="lightbox-close mono" type="button" aria-label="Close">Close</button>
        </dialog>

        <h2>What I do</h2>
        <p>I own the Norwegian market from first contact to onboarding. I book the meetings, follow up, and onboard customers once they sign. I also work closely with the CTO on which markets Kora should enter next.</p>

        <h2>What I built</h2>
        <p>Early on, I noticed how much of the job was repetitive work. So I built tools for it.</p>
        <ul>
          <li><strong>Lead sourcing.</strong> AI tools that find and qualify potential customers, so more of my time goes to actual conversations.</li>
          <li><strong>Meeting preparation.</strong> A platform that pulls together what I need to know before each client meeting.</li>
          <li><strong>Onboarding.</strong> The same platform is used to onboard new GTM hires, so they don&rsquo;t have to start from zero.</li>
        </ul>
        <p>Being the first hire means there is no playbook. Building these tools has been my way of writing one.</p>

        """,
    ),
    dict(
        slug="vuse-market-research",
        title="Market research for a flagship launch",
        meta="I Wish · 2025",
        summary="Market and competitor research for VUSE ahead of its flagship store opening in London.",
        facts=[("Context", "Summer Internship, Consultant, I Wish"),
               ("Period", "Jul to Aug 2025"),
               ("Location", "London and Exeter, UK"),
               ("Client", "VUSE"),
               ("Company", '<a class="ext" href="https://www.iwishworld.com/" target="_blank" rel="noopener">iwishworld.com</a>')],
        body="""
        <h2>Background</h2>
        <p>I Wish is an insight-led innovation consultancy.</p>

        <h2>The work</h2>
        <p>My main project was VUSE. Ahead of the launch of their flagship store in London, I led the market and competitor research. I then presented the findings directly to the client team.</p>
        <p>Beyond VUSE, I worked across five client accounts, two of them early-stage ventures. Most of that work was researching new markets and turning what we found into recommendations the clients could act on.</p>
        <p>Presenting to a client taught me to cut research down to what actually matters for the decision.</p>

        """,
    ),
    dict(
        slug="cyber-snails",
        title="Cyber Snails",
        meta="Co-founder · 2021 to 2022",
        summary="Co-founded a Web3 project and led the commercial side. Sold out for NOK 6 million on launch day.",
        facts=[("Role", "Co-founder, Commercial Lead"),
               ("Period", "Nov 2021 to May 2022"),
               ("Location", "Kristiansand, Norway"),
               ("Project", '<a class="ext" href="https://x.com/CyberSnailsNFT" target="_blank" rel="noopener">@CyberSnailsNFT on X</a>')],
        body="""
        <h2>Background</h2>
        <p>Cyber Snails was a Web3 project, launched at the height of the NFT market.</p>

        <h2>The result</h2>
        <p>The collection sold out on launch day, bringing in NOK 6 million.</p>
        <p>It was also an early lesson in how fast sentiment can move a market. That is a big part of why I chose to study finance.</p>

        """,
    ),
]

def next_link(href, kicker, title):
    return f"""<a class="next" href="{href}">
  <span class="mono">{kicker}</span>
  <span class="next-title">{title}<span class="dot">.</span></span>
  <span class="card-arrow">&rarr;</span>
</a>"""

# ---------- Home ----------
page("", None,
     "Hi, I\u2019m Albert. Finance student in Bergen.",
     """
<h1 class="display"><span>Albert</span> <em>Berthelsen<span class="dot">.</span></em></h1>
<div class="hero-body">
<p class="hero-intro">I&rsquo;m a finance student at <span class="hl">BI Norwegian Business School</span> in Bergen. Last spring I was on exchange at <span class="hl">Bocconi</span> in Milan. Today I&rsquo;m the first external hire at <a class="hl" href="/projects/ai-gtm-toolkit">Kora Fashion</a>, a B2B SaaS start-up founded by two former Meta employees. I handle sales in Norway and build AI tools for the team. Before that, I spent a summer as a consultant at <a class="hl" href="/projects/vuse-market-research">I Wish</a> in London, and I co-founded <a class="hl" href="/projects/cyber-snails">Cyber Snails</a>. It sold out for NOK 6 million on launch day.</p>
<nav class="cards cards-single" aria-label="Main">
  <a class="card" href="/projects">
    <span><span class="card-title">Projects</span><span class="mono card-sub">4 selected projects</span></span>
    <span class="card-arrow">&rarr;</span>
  </a>
</nav>
</div>
""", home=True)

# ---------- Projects index ----------
items = "\n".join(
    f"""  <li>
    <a href="/projects/{p['slug']}">
      <span class="mono idx">{i:02d}</span>
      <span class="pl-main">
        <h2>{p['title']}</h2>
        <p>{p['summary']}</p>
      </span>
      <span class="mono pl-meta">{p['meta']}</span>
      <span class="card-arrow">&rarr;</span>
    </a>
  </li>""" for i, p in enumerate(projects, 1))
page("projects", "Projects",
     "Selected projects by Albert Berthelsen.",
     f"""
     <h1 class="mono kicker">Projects</h1>
     <ul class="project-list">
     {items}
     </ul>
     {next_link("/contact", "Next", "Contact")}
     """.replace("\n     ", "\n"), wide=True)

# ---------- Project pages ----------
for n, p in enumerate(projects):
    if n + 1 < len(projects):
        nxt = next_link(f"/projects/{projects[n+1]['slug']}", "Next project", projects[n+1]["title"])
    else:
        nxt = next_link("/contact", "Next", "Contact")
    facts = "\n".join(f"  <dt class=\"mono\">{k}</dt><dd>{v}</dd>" for k, v in p["facts"])
    page(f"projects/{p['slug']}", p["title"], p["summary"],
         f"""
<p class="mono kicker">{p['meta']}</p>
<h1>{p['title']}</h1>
<div class="project-layout">
<aside class="project-facts">
<dl class="facts">
{facts}
</dl>
</aside>
<div class="project-body">
{textwrap.dedent(p['body']).strip()}
{nxt}
<a class="mono back" href="/projects">&larr; All projects</a>
</div>
</div>
""", wide=True)

# ---------- About (shown in a panel on the contact page) ----------
ABOUT = """
<p class="lede">Most of my experience so far is commercial. I&rsquo;ve sold, researched markets for clients and helped build something from scratch. At school I&rsquo;ve worked on the other side of the same question: how you put a value on a business. I want a career where I use both.</p>

<h2>Education</h2>

<div class="entry">
  <span class="mono entry-date">2024 to 2027</span>
  <div>
  <h3><a class="ext" href="https://www.bi.no/" target="_blank" rel="noopener">BI Norwegian Business School</a></h3>
  <p class="entry-role">Bachelor in Finance, Bergen</p>
  <p>GPA 4.75 / 5. My courses include corporate finance, financial modelling, statistics and financial econometrics, which together cover most of what goes into valuing a company.</p>
  </div>
</div>

<div class="entry">
  <span class="mono entry-date">Feb to May 2026</span>
  <div>
  <h3><a class="ext" href="https://www.unibocconi.it/en" target="_blank" rel="noopener">Università Bocconi</a></h3>
  <p class="entry-role">Exchange semester, Milan</p>
  <p>Final grade 26 / 30. I took Business Valuation, Fintech for Banking, and Macroeconomics and the World Economy.</p>
  </div>
</div>

<h2>Student organisations</h2>

<div class="entry">
  <span class="mono entry-date">Since 2024</span>
  <div>
  <h3><a class="ext" href="https://www.linkedin.com/company/shippingutvalgetbi/" target="_blank" rel="noopener">Shippingutvalget</a></h3>
  <p class="entry-role">Head of Business Contact</p>
  <p>The shipping committee at BI Bergen. I&rsquo;m responsible for our contact with the shipping industry in the city. In practice, that means building relationships with companies and arranging company visits for our 35 members.</p>
  </div>
</div>

<div class="entry">
  <span class="mono entry-date">2025 to 2026</span>
  <div>
  <h3><a class="ext" href="https://www.linkedin.com/company/bi-bergen-case-club/" target="_blank" rel="noopener">BISO Bergen Case Club</a></h3>
  <p class="entry-role">Business Relations Manager</p>
  <p>I was responsible for our relationships with consulting firms. I reached out to new companies, built partnerships and arranged company visits for our members.</p>
  </div>
</div>

<h2>Outside work</h2>
<p>Most of my free time goes to training, mainly running and football, and to time with friends. I also love to travel, and a semester in Milan only made that stronger.</p>
"""

# ---------- Contact ----------
page("contact", "Contact",
     "Get in touch with Albert Berthelsen.",
     """
<h1 class="mono kicker">Get in touch</h1>
<div class="contact-grid">
  <figure class="contact-photo">
    <img src="/img/albert.jpg" alt="Albert Berthelsen" width="878" height="1382">
  </figure>
  <div class="contact-side">
  <dl class="contact-facts">
    <dt class="mono">Email</dt><dd><a href="mailto:albert.berthelsen@gmail.com">albert.berthelsen@gmail.com</a></dd>
    <dt class="mono">Based in</dt><dd>Bergen, Norway</dd>
    <dt class="mono">Phone</dt><dd><a href="tel:+4746802628">+47 468 02 628</a></dd>
    <dt class="mono">LinkedIn</dt><dd><a href="https://www.linkedin.com/in/albert-berthelsen-7a202219b" target="_blank" rel="noopener">albert-berthelsen</a></dd>
  </dl>
    <div class="cta-row">
      <a class="send mono" href="mailto:albert.berthelsen@gmail.com">Send a message &rarr;</a>
      <button class="send send-ghost mono" type="button" data-dialog="about-me">More about me</button>
    </div>
  </div>
</div>
<dialog class="drawer" id="about-me" aria-label="More about Albert">
  <div class="drawer-inner">
    <div class="drawer-head">
      <p class="mono kicker">About</p>
      <button class="lightbox-close mono" type="button" data-close>Close</button>
    </div>
""" + textwrap.indent(ABOUT.strip(), "    ") + """
  </div>
</dialog>
""", wide=True)

# ---------- 404 ----------
page("404", "Page not found",
     "Page not found.",
     """
<p class="mono kicker">Error 404</p>
<h1>Page <em>not found</em></h1>
<p class="lede muted">The page you were looking for does not exist.</p>
<a class="mono back" href="/">&larr; Back home</a>
""")
print("ok")
