import { addPropertyControls, ControlType, useLocaleInfo } from "framer"

/**
 * Trackbase — "Read as Markdown" link
 *
 * Links a blog post to its plain-markdown mirror on content.trackbase.ai
 * (EN: /blog/<slug>.md, NL: /nl/blog/<slug>.md). Bind `slug` to the Blog
 * collection's Slug field. Renders a small text link; the label switches
 * with the active locale.
 *
 * @framerSupportedLayoutWidth auto
 * @framerSupportedLayoutHeight auto
 */
const BASE = "https://content.trackbase.ai"

export default function MarkdownLink(props: any) {
    const { slug, labelEn, labelNl, color, fontSize, style } = props
    let isNl = false
    try {
        const info: any = useLocaleInfo()
        isNl = !!(info && info.activeLocale && /^nl/i.test(info.activeLocale.code || ""))
    } catch (e) {}
    if (!slug) return null
    const href = BASE + (isNl ? "/nl" : "") + "/blog/" + slug + ".md"
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener alternate"
            type="text/markdown"
            hrefLang={isNl ? "nl" : "en"}
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                color: color || "#4D6B9A",
                fontSize: fontSize || 14,
                lineHeight: 1.2,
                textDecoration: "none",
                fontFamily: "inherit",
                whiteSpace: "nowrap",
                ...style,
            }}
        >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="8" y1="13" x2="16" y2="13" />
                <line x1="8" y1="17" x2="16" y2="17" />
            </svg>
            {isNl ? labelNl || "Lees als Markdown" : labelEn || "Read as Markdown"}
        </a>
    )
}

MarkdownLink.defaultProps = { slug: "", labelEn: "Read as Markdown", labelNl: "Lees als Markdown", color: "#4D6B9A", fontSize: 14 }

addPropertyControls(MarkdownLink, {
    slug: { type: ControlType.String, title: "Slug" },
    labelEn: { type: ControlType.String, title: "Label EN", defaultValue: "Read as Markdown" },
    labelNl: { type: ControlType.String, title: "Label NL", defaultValue: "Lees als Markdown" },
    color: { type: ControlType.Color, title: "Color", defaultValue: "#4D6B9A" },
    fontSize: { type: ControlType.Number, title: "Font size", defaultValue: 14, min: 10, max: 24 },
})
