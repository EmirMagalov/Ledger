document.addEventListener('DOMContentLoaded', () => {
  const generateBtn = document.querySelector('[data-js-generate-button]')
  if (!generateBtn) return

  generateBtn.addEventListener('click', () => {
    const firstRow = document.querySelector('.reports-table__row:not(.reports-table__row--head)')
    if (!firstRow) return

    firstRow.style.backgroundColor = '#313131'

    const link = firstRow.querySelector('.reports-table__link')
    if (link) {
      link.innerHTML = 'Loading<span class="reports-table__dots"></span>'
      link.style.pointerEvents = 'none'
      link.style.gap = '0'
    }
  })
})