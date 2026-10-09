import { describe, expect, it } from 'vitest'
import { useInput } from './useInput'

describe('useInput', () => {
  it('menginisialisasi, mengubah, dan mereset nilai', () => {
    const { values, setValue, setValues, reset } = useInput({ name: 'a', age: 1 })
    expect(values).toEqual({ name: 'a', age: 1 })
    setValue('name', 'b')
    expect(values.name).toBe('b')
    setValues({ age: 5 })
    expect(values.age).toBe(5)
    reset()
    expect(values).toEqual({ name: 'a', age: 1 })
  })

  it('onInput menyalin nilai dari event', () => {
    const { values, onInput } = useInput({ name: '' })
    const input = document.createElement('input')
    input.value = 'Delcom'
    onInput('name')({ target: input } as unknown as Event)
    expect(values.name).toBe('Delcom')
  })
})
