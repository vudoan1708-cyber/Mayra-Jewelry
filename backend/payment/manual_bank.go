package payment

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"time"

	"github.com/vudoan1708-cyber/Mayra-Jewelry/backend/mayra-jewelry/api/session"
	"github.com/vudoan1708-cyber/Mayra-Jewelry/backend/mayra-jewelry/helpers"
	nonDbModels "github.com/vudoan1708-cyber/Mayra-Jewelry/backend/mayra-jewelry/models"
)

// ManualBankVerifier confirms payment based on an admin clicking the email link
// with an encrypted session token. There is no real payment-provider check —
// human approval is the trust anchor. Stays as the admin-override fallback
// after real providers ship.
type ManualBankVerifier struct{}

func (ManualBankVerifier) Source() Source { return SourceManualBank }

func (ManualBankVerifier) Verify(_ context.Context, evidence []byte) (Confirmation, error) {
	encryptedId, decodeErr := base64.URLEncoding.DecodeString(string(evidence))
	if decodeErr != nil {
		return Confirmation{}, fmt.Errorf("manual_bank: decode evidence: %w", decodeErr)
	}
	foundSession, sessionExists := session.UserSessionFactory.GetSessionByCypherText(encryptedId)
	if !sessionExists {
		return Confirmation{}, fmt.Errorf("manual_bank: no session matches cypher text")
	}
	decrypted, decryptErr := helpers.Decrypt(foundSession.CypherText, foundSession.CypherKey, foundSession.Nonce)
	if decryptErr != nil {
		return Confirmation{}, fmt.Errorf("manual_bank: decrypt session: %w", decryptErr)
	}
	encryptionData := nonDbModels.EncryptionData{}
	if unmarshalErr := json.Unmarshal(decrypted, &encryptionData); unmarshalErr != nil {
		return Confirmation{}, fmt.Errorf("manual_bank: unmarshal session payload: %w", unmarshalErr)
	}
	if encryptionData.OrderId == "" || encryptionData.BuyerId == "" {
		return Confirmation{}, fmt.Errorf("manual_bank: session payload missing order/buyer id")
	}
	return Confirmation{
		OrderID: encryptionData.OrderId,
		BuyerID: encryptionData.BuyerId,
		Source:  SourceManualBank,
		Ref:     fmt.Sprintf("admin:%s", encryptionData.OrderId),
		PaidAt:  time.Now(),
	}, nil
}
