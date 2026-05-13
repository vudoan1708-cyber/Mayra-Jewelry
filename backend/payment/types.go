// Package payment encapsulates the transition from a pending order to a paid
// order. Verifiers validate provider evidence; ConfirmOrderPayment performs
// state mutation and side effects in one place. New providers plug in by
// implementing Verifier and calling Register at boot.
package payment

import (
	"context"
	"encoding/json"
	"time"
)

type Source string

const (
	SourceManualBank    Source = "manual_bank"
	SourceVietQRWebhook Source = "vietqr_webhook"
	SourceStripe        Source = "stripe"
	SourceVNPay         Source = "vnpay"
)

type Method string

const (
	MethodVietQRStatic  Method = "vietqr_static"
	MethodVietQRWebhook Method = "vietqr_webhook"
	MethodStripe        Method = "stripe"
)

type Confirmation struct {
	OrderID string
	BuyerID string
	Source  Source
	Ref     string
	PaidAt  time.Time
	Raw     json.RawMessage
}

type Verifier interface {
	Source() Source
	Verify(ctx context.Context, evidence []byte) (Confirmation, error)
}
