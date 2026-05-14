package helpers

import (
	"strings"
	"testing"
)

func TestGenerateToken_LengthMatchesBase64URL(t *testing.T) {
	cases := []struct {
		byteLength int
		wantLength int
	}{
		{6, 8},
		{8, 11},
		{12, 16},
		{16, 22},
	}
	for _, testCase := range cases {
		token, generateErr := GenerateToken(testCase.byteLength)
		if generateErr != nil {
			t.Fatalf("GenerateToken(%d) failed: %v", testCase.byteLength, generateErr)
		}
		if len(token) != testCase.wantLength {
			t.Errorf("GenerateToken(%d) length = %d, want %d (token=%q)", testCase.byteLength, len(token), testCase.wantLength, token)
		}
	}
}

func TestGenerateToken_OnlyURLSafeChars(t *testing.T) {
	const allowed = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"
	token, generateErr := GenerateToken(32)
	if generateErr != nil {
		t.Fatalf("GenerateToken failed: %v", generateErr)
	}
	for _, character := range token {
		if !strings.ContainsRune(allowed, character) {
			t.Errorf("GenerateToken produced disallowed char %q in token %q", character, token)
		}
	}
}

func TestGenerateToken_UniqueAcrossManyCalls(t *testing.T) {
	const iterations = 1000
	seen := make(map[string]struct{}, iterations)
	for index := 0; index < iterations; index++ {
		token, generateErr := GenerateToken(8)
		if generateErr != nil {
			t.Fatalf("GenerateToken failed on iteration %d: %v", index, generateErr)
		}
		if _, duplicate := seen[token]; duplicate {
			t.Fatalf("GenerateToken produced duplicate %q after %d iterations", token, index)
		}
		seen[token] = struct{}{}
	}
}
