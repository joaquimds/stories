/* global describe, it, browser, expect */
import config from '../../config'
import { pageComponent } from '../components/page.component'
import { libraryPage } from '../pages/library.page'

describe('Read', () => {
  it('should view the library', () => {
    libraryPage.open()
    expect(browser).toHaveUrl(`${config.site.url}/library`)
    expect(libraryPage.stories).toHaveLength(3)
    libraryPage.loadMoreButton.click()
    expect(libraryPage.loadMoreButton).not.toBeExisting()
    expect(libraryPage.stories).toHaveLength(4)
    expect(libraryPage.stories[0]).toHaveText('Following')
    expect(libraryPage.stories[1]).toHaveText('Ending')
    expect(libraryPage.stories[2]).toHaveText('Beginning')
    expect(libraryPage.stories[3]).toHaveText('Alternate')
    libraryPage.newestButton.click()
    expect(libraryPage.newestButton).toHaveElementClassContaining('active')
    expect(libraryPage.stories[0]).toHaveText('Ending')
    expect(libraryPage.stories[1]).toHaveText('Alternate')
    expect(libraryPage.stories[2]).toHaveText('Following')
    libraryPage.oldestButton.click()
    expect(libraryPage.oldestButton).toHaveElementClassContaining('active')
    expect(libraryPage.stories[0]).toHaveText('Beginning')
    expect(libraryPage.stories[1]).toHaveText('Following')
    expect(libraryPage.stories[2]).toHaveText('Alternate')
  })
  it('should view a story', () => {
    libraryPage.newestButton.click()
    expect(libraryPage.newestButton).toHaveElementClassContaining('active')
    libraryPage.storyLinks[0].click()
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
    expect(browser).toHaveUrl(`${config.site.url}/Beginning`)
  })
})
