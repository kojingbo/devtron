'use strict';

class ModuleView extends View {
  constructor(module, table) {
    super('js-requires-table-row')

    this.module = module
    this.table = table

    table.appendChild(this.element)
    this.render()
    this.children = this.module.children.map((child) => new ModuleView(child, table))
    this.module.getDepth() === 1 ? this.expand() : this.collapse()
    this.handleEvents()
  }

  handleEvents() {
    this.disclosure.addEventListener('click', () => this.toggleExpansion())
    this.table.addEventListener('mousedown', (event) => {
      if (this.element.contains(event.target))
        this.select()
      else
        this.deselect()
    })
    window.addEventListener('keydown', (event) => {
      if (!this.selected) return

      switch (event.code) {
        case 'ArrowDown':
          this.selectNext()
          event.stopImmediatePropagation()
          break
        case 'ArrowLeft':
          this.collapse()
          event.stopImmediatePropagation()
          break
        case 'ArrowRight':
          this.expand()
          event.stopImmediatePropagation()
          break
        case 'ArrowUp':
          this.selectPrevious()
          event.stopImmediatePropagation()
          break
      }
    })
  }

  getHumanizedSize() {
    const size = this.module.getSize()
    if (size > 1024 * 1024) {
      return `${Math.round((size * 10) / (1024 * 1024)) / 10}M`
    } else if (size > 1024) {
      return `${Math.round((size * 10) / 1024) / 10}K`
    } else {
      return `${size}B`
    }
  }

  isHidden() {
    return this.element.classList.contains('hidden')
  }

  hide() {
    this.element.classList.add('hidden')
    this.children.forEach((child) => child.hide())
  }

  show() {
    this.element.classList.remove('hidden')
    if (this.expanded)
      this.children.forEach((child) => child.show())
  }

  select() {
    this.selected = true
    this.element.classList.add('active')
  }

  deselect() {
    this.selected = false
    this.element.classList.remove('active')
  }

  selectNext() {
    let next = this.element.nextElementSibling
    while (next && (next.view instanceof ModuleView)) {
      if (next.view.isHidden()) {
        next = next.nextElementSibling
        continue
      }
      this.deselect()
      next.view.select()
      break
    }
  }

  selectPrevious() {
    let previous = this.element.previousElementSibling
    while (previous && (previous.view instanceof ModuleView)) {
      if (previous.view.isHidden()) {
        previous = previous.previousElementSibling
        continue
      }
      this.deselect()
      previous.view.select()
      break
    }
  }

  toggleExpansion() {
    if (this.expanded) {
      this.collapse()
    } else {
      this.expand()
    }
  }

  expand() {
    this.expanded = true
    this.disclosure.classList.add('disclosure-arrow-expanded')
    this.children.forEach((child) => child.show())
  }

  collapse() {
    this.expanded = false
    this.disclosure.classList.remove('disclosure-arrow-expanded')
    this.children.forEach((child) => child.hide())
  }

  render() {
    this.moduleName.textContent = this.module.getLibrary()
    this.fileSize.textContent = this.getHumanizedSize()

    if (this.module.hasChildren()) this.element.classList.add('has-children')
    this.fileName.textContent = this.module.getName()
    this.moduleDirectory.textContent = this.module.getDirectory()
    this.pathSection.style['padding-left'] = `${(this.module.getDepth()) * 15}px`
  }
}

document.addEventListener("DOMContentLoaded", () => {
  getRequires().then((mainModule) => {
    const table = document.querySelector('.js-requires-table')
    let selectedView = new ModuleView(mainModule, table)
    selectedView.select()
  })
});
