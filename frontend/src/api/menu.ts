import { apiClient } from './client'
import { MenuItem } from '../types'

export const fetchMenu = async (): Promise<MenuItem[]> => (await apiClient.get<MenuItem[]>('/menu')).data
