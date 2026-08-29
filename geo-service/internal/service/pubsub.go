package service

import (
	"context"
	"encoding/json"
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
		"type":      "alert", // Adding a type field for the frontend WebSocket parser
		"alertType": alertType,
		"data":      data,
	}

	jsonBytes, err := json.Marshal(msg)
	if err != nil {
		return fmt.Errorf("failed to marshal alert: %w", err)
	}

	_, err = s.rdb.Publish(ctx, s.alertChannel, jsonBytes).Result()
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
