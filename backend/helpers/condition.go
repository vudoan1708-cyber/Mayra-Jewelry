package helpers

func FalsyFallback[T comparable](primary T, fallback T) T {
	var falsy T
	if primary != falsy {
		return primary
	}
	return fallback
}
