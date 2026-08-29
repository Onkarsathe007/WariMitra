package service

import (
	"context"
	"fmt"

	"github.com/redis/go-redis/v9"
)

type PubSubService struct {
	rdb          *redis.Client
	alertChannel string
}

func NewPubSubService(rdb *redis.Client) *PubSubService {
	return &PubSubService{
		rdb:          rdb,
		alertChannel: "visava:alerts",
	}
}

func (s *PubSubService) PublishAlert(ctx context.Context, alertType string, data map[string]interface{}) error {
	msg := map[string]interface{}{
		"alertType": alertType,
		"data":      data,
	}

	_, err := s.rdb.Publish(ctx, s.alertChannel, msg).Result()
	if err != nil {
		return fmt.Errorf("failed to publish alert: %w", err)
	}

	return nil
}

func (s *PubSubService) Subscribe(ctx context.Context, handler func(channel string, payload string)) {
	sub := s.rdb.Subscribe(ctx, s.alertChannel)
	ch := sub.Channel()

	go func() {
		for msg := range ch {
			handler(msg.Channel, msg.Payload)
		}
	}()
}
