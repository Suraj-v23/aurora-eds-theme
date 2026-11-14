# Aurora — SaaS landing theme for AEM Edge Delivery Services

A free, fast, ready-to-author landing page theme for [AEM Edge Delivery Services](https://www.aem.live/). Built on the official [Adobe AEM boilerplate](https://github.com/adobe/aem-boilerplate), so the standard tooling, Sidekick and upgrade path keep working.

![Aurora theme preview](docs/screenshot.png)

- No build step, no web fonts, no dependencies at runtime
- Rebrand the whole site from one block of CSS variables
- 18 blocks and 5 section styles, each authored as a plain table
- Interactive components (tabs, carousel, accordion, modal, embed) in plain JavaScript
- A live block library page that documents every block
- Dark sections, scroll reveal, visible focus rings, reduced-motion support

## Quick start

1. Click **Use this template** on GitHub to create your own repository.
2. Install the [AEM Code Sync](https://github.com/apps/aem-code-sync) GitHub app on it.
3. Point the project at your content source (Google Drive, SharePoint or DA) as described in the [AEM developer tutorial](https://www.aem.live/developer/tutorial).
4. Run it locally with the bundled demo page:

```sh
npm install
npm run dev
```

Open http://localhost:3000. The demo content lives in [`drafts/`](drafts/). In the local demo, section styles are written as classes on the section `<div>`; on a real site authors use the Section Metadata table and the delivery service adds those classes.

## Rebrand

Edit the variables at the top of [`styles/styles.css`](styles/styles.css):

| Variable | Controls |
|---|---|
| `--link-color`, `--link-hover-color` | Brand color: buttons, links, highlights |
| `--accent-color` | Check marks, focus ring |
| `--gradient` | Stat numbers, step numbers, badges, call-to-action band |
| `--night-color` | Hero and dark section background |
| `--radius`, `--shadow` | Card shape and depth |
| `--body-font-family`, `--heading-font-family` | Fonts (system stack by default) |

## Blocks

Each block is a table in your document. The first row is the block name. See every block live, with authoring notes, on the **block library page**: run `npm run dev` and open http://localhost:3000/library ([source](drafts/library.html)).

**Layout and content**

| Block | Rows | Columns |
|---|---|---|
| **Hero** | One row | Heading, text, buttons. Italic words in the heading get the gradient. An italic line above the heading becomes a pill label. Optional image becomes the background. |
| **Cards** | One per card | Optional image column, then heading and text |
| **Columns** | One per feature | Image cell and text cell. Rows alternate sides on desktop. |
| **Stats** | One per stat | Number, label. Numbers count up on scroll. |
| **Steps** | One per step | Title, description. Numbered automatically. |
| **Logos** | Any | One logo image or company name per cell |
| **Testimonials** | One per quote | Quote, then name and role |
| **Pricing** | One per plan | Plan name (H3), price, feature list, button. Optional second column with badge text such as "Most popular" highlights the plan. |
| **Table** | First row is the heading row | One cell per column |
| **Callout** | One | Content. Variants: `Callout (success)`, `Callout (warning)` |

**Interactive components** (plain JavaScript, loaded only on pages that use them)

| Block | Rows | Columns |
|---|---|---|
| **Tabs** | One per tab | Tab label, panel content. Arrow-key navigation. |
| **Accordion** | One per item | Question, answer |
| **Carousel** | One per slide | Optional image column, then content. Scroll-snap, arrow buttons, no autoplay. |
| **Modal** | One | Button label, dialog content. Native `<dialog>`. |
| **Embed** | One | YouTube or Vimeo link. Loads the player only after the visitor presses play. |

**From the boilerplate:** Fragment, Header, Footer.

Buttons: make a link **bold** for a primary button, *italic* for a secondary button.

Eyebrow labels: an italic-only line directly above any heading becomes a small uppercase label.

## Section styles

Add a **Section Metadata** table with a `Style` row. Combine with commas, for example `dark, center`.

| Style | Effect |
|---|---|
| `center` | Centered text, narrower intro paragraph |
| `narrow` | 800px content width, good for FAQ and long text |
| `light` | Soft grey band |
| `dark` | Dark band; every block inside adapts |
| `cta` | Gradient call-to-action band |

## Development

```sh
npm run lint
```

## License

Apache-2.0. Based on the Adobe AEM boilerplate, © Adobe, also Apache-2.0. See [LICENSE](LICENSE).
