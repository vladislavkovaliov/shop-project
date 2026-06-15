package rabbit

import (
	"context"
	"encoding/json"
	"log"

	"github.com/rabbitmq/amqp091-go"
)

type Consumer struct {
	conn    *amqp091.Connection
	channel *amqp091.Channel
}

func NewConsumer(rabbitURL string) (*Consumer, error) {
	conn, err := amqp091.Dial(rabbitURL)

	if err != nil {
		return nil, err
	}

	ch, err := conn.Channel()

	if err != nil {
		conn.Close()

		return nil, err
	}

	if err := ch.ExchangeDeclare(
		"shop.notifications",
		amqp091.ExchangeDirect,
		true,
		false,
		false,
		false,
		nil,
	); err != nil {
		return nil, err
	}

	dlqArgs := amqp091.Table{
		"x-dead-letter-exchange":    "shop.notifications.dlx",
		"x-dead-letter-routing-key": "email.dlq",
	}

	for _, q := range []string{"email.user.order_confirmation", "email.manager.new_order"} {
		if _, err := ch.QueueDeclare(
			q,
			true,
			false,
			false,
			false,
			dlqArgs,
		); err != nil {
			return nil, err
		}
	}

	if _, err := ch.QueueDeclare("email.dlq", true, false, false, false, nil); err != nil {
		return nil, err
	}

	if err := ch.QueueBind("email.user.order_confirmation", "order.created", "shop.notifications", false, nil); err != nil {
		return nil, err
	}

	if err := ch.QueueBind("email.manager.new_order", "order.created.manager", "shop.notifications", false, nil); err != nil {
		return nil, err
	}

	if err := ch.QueueBind("email.dlq", "email.dlq", "shop.notifications.dlx", false, nil); err != nil {
		return nil, err
	}

	return &Consumer{
		conn:    conn,
		channel: ch,
	}, nil
}

func (c *Consumer) Start(ctx context.Context) {
	userDelivery, err := c.channel.Consume("email.user.order_confirmation", "", false, false, false, false, nil)
	if err != nil {
		log.Printf("rabbit: consume user queue error: %v", err)
		return
	}

	managerDelivery, err := c.channel.Consume(
		"email.manager.new_order",
		"",
		false,
		false,
		false,
		false,
		nil,
	)

	if err != nil {
		log.Printf("rabbit: consume manager queue error: %v", err)
		return
	}

	for {
		select {
		case <-ctx.Done():
			return
		case msg := <-userDelivery:
			c.handle(msg, "customer")
		case msg := <-managerDelivery:
			c.handle(msg, "manager")
		}
	}
}

func (c *Consumer) handle(msg amqp091.Delivery, recipient string) {
	var notif OrderNotification

	if err := json.Unmarshal(msg.Body, &notif); err != nil {
		log.Printf("rabbit: unmarhal error: %v", err)

		msg.Nack(false, false)

		return
	}

	log.Printf("[EMAIL %s] Order %d: notification sent to %s", recipient, notif.OrderID, recipient)

	msg.Ack(false)
}

func (c *Consumer) Close() error {
	if err := c.channel.Close(); err != nil {
		return err
	}

	return c.conn.Close()
}
