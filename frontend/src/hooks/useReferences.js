import { useQuery } from '@tanstack/react-query'
import { referenceApi } from '@/api/endpoints'

const ONE_HOUR = 60 * 60 * 1000

export function useRegions() {
  return useQuery({
    queryKey: ['regions'],
    queryFn: referenceApi.regions,
    staleTime: ONE_HOUR,
  })
}

export function useDistricts(regionId) {
  return useQuery({
    queryKey: ['districts', regionId],
    queryFn: () => referenceApi.districts(regionId),
    staleTime: ONE_HOUR,
    enabled: !!regionId,
  })
}

export function useProfessions() {
  return useQuery({
    queryKey: ['professions'],
    queryFn: referenceApi.professions,
    staleTime: ONE_HOUR,
  })
}

export function useIndustries() {
  return useQuery({
    queryKey: ['industries'],
    queryFn: referenceApi.industries,
    staleTime: ONE_HOUR,
  })
}

export function useUniversities() {
  return useQuery({
    queryKey: ['universities'],
    queryFn: () =>
      import('@/api/client').then(({ apiClient }) =>
        apiClient.get('/reference/universities/').then((r) => r.data)
      ),
    staleTime: ONE_HOUR,
  })
}

export function useUniversityDirections(universityId) {
  return useQuery({
    queryKey: ['directions', universityId],
    queryFn: () =>
      import('@/api/client').then(({ apiClient }) =>
        apiClient
          .get('/reference/directions/', {
            params: universityId ? { university: universityId } : {},
          })
          .then((r) => r.data)
      ),
    staleTime: ONE_HOUR,
    enabled: !!universityId,
  })
}
