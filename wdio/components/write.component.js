/* global $ */

import Component from './component'

export default class WriteComponent extends Component {
  get input() {
    return $('[class^="Write_write__"] form textarea')
  }
  get submit() {
    return $('[class^="Write_write__"] form button')
  }
}

export const writeComponent = new WriteComponent()
