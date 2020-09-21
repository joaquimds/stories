/* global describe, it, browser, expect */
import config from '../../config'
import { accountPage } from '../pageobjects/account.page'
import { authenticatedPage } from '../pageobjects/authenticated.page'
import { fragmentsPage } from '../pageobjects/fragments.page'
import { loginPage } from '../pageobjects/login.page'

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
    expect(fragmentsPage.loadMoreButton).toBeExisting()
    expect(fragmentsPage.fragments).toHaveLength(3)
    fragmentsPage.loadMoreButton.click()
    expect(fragmentsPage.loadMoreButton).not.toBeExisting()
    expect(fragmentsPage.fragments).toHaveLength(4)
    browser.back()
  })
  it('should log out', () => {
    accountPage.logoutButton.click()
    expect(browser).toHaveUrl(`${config.site.url}/`)
  })
})
