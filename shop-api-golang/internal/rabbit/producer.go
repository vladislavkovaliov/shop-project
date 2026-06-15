package rabbit

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/rabbitmq/amqp091-go"
)

type Producer struct {
	conn    *amqp091.Connection
	channel *amqp091.Channel
}

func NewProducer(rabbitURL string) (*Producer, error) {
	conn, err := amqp091.Dial(rabbitURL)

	if err != nil {
		return nil, fmt.Errorf("rabbit dial: %w", err)
	}

	ch, err := conn.Channel()

	if err != nil {
		conn.Close()

		return nil, fmt.Errorf("rabbit dial: %w", err)
	}

	if err := ch.ExchangeDeclare(
		"shop.notifications",
		amqp091.ExchangeDirect,
		true, false, false, false, nil,
	); err != nil {
		ch.Close()
		conn.Close()

		return nil, fmt.Errorf("exchange declare: %w", err)
	}

	if err := ch.ExchangeDeclare(
		"shop.notifications.dlx",
		amqp091.ExchangeDirect,
		true, false, false, false, nil,
	); err != nil {
		ch.Close()
		conn.Close()
		return nil, fmt.Errorf("exchange dlx declare: %w", err)
	}

	return &Producer{
		conn:    conn,
		channel: ch,
	}, nil
}

func (p *Producer) PublishOrderCreated(ctx context.Context, orderID, userID int64) error {
	body, err := json.Marshal(OrderNotification{OrderID: orderID, UserID: userID})

	if err != nil {
		return fmt.Errorf("marshal: %w", err)
	}

	for _, routingKey := range []string{"order.created", "order.created.manager"} {
		if err := p.channel.PublishWithContext(ctx,
			"shop.notifications",
			routingKey,
			false,
			false,
			amqp091.Publishing{
				ContentType:  "application/json",
				DeliveryMode: amqp091.Persistent,
				Body:         body,
			},
		); err != nil {
			return fmt.Errorf("marshal: %w", err)
		}
	}

	return nil
}

func (p *Producer) Close() error {
	if err := p.channel.Close(); err != nil {
		return err
	}

	return p.conn.Close()
}
