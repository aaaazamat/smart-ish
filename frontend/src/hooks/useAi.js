import { useMutation } from '@tanstack/react-query'
import { aiApi } from '@/api/endpoints'

export function useGenerateVacancyDescription() {
  return useMutation({
    mutationFn: aiApi.generateVacancyDescription,
  })
}

export function useAiChat() {
  return useMutation({
    mutationFn: aiApi.chat,
  })
}

export function useAiMatch() {
  return useMutation({
    mutationFn: aiApi.match,
  })
}

export function useAiTopMatchedResumes() {
  return useMutation({
    mutationFn: aiApi.topMatchedResumes,
  })
}

export function useAiTopVacanciesForMe() {
  return useMutation({
    mutationFn: aiApi.topVacanciesForMe,
  })
}
