import { describe, expect, it } from 'vitest'
import {
  MAX_NOTICES,
  noticeDismissed,
  noticeRequested,
  noticesReducer,
  initialNoticesState,
} from './noticesSlice'

const request = (message: string, persistent = false) => ({
  message,
  persistent,
})

describe('notices slice', () => {
  it('FR13: a new Notice goes on top with a fresh id', () => {
    let state = noticesReducer(
      initialNoticesState,
      noticeRequested(request('a')),
    )
    state = noticesReducer(state, noticeRequested(request('b')))
    expect(state.items.map((n) => n.message)).toEqual(['b', 'a'])
    expect(state.items.map((n) => n.id)).toEqual([2, 1])
  })

  it('UX-DR18: at most three Notices stack, dropping the oldest', () => {
    let state = initialNoticesState
    for (const message of ['a', 'b', 'c', 'd']) {
      state = noticesReducer(state, noticeRequested(request(message)))
    }
    expect(state.items).toHaveLength(MAX_NOTICES)
    expect(state.items.map((n) => n.message)).toEqual(['d', 'c', 'b'])
  })

  it('FR13: a dismissed Notice is removed by id', () => {
    let state = noticesReducer(
      initialNoticesState,
      noticeRequested(request('a')),
    )
    state = noticesReducer(state, noticeRequested(request('b', true)))
    state = noticesReducer(state, noticeDismissed(2))
    expect(state.items.map((n) => n.message)).toEqual(['a'])
  })
})
