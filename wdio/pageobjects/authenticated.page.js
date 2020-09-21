/* global $ */

import Page from './page'

/**
 * sub page containing specific selectors and methods for a specific page
 */
export default class AuthenticatedPage extends Page {
  get accountLink() {
    return $('a[href="/account"]')
  }
}

export const authenticatedPage = new AuthenticatedPage()
