/* global $ */

import AuthenticatedPage from './authenticated.page'

/**
 * sub page containing specific selectors and methods for a specific page
 */
export default class AccountPage extends AuthenticatedPage {
  get fragmentsLink() {
    return $('a[href="/account/fragments"]')
  }

  get favouritesLink() {
    return $('a[href="/account/favourites"]')
  }

  get logoutButton() {
    return $('#logout')
  }
}

export const accountPage = new AccountPage()
