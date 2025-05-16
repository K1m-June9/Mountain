// src/lib/types/reaction.ts

import { ID, Timestamps, ReactionType } from './common';

/**
 * 반응 관련 타입 정의
 */

/**
 * 반응 기본 정보
 */
export interface Reaction extends Timestamps {
  id: ID;
  user_id: ID;
  post_id?: ID;
  comment_id?: ID;
  type: ReactionType;
}