package helpers

func MapFunc[T any, R any](array []T, callback func(T, int) R) []R {
	newArray := make([]R, len(array))

	for idx, item := range array {
		newArray[idx] = callback(item, idx)
	}
	return newArray
}

func FilterFunc[T any](array []T, callback func(T, int) bool) []T {
	newArray := make([]T, 0, len(array))

	for idx, item := range array {
		if callback(item, idx) {
			newArray = append(newArray, item)
		}
	}

	return newArray
}

func FindFunc[T any](array []T, callback func(T, int) bool) (*T, bool) {
	for idx, item := range array {
		if callback(item, idx) {
			return &item, true
		}
	}
	return nil, false
}

func FlatFunc[T any](array [][]T) []T {
	var flat []T

	for _, items := range array {
		flat = append(flat, items...)
	}
	return flat
}
