// 结构为：
// <ul>
//  <li>
//    <div data-turbo-nav-tree-item>
//     item内容
//     <button>...</button>
//    </div>
//    <div data-turbo-nav-tree-children-container>
//     <ul>...</ul> (可选)
//     <turbo-frame>...</turbo-frame> (可选)
//    </div>
//  </li>
// </ul>

import { Controller } from "@hotwired/stimulus"
import Mustache from "mustache"

export default class extends Controller {
  static values = {
    navTree: Array,
    depth: Number,
    parentPath: String,
    url: String,
    currentPath: String,
    idPrefix: String,
    containerStyle: String,
    rootContainer: String, // 整个栏目树的容器是什么，class
    itemStyle: String,
    itemActiveClass: String,
    linkTurboFrame: String,
    linkTurboFrameAction: String,
    linkTurbo: Boolean // 新增参数
  }

  static targets = [
    "itemTemplate" // item 模板
  ]

  connect() {
    this.itemTemplate = this.hasItemTemplateTarget ? this.itemTemplateTarget.innerHTML.trim() : null
    if (!this.hasCurrentPathValue) {
      this.currentPathValue = window.location.pathname
    }

    // 渲染导航树
    this.renderTree(this.navTreeValue || [], this.depthValue || 0, this.element)

    requestAnimationFrame(() => {
      this.menuContainer = this.rootContainer()
    })
  }

  renderTree(nodes, depth, container) {
    const ul = document.createElement("ul")
    ul.className = this.hasContainerStyleValue ? this.containerStyleValue : "w-full space-y-1"
    requestAnimationFrame(() => {
      nodes.forEach(node => {
        const liDom = document.createElement("li")

        liDom.className = this.hasItemStyleValue ? this.itemStyleValue : ""

        const isActive = this.isPathActive(node)
        const shouldOpen = isActive || this.hasActiveChild(node)
        const useRenderChildren = node.children?.length > 0
        const useRenderTurboFrame = node.children?.length == 0 && node.children_count > 0

        // --- item 内容 ---
        const itemHtml = this.renderItem(node, depth, shouldOpen, isActive)
        liDom.innerHTML = itemHtml
        const treeItem = liDom.children[0]
        treeItem.setAttribute('turbo-nav-tree-item', '')

        const childrenContainer = document.createElement("div")
        childrenContainer.setAttribute("turbo-nav-tree-children-container", "")
        childrenContainer.classList.add("transition-all", "duration-300")
        childrenContainer.hidden = !shouldOpen

        if (isActive) {
          // const activeClass = this.hasItemActiveClassValue ? this.itemActiveClassValue : ""
          liDom.setAttribute("active", "")
          if (this.isPathActive(node, false)) treeItem.setAttribute("active", "")

          requestAnimationFrame(() => {
            liDom.scrollIntoView({ behavior: "smooth", block: "center" })
          })
        }

        // --- 有 children 数据，直接渲染 ---
        if (useRenderChildren) {
          this.renderTree(node.children, depth + 1, childrenContainer)
        }

        // --- 没有 children 数据，但 children_count > 0，使用 turbo-frame 懒加载 ---
        if (useRenderTurboFrame) {
          this.appendTurboFrame(childrenContainer, node, depth + 1)
        }

        liDom.appendChild(childrenContainer)
        ul.appendChild(liDom)
      })

      container.appendChild(ul)
    })
  }

  // 懒加载 turbo-frame
  appendTurboFrame(container, node, depth) {
    const tf = document.createElement("turbo-frame")
    tf.classList.add("w-full")
    const idPrefix = this.hasIdPrefixValue ? this.idPrefixValue : "nav_tree_frame_"
    tf.id = `${idPrefix}${node.path.replaceAll('/', '_')}`

    const urlBase = this.urlValue.split("?")[0]
    const params = new URLSearchParams()
    params.set("parent_path", node.path)
    params.set("depth", depth)
    tf.src = `${urlBase}?${params.toString()}`
    tf.loading = "lazy"

    tf.innerHTML = `
      <div class="flex justify-center items-center bg-transparent text-base-content/60">
        <span class="loading loading-spinner loading-sm"></span>
      </div>
    `
    container.appendChild(tf)
  }

