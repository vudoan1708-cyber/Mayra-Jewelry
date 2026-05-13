package payment

import "fmt"

var registry = map[Source]Verifier{}

func Register(verifier Verifier) {
	if verifier == nil {
		panic("payment.Register: nil verifier")
	}
	source := verifier.Source()
	if source == "" {
		panic("payment.Register: verifier returned empty Source")
	}
	if _, exists := registry[source]; exists {
		panic(fmt.Sprintf("payment.Register: source %q already registered", source))
	}
	registry[source] = verifier
}

func Get(source Source) (Verifier, bool) {
	verifier, exists := registry[source]
	return verifier, exists
}

func resetForTest() {
	registry = map[Source]Verifier{}
}
