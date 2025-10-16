package session

import (
	"fmt"
	"time"

	"github.com/vudoan1708-cyber/Mayra-Jewelry/backend/mayra-jewelry/helpers"
)

type Session struct {
	UserId     string
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

func (fac SessionFactory) Add(id string) error {
	found := helpers.FilterFunc(UserSessionFactory.sessions, func(s Session, nil int) bool {
		return id == s.UserId
	})
	untilRetry := UntilRetry(found[0].created_at)
	if len(found) > 0 && untilRetry > 0 {
		return fmt.Errorf("user with an ID of: %s already has a pending session. Please wait for %d seconds", found[0].UserId, untilRetry)
	} else if len(found) > 0 && untilRetry <= 0 {
		UserSessionFactory.sessions = helpers.FilterFunc(UserSessionFactory.sessions, func(s Session, nil int) bool {
			return s.UserId != id
		})
	}
	session := createPerUser(id)

	UserSessionFactory.sessions = append(UserSessionFactory.sessions, session)
	return nil
}
