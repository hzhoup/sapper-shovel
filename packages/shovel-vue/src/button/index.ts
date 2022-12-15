import { ref } from 'vue'

interface UseButtonOptions {
  click?: () => void
}

export const useButton = (options: UseButtonOptions) => {
  const loading = ref(false)
  const execute = async () => {
    loading.value = true
    await options.click?.()
    loading.value = false
  }

  return { loading, execute }
}
