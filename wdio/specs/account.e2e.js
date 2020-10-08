/* global describe, it, browser, expect */
import config from '../../config'
import { accountPage } from '../pages/account.page'
import { authenticatedPage } from '../pages/authenticated.page'
import { fragmentsPage } from '../pages/fragments.page'
import { loginPage } from '../pages/login.page'
import { storyListPage } from '../pages/storylist.page'

describe('Account', () => {
  it('should login with valid credentials', () => {
    loginPage.open()
    loginPage.login('joaquimds@gmail.com', 'password')
    expect(browser).toHaveUrl(`${config.site.url}/`)
    expect(authenticatedPage.accountLink).toHaveText('Account')
  })
  it('should visit account page', () => {
    authenticatedPage.accountLink.click()
    expect(browser).toHaveUrl(`${config.site.url}/account`)
  })
  it('should view fragments', () => {
    accountPage.fragmentsLink.click()
    expect(browser).toHaveUrl(`${config.site.url}/account/fragments`)
    expect(fragmentsPage.loadMoreButton).toBeExisting()
    expect(fragmentsPage.fragments).toHaveLength(3)
    fragmentsPage.loadMoreButton.click()
    fragmentsPage.loadMoreButton.click()
    expect(fragmentsPage.loadMoreButton).not.toBeExisting()
    expect(fragmentsPage.fragments).toHaveLength(8)
    browser.back()
  })
  it('should view favourites', () => {
    accountPage.favouritesLink.click()
    expect(browser).toHaveUrl(`${config.site.url}/account/favourites`)
    expect(storyListPage.loadMoreButton).toBeExisting()
    expect(storyListPage.stories).toHaveLength(3)
    storyListPage.loadMoreButton.click()
    expect(storyListPage.loadMoreButton).not.toBeExisting()
    expect(storyListPage.stories).toHaveLength(5)
    browser.back()
  })
  it('should log out', () => {
    accountPage.logoutButton.click()
    expect(browser).toHaveUrl(`${config.site.url}/`)
  })
})
