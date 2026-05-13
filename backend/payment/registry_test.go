package payment

import (
	"context"
	"testing"
)

type fakeVerifier struct {
	source Source
}

func (fake fakeVerifier) Source() Source { return fake.source }
func (fakeVerifier) Verify(_ context.Context, _ []byte) (Confirmation, error) {
	return Confirmation{}, nil
}

func TestRegister_AndGet(t *testing.T) {
	resetForTest()

	verifier := fakeVerifier{source: "test_source"}
	Register(verifier)

	retrieved, exists := Get("test_source")
	if !exists {
		t.Fatal("expected verifier to be registered")
	}
	if retrieved.Source() != "test_source" {
		t.Fatalf("got source %q, want %q", retrieved.Source(), "test_source")
	}
}

func TestGet_MissingSourceReturnsFalse(t *testing.T) {
	resetForTest()

	_, exists := Get("never_registered")
	if exists {
		t.Fatal("expected Get to return false for unregistered source")
	}
}

func TestRegister_NilVerifierPanics(t *testing.T) {
	resetForTest()

	defer func() {
		if recover() == nil {
			t.Fatal("expected panic on nil verifier")
		}
	}()
	Register(nil)
}

func TestRegister_EmptySourcePanics(t *testing.T) {
	resetForTest()

	defer func() {
		if recover() == nil {
			t.Fatal("expected panic on empty source")
		}
	}()
	Register(fakeVerifier{source: ""})
}

func TestRegister_DuplicateSourcePanics(t *testing.T) {
	resetForTest()

	Register(fakeVerifier{source: "dup_source"})

	defer func() {
		if recover() == nil {
			t.Fatal("expected panic on duplicate source registration")
		}
	}()
	Register(fakeVerifier{source: "dup_source"})
}
