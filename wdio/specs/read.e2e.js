/* global describe, it, browser, expect */
import config from '../../config'
import { pageComponent } from '../components/page.component'
import { storyListPage } from '../pages/storylist.page'

describe('Read', () => {
  it('should view the library', () => {
    storyListPage.open()
    expect(browser).toHaveUrl(`${config.site.url}/library`)
    expect(storyListPage.stories).toHaveLength(3)
    storyListPage.loadMoreButton.click()
    expect(storyListPage.loadMoreButton).not.toBeExisting()
    expect(storyListPage.stories).toHaveLength(4)
    expect(storyListPage.storyTitles[0]).toHaveText('Following')
    expect(storyListPage.storyTitles[1]).toHaveText('Ending')
    expect(storyListPage.storyTitles[2]).toHaveText('Beginning')
    expect(storyListPage.storyTitles[3]).toHaveText('Alternate')
    storyListPage.newestButton.click()
    expect(storyListPage.newestButton).toHaveElementClassContaining('active')
    expect(storyListPage.storyTitles[0]).toHaveText('Ending')
    expect(storyListPage.storyTitles[1]).toHaveText('Alternate')
    expect(storyListPage.storyTitles[2]).toHaveText('Following')
    storyListPage.oldestButton.click()
    expect(storyListPage.oldestButton).toHaveElementClassContaining('active')
    expect(storyListPage.storyTitles[0]).toHaveText('Beginning')
    expect(storyListPage.storyTitles[1]).toHaveText('Following')
    expect(storyListPage.storyTitles[2]).toHaveText('Alternate')
  })
  it('should view a story', () => {
    storyListPage.newestButton.click()
    expect(storyListPage.newestButton).toHaveElementClassContaining('active')
    storyListPage.stories[0].click()
    expect(browser).toHaveUrl(`${config.site.url}/Ending`)
    expect(pageComponent.content).toHaveLength(3)
    expect(pageComponent.content[0]).toHaveText(
      "The hills across the valley of the Ebro' were long and white."
    )
    expect(pageComponent.content[1]).toHaveText(
      'Close against the side of the station there was the warm shadow of the building and a curtain, made of strings of bamboo beads hung across the open door into the bar, to keep out flies.'
    )
    expect(pageComponent.content[2]).toHaveText(
      'It stopped at this junction for two minutes and went on to Madrid.'
    )
  })
  it('should navigate to an earlier point in the story', () => {
    pageComponent.content[0].click()
    pageComponent.viewLink.click()
    expect(browser).toHaveUrl(`${config.site.url}/Beginning`)
  })
})
