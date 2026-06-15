package events

import (
	"context"
	"encoding/json"
	"log/slog"
	"time"

	"github.com/segmentio/kafka-go"

	userdomain "shop-api/domain/user"
)

type UserConsumer struct {
	reader *kafka.Reader
	repo   userdomain.Repository
}

func NewUserConsumer(brokers []string, groupID string, repo userdomain.Repository) *UserConsumer {
	return &UserConsumer{
		reader: kafka.NewReader(kafka.ReaderConfig{
			Brokers:  brokers,
			Topic:    "user.events",
			GroupID:  groupID,
			MinBytes: 10,
			MaxBytes: 10e6,
			MaxWait:  time.Second,
		}),
		repo: repo,
	}
}

func (c *UserConsumer) Start(ctx context.Context) {
	slog.Info("consumer started", "topic", "user.events")

	for {
		msg, err := c.reader.ReadMessage(ctx)

		if err != nil {
			if ctx.Err() != nil {
				return
			}

			slog.Error("consumer read error", "error", err)

			continue
		}

		var event UserCreated

		if err := json.Unmarshal(msg.Value, &event); err != nil {
			slog.Error("consumer unmarshal error", "error", err)

			continue
		}

		slog.Info("user created",
			"user_id", event.UserID,
			"partition", msg.Partition,
			"offset", msg.Offset,
		)

		userDate := event.CreatedAt.Truncate(24 * time.Hour)

		if err := c.repo.UpsertDailyUserRegistration(ctx, userDate); err != nil {
			slog.Error("upsert daily user registration error", "error", err)
		}
	}
}

func (c *UserConsumer) Close() error {
	return c.reader.Close()
}

func StartUserConsumer(ctx context.Context, brokers []string, groupID string, repo userdomain.Repository) {
	c := NewUserConsumer(brokers, groupID, repo)

	defer func() {
		if err := c.Close(); err != nil {
			slog.Error("consumer close error", "error", err)
		}
	}()

	c.Start(ctx)
}
