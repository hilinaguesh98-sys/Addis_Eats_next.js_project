export async function fetcher(key) {
  let url = key

  if (Array.isArray(key)) {
    const [path, search, category, sort, page] = key
    const params = new URLSearchParams({ search, category, sort, page: String(page), pageSize: '6' })
    url = `${path}?${params}`
  }

  const response = await fetch(url)
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`)
  }

  return data
}