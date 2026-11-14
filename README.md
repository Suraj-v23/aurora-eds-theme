# Aurora — SaaS landing theme for AEM Edge Delivery Services

A free, fast, ready-to-author landing page theme for [AEM Edge Delivery Services](https://www.aem.live/). Built on the official [Adobe AEM boilerplate](https://github.com/adobe/aem-boilerplate), so the standard tooling, Sidekick and upgrade path keep working.

- No build step, no web fonts, no dependencies at runtime
- Rebrand the whole site from one block of CSS variables
- 9 blocks and 6 section styles, each authored as a plain table
- Dark sections, visible focus rings, reduced-motion support

## Quick start

1. Click **Use this template** on GitHub to create your own repository.
2. Install the [AEM Code Sync](https://github.com/apps/aem-code-sync) GitHub app on it.
3. Point the project at your content source (Google Drive, SharePoint or DA) as described in the [AEM developer tutorial](https://www.aem.live/developer/tutorial).
4. Run it locally with the bundled demo page:

```sh
npm install
npm run dev
```

Open http://localhost:3000. The demo content lives in [`drafts/`](drafts/).

## Rebrand

Edit the variables at the top of [`styles/styles.css`](styles/styles.css):

| Variable | Controls |
|---|---|
| `--link-color`, `--link-hover-color` | Brand color: buttons, links, highlights |
| `--accent-color` | Second gradient color, check marks, focus ring |
| `--night-color` | Hero and dark section background |
| `--radius`, `--shadow` | Card shape and depth |
| `--body-font-family`, `--heading-font-family` | Fonts (system stack by default) |

## Blocks

Each block is a table in your document. The first row is the block name.

| Block | Rows | Columns |
|---|---|---|
| **Hero** | One row | Heading, text, buttons. Optional image becomes the background. |
| **Cards** | One per card | Optional image column, then heading and text |
| **Stats** | One per stat | Number, label |
| **Testimonials** | One per quote | Quote, then name and role |
| **Pricing** | One per plan | Plan name (H3), price, feature list, button. Optional second column with badge text such as "Most popular" highlights the plan. |
| **Accordion** | One per item | Question, answer |
| **Columns**, **Fragment**, **Header**, **Footer** | As in the boilerplate | |

Buttons: make a link **bold** for a primary button, *italic* for a secondary button.

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
