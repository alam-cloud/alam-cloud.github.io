#!/usr/bin/env python3
"""Refresh the static AWS Builder Center article cards and embedded article
sections in index.html.

Builder Center's content API is internal and CORS-restricted, so this script is
intended to run during a scheduled GitHub Actions job rather than in a visitor's
browser. It uses Python's standard library plus pandoc for Markdown rendering.
"""

from __future__ import annotations

import argparse
import html
import json
import re
import subprocess
import sys
import time
from datetime import UTC, datetime
from pathlib import Path
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "index.html"

SEARCH_URL = "https://api.builder.aws.com/cs/search"
ARTICLE_URL = "https://api.builder.aws.com/cs/v2/articles"
BUILDER_ORIGIN = "https://builder.aws.com"
AUTHOR_NAME = "Alam Ahmed"
AUTHOR_ALIAS = "techghost"
AUTHOR_CREATOR_ID = "7525ab03-10b5-48b1-8fd9-58300af609fb"

DEFAULT_MAX_ARTICLES = 6
MAX_PAGES_PER_QUERY = 6

# Articles whose full text is maintained by hand inside index.html. Their cards
# link to the hand-maintained section, and the API body is never rendered over it.
LOCAL_ARTICLE_LINKS = {
    "/content/3IPv53avJpYSJKzCUldxEQZ0k2d": "#security-at-the-speed-of-synth",
}

ARTICLE_TYPE_OVERRIDES = {
    "/content/3IPv53avJpYSJKzCUldxEQZ0k2d": "Article · New",
    "/content/3HGyvM25DcXQaOeeIUhGF6Tj6PQ": "Article · Talk Recap",
    "/content/3ElShp5DBoeQCRfc5kaBhwsruIe": "Article · ★ Spotlight Pick",
}

DESCRIPTION_OVERRIDES = {
    "/content/3IPv53avJpYSJKzCUldxEQZ0k2d": "CDK-nag, CloudFormation Guard, CodePipeline and Amazon Q Developer — making insecure infrastructure undeliverable across the developer loop",
    "/content/3HGyvM25DcXQaOeeIUhGF6Tj6PQ": "AWS London Well-Architected User Group recap — practical lessons on Terraform reviews that catch real risk",
    "/content/3FuJq2YhQh31l3A3FOxBwIRin0A": "A guarded deployment pattern for AI-generated infrastructure using Lambda MicroVMs, policy checks and progressive delivery",
    "/content/3FDkVLwnZueCOxVOJGoXNRgIIaA": "Beyond terraform apply — orchestrating hundreds of MSP accounts with guardrails and infrastructure as a product",
    "/content/3ElShp5DBoeQCRfc5kaBhwsruIe": "Featured in the AWS Community Builders Spotlight — how Kiro, AgentCore and Transform are reshaping developer experience",
    "/content/3EM8bMXL03D2K5eG4alo8lrSP8w": "AppConfig targeting, Lambda canary deployments and CloudWatch Synthetics for automated promotion and rollback",
}

CARD_START = "<!-- BUILDER-ARTICLES:START -->"
CARD_END = "<!-- BUILDER-ARTICLES:END -->"
BODY_START = "<!-- BUILDER-ARTICLE-BODIES:START -->"
BODY_END = "<!-- BUILDER-ARTICLE-BODIES:END -->"
LATEST_START = "// BUILDER-LATEST-ARTICLE:START"
LATEST_END = "// BUILDER-LATEST-ARTICLE:END"
TERMINAL_START = "// BUILDER-TERMINAL-ARTICLES:START"
TERMINAL_END = "// BUILDER-TERMINAL-ARTICLES:END"

API_HEADERS = {
    "accept": "application/json",
    # This is the anonymous session marker sent by Builder Center's own SPA.
    "builder-session-token": "dummy",
    "origin": BUILDER_ORIGIN,
    "referer": BUILDER_ORIGIN + "/",
    "user-agent": "alamahmed.dev-static-article-sync/1.0",
}


def request_json(url: str, payload: dict[str, Any] | None = None, attempts: int = 3) -> dict[str, Any]:
    data = None
    headers = dict(API_HEADERS)
    if payload is not None:
        data = json.dumps(payload).encode("utf-8")
        headers["content-type"] = "application/json"
    last_error: Exception | None = None
    for attempt in range(1, attempts + 1):
        try:
            request = Request(url, data=data, headers=headers, method="POST" if data else "GET")
            with urlopen(request, timeout=30) as response:
                return json.loads(response.read().decode("utf-8"))
        except (HTTPError, URLError, TimeoutError, json.JSONDecodeError) as exc:
            last_error = exc
            if attempt < attempts:
                time.sleep(1.5 * attempt)
    raise RuntimeError(f"Builder Center request failed after {attempts} attempts: {last_error}")


