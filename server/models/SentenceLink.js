import { Model } from 'objection'
import { Like } from './Like'
import { Point } from './Point'

export class SentenceLink extends Model {
  static get tableName() {
    return 'sentenceLinks'
  }

  async isProtected(storyId) {
    const likeResult = await Like.query()
      .count()
      .where({ storyId })
      .andWhereNot({ userId: this.authorId })
      .first()
    if (likeResult && likeResult.count > 0) {
      return true
    }
    const scoreResult = await Point.query()
      .count()
      .where({ storyParentId: storyId })
      .andWhere((qb) => {
        qb.where((qb) => {
          qb.where({ type: 'LIKE' }).andWhereNot({ userId: this.authorId })
        }).orWhere((qb) => {
          qb.where({ type: 'WRITE' })
        })
      })
      .first()
    return scoreResult && scoreResult.count > 0
  }
}
