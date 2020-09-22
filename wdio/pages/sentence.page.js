/* global $, $$ */

import Page from './page'

/**
 * sub page containing specific selectors and methods for a specific page
 */
export default class SentencePage extends Page {
  get sentences() {
    return $$('[class^="Sentence_link__"]')
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

export const sentencePage = new SentencePage()
