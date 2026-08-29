package service

import (
	"context"
	"fmt"
	"strconv"
	"time"

	"github.com/redis/go-redis/v9"
	"github.com/visava/geo-service/internal/model"
)

const (
	locationsKey     = "visava:locations:all"
	locationPrefix   = "visava:locations:wari:"
	locationDataPref = "visava:locationdata:"
)

type LocationService struct {
	rdb *redis.Client
}

func NewLocationService(rdb *redis.Client) *LocationService {
	return &LocationService{rdb: rdb}
}

func (s *LocationService) UpdateLocation(ctx context.Context, loc model.Location) error {
	pipe := s.rdb.Pipeline()

	pipe.GeoAdd(ctx, locationsKey, &redis.GeoLocation{
		Longitude: loc.Lng,
		Latitude:  loc.Lat,
		Name:      loc.MemberID,
	})

	if loc.WariID != "" {
		wariKey := locationPrefix + loc.WariID
		pipe.GeoAdd(ctx, wariKey, &redis.GeoLocation{
			Longitude: loc.Lng,
			Latitude:  loc.Lat,
			Name:      loc.MemberID,
		})
	}

	dataKey := locationDataPref + loc.MemberID
	data := map[string]interface{}{
		"type":      loc.Type,
		"wariId":    loc.WariID,
		"timestamp": strconv.FormatInt(loc.Timestamp, 10),
	}
	pipe.HSet(ctx, dataKey, data)
	pipe.Expire(ctx, dataKey, 24*time.Hour)

	_, err := pipe.Exec(ctx)
	return err
}

func (s *LocationService) FindNearby(ctx context.Context, lat, lng, radius float64, entityType string) ([]model.NearbyResult, error) {
	key := locationsKey
	if entityType == "wari" || entityType == "varkari" {
		key = locationsKey
	}

	results, err := s.rdb.GeoRadius(ctx, key, lng, lat, &redis.GeoRadiusQuery{
		Radius:      radius,
		Unit:        "km",
		WithCoord:   true,
		WithDist:    true,
		Sort:        "ASC",
		Count:       100,
	}).Result()

	if err != nil {
		return nil, fmt.Errorf("geo radius query failed: %w", err)
	}

	var nearby []model.NearbyResult
	for _, r := range results {
		metadata := make(map[string]interface{})
		dataKey := locationDataPref + r.Name
		data, err := s.rdb.HGetAll(ctx, dataKey).Result()
		if err == nil {
			for k, v := range data {
				metadata[k] = v
			}
		}

		nearby = append(nearby, model.NearbyResult{
			ID:       r.Name,
			Lat:      r.Latitude,
			Lng:      r.Longitude,
			Distance: r.Dist,
			Type:     entityType,
			Metadata: metadata,
		})
	}

	return nearby, nil
}

func (s *LocationService) GetWariLocation(ctx context.Context, wariID string) (*model.WariLocationResponse, error) {
	wariKey := locationPrefix + wariID
	results, err := s.rdb.GeoPos(ctx, wariKey).Result()
	if err != nil {
		return nil, fmt.Errorf("geo pos query failed: %w", err)
	}

	if len(results) == 0 || results[0] == nil {
		return nil, fmt.Errorf("wari location not found")
	}

	return &model.WariLocationResponse{
		Lat:         results[0].Latitude,
		Lng:         results[0].Longitude,
		LastUpdated: time.Now().UTC().Format(time.RFC3339),
	}, nil
}

func (s *LocationService) GetActiveConnectionCount(ctx context.Context) int {
	count, err := s.rdb.SCard(ctx, locationsKey).Result()
	if err != nil {
		return 0
	}
	return int(count)
}

func (s *LocationService) RemoveLocation(ctx context.Context, memberID string) error {
	pipe := s.rdb.Pipeline()

	pipe.ZRem(ctx, locationsKey, memberID)

	dataKey := locationDataPref + memberID
	pipe.Del(ctx, dataKey)

	_, err := pipe.Exec(ctx)
	return err
}
