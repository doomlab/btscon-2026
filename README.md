# BTSCon 2026 Presentations

Slides and materials from the [5th annual Big Team Science Conference](https://bigteamscienceconference.github.io/) (BTSCon 2026, October 6–8, held virtually).

All slide decks are [Quarto](https://quarto.org/) reveal.js presentations. Open any `.html` file in a browser to view it, or edit the `.qmd` source and re-render with `quarto render`.

## Contents

| Folder | Talk | Slides |
|--------|------|--------|
| `01-welcome/` | Welcome to BTSCon 2026 | [`welcome.html`](01-welcome/welcome.html) · [online](https://doomlab.quarto.pub/welcome-to-btscon-2026) |
| `02-tools/tools-talk-1/` | Tools of the Trade: The Big Team Science Workflow (Day 1) | [`workflow.html`](02-tools/tools-talk-1/workflow.html) · [online](https://doomlab.quarto.pub/tools-of-the-trade-the-big-team-science-workflow) |
| `02-tools/tools-talk-2/` | Beyond Google Docs: Collaborative Writing with HackMD (Day 2) | [`hackmd.html`](02-tools/tools-talk-2/hackmd.html) · [online](https://doomlab.quarto.pub/beyond-google-docs) |
| `03-zenodo-tutorial/` | Archive It with Zenodo (with GitHub releases) | [`zenodo.html`](03-zenodo-tutorial/zenodo.html) · [`zenodo.pdf`](03-zenodo-tutorial/zenodo.pdf) · [online](https://doomlab.quarto.pub/archive-it-with-zenodo) |

To make a one-file PDF of any deck (needs Google Chrome and Node 22+):

```bash
node scripts/print-pdf.mjs 03-zenodo-tutorial/zenodo.html
```

Also included:

- [`02-tools/Tools + Infrastructure CONNECT.md`](02-tools/Tools%20+%20Infrastructure%20CONNECT.md): the full list of big team science tools by workflow stage, from the CONNECT Tools and Infrastructure Working Group.
- `01-welcome/prep_registrations.R`: turns the registration export into the de-identified country and career-stage counts in `01-welcome/data/`. The raw registration file is not included.

## Citation

This repository is archived on [Zenodo](https://zenodo.org/) through the GitHub integration, which is also the live demo in the Zenodo tutorial. See [`CITATION.cff`](CITATION.cff), or use the **Cite this repository** button on GitHub.

## License

[CC BY 4.0](LICENSE.md)
