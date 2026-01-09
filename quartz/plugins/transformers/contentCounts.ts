import { QuartzTransformerPlugin } from "../types"

export const ContentCounts: QuartzTransformerPlugin = () => {
  return {
    name: "ContentCounts",
    textTransform(_ctx, src) {
      // Replace {{count:TYPE}} with a span that will be processed during emit
      // Supported types: notes, people, essays
      return src.replace(
        /\{\{count:(notes|people|essays)\}\}/gi,
        (_match, type) => `<span data-content-count="${type.toLowerCase()}"></span>`,
      )
    },
  }
}
