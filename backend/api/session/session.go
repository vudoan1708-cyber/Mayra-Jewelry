package session

import (
	"fmt"
	"time"

	"github.com/vudoan1708-cyber/Mayra-Jewelry/backend/mayra-jewelry/helpers"
)

type Session struct {
	UserId     string
	Id         []byte
	created_at time.Time
}

func createPerUser(id string) Session {
	now := time.Now().Local()
	userSession := Session{
		UserId:     id,
		created_at: now,
	}
	return userSession
}
func UntilRetry(created_at time.Time) time.Duration {
	return time.Until(created_at.Add(5 * time.Second))
}

type SessionFactory struct {
	sessions []Session
}

var UserSessionFactory = &SessionFactory{}

func (fac SessionFactory) AddSession(id string) error {
	found, ok := helpers.FindFunc(fac.sessions, func(s Session, _ int) bool {
		return id == s.UserId
	})
	var untilRetry time.Duration
	if ok {
		untilRetry = UntilRetry(found.created_at)
	}
	if ok && untilRetry > 0 {
		return fmt.Errorf("user with an ID of: %s already has a pending session. Please wait for %d seconds", found.UserId, untilRetry)
	} else if ok && untilRetry <= 0 {
		UserSessionFactory.sessions = helpers.FilterFunc(UserSessionFactory.sessions, func(s Session, nil int) bool {
			return s.UserId != id
		})
	}
	session := createPerUser(id)

	UserSessionFactory.sessions = append(UserSessionFactory.sessions, session)
	return nil
}

func (fac SessionFactory) AddNonceId(userId string, nonceId []byte) error {
	found, ok := helpers.FindFunc(fac.sessions, func(s Session, _ int) bool {
		return userId == s.UserId
	})
	if ok {
		found.Id = nonceId
		return nil
	} else {
		return fmt.Errorf("cannot find a user session with a User ID: %s", userId)
	}
}
