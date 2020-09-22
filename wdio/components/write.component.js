/* global $ */

import Component from './component'

export default class WriteComponent extends Component {
  get input() {
    return $('form[class^="Write_write__"] textarea')
  }
  get submit() {
    return $('form[class^="Write_write__"] button')
  }
}

export const writeComponent = new WriteComponent()
