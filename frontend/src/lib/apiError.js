export function getApiError(error, fallback = 'Xatolik yuz berdi') {
  if (!error) return fallback
  const data = error.response?.data
  if (!data) return error.message || fallback

  if (typeof data === 'string') return data
  if (data.detail) return data.detail

  const firstField = Object.keys(data)[0]
  if (firstField) {
    const value = data[firstField]
    if (Array.isArray(value)) return value[0]
    if (typeof value === 'string') return value
  }

  return fallback
}

export function applyApiErrorsToForm(error, setError) {
  const data = error?.response?.data
  if (!data || typeof data !== 'object') return

  Object.entries(data).forEach(([field, messages]) => {
    if (field === 'detail') return
    const message = Array.isArray(messages) ? messages[0] : String(messages)
    setError(field, { type: 'server', message })
  })
}
