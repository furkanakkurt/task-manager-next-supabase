import { supabase } from '@/lib/supabase/client'
import { Category } from '@/types'

export class CategoryService {
  async getCategories(userId: string) {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return data
  }

  async createCategory(category: Partial<Category>) {
    const { data, error } = await supabase
      .from('categories')
      .insert([category])
      .select()
      .single()

    if (error) {
      throw error
    }

    return data
  }

  async updateCategory(id: string, updates: Partial<Category>) {
    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return data
  }

  async deleteCategory(id: string) {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)

    if (error) {
      throw error
    }
  }
} 