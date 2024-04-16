import { create } from 'zustand'

type UrlState = {
  url: string,
  updateUrl: (newUrl: string) => void,
}

export const useUrlStore = create<UrlState>((set) => ({
  url: "",
  updateUrl: (newUrl: string) => set({ url: newUrl }),
}))