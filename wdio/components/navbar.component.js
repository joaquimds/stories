/* global $ */

import Component from './component'

export default class NavbarComponent extends Component {
  get libraryLink() {
    return $('a[href="/library"]')
  }
}

export const navbarComponent = new NavbarComponent()
