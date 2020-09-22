/* global $, $$ */

import Component from './component'

export default class PageComponent extends Component {
  get content() {
    return $$('[class^="Page_content__"]')
  }
  get deleteButton() {
    return $('[class*="Page_delete__"]')
  }
}

export const pageComponent = new PageComponent()