def post_json(payload: dict[str, Any], attempts: int = 3) -> dict[str, Any]:
    return request_json(SEARCH_URL, payload=payload, attempts=attempts)


def fetch_full_article(content_id: str) -> dict[str, Any]:
    url = ARTICLE_URL + "?" + urlencode({"articleId": content_id})
    return request_json(url)


def is_author_item(item: dict[str, Any]) -> bool:
    author = item.get("author") or {}
    return (
        author.get("creatorId") == AUTHOR_CREATOR_ID
        or author.get("alias") == AUTHOR_ALIAS
    )


def search_author(query: str) -> dict[str, dict[str, Any]]:
    found: dict[str, dict[str, Any]] = {}
    next_token: str | None = None
    stale_pages = 0

    for page in range(1, MAX_PAGES_PER_QUERY + 1):
        category: dict[str, Any] = {"category": "ARTICLE"}
        if next_token:
            category["nextToken"] = str(next_token)
        payload = {
            "locale": "en",
            "search": query,
            "categories": [category],
        }
        data = post_json(payload)
        article_category = (data.get("categories") or {}).get("ARTICLE") or {}
        items = article_category.get("feedContents") or []

        new_hits = 0
        for item in items:
            if not is_author_item(item):
                continue
            content_id = item.get("contentId")
            if content_id and content_id not in found:
                found[content_id] = item
                new_hits += 1

        stale_pages = stale_pages + 1 if new_hits == 0 else 0
        next_token_value = article_category.get("nextToken")
        next_token = str(next_token_value) if next_token_value else None
        if not next_token or (page >= 2 and stale_pages >= 2):
            break

    return found


def timestamp_ms(item: dict[str, Any]) -> int:
    for key in ("lastPublishedAt", "lastModifiedAt", "createdAt"):
        value = item.get(key)
        if isinstance(value, (int, float)):
            return int(value)
    return 0


def clean_text(value: str) -> str:
    value = re.sub(r"<[^>]+>", " ", value)
    value = re.sub(r"[#*_`>\[\]()]", "", value)
    value = re.sub(r"\s+", " ", value).strip()
    return value


def clean_description(item: dict[str, Any]) -> str:
    content_id = item.get("contentId", "")
    if content_id in DESCRIPTION_OVERRIDES:
        return DESCRIPTION_OVERRIDES[content_id]

    article = (item.get("contentTypeSpecificResponse") or {}).get("article") or {}
    description = clean_text(str(article.get("description") or ""))
    if not description:
        description = clean_text(str(item.get("markdownDescription") or ""))
    if len(description) > 220:
        description = description[:217].rsplit(" ", 1)[0].rstrip(" ,;:") + "…"
    return description


def article_title(item: dict[str, Any]) -> str:
    return clean_text(str(item.get("title") or "Untitled article"))


def article_date(item: dict[str, Any]) -> datetime:
    return datetime.fromtimestamp(timestamp_ms(item) / 1000, UTC)


def article_slug(item: dict[str, Any]) -> str:
    """Stable local anchor id: the slug Builder Center itself uses in the URI."""
    uri = str(item.get("uri") or "")
    if "/" in uri.strip("/"):
        slug = uri.rstrip("/").rsplit("/", 1)[-1]
        if slug:
            return slug
    slug = re.sub(r"[^a-z0-9]+", "-", article_title(item).lower()).strip("-")
    return slug or str(item.get("contentId") or "article").replace("/", "-")


def external_url(item: dict[str, Any]) -> str:
    uri = str(item.get("uri") or item.get("contentId") or "")
    if uri.startswith("/"):
        return BUILDER_ORIGIN + uri
    return uri


def article_url(item: dict[str, Any], embedded: set[str]) -> str:
    content_id = str(item.get("contentId") or "")
    if content_id in LOCAL_ARTICLE_LINKS:
        return LOCAL_ARTICLE_LINKS[content_id]
    if content_id in embedded:
        return "#" + article_slug(item)
    return external_url(item)


def article_type(item: dict[str, Any], position: int) -> str:
    content_id = str(item.get("contentId") or "")
    if content_id in ARTICLE_TYPE_OVERRIDES:
        return ARTICLE_TYPE_OVERRIDES[content_id]
    return "Article · New" if position == 0 else "Article"