  toggle(event) {
    const target = event.currentTarget
    const li = target.closest("li")
    const childrenContainer = li.querySelector("[turbo-nav-tree-children-container]")

    if (childrenContainer && childrenContainer.children.length > 0) {
      const shouldOpen = childrenContainer.hidden

      // 添加过渡动画
      if (shouldOpen) {
        childrenContainer.hidden = false
        childrenContainer.classList.add('opacity-0')
        requestAnimationFrame(() => {
          childrenContainer.classList.remove('opacity-0')
          childrenContainer.classList.add('opacity-100')
        })
      } else {
        childrenContainer.classList.add('opacity-100')
        requestAnimationFrame(() => {
          childrenContainer.classList.remove('opacity-100')
          childrenContainer.classList.add('opacity-0')
        })
        childrenContainer.addEventListener("transitionend", () => {
          childrenContainer.hidden = true
        }, { once: true })
      }

      const itemTargetIcon = li.querySelector("[turbo-nav-tree-item-target-icon]")
      itemTargetIcon.classList.add("transition-transform", "duration-300", 'peer-hover:text-primary')
      itemTargetIcon.classList.toggle("rotate-90", shouldOpen)
    }
  }

  click(event) {
    const target = event.currentTarget
    const li = target.closest("li")
    this.menuContainer?.querySelectorAll('[active]').forEach(el => {
      el.removeAttribute('active');
    })

    this.getParents(target, 'li').forEach(el => {
      el.setAttribute('active', '');
    })

    li.querySelector('[turbo-nav-tree-item]')?.setAttribute('active', '')
  }

  // 单个 item 渲染
  renderItem(node, depth, open = false, isActive = false) {
    const hasChildren = node.children_count > 0

    // 动态拼接 a 标签属性
    let aAttrs = []
    if (this.hasLinkTurboFrameValue && this.linkTurboFrameValue) {
      aAttrs.push(`data-turbo-frame="${this.linkTurboFrameValue}"`)
    }
    if (this.hasLinkTurboFrameActionValue && this.linkTurboFrameActionValue) {
      aAttrs.push(`data-turbo-action="${this.linkTurboFrameActionValue}"`)
    }
    if (this.hasLinkTurboValue && this.linkTurboValue === false) {
      aAttrs = [`data-turbo="false"`]
    }

    let template = ""
    if (this.itemTemplate) {
      template = this.itemTemplate
    } else {
      template = `
        <div class="flex items-center">
          <a href="{{path}}"
            ${aAttrs.join(" ")}
            class="block hover:underline"
            style="padding-left: {{padding}}rem">
            {{link_text}}
          </a>
        </div>
      `
      if (hasChildren) {
        template = `
          <div class="flex items-center" data-action="click->turbo-nav-tree#toggle">
            <a href="{{path}}"
              ${aAttrs.join(" ")}
              class="block hover:underline"
              style="padding-left: {{padding}}rem">
              {{{link_text}}}
            </a>
            <!-- 有子节点时显示 toggle 按钮 -->
            <div turbo-nav-tree-item-target-icon class="inline-block ml-auto mr-1 ${open ? "rotate-90" : ""}">
              <svg class="w-4 h-4 opacity-70 transition-transform duration-200"
                  fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M9 6l6 6-6 6"/>
              </svg>
            </div>
          </div>
        `
      }
    }

    return Mustache.render(template, {
      ...node,
      depth,
      padding: depth * 1.25,
      hasChildren,
      open,
      isActive,
    })
  }

  // 激活判断
  isPathActive(node, isPrefix = true) {
    if (isPrefix) {
      const currentParts = this.currentPathValue.split('/').filter(Boolean)
      const nodeParts = node.path.split('/').filter(Boolean)

      if (nodeParts.length > currentParts.length) return false

      return nodeParts.every((part, idx) => currentParts[idx] === part)
    } else {
      return node.path == this.currentPathValue
    }
  }

  hasActiveChild(node) {
    if (!node.children || node.children.length === 0) return false
    return node.children.some(child => this.isPathActive(child) || this.hasActiveChild(child))
  }

  /**
   * 从元素向上查找所有符合 selector 的父级元素
   * @param {Element} el - 起始元素
   * @param {string} selector - 父元素选择器
   * @param {Element} [root=document.body] - 可选查找上限
   * @returns {Element[]} - 符合条件的父级元素数组，按从近到远顺序
  */
  getParents(el, selector, root = null) {
    const parents = [];
    let parent = el.parentElement;

    while (parent && parent !== root) {
      if (parent.matches(selector)) {
        parents.push(parent);
      }
      parent = parent.parentElement;
    }
    return parents;
  }

  rootContainer() {
    if (this.hasRootContainerValue) {
      return this.element.closest(this.rootContainerValue)
    } else {
      return this.getParents(this.element.querySelector('li'), 'ul').at(-1)
    }
  }
}
