---
name: qwoted-backlinks
description: Use Qwoted as an SEO link-building channel for Alphastrix Digital and its clients. Triage journalist source requests by backlink value, map each one to the client page it should earn a link to, write pitches reporters quote, then verify, reclaim and report the links. Use whenever Captain pastes a Qwoted opportunity or any journalist query (Qwoted, HARO, Featured, Help a B2B Writer, SourceBottle, #journorequest), or asks to "pitch this", "get this client quoted", "build backlinks through PR", "digital PR for SEO", "earn links from journalists", "check if we got the link", "chase an unlinked mention", or "report on PR links". Also use to set up a client's Qwoted link-building plan or expert profile.
---

# Qwoted SEO Backlinks

Qwoted connects journalists with expert sources. A reporter posts a source request with questions and a deadline, experts pitch, and the reporter quotes a handful. For SEO, each published quote is a shot at an editorial backlink from a site that would never sell one, plus a brand mention that feeds E-E-A-T and AI search citations.

Here's the thing: reporters don't care about your client's rankings. They care about a good quote on deadline. So the SEO work happens around the pitch (choosing requests, choosing the target page, chasing the link afterwards) while the pitch itself stays 100% about being useful to the reporter.

## The loop

1. **Plan** the client's link targets once (section A).
2. **Triage** each request for link value (section B).
3. **Pitch** so the reporter quotes you (section C).
4. **Verify and reclaim** the link after publication (section D).
5. **Log and report** (section E).

Tell Captain which step you're on. Most requests start at step 2.

---

## A. Plan: set up the client once

Before the first pitch for a client, build a short link plan and save it to `references/client-link-plans.md`. Use `references/client-link-plan-template.md`.

The plan covers:

- **Expert.** Who gets quoted. Build their profile with `references/expert-profile-template.md`.
- **Target pages.** The 3–5 URLs that should earn links, ranked. Usually:
  - the homepage (safest, what most reporters link to anyway),
  - one or two money pages (service or category pages the client wants to rank),
  - any linkable asset (original data, a free tool, a guide) — reporters link to these far more readily than to sales pages.
- **Topic map.** Which request topics feed which target page. For example: "Google Ads mistakes" → `/services/google-ads`.
- **Brand name format.** Exactly how the company should be written, so mentions are consistent and easy to find.
- **Monthly goal.** Pitches sent, links earned. Be realistic: many accepted quotes never become links, and many links are nofollow.

---

## B. Triage: is this request worth a pitch?

### Gate checks (all must pass)

| Check | Pass when |
| --- | --- |
| Fit | The expert has direct, first-hand experience with the exact topic |
| Requirements | Every stated requirement is met (country, title, "brand not agency", company size) |
| Time | There's enough time to send a considered answer before the deadline |

If any gate fails, the answer is **pass**. Pitching outside the brief to chase a link burns the expert's name with that reporter.

### Link-value score

Score each factor 0–2 and add them up (max 10):

| Factor | 0 | 1 | 2 |
| --- | --- | --- | --- |
| Authority | Unknown or spammy site | Solid niche or regional site | Major national or leading trade outlet |
| Relevance | Unrelated to the client's industry | Adjacent audience | Same industry or customer base |
| Link likelihood | News story, rarely links to sources | Unclear | Expert roundup, "tips from", or reporter asks for a website/URL |
| Topic match | Doesn't map to any target page | Maps to homepage | Maps to a money page or linkable asset |
| Competition | Obvious 50-quote listicle | Normal request | Narrow brief with few qualified sources |

- **7–10:** Pitch, high priority.
- **4–6:** Pitch if time allows.
- **0–3:** Pass, unless the outlet is a brand win the client specifically wants.

If you can't see the outlet's authority, say so and ask Captain to check it in Ahrefs or Semrush. Don't guess at domain metrics.

Report the verdict in one line before drafting: *"Pitch — 8/10, roundup on a DR-strong trade site, maps to /services/seo."*

**A note on nofollow.** Many big publishers nofollow outbound links or add no link at all. Still pitch high-authority outlets: the mention builds brand trust, helps AI search engines connect the brand to the topic, and often gets syndicated or picked up by smaller sites that do link. Just don't count them as dofollow wins in the report.

---

## C. Pitch: write what the reporter will quote

### Structure (120–250 words unless the reporter asks for more)

```
[Credential line: Name, Title at Company. Why they know this.]

[Q1 restated in 3–6 words, only if there are multiple questions]
[Answer: lead with the point, then one concrete detail — a number, an example, a named tactic.]

[Q2 ...]

[Link line — only if the request asks for a website or URL:]
Website: [target page from the link plan]
```

### Writing rules

- **Answer exactly what was asked**, in the reporter's order. Skip nothing, add nothing.
- **First sentence is the quote.** It should still work lifted out of context, in the expert's own first-person voice.
- **Be specific.** One real example or number per answer. "We cut a D2C client's cost per lead from ₹410 to ₹180 by killing broad-match keywords" beats "focus on targeting."
- **Take a position.** Reporters quote clear opinions, not balanced overviews.
- **Never sell.** No service lists, no "contact us", no keyword-stuffed phrasing. A pitch that reads like SEO bait gets skipped.
- **Links: follow the reporter.** Include a URL only when the request asks for one, and then use the target page mapped in the plan. Never ask for a specific anchor text or for "dofollow" in the pitch.
- **Brand name exactly as in the plan**, so the mention is easy to track and reclaim.
- **Plain, human language.** No "leverage", "synergy", "game-changer", "in today's fast-paced world".
- **No invented facts.** Numbers, clients and results come from Captain or the expert. Mark anything unverified as `[CONFIRM: ...]` and list it at the end.

### Pre-send checklist

- [ ] Every question answered, in order
- [ ] Opening line of each answer quotable on its own
- [ ] One concrete detail per answer
- [ ] All request requirements met
- [ ] No sales language; URL only if requested, and it's the mapped target page
- [ ] Brand name matches the plan
- [ ] No invented statistics, clients or results
- [ ] 120–250 words

### Deliver

1. **Verdict and score** with the target page.
2. **The pitch** in a code block, ready to paste into Qwoted.
3. **Confirm list** of every `[CONFIRM: ...]` item.
4. **Log row** for the tracker (section E), status `Sent`.

If Captain asks for options, give two genuinely different angles (tactical vs. opinionated), not the same answer reworded.

---

## D. Verify and reclaim the link

When a pitch is accepted or Captain says the piece is live:

1. **Find the article.** Ask for the URL, or search the outlet's site for the brand name and the expert's name.
2. **Check the link.** Is there one? Where does it point? What's the `rel` attribute (`nofollow`, `sponsored`, `ugc`, or none = followed)? If you can't fetch the page, give Captain the exact things to check in browser dev tools.
3. **Check indexing.** Search `site:` plus the article URL, or have Captain inspect it in Search Console for the client's property once the link appears in the Links report.
4. **Act on what you find:**

| Finding | Action |
| --- | --- |
| Followed link to target page | Log it as a win. Send a short thank-you. |
| Nofollow link | Log it. No follow-up about link attributes, ever. |
| Link to wrong or broken URL | One polite correction request with the right URL. |
| Mention with no link | One polite reclamation email (template in `references/outreach-templates.md`) — only if the outlet links to other sources in its articles. |
| Quote not used | Log as Declined. No follow-up. |

**One follow-up, maximum.** Chasing a reporter over a link loses the relationship, and future quotes are worth more than one link.

---

## E. Log and report

Keep one row per pitch:

| Date | Client | Expert | Outlet | Reporter | Topic | Score | Target page | Status | Article URL | Link type | Indexed |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |

- **Status:** Sent, Accepted, Published, Declined, No response.
- **Link type:** Dofollow, Nofollow, Mention only, Wrong URL, Unknown.

Use the `xlsx` skill when Captain wants the tracker as a spreadsheet.

**Monthly client report**, short and honest:

- Pitches sent / accepted / published
- Links earned, split by dofollow and nofollow, with the outlets named
- Unlinked mentions and reclamation results
- Which target pages received links
- What's next: topics and outlets to prioritise next month

Never pad the report. A client who sees "3 links from real publications" trusts the agency more than one who sees "47 media placements" padded out with syndication spam.

---

## Example

**Request (Qwoted):** *Small-business trade outlet. "Looking for marketing agency founders: What's the most common mistake small businesses make with Google Ads, and how should they fix it? Please include your website. Deadline: 48 hours. India or APAC-based sources welcome."*

**Verdict:** Pitch — 8/10. Roundup format that asks for a website (link likelihood 2), APAC requirement met, maps to the Google Ads service page.

```
Atul Nema, Founder of Alphastrix Digital, a performance marketing agency that runs Google Ads for small and mid-sized businesses across India.

The most common mistake
"Most small businesses pay Google to show their ads to people who were never going to buy. They switch on broad match, skip the negative keyword list, and let the campaign spend on searches like 'free' or 'jobs'. [CONFIRM: example figure] In one account we audited, close to a third of the monthly budget was going to searches like that."

How to fix it
"Open the search terms report every week for the first two months and add anything irrelevant as a negative keyword. Start with phrase and exact match on your ten best-converting terms, then widen only once you know your cost per lead. It's dull work, but it's the fastest way to stop wasting money."

Website: [target page from the Alphastrix link plan]
```

**Confirm list:**
- The share of wasted budget from a real audit, or remove the sentence.
- The Google Ads target URL, once the service page exists.

**Log row:** 2026-09-26 · Alphastrix · Atul Nema · [Outlet] · [Reporter] · Google Ads mistakes · 8 · Google Ads service page · Sent · — · — · —
