import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"
import { SimpleSlug } from "./quartz/util/path"

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  footer: Component.Footer({
    links: {
      // GitHub: "https://github.com/jackyzha0/quartz",
      // "Discord Community": "https://discord.gg/cRFFHYye7t",
      "Twitter": "https://twitter.com/kmayama2",
      "Farcaster": "https://warpcast.com/kenty",
      "Newsletter": "https://paragraph.xyz/@kenti"
    },
  }),
}

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.Breadcrumbs(),
    Component.ArticleTitle(),
    Component.ContentMeta(),
    Component.TagList(),
  ],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Search(),
    Component.Darkmode(),
    Component.DesktopOnly(
      Component.Explorer({
        title: "Explore", // title of the explorer component
        folderClickBehavior: "collapse", // what happens when you click a folder ("link" to navigate to folder page on click or "collapse" to collapse folder on click)
        folderDefaultState: "collapsed", // default state of folders ("collapsed" or "open")
        useSavedState: false, // whether to use local storage to save "state" (which folders are opened) of explorer
        // Sort order: folders first, then files. Sort folders and files alphabetically
        /*
        sortFn: (a, b) => {
          ... // default implementation shown later
        },
        filterFn: filterFn: (node) => node.name !== "tags", // filters out 'tags' folder
        mapFn: undefined,
        // what order to apply functions in
        order: ["filter", "map", "sort"],
        */
      }),
    ),
    // Recent Essays
    Component.DesktopOnly(
      Component.RecentNotes({
        title: "Recent Essays",
        limit: 1,
        showTags: false,
        filter: (f) =>
          f.slug!.startsWith("essays/") && f.slug! !== "notes/index" && !f.frontmatter?.noindex,
        linkToMore: "essays/" as SimpleSlug,
      }),
    ),
    // Recent Notes
    Component.DesktopOnly(
      Component.RecentNotes({
        title: "Recent Notes",
        limit: 1,
        showTags: false,
        filter: (f) =>
          f.slug!.startsWith("notes/") && f.slug! !== "notes/index" && !f.frontmatter?.noindex,
        linkToMore: "notes/" as SimpleSlug,
      }),
    ),
    // Recent People
    Component.DesktopOnly(
      Component.RecentNotes({
        title: "Recent People",
        limit: 1,
        showTags: false,
        filter: (f) =>
          f.slug!.startsWith("people/") && f.slug! !== "notes/index" && !f.frontmatter?.noindex,
        linkToMore: "people/" as SimpleSlug,
      }),
    ),
  ],
  right: [
    Component.Graph({
      localGraph: {
        drag: true, // whether to allow panning the view around
        zoom: true, // whether to allow zooming in and out
        depth: 2, // how many hops of notes to display - was 1
        scale: 1.1, // default view scale
        repelForce: 0.5, // how much nodes should repel each other
        centerForce: 0.3, // how much force to use when trying to center the nodes
        linkDistance: 30, // how long should the links be by default?
        fontSize: 0.6, // what size should the node labels be?
        opacityScale: 1, // how quickly do we fade out the labels when zooming out?
        removeTags: [], // what tags to remove from the graph
        showTags: false, // whether to show tags in the graph - was false
        // enableRadial: false, // whether to constrain the graph, similar to Obsidian
      },
      globalGraph: {
        drag: true,
        zoom: true,
        depth: -1,
        scale: 0.9,
        repelForce: 0.5,
        centerForce: 0.3,
        linkDistance: 30,
        fontSize: 0.6,
        opacityScale: 1,
        removeTags: [], // what tags to remove from the graph
        showTags: false, // whether to show tags in the graph
        // enableRadial: true, // whether to constrain the graph, similar to Obsidian
      },
    }),
    Component.DesktopOnly(Component.TableOfContents()),
    Component.Backlinks(),
  ],
}

// components for pages that display lists of pages  (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
  beforeBody: [Component.Breadcrumbs(), Component.ArticleTitle(), Component.ContentMeta()],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Search(),
    Component.Darkmode(),
    Component.DesktopOnly(Component.Explorer()),
  ],
  right: [],
}
