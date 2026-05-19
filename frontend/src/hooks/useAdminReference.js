import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/api/endpoints'

function makeRefHooks(api, queryKey) {
  return {
    useList: () => useQuery({
      queryKey: [queryKey],
      queryFn: api.list,
    }),
    useCreate: () => {
      const qc = useQueryClient()
      return useMutation({
        mutationFn: api.create,
        onSuccess: () => qc.invalidateQueries({ queryKey: [queryKey] }),
      })
    },
    useUpdate: () => {
      const qc = useQueryClient()
      return useMutation({
        mutationFn: ({ id, data }) => api.update(id, data),
        onSuccess: () => qc.invalidateQueries({ queryKey: [queryKey] }),
      })
    },
    useDelete: () => {
      const qc = useQueryClient()
      return useMutation({
        mutationFn: api.remove,
        onSuccess: () => qc.invalidateQueries({ queryKey: [queryKey] }),
      })
    },
  }
}

export const adminRegions = makeRefHooks(adminApi.reference.regions, 'admin-regions')
export const adminDistricts = makeRefHooks(adminApi.reference.districts, 'admin-districts')
export const adminProfessions = makeRefHooks(adminApi.reference.professions, 'admin-professions')
export const adminSkills = makeRefHooks(adminApi.reference.skills, 'admin-skills')
export const adminIndustries = makeRefHooks(adminApi.reference.industries, 'admin-industries')
export const adminUniversities = makeRefHooks(adminApi.reference.universities, 'admin-universities')
export const adminDirections = makeRefHooks(adminApi.reference.directions, 'admin-directions')

// Tashkilotlar — reference emas, lekin admin tomonidan boshqariladi
export const adminOrganizations = makeRefHooks(adminApi.organizations, 'admin-organizations')
