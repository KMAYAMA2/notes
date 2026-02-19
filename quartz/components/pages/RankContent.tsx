import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"
import { FullSlug, resolveRelative, simplifySlug } from "../../util/path"

const RankContent: QuartzComponent = (props: QuartzComponentProps) => {
  const { fileData, allFiles } = props

  // Filter to real content pages only
  const contentFiles = allFiles.filter((f) => {
    const slug = f.slug
    if (!slug) return false
    if (slug.startsWith("tags/")) return false
    if (slug === "index") return false
    if (slug === "rank") return false
    return true
  })

  // Compute connection counts for each file
  const ranked = contentFiles.map((file) => {
    const simpleSlug = simplifySlug(file.slug!)
    const inCount = allFiles.filter((f) => f.links?.includes(simpleSlug)).length
    const outCount = (file.links ?? []).length
    return {
      slug: file.slug!,
      title: file.frontmatter?.title ?? file.slug!,
      section: file.slug!.includes("/") ? file.slug!.split("/")[0] : "",
      inCount,
      outCount,
      total: inCount + outCount,
    }
  })

  // Sort by total connections descending, then alphabetically by title
  ranked.sort((a, b) => b.total - a.total || a.title.localeCompare(b.title))

  return (
    <div class="popover-hint">
      <article>
        <p>
          {ranked.length} notes ranked by total connections (incoming + outgoing links).
        </p>
        <table class="rank-table">
          <thead>
            <tr>
              <th class="rank-col">#</th>
              <th>Title</th>
              <th class="section-col">Section</th>
              <th class="num-col">Total</th>
              <th class="num-col">In</th>
              <th class="num-col">Out</th>
            </tr>
          </thead>
          <tbody>
            {ranked.map((note, i) => (
              <tr>
                <td class="rank-col">{i + 1}</td>
                <td>
                  <a
                    href={resolveRelative(fileData.slug!, note.slug as FullSlug)}
                    class="internal"
                  >
                    {note.title}
                  </a>
                </td>
                <td class="section-col">{note.section}</td>
                <td class="num-col">{note.total}</td>
                <td class="num-col">{note.inCount}</td>
                <td class="num-col">{note.outCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </article>
    </div>
  )
}

RankContent.css = `
.rank-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1em;
}

.rank-table th,
.rank-table td {
  padding: 0.4em 0.8em;
  text-align: left;
  border-bottom: 1px solid var(--lightgray);
}

.rank-table th {
  font-weight: 600;
  border-bottom: 2px solid var(--gray);
}

.rank-table .rank-col {
  width: 3em;
  text-align: right;
  opacity: 0.6;
}

.rank-table .section-col {
  width: 5em;
  opacity: 0.6;
}

.rank-table .num-col {
  width: 4em;
  text-align: right;
}

.rank-table tbody tr:hover {
  background: var(--highlight);
}
`

export default (() => RankContent) satisfies QuartzComponentConstructor
