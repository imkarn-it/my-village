import { describe, test, expect, vi } from 'vitest'
import { getPublicIdFromUrl } from '../cloudinary.service'

// Note: uploadToCloudinary and deleteFromCloudinary are not tested here
// because they require mocking the cloudinary SDK which is complex.
// These should be tested via integration tests with Cloudinary sandbox.

describe('Cloudinary Service', () => {
    describe('getPublicIdFromUrl', () => {
        test('should extract public ID from standard Cloudinary URL', () => {
            const url = 'https://res.cloudinary.com/mycloud/image/upload/v1234567890/village-app/image.jpg'
            const result = getPublicIdFromUrl(url)
            expect(result).toBe('village-app/image')
        })

        test('should extract public ID without version', () => {
            const url = 'https://res.cloudinary.com/mycloud/image/upload/folder/subfolder/file.png'
            const result = getPublicIdFromUrl(url)
            expect(result).toBe('folder/subfolder/file')
        })

        test('should handle nested folders', () => {
            const url = 'https://res.cloudinary.com/mycloud/image/upload/v123/foo/bar/baz/image.webp'
            const result = getPublicIdFromUrl(url)
            expect(result).toBe('foo/bar/baz/image')
        })

        test('should return null for invalid URL', () => {
            const url = 'https://example.com/some-image.jpg'
            const result = getPublicIdFromUrl(url)
            expect(result).toBeNull()
        })

        test('should return null for URL without upload segment', () => {
            const url = 'https://res.cloudinary.com/mycloud/image/fetch/https://example.com/image.jpg'
            const result = getPublicIdFromUrl(url)
            expect(result).toBeNull()
        })

        test('should handle file without extension', () => {
            const url = 'https://res.cloudinary.com/mycloud/image/upload/v123/folder/filename'
            const result = getPublicIdFromUrl(url)
            expect(result).toBe('folder/filename')
        })

        test('should handle different resource types', () => {
            const url = 'https://res.cloudinary.com/mycloud/video/upload/v123/videos/myvideo.mp4'
            const result = getPublicIdFromUrl(url)
            expect(result).toBe('videos/myvideo')
        })
    })
})
