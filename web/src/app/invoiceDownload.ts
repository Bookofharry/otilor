export function saveBlobAsFile(blob: Blob, filename: string): void {
  const downloadUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = downloadUrl
  link.download = filename
  link.rel = 'noopener'
  link.style.display = 'none'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  window.setTimeout(() => {
    URL.revokeObjectURL(downloadUrl)
  }, 1000)
}

export function openDownloadUrl(url: string): void {
  const link = document.createElement('a')
  link.href = url
  link.target = '_blank'
  link.rel = 'noopener noreferrer'
  link.style.display = 'none'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function savePdfResult(result: Blob | string, filename: string): void {
  if (result instanceof Blob) {
    saveBlobAsFile(result, filename)
    return
  }

  openDownloadUrl(result)
}
