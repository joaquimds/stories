/* global describe, it, browser, expect */
import config from '../../config'
import { pageComponent } from '../components/page.component'
import { writeComponent } from '../components/write.component'
import { accountPage } from '../pages/account.page'
import { authenticatedPage } from '../pages/authenticated.page'
import { fragmentsPage } from '../pages/fragments.page'
import { loginPage } from '../pages/login.page'
import { storyPage } from '../pages/story.page'
import { storyListPage } from '../pages/storylist.page'

describe('Write', () => {
  it('should login with valid credentials', () => {
    loginPage.open()
    loginPage.login('joaquimds@gmail.com', 'password')
    expect(browser).toHaveUrl(`${config.site.url}/`)
  })
  it('should write a new sentence', () => {
    storyPage.open('Beginning')
    expect(browser).toHaveUrl(`${config.site.url}/Beginning`)
    writeComponent.input.setValue('New sentence')
    writeComponent.submit.click()
    expect(browser).not.toHaveUrl(`${config.site.url}/Beginning`)
    expect(pageComponent.content[1]).toHaveText('New sentence')
    browser.back()
  })
  it('should see new sentence in all orders', () => {
    expect(browser).toHaveUrl(`${config.site.url}/Beginning`)
    expect(storyPage.sentences[3]).toHaveText('New sentence')
    storyPage.newestButton.click()
    expect(storyPage.loadMoreButton).toBeExisting()
    expect(storyPage.sentences[0]).toHaveText('New sentence')
    storyPage.oldestButton.click()
    storyPage.loadMoreButton.click()
    expect(storyPage.loadMoreButton).not.toBeExisting()
    expect(storyPage.sentences[4]).toHaveText('New sentence')
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
    storyPage.popularButton.click()
    expect(storyPage.sentences[3]).toHaveText('New sentence')
    expect(storyPage.sentences[4]).toHaveText('Newer sentence')
    storyPage.newestButton.click()
    expect(storyPage.newestButton).toHaveElementClassContaining('active')
    expect(storyPage.sentences[0]).toHaveText('New sentence')
    expect(storyPage.sentences[3]).toHaveText('Newer sentence')
    storyPage.oldestButton.click()
    expect(storyPage.loadMoreButton).not.toBeExisting()
    expect(storyPage.sentences[5]).toHaveText('Newer sentence')
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
    expect(storyListPage.loadMoreButton).toBeExisting()
    expect(storyListPage.stories).toHaveLength(3)
    storyListPage.loadMoreButton.click()
    expect(storyListPage.loadMoreButton).not.toBeExisting()
    expect(storyListPage.stories).toHaveLength(6)
    expect(storyListPage.stories[0]).toHaveText(
      "The hills across the valley of the Ebro' were long and white. → Newer sentence"
    )
  })
  it('should delete sentences', () => {
    storyListPage.stories[0].click()
    expect(pageComponent.deleteButton).toBeExisting()
    pageComponent.deleteButton.click()
    expect(browser).toHaveUrl(`${config.site.url}/Beginning`)
    storyPage.loadMoreButton.click()
    expect(storyPage.loadMoreButton).not.toBeExisting()
    storyPage.sentences[4].click()
    expect(browser).not.toHaveUrl(`${config.site.url}/Beginning`)
    expect(pageComponent.deleteButton).toBeExisting()
    pageComponent.deleteButton.click()
    expect(browser).toHaveUrl(`${config.site.url}/Beginning`)
    expect(storyPage.sentences).toHaveLength(3)
    expect(storyPage.loadMoreButton).toBeExisting()
    storyPage.loadMoreButton.click()
    expect(storyPage.loadMoreButton).not.toBeExisting()
    expect(storyPage.sentences).toHaveLength(4)
  })
  it('should not see deleted sentences in fragments', () => {
    authenticatedPage.accountLink.click()
    accountPage.fragmentsLink.click()
    expect(fragmentsPage.loadMoreButton).toBeExisting()
    fragmentsPage.loadMoreButton.click()
    fragmentsPage.loadMoreButton.click()
    expect(fragmentsPage.loadMoreButton).not.toBeExisting()
    expect(fragmentsPage.fragments).toHaveLength(8)
  })
  it('should not see deleted sentence in favourites', () => {
    authenticatedPage.accountLink.click()
    accountPage.favouritesLink.click()
    expect(storyListPage.loadMoreButton).toBeExisting()
    storyListPage.loadMoreButton.click()
    expect(storyListPage.loadMoreButton).not.toBeExisting()
    expect(storyListPage.stories).toHaveLength(5)
  })
})
