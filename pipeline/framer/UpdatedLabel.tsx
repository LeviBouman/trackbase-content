import { addPropertyControls, ControlType, useLocaleInfo } from "framer"

/**
 * Trackbase — "Updated <date>" label for blog posts
 *
 * Bind `published` to the Blog Date field and `updated` to the Updated field.
 * Renders nothing when the post was never updated after publication (same day),
 * so old posts keep showing only their publication date.
 *
 * @framerSupportedLayoutWidth auto
 * @framerSupportedLayoutHeight auto
 */
function day(v: any): string {
    if (!v) return ""
    const d = new Date(v)
    if (isNaN(d.getTime())) return ""
    return d.toISOString().slice(0, 10)
}

export default function UpdatedLabel(props: any) {
    const { published, updated, labelEn, labelNl, color, fontSize, style } = props
    let locale = "en-US"
    let isNl = false
    try {
        const info: any = useLocaleInfo()
        const code = (info && info.activeLocale && info.activeLocale.code) || ""
        if (/^nl/i.test(code)) { locale = "nl-NL"; isNl = true }
    } catch (e) {}
    const u = day(updated)
    const p = day(published)
    if (!u || (p && u <= p)) return null
    const text = new Date(u + "T12:00:00Z").toLocaleDateString(locale, { year: "numeric", month: "short", day: "numeric" })
    return (
        <span
            style={{
                display: "inline-block",
                color: color || "#6B7A90",
                fontSize: fontSize || 12,
                lineHeight: 1,
                letterSpacing: "-0.025em",
                fontWeight: 600,
                fontFamily: "'Geist', 'Inter', sans-serif",
                whiteSpace: "nowrap",
                ...style,
            }}
        >
            {(isNl ? labelNl || "Bijgewerkt" : labelEn || "Updated") + " " + text}
        </span>
    )
}

UpdatedLabel.defaultProps = { labelEn: "Updated", labelNl: "Bijgewerkt", color: "#6B7A90", fontSize: 12 }

addPropertyControls(UpdatedLabel, {
    published: { type: ControlType.Date, title: "Published" },
    updated: { type: ControlType.Date, title: "Updated" },
    labelEn: { type: ControlType.String, title: "Label EN", defaultValue: "Updated" },
    labelNl: { type: ControlType.String, title: "Label NL", defaultValue: "Bijgewerkt" },
    color: { type: ControlType.Color, title: "Color", defaultValue: "#6B7A90" },
    fontSize: { type: ControlType.Number, title: "Font size", defaultValue: 12, min: 10, max: 20 },
})
