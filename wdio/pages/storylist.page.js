/* global $, $$ */

import Page from './page'

/**
 * sub page containing specific selectors and methods for a specific page
 */
export default class StoryListPage extends Page {
  open(path = 'library') {
    super.open(path)
  }

  get storyTitles() {
    return $$('[class^="StoryList_story__"] h2')
  }

  get stories() {
    return $$('[class^="StoryList_story__"] a')
  }

  get loadMoreButton() {
    return $('[class^="StoryList_load-more__"] button')
  }

  get popularButton() {
    return $('button=Popular')
  }

  get newestButton() {
    return $('button=Newest')
  }

  get oldestButton() {
    return $('button=Oldest')
  }
}

export const storyListPage = new StoryListPage()
