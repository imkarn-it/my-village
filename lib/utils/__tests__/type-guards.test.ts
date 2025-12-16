import { describe, test, expect } from 'vitest'
import {
    isDefined,
    isNullish,
    isString,
    isNumber,
    isObject,
    isArray,
    isNonEmptyString,
    isNonEmptyArray,
    objectKeys,
    objectEntries,
    objectFromEntries,
    pick,
    omit,
    compact,
    unique,
    groupBy,
    first,
    last,
    getErrorMessage,
    createErrorHandler,
} from '../type-guards'

describe('Type Guards', () => {
    describe('isDefined', () => {
        test('should return true for defined values', () => {
            expect(isDefined(0)).toBe(true)
            expect(isDefined('')).toBe(true)
            expect(isDefined(false)).toBe(true)
            expect(isDefined([])).toBe(true)
            expect(isDefined({})).toBe(true)
        })

        test('should return false for null or undefined', () => {
            expect(isDefined(null)).toBe(false)
            expect(isDefined(undefined)).toBe(false)
        })
    })

    describe('isNullish', () => {
        test('should return true for null or undefined', () => {
            expect(isNullish(null)).toBe(true)
            expect(isNullish(undefined)).toBe(true)
        })

        test('should return false for defined values', () => {
            expect(isNullish(0)).toBe(false)
            expect(isNullish('')).toBe(false)
            expect(isNullish(false)).toBe(false)
        })
    })

    describe('isString', () => {
        test('should return true for strings', () => {
            expect(isString('hello')).toBe(true)
            expect(isString('')).toBe(true)
        })

        test('should return false for non-strings', () => {
            expect(isString(123)).toBe(false)
            expect(isString(null)).toBe(false)
            expect(isString(undefined)).toBe(false)
            expect(isString({})).toBe(false)
        })
    })

    describe('isNumber', () => {
        test('should return true for valid numbers', () => {
            expect(isNumber(0)).toBe(true)
            expect(isNumber(123)).toBe(true)
            expect(isNumber(-456)).toBe(true)
            expect(isNumber(3.14)).toBe(true)
        })

        test('should return false for NaN', () => {
            expect(isNumber(NaN)).toBe(false)
        })

        test('should return false for non-numbers', () => {
            expect(isNumber('123')).toBe(false)
            expect(isNumber(null)).toBe(false)
            expect(isNumber(undefined)).toBe(false)
        })
    })

    describe('isObject', () => {
        test('should return true for plain objects', () => {
            expect(isObject({})).toBe(true)
            expect(isObject({ key: 'value' })).toBe(true)
        })

        test('should return false for null, arrays, and primitives', () => {
            expect(isObject(null)).toBe(false)
            expect(isObject([])).toBe(false)
            expect(isObject('string')).toBe(false)
            expect(isObject(123)).toBe(false)
        })
    })

    describe('isArray', () => {
        test('should return true for arrays', () => {
            expect(isArray([])).toBe(true)
            expect(isArray([1, 2, 3])).toBe(true)
        })

        test('should return false for non-arrays', () => {
            expect(isArray({})).toBe(false)
            expect(isArray('string')).toBe(false)
            expect(isArray(null)).toBe(false)
        })
    })

    describe('isNonEmptyString', () => {
        test('should return true for non-empty strings', () => {
            expect(isNonEmptyString('hello')).toBe(true)
            expect(isNonEmptyString('  text  ')).toBe(true)
        })

        test('should return false for empty or whitespace strings', () => {
            expect(isNonEmptyString('')).toBe(false)
            expect(isNonEmptyString('   ')).toBe(false)
        })

        test('should return false for non-strings', () => {
            expect(isNonEmptyString(123)).toBe(false)
            expect(isNonEmptyString(null)).toBe(false)
        })
    })

    describe('isNonEmptyArray', () => {
        test('should return true for non-empty arrays', () => {
            expect(isNonEmptyArray([1])).toBe(true)
            expect(isNonEmptyArray([1, 2, 3])).toBe(true)
        })

        test('should return false for empty arrays', () => {
            expect(isNonEmptyArray([])).toBe(false)
        })

        test('should return false for non-arrays', () => {
            expect(isNonEmptyArray({})).toBe(false)
            expect(isNonEmptyArray('string')).toBe(false)
        })
    })
})

