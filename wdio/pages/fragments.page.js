/* global $, $$ */

import AuthenticatedPage from './authenticated.page'

/**
 * sub page containing specific selectors and methods for a specific page
 */
export default class FragmentsPage extends AuthenticatedPage {
  get fragments() {
    return $$('[class^="AccountSentenceList_sentence__"] a')
  }

  get loadMoreButton() {
    return $('[class^="AccountSentenceList_load-more"] button')
  }
}

export const fragmentsPage = new FragmentsPage()
