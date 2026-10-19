export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

export function validateMobile(mobile) {
  const re = /^[6-9]\d{9}$/
  const clean = mobile.replace(/\D/g, '')
  return re.test(clean)
}

export function validatePassword(password) {
  return password.length >= 6
}

export function validateRequired(value) {
  return value !== undefined && value !== null && value.toString().trim() !== ''
}

export function validateNumber(value, min = 0, max = Infinity) {
  const num = parseFloat(value)
  return !isNaN(num) && num >= min && num <= max
}

export function validateDimensions(length, width, height) {
  return (
    validateNumber(length, 0.1, 100) &&
    validateNumber(width, 0.1, 100) &&
    validateNumber(height, 0.1, 100)
  )
}

export function validateBudget(min, max) {
  const minVal = parseFloat(min)
  const maxVal = parseFloat(max)
  return !isNaN(minVal) && !isNaN(maxVal) && minVal > 0 && maxVal > minVal
}

export function validateImage(file) {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp']
  const maxSize = 5 * 1024 * 1024 // 5MB
  return validTypes.includes(file.type) && file.size <= maxSize
}
