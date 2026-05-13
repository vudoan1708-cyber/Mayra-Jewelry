package payment

import (
	"context"
	"strings"
	"testing"
)

func TestManualBankVerifier_Source(t *testing.T) {
	verifier := ManualBankVerifier{}
	if verifier.Source() != SourceManualBank {
		t.Fatalf("got source %q, want %q", verifier.Source(), SourceManualBank)
	}
}

func TestManualBankVerifier_RejectsInvalidBase64(t *testing.T) {
	verifier := ManualBankVerifier{}
	_, verifyErr := verifier.Verify(context.Background(), []byte("not!!valid!!base64!!"))
	if verifyErr == nil {
		t.Fatal("expected an error on invalid base64 evidence")
	}
	if !strings.Contains(verifyErr.Error(), "decode evidence") {
		t.Fatalf("expected decode-evidence error, got: %v", verifyErr)
	}
}

func TestManualBankVerifier_RejectsUnknownSessionToken(t *testing.T) {
	verifier := ManualBankVerifier{}
	// "aGVsbG8" is base64-url for "hello" — decodes fine, won't match any active session.
	_, verifyErr := verifier.Verify(context.Background(), []byte("aGVsbG8="))
	if verifyErr == nil {
		t.Fatal("expected an error when no session matches the cypher text")
	}
	if !strings.Contains(verifyErr.Error(), "no session matches") {
		t.Fatalf("expected no-session error, got: %v", verifyErr)
	}
}
