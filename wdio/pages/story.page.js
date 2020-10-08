/* global $, $$ */

import Page from './page'

/**
 * sub page containing specific selectors and methods for a specific page
 */
export default class StoryPage extends Page {
  get sentences() {
    return $$('[class^="StoryLink_link__"]')
  }

  get loadMoreButton() {
    return $('[class^="StoryTree_load-more__"] button')
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

export const storyPage = new StoryPage()
