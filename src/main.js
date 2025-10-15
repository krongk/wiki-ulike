import * as Turbo from "@hotwired/turbo"
import Alpine from 'alpinejs'
import collapse from '@alpinejs/collapse'
import { Application } from "@hotwired/stimulus"
import MenuController from "./menu_controller"
import ViewImagesController from "./view_images_controller"
// import NavtreeController from "./navtree_controller"
// import ThemeController from "./theme_controller"
import Dropdown from 'stimulus-dropdown'
import Clipboard from '@stimulus-components/clipboard'

import TurboNavTreeController from "./turbo_nav_tree_controller"

window.Alpine = Alpine
Alpine.plugin(collapse)
Alpine.start()

const application = Application.start()
window.Stimulus = application
application.register('menu', MenuController)
application.register('view_images', ViewImagesController)
// application.register('theme', ThemeController)
application.register('dropdown', Dropdown)
application.register('clipboard', Clipboard)
application.register('turbo-nav-tree', TurboNavTreeController)
