import { reactive } from 'vue'

/** Composable bertipe untuk two-way binding dan pengelolaan input form. */
export function useInput<T extends Record<string, unknown>>(initialValues: T) {
  const values = reactive({ ...initialValues }) as T

  function setValue<K extends keyof T>(key: K, value: T[K]): void {
    values[key] = value
  }

  function setValues(next: Partial<T>): void {
    Object.assign(values, next)
  }

  function reset(): void {
    Object.assign(values, initialValues)
  }

  /** Handler `@input` yang menyalin nilai elemen input ke field terkait. */
  function onInput<K extends keyof T>(key: K) {
    return (event: Event): void => {
      values[key] = (event.target as HTMLInputElement).value as T[K]
    }
  }

  return { values, setValue, setValues, reset, onInput }
}
