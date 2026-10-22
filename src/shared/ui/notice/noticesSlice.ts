import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

/** How many Notices stack at once; the oldest is dropped first (UX-DR18). */
export const MAX_NOTICES = 3

export type Notice = {
  id: number
  message: string
  /** Persistent Notices never auto-dismiss (FR13). */
  persistent: boolean
}

export type NoticesState = {
  items: Notice[]
  /** Next id to issue. Kept in state so reducers stay pure (AD-3). */
  nextId: number
}

export const initialNoticesState: NoticesState = { items: [], nextId: 1 }

type NoticeRequest = Omit<Notice, 'id'>

// AD-16: only app/noticeListener.ts dispatches noticeRequested.
export const noticesSlice = createSlice({
  name: 'notices',
  initialState: initialNoticesState,
  reducers: {
    noticeRequested(state, action: PayloadAction<NoticeRequest>) {
      // Newest on top: prepend, then keep at most MAX_NOTICES.
      state.items.unshift({ id: state.nextId, ...action.payload })
      state.items = state.items.slice(0, MAX_NOTICES)
      state.nextId += 1
    },
    noticeDismissed(state, action: PayloadAction<number>) {
      state.items = state.items.filter((notice) => notice.id !== action.payload)
    },
  },
})

export const { noticeRequested, noticeDismissed } = noticesSlice.actions
export const noticesReducer = noticesSlice.reducer
