import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { vacanciesApi } from '@/api/endpoints'

export function useVacancies(params) {
  return useQuery({
    queryKey: ['vacancies', params],
    queryFn: () => vacanciesApi.list(params),
    placeholderData: (previous) => previous,
  })
}

export function useLikedVacancies(params) {
  return useQuery({
    queryKey: ['liked-vacancies', params],
    queryFn: () => vacanciesApi.liked(params),
    placeholderData: (previous) => previous,
  })
}

export function useVacancyDetail(id) {
  return useQuery({
    queryKey: ['vacancy', id],
    queryFn: () => vacanciesApi.detail(id),
    enabled: !!id,
  })
}

export function useSimilarVacancies(id) {
  return useQuery({
    queryKey: ['vacancy', id, 'similar'],
    queryFn: () => vacanciesApi.similar(id),
    enabled: !!id,
  })
}

export function useToggleLike() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id) => vacanciesApi.toggleLike(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['vacancy', id] })
      const previous = queryClient.getQueryData(['vacancy', id])
      queryClient.setQueryData(['vacancy', id], (old) =>
        old ? { ...old, is_liked: !old.is_liked } : old
      )
      return { previous, id }
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['vacancy', context.id], context.previous)
      }
    },
    onSettled: (_data, _err, id) => {
      queryClient.invalidateQueries({ queryKey: ['vacancy', id] })
      queryClient.invalidateQueries({ queryKey: ['vacancies'] })
    },
  })
}
