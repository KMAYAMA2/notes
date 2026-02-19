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
              <th class="sortable" data-sort="title">Title</th>
              <th class="section-col sortable" data-sort="section">Section</th>
              <th class="num-col sortable active" data-sort="total">Total ↓</th>
              <th class="num-col sortable" data-sort="in">In</th>
              <th class="num-col sortable" data-sort="out">Out</th>
            </tr>
          </thead>
          <tbody>
            {ranked.map((note, i) => (
              <tr
                data-title={note.title}
                data-section={note.section}
                data-total={note.total}
                data-in={note.inCount}
                data-out={note.outCount}
              >
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

RankContent.afterDOMLoaded = `
const table = document.querySelector(".rank-table")
if (table) {
  const headers = table.querySelectorAll("th.sortable")
  let currentSort = "total"
  let ascending = false

  headers.forEach(th => {
    th.addEventListener("click", () => {
      const key = th.dataset.sort
      if (currentSort === key) {
        ascending = !ascending
      } else {
        currentSort = key
        ascending = key === "title" || key === "section"
      }

      const tbody = table.querySelector("tbody")
      const rows = Array.from(tbody.querySelectorAll("tr"))

      rows.sort((a, b) => {
        if (key === "title" || key === "section") {
          const va = a.dataset[key] || ""
          const vb = b.dataset[key] || ""
          return ascending ? va.localeCompare(vb) : vb.localeCompare(va)
        }
        const va = parseInt(a.dataset[key]) || 0
        const vb = parseInt(b.dataset[key]) || 0
        return ascending ? va - vb : vb - va
      })

      rows.forEach((row, i) => {
        row.querySelector(".rank-col").textContent = i + 1
        tbody.appendChild(row)
      })

      headers.forEach(h => {
        h.classList.remove("active")
        h.textContent = h.textContent.replace(/ [↑↓]$/, "")
      })
      th.classList.add("active")
      th.textContent += ascending ? " ↑" : " ↓"
    })
  })
}
`

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

.rank-table th.sortable {
  cursor: pointer;
  user-select: none;
}

.rank-table th.sortable:hover {
  color: var(--secondary);
}

.rank-table th.sortable.active {
  color: var(--secondary);
}
`

export default (() => RankContent) satisfies QuartzComponentConstructor
