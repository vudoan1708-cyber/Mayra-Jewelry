package helpers

import "testing"

func TestFalsyFallback(t *testing.T) {
	truthy := "a"
	falsy := ""
	result := FalsyFallback(falsy, truthy)

	want := truthy

	if result != want {
		t.Errorf("TestFalsyFallback: %s does not equal %s", result, want)
	}
}