def render_card(item: dict[str, Any], position: int, embedded: set[str]) -> str:
    title = html.escape(article_title(item))
    description = html.escape(clean_description(item))
    date = html.escape(article_date(item).strftime("%b %Y"))
    kind = html.escape(article_type(item, position))
    url = html.escape(article_url(item, embedded), quote=True)
    external = url.startswith("https://")
    target = ' target="_blank" rel="noopener noreferrer"' if external else ""
    highlight = ' style="border-color: rgba(0, 212, 170, 0.45); box-shadow: 0 0 24px rgba(0, 212, 170, 0.08);"' if position == 0 else ""

    return f'''                <div class="talk-card"{highlight}>
                    <div class="talk-type author">&#9679; {kind}</div>
                    <h3 class="talk-title">{title}</h3>
                    <div class="talk-venue">{description}</div>
                    <div class="talk-meta">
                        <span>{date}</span>
                        <a href="{url}"{target} class="talk-link">Read &rarr;</a>
                    </div>
                </div>'''


def preprocess_markdown(markdown: str) -> str:
    """Convert Builder Center's custom <Image /> tags into Markdown images."""

    def image_sub(match: re.Match[str]) -> str:
        attrs = match.group(1)
        url_match = re.search(r'url="([^"]+)"', attrs)
        title_match = re.search(r'title="([^"]*)"', attrs)
        if not url_match:
            return ""
        alt = (title_match.group(1).strip() if title_match else "") or "Article image"
        return f"\n\n![{alt}]({url_match.group(1)})\n\n"

    return re.sub(r"<Image\s+([^>]*?)/>", image_sub, markdown)


def markdown_to_html(markdown: str, id_prefix: str = "") -> str:
    command = ["pandoc", "-f", "gfm", "-t", "html", "--wrap=none"]
    if id_prefix:
        command.append(f"--id-prefix={id_prefix}")
    result = subprocess.run(
        command,
        input=markdown,
        capture_output=True,
        text=True,
        timeout=60,
    )
    if result.returncode != 0:
        raise RuntimeError(f"pandoc failed: {result.stderr.strip()[:400]}")
    return result.stdout.strip()


def toc_from_body(body_html: str) -> str:
    headings = re.findall(r'<h([23]) id="([^"]+)">(.*?)</h\1>', body_html, re.DOTALL)
    if not headings:
        return ""
    has_h2 = any(level == "2" for level, _, _ in headings)
    links: list[str] = []
    for level, anchor, text in headings:
        text = re.sub(r"<[^>]+>", "", text).strip()
        sub = ' class="toc-sub"' if has_h2 and level == "3" else ""
        links.append(f'<a{sub} href="#{anchor}">{text}</a>')
    return "\n".join(links)


def render_section(item: dict[str, Any], body_html: str) -> str:
    slug = article_slug(item)
    title = html.escape(article_title(item))
    description = html.escape(clean_description(item))
    date = html.escape(article_date(item).strftime("%b %Y"))
    canonical = html.escape(external_url(item), quote=True)
    toc = toc_from_body(body_html)
    toc_block = ""
    if toc:
        toc_block = f'''<aside aria-label="Article contents" class="article-toc">
<div class="toc-title">cat article.map</div>
{toc}
</aside>'''

    return f'''<section id="{slug}" class="article-section" aria-labelledby="{slug}-title">
<section class="article-hero">
<div class="kicker">Published Intelligence · {date}</div>
<h1 id="{slug}-title">{title}</h1>
<p class="standfirst">{description}</p>
<div aria-label="Article metadata" class="meta-panel">
<div aria-hidden="true" class="meta-bar">
<span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span>
<span class="meta-title">alam@builder-center:~/writing</span>
</div>
<div class="meta-body">
<div class="meta-item">
<div class="meta-label">Author</div>
<div class="meta-value">Alam Ahmed</div>
</div>
<div class="meta-item">
<div class="meta-label">Role</div>
<div class="meta-value">AWS Community Builder</div>
</div>
<div class="meta-item">
<div class="meta-label">Published</div>
<div class="meta-value">{date}</div>
</div>
</div>
</div>
</section>
<div class="article-layout">
{toc_block}
<article class="article-body">
{body_html}
<hr/>
<p><em>Originally published on <a href="{canonical}">AWS Builder Center</a>. Any opinions are those of the individual author and may not reflect the opinions of AWS.</em></p>
</article>
</div>
<footer class="article-footer">
<a class="button" href="#writing">&larr; Back to writing</a>
<a class="button" href="{canonical}" target="_blank" rel="noopener noreferrer">Discuss on Builder Center &rarr;</a>
</footer>
</section>'''


def js_string(value: str) -> str:
    return json.dumps(value, ensure_ascii=False)


