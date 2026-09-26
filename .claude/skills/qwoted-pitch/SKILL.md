---
name: qwoted-pitch
description: Triage Qwoted source requests and write pitches that journalists actually quote, for Alphastrix Digital or its clients. Use whenever Captain pastes a Qwoted opportunity, a journalist query (Qwoted, HARO, Featured, Help a B2B Writer, SourceBottle, #journorequest), or asks to "pitch this", "answer this request", "get this client quoted", "write a Qwoted response", "find PR opportunities", or plan digital PR for backlinks and brand mentions. Also use to build or refresh an expert profile on Qwoted.
---

# Qwoted Pitch

Qwoted connects journalists with expert sources. A reporter posts a source request with questions and a deadline, experts pitch, and the reporter picks a handful of answers to quote. Every accepted pitch is a potential brand mention and, often, a high-authority backlink.

The reporter is reading dozens of pitches on a deadline. The pitch that wins is the one they can paste straight into their draft. Everything in this skill serves that one goal.

## Workflow

### 1. Get the inputs

Before writing, confirm you have:

- **The request.** Outlet, reporter, headline or topic, the exact questions, requirements (location, credentials, "no agencies"), and deadline.
- **The expert.** Who is being quoted: name, title, company, one-line credential. If the expert has a profile in `references/expert-profiles.md`, use it. If not, ask for the details or build one with `references/expert-profile-template.md`.
- **Real material.** Any numbers, client results or stories the expert is cleared to share. Never invent these.

If the request text is missing, ask Captain to paste it. Do not pitch from a headline alone.

### 2. Triage: pitch or pass

Score the request before spending time on it. Pitch only when all three hold:

| Check | Pass when |
| --- | --- |
| Fit | The expert has direct, first-hand experience with the exact topic, not just the industry |
| Requirements | Every stated requirement is met (country, job title, company size, "brand not agency", etc.) |
| Time | There is enough time left to send a considered answer before the deadline |

Then rate the upside:

- **High:** national or major trade outlet, topic sits on a service or keyword the client wants to rank for.
- **Medium:** niche publication or blog with real readership, topic is adjacent.
- **Low:** content farm, listicle collecting 50 quotes, or unclear outlet.

Tell Captain the verdict in one line ("Pitch, high upside" / "Pass, requires a US-based CPA") before drafting. When in doubt on a borderline requirement, flag it and let Captain decide. Pitching outside the brief burns the expert's credibility with that reporter.

### 3. Write the pitch

Use this structure. Keep the whole thing between 120 and 250 words unless the reporter asks for more.

```
[One-line credential: Name, Title at Company. Why they know this.]

[Q1 restated in 3-6 words, only if there are multiple questions]
[Answer: lead with the point, then one concrete detail — a number, an example, a named tactic.]

[Q2 ...]

[Optional: one sentence offering a follow-up, a data point, or a headshot.]
```

Rules for the answers:

- **Answer the question asked.** Match the reporter's numbering and order. Skip nothing they asked; add nothing they didn't.
- **First sentence is the quote.** Write it so it works lifted out of context, in the expert's voice, first person.
- **Be specific.** "We cut a D2C client's cost per lead from ₹410 to ₹180 by killing broad-match keywords" beats "Focus on targeting." One real example per answer.
- **Take a position.** Reporters quote opinions, contrarian takes and clear recommendations. Hedged, balanced overviews get skipped.
- **No selling.** No service lists, no "contact us", no links unless the reporter asked for a website. The byline credit is the win.
- **Plain language.** Short sentences. No jargon the outlet's reader wouldn't know. None of: "leverage", "synergy", "game-changer", "in today's fast-paced world", "it's important to note".
- **Accurate always.** Numbers, client names and results must come from Captain or the expert. If a claim needs data you don't have, write `[CONFIRM: ...]` inline and list it at the end.

### 4. Check before handing over

Run through this list and fix anything that fails:

- [ ] Every question in the request is answered, in order
- [ ] The opening line of each answer is quotable on its own
- [ ] At least one concrete detail (number, example, named tactic) per answer
- [ ] All requirements in the request are met
- [ ] No sales language, no unrequested links
- [ ] No invented statistics, clients or results
- [ ] Word count within range
- [ ] Reads like a person talking, not a press release

### 5. Deliver

Return, in this order:

1. **Verdict** — pitch or pass, upside, and any flagged requirement.
2. **The pitch** — ready to paste into Qwoted, in a code block so formatting survives.
3. **Confirm list** — every `[CONFIRM: ...]` item, if any.
4. **Subject/summary line** — if the request asks for one, under 12 words.

If Captain asks for options, give two versions with a clearly different angle (for example, tactical vs. opinionated), not the same answer reworded.

## Building an expert profile

A strong Qwoted profile gets the expert invited to pitch and makes the reporter trust the answer. When asked to create or improve one, fill in `references/expert-profile-template.md` and save the finished profile to `references/expert-profiles.md` so later pitches can reuse it.

## Tracking

When Captain wants a log, keep one row per pitch:

| Date | Client/expert | Outlet | Reporter | Topic | Status | Published URL | Link type |
| --- | --- | --- | --- | --- | --- | --- | --- |

Status is one of: Sent, Accepted, Published, Declined, No response. Link type is Dofollow, Nofollow, Mention only, or Unknown. Use the `xlsx` skill if Captain wants it as a spreadsheet.

## Example

**Request (Qwoted):** *Small-business trade outlet. "Looking for marketing agency founders: What's the most common mistake small businesses make with Google Ads, and how should they fix it? Deadline: 48 hours. India or APAC-based sources welcome."*

**Verdict:** Pitch, high upside. Matches Alphastrix's Performance Ads service and APAC requirement.

```
Atul Nema, Founder of Alphastrix Digital, a performance marketing agency that runs Google Ads for small and mid-sized businesses across India.

The most common mistake
"Most small businesses pay Google to show their ads to people who were never going to buy. They switch on broad match, skip the negative keyword list, and let the campaign spend on searches like 'free' or 'jobs'. [CONFIRM: example figure] In one account we audited, close to a third of the monthly budget was going to searches like that."

How to fix it
"Open the search terms report every week for the first two months and add anything irrelevant as a negative keyword. Start with phrase and exact match on your ten best-converting terms, then widen only once you know your cost per lead. It is dull work, but it is the fastest way to stop wasting money."

Happy to share a before-and-after screenshot of a cleaned-up search terms report if useful.
```

**Confirm list:**
- The share of wasted budget from a real audit, or remove the sentence.
