package helpers

func MapFunc[T any, R any](array []T, callback func(T) R) []R {
	newArray := make([]R, len(array))

	for idx, item := range array {
		newArray[idx] = callback(item)
	}
	return newArray
}