def terminal_title(title: str, maximum: int = 68) -> str:
    return title if len(title) <= maximum else title[: maximum - 1].rsplit(" ", 1)[0] + "…"


def render_terminal_lines(articles: list[dict[str, Any]]) -> str:
    lines: list[str] = []
    for position, item in enumerate(articles):
        date = article_date(item).strftime("%b %y")
        title = html.escape(terminal_title(article_title(item)), quote=False)
        badge = ""
        content_id = str(item.get("contentId") or "")
        if position == 0:
            badge = ' <span class="ok">New</span>'
        elif content_id == "/content/3ElShp5DBoeQCRfc5kaBhwsruIe":
            badge = ' <span class="wrn">&#11088; Spotlight pick</span>'
        lines.append(f'  <span class="inf">{date}</span> {title}{badge}')
    return "\n".join("                " + js_string(line) + "," for line in lines)


def replace_marked(source: str, start: str, end: str, body: str, closing_indent: str) -> str:
    pattern = re.compile(re.escape(start) + r".*?" + re.escape(end), re.DOTALL)
    replacement = start + "\n" + body + "\n" + closing_indent + end
    updated, count = pattern.subn(replacement, source, count=1)
    if count != 1:
        raise RuntimeError(f"Could not find marker pair: {start} ... {end}")
    return updated


def build_sections(articles: list[dict[str, Any]]) -> tuple[str, set[str]]:
    """Fetch and render full article bodies. Returns (sections_html, embedded_ids).

    If a body cannot be fetched or rendered, that article is skipped: its card
    falls back to linking to Builder Center instead of a local section.
    """
    sections: list[str] = []
    embedded: set[str] = set()
    for item in articles:
        content_id = str(item.get("contentId") or "")
        if not content_id or content_id in LOCAL_ARTICLE_LINKS:
            if content_id in LOCAL_ARTICLE_LINKS:
                embedded.add(content_id)
            continue
        try:
            full = fetch_full_article(content_id)
            markdown = str(full.get("markdownDescription") or "")
            if len(markdown) < 200:
                raise RuntimeError("article body looks empty")
            # Prefix every generated id with the content id tail so pandoc's
            # per-document anchors (cb1, cb2, ...) can never collide across
            # embedded articles on the same page.
            id_prefix = "x" + re.sub(r"[^A-Za-z0-9]", "", content_id)[-6:] + "-"
            body_html = markdown_to_html(preprocess_markdown(markdown), id_prefix)
        except Exception as exc:  # noqa: BLE001 - degrade to external link
            print(f"warning: could not embed {content_id}: {exc}", file=sys.stderr)
            continue
        sections.append(render_section(item, body_html))
        embedded.add(content_id)
    return "\n".join(sections), embedded


def update_index(articles: list[dict[str, Any]], dry_run: bool = False) -> bool:
    source = INDEX.read_text()

    sections_html, embedded = build_sections(articles)
    cards = "\n".join(render_card(item, position, embedded) for position, item in enumerate(articles))
    latest = articles[0]
    latest_line = f'<span class="inf">Article:</span> {html.escape(article_title(latest), quote=False)} ({article_date(latest).strftime("%b %Y")})'

    updated = replace_marked(source, CARD_START, CARD_END, cards, "                ")
    updated = replace_marked(updated, LATEST_START, LATEST_END, "                " + js_string(latest_line) + ",", "                ")
    updated = replace_marked(updated, TERMINAL_START, TERMINAL_END, render_terminal_lines(articles), "                ")
    if BODY_START in updated:
        updated = replace_marked(updated, BODY_START, BODY_END, sections_html, "")

    if dry_run:
        print(updated[updated.index(CARD_START):updated.index(CARD_END) + len(CARD_END)])
        return updated != source

    if updated != source:
        INDEX.write_text(updated)
        rendered = sections_html.count('<section id=')
        print(f"Updated {len(articles)} Builder Center article cards and {rendered} embedded article sections in {INDEX}")
    else:
        print("Builder Center article cards already up to date")
    return updated != source


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dry-run", action="store_true", help="print the generated cards without editing index.html")
    parser.add_argument("--max-articles", type=int, default=DEFAULT_MAX_ARTICLES, help="number of latest articles to render")
    args = parser.parse_args()

    found: dict[str, dict[str, Any]] = {}
    for query in (AUTHOR_ALIAS, AUTHOR_NAME):
        found.update(search_author(query))

    articles = sorted(found.values(), key=timestamp_ms, reverse=True)[: args.max_articles]
    if not articles:
        print("No Builder Center articles matched the configured author identity", file=sys.stderr)
        return 1

    update_index(articles, dry_run=args.dry_run)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