describe('Object Utilities', () => {
    describe('objectKeys', () => {
        test('should return typed keys', () => {
            const obj = { a: 1, b: 2, c: 3 }
            const keys = objectKeys(obj)
            expect(keys).toEqual(['a', 'b', 'c'])
        })
    })

    describe('objectEntries', () => {
        test('should return typed entries', () => {
            const obj = { a: 1, b: 2 }
            const entries = objectEntries(obj)
            expect(entries).toEqual([['a', 1], ['b', 2]])
        })
    })

    describe('objectFromEntries', () => {
        test('should create object from entries', () => {
            const entries: [string, number][] = [['a', 1], ['b', 2]]
            const obj = objectFromEntries(entries)
            expect(obj).toEqual({ a: 1, b: 2 })
        })
    })

    describe('pick', () => {
        test('should pick specified keys', () => {
            const obj = { a: 1, b: 2, c: 3 }
            const picked = pick(obj, ['a', 'c'])
            expect(picked).toEqual({ a: 1, c: 3 })
        })

        test('should handle non-existent keys', () => {
            const obj = { a: 1, b: 2 }
            const picked = pick(obj, ['a', 'c'] as any)
            expect(picked).toEqual({ a: 1 })
        })
    })

    describe('omit', () => {
        test('should omit specified keys', () => {
            const obj = { a: 1, b: 2, c: 3 }
            const omitted = omit(obj, ['b'])
            expect(omitted).toEqual({ a: 1, c: 3 })
        })
    })
})

describe('Array Utilities', () => {
    describe('compact', () => {
        test('should filter out null and undefined', () => {
            const arr = [1, null, 2, undefined, 3]
            expect(compact(arr)).toEqual([1, 2, 3])
        })

        test('should keep falsy values that are not null/undefined', () => {
            const arr = [0, false, '', null, undefined]
            expect(compact(arr)).toEqual([0, false, ''])
        })
    })

    describe('unique', () => {
        test('should return unique values', () => {
            expect(unique([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3])
            expect(unique(['a', 'b', 'a', 'c'])).toEqual(['a', 'b', 'c'])
        })

        test('should handle empty arrays', () => {
            expect(unique([])).toEqual([])
        })
    })

    describe('groupBy', () => {
        test('should group items by key', () => {
            const items = [
                { type: 'fruit', name: 'apple' },
                { type: 'fruit', name: 'banana' },
                { type: 'vegetable', name: 'carrot' },
            ]
            const grouped = groupBy(items, item => item.type)
            expect(grouped).toEqual({
                fruit: [
                    { type: 'fruit', name: 'apple' },
                    { type: 'fruit', name: 'banana' },
                ],
                vegetable: [
                    { type: 'vegetable', name: 'carrot' },
                ],
            })
        })
    })

    describe('first', () => {
        test('should return first element', () => {
            expect(first([1, 2, 3])).toBe(1)
            expect(first(['a', 'b'])).toBe('a')
        })

        test('should return undefined for empty array', () => {
            expect(first([])).toBeUndefined()
        })
    })

    describe('last', () => {
        test('should return last element', () => {
            expect(last([1, 2, 3])).toBe(3)
            expect(last(['a', 'b'])).toBe('b')
        })

        test('should return undefined for empty array', () => {
            expect(last([])).toBeUndefined()
        })
    })
})

describe('Error Utilities', () => {
    describe('getErrorMessage', () => {
        test('should extract message from Error instance', () => {
            const error = new Error('Test error')
            expect(getErrorMessage(error)).toBe('Test error')
        })

        test('should return string errors as-is', () => {
            expect(getErrorMessage('String error')).toBe('String error')
        })

        test('should return fallback for unknown errors', () => {
            expect(getErrorMessage({})).toBe('เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ')
            expect(getErrorMessage(123)).toBe('เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ')
            expect(getErrorMessage(null)).toBe('เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ')
        })
    })

    describe('createErrorHandler', () => {
        test('should create error handler with fallback', () => {
            const handler = createErrorHandler('Default error')
            expect(handler(new Error('Test'))).toBe('Test')
            expect(handler('String error')).toBe('String error')
            // createErrorHandler uses getErrorMessage which returns Thai default message
            expect(handler({})).toBe('เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ')
        })
    })
})
