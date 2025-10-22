package session

import (
	"crypto/subtle"
	"fmt"
	"time"
)

type Session struct {
	UserId     string
	Nonce      []byte
	CypherKey  []byte
	CypherText []byte
	created_at time.Time
}

func createSessionPerUser(id string) *Session {
	now := time.Now().Local()
	userSession := Session{
		UserId:     id,
		created_at: now,
	}
	return &userSession
}
func UntilRetry(created_at time.Time) time.Duration {
	return time.Until(created_at.Add(5 * time.Second))
}

type SessionFactory struct {
	sessions map[string]*Session
}

func (fac *SessionFactory) GetSessionByUserId(userId string) (*Session, bool) {
	found, ok := fac.sessions[userId]
	return found, ok
}
func (fac *SessionFactory) GetSessionByCypherText(ct []byte) (*Session, bool) {
	for key, value := range fac.sessions {
		if subtle.ConstantTimeCompare(value.CypherText, ct) == 1 {
			// Once this is retrieved, it is immediately removed for security
			delete(fac.sessions, key)
			return value, true
		}
	}
	return nil, false
}
func (fac *SessionFactory) AddSession(id string) error {
	found, ok := fac.GetSessionByUserId(id)
	var untilRetry time.Duration
	if ok {
		untilRetry = UntilRetry(found.created_at)
	}
	if ok && untilRetry > 0 {
		return fmt.Errorf("user with an ID of: %s already has a pending session. Please wait for %d seconds", found.UserId, untilRetry)
	} else if ok && untilRetry <= 0 {
		delete(fac.sessions, id)
	}

	fac.sessions[id] = createSessionPerUser(id)
	return nil
}

func (fac *SessionFactory) AddNonceAndKey(userId string, nonceId []byte, cypherKey []byte, cypherText []byte) error {
	found, ok := fac.GetSessionByUserId(userId)
	if ok {
		found.Nonce = nonceId
		found.CypherKey = cypherKey
		found.CypherText = cypherText
		return nil
	} else {
		return fmt.Errorf("cannot find a user session with a User ID: %s", userId)
	}
}

var UserSessionFactory = &SessionFactory{
	sessions: make(map[string]*Session),
}
