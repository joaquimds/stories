/* global describe, it, browser, expect */
import config from '../../config'
import { pageComponent } from '../components/page.component'
import { writeComponent } from '../components/write.component'
import { accountPage } from '../pages/account.page'
import { authenticatedPage } from '../pages/authenticated.page'
import { fragmentsPage } from '../pages/fragments.page'
import { loginPage } from '../pages/login.page'
import { sentencePage } from '../pages/sentence.page'

describe('Write', () => {
  it('should login with valid credentials', () => {
    loginPage.open()
    loginPage.login('joaquimds@gmail.com', 'password')
    expect(browser).toHaveUrl(`${config.site.url}/`)
  })
  it('should write a new sentence', () => {
    sentencePage.open('Beginning')
    expect(browser).toHaveUrl(`${config.site.url}/Beginning`)
    writeComponent.input.setValue('New sentence')
    writeComponent.submit.click()
    expect(browser).not.toHaveUrl(`${config.site.url}/Beginning`)
    expect(pageComponent.content[1]).toHaveText('New sentence')
    browser.back()
  })
  it('should see new sentence in all orders', () => {
    expect(browser).toHaveUrl(`${config.site.url}/Beginning`)
    expect(sentencePage.sentences[3]).toHaveText('New sentence')
    sentencePage.newestButton.click()
    expect(sentencePage.loadMoreButton).toBeExisting()
    expect(sentencePage.sentences[0]).toHaveText('New sentence')
    sentencePage.oldestButton.click()
    sentencePage.loadMoreButton.click()
    expect(sentencePage.loadMoreButton).not.toBeExisting()
    expect(sentencePage.sentences[4]).toHaveText('New sentence')
  })
  it('should write a newer sentence and like it', () => {
    writeComponent.input.setValue('Newer sentence')
    writeComponent.submit.click()
    expect(browser).not.toHaveUrl(`${config.site.url}/Beginning`)
    expect(pageComponent.content[1]).toHaveText('Newer sentence')
    pageComponent.likeButton.click()
    expect(pageComponent.unlikeButton).toBeExisting()
    browser.back()
  })
  it('should see newer sentence in all orders', () => {
    expect(browser).toHaveUrl(`${config.site.url}/Beginning`)
    sentencePage.popularButton.click()
    expect(sentencePage.sentences[3]).toHaveText('New sentence')
    expect(sentencePage.sentences[4]).toHaveText('Newer sentence')
    sentencePage.newestButton.click()
    expect(sentencePage.newestButton).toHaveElementClassContaining('active')
    expect(sentencePage.sentences[0]).toHaveText('New sentence')
    expect(sentencePage.sentences[3]).toHaveText('Newer sentence')
    sentencePage.oldestButton.click()
    expect(sentencePage.loadMoreButton).not.toBeExisting()
    expect(sentencePage.sentences[5]).toHaveText('Newer sentence')
  })
  it('should see new sentences in fragments', () => {
    authenticatedPage.accountLink.click()
    accountPage.fragmentsLink.click()
    expect(fragmentsPage.loadMoreButton).toBeExisting()
    expect(fragmentsPage.fragments).toHaveLength(3)
    fragmentsPage.loadMoreButton.click()
    fragmentsPage.loadMoreButton.click()
    fragmentsPage.loadMoreButton.click()
    expect(fragmentsPage.loadMoreButton).not.toBeExisting()
    expect(fragmentsPage.fragments).toHaveLength(10)
  })
  it('should see newer sentence in favourites', () => {
    authenticatedPage.accountLink.click()
    accountPage.favouritesLink.click()
    expect(fragmentsPage.loadMoreButton).toBeExisting()
    expect(fragmentsPage.fragments).toHaveLength(3)
    fragmentsPage.loadMoreButton.click()
    expect(fragmentsPage.loadMoreButton).not.toBeExisting()
    expect(fragmentsPage.fragments).toHaveLength(5)
    expect(fragmentsPage.fragments[4]).toHaveText('Newer sentence')
  })
  it('should delete sentences', () => {
    fragmentsPage.fragments[4].click()
    expect(pageComponent.deleteButton).toBeExisting()
    pageComponent.deleteButton.click()
    expect(browser).toHaveUrl(`${config.site.url}/Beginning`)
    sentencePage.sentences[3].click()
    expect(browser).not.toHaveUrl(`${config.site.url}/Beginning`)
    expect(pageComponent.deleteButton).toBeExisting()
    pageComponent.deleteButton.click()
    expect(browser).toHaveUrl(`${config.site.url}/Beginning`)
    expect(sentencePage.sentences).toHaveLength(3)
    expect(sentencePage.loadMoreButton).toBeExisting()
    sentencePage.loadMoreButton.click()
    expect(sentencePage.loadMoreButton).not.toBeExisting()
    expect(sentencePage.sentences).toHaveLength(4)
  })
  it('should not see deleted sentences in fragments', () => {
    authenticatedPage.accountLink.click()
    accountPage.fragmentsLink.click()
    expect(fragmentsPage.loadMoreButton).not.toBeExisting()
    expect(fragmentsPage.fragments).toHaveLength(8)
  })
  it('should not see deleted sentence in favourites', () => {
    authenticatedPage.accountLink.click()
    accountPage.favouritesLink.click()
    expect(fragmentsPage.loadMoreButton).not.toBeExisting()
    expect(fragmentsPage.fragments).toHaveLength(4)
  })
})
