package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

func AuthMiddleware(pool *pgxpool.Pool) gin.HandlerFunc {
	return func(c *gin.Context) {
		token := ""

		if cookie, err := c.Cookie("better-auth.session_token"); err == nil && cookie != "" {
			token = cookie
		} else if header := c.GetHeader("Authorization"); header != "" {
			if strings.HasPrefix(header, "Bearer ") {
				token = strings.TrimPrefix(header, "Bearer ")
			}
		}

		if token == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}

		if idx := strings.Index(token, "."); idx != -1 {
			token = token[:idx]
		}

		var userID string
		err := pool.QueryRow(c,
			`SELECT "userId" FROM "session" WHERE token = $1 AND "expiresAt" > NOW()`,
			token,
		).Scan(&userID)

		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}

		c.Set("userID", userID)
		c.Next()
	}
}
