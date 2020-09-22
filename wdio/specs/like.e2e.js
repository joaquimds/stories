/* global describe, it, browser, expect */
import config from '../../config'
import { pageComponent } from '../components/page.component'
import { fragmentsPage } from '../pages/fragments.page'
import { loginPage } from '../pages/login.page'
import { sentencePage } from '../pages/sentence.page'

describe('Like', () => {
  it('should login with valid credentials', () => {
    loginPage.open()
    loginPage.login('joaquimds@gmail.com', 'password')
    expect(browser).toHaveUrl(`${config.site.url}/`)
  })
  it('should like a story', () => {
    sentencePage.sentences[0].click()
    expect(browser).toHaveUrl(`${config.site.url}/Beginning`)
    expect(pageComponent.likeButton).toBeExisting()
    pageComponent.likeButton.click()
    expect(pageComponent.likeButton).not.toBeExisting()
    expect(pageComponent.unlikeButton).toBeExisting()
    browser.refresh()
    expect(pageComponent.likeButton).not.toBeExisting()
    expect(pageComponent.unlikeButton).toBeExisting()
  })
  it('should show story in favourites', () => {
    fragmentsPage.open('account/favourites')
    expect(browser).toHaveUrl(`${config.site.url}/account/favourites`)
    expect(fragmentsPage.loadMoreButton).toBeExisting()
    expect(fragmentsPage.fragments[0]).toHaveText(
      "The hills across the valley of the Ebro' were long and white."
    )
    fragmentsPage.fragments[0].click()
  })
  it('should remove story from favourites', () => {
    expect(pageComponent.unlikeButton).toBeExisting()
    pageComponent.unlikeButton.click()
    expect(pageComponent.unlikeButton).not.toBeExisting()
    expect(pageComponent.likeButton).toBeExisting()
  })
})
