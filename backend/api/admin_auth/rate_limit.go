package admin_auth

import (
	"net"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/vudoan1708-cyber/Mayra-Jewelry/backend/mayra-jewelry/middleware"
	"golang.org/x/time/rate"
)

type ipLimiter struct {
	mu        sync.Mutex
	visitors  map[string]*visitor
	rate      rate.Limit
	burst     int
	cleanup   time.Duration
	lastSweep time.Time
}

type visitor struct {
	limiter  *rate.Limiter
	lastSeen time.Time
}

func newIPLimiter(rps rate.Limit, burst int) *ipLimiter {
	return &ipLimiter{
		visitors: make(map[string]*visitor),
		rate:     rps,
		burst:    burst,
		cleanup:  10 * time.Minute,
	}
}

func (l *ipLimiter) get(ip string) *rate.Limiter {
	l.mu.Lock()
	defer l.mu.Unlock()
	now := time.Now()
	v, ok := l.visitors[ip]
	if !ok {
		v = &visitor{limiter: rate.NewLimiter(l.rate, l.burst)}
		l.visitors[ip] = v
	}
	v.lastSeen = now
	if now.Sub(l.lastSweep) > l.cleanup {
		for k, vv := range l.visitors {
			if now.Sub(vv.lastSeen) > l.cleanup {
				delete(l.visitors, k)
			}
		}
		l.lastSweep = now
	}
	return v.limiter
}

var loginLimiter = newIPLimiter(rate.Every(12*time.Second), 5)

func clientIP(r *http.Request) string {
	if fwd := r.Header.Get("X-Forwarded-For"); fwd != "" {
		if i := strings.IndexByte(fwd, ','); i >= 0 {
			return strings.TrimSpace(fwd[:i])
		}
		return strings.TrimSpace(fwd)
	}
	if real := r.Header.Get("X-Real-IP"); real != "" {
		return real
	}
	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return r.RemoteAddr
	}
	return host
}

func RateLimitLogin(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !loginLimiter.get(clientIP(r)).Allow() {
			middleware.HandleErrorResponse(w, http.StatusTooManyRequests, "too many login attempts, slow down")
			return
		}
		next.ServeHTTP(w, r)
	})
}
