/* global $, $$ */

import Page from './page'

/**
 * sub page containing specific selectors and methods for a specific page
 */
export default class LibraryPage extends Page {
  open() {
    super.open('library')
  }

  get stories() {
    return $$('[class^="Library_story__"] h2')
  }

  get storyLinks() {
    return $$('[class^="Library_story__"] a')
  }

  get loadMoreButton() {
    return $('[class^="Library_load-more__"] button')
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

export const libraryPage = new LibraryPage()
