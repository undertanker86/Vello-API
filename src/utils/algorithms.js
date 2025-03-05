// https://www.mongodb.com/docs/manual/reference/method/cursor.skip/#pagination-example

export const pagingSkipValue = (page, itemsPerPage) => {
  if (!page || !itemsPerPage) return 0
  if (page <= 0 || itemsPerPage <= 0) return 0
  return (page - 1) * itemsPerPage
}

