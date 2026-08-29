package service

import (
	"context"

	"github.com/visava/geo-service/internal/model"
)

type GeoService struct {
	location *LocationService
	pubsub   *PubSubService
}

func NewGeoService(location *LocationService, pubsub *PubSubService) *GeoService {
	return &GeoService{
		location: location,
		pubsub:   pubsub,
	}
}

func (s *GeoService) RadiusQuery(ctx context.Context, req model.RadiusQueryRequest) ([]model.NearbyResult, error) {
	return s.location.FindNearby(ctx, req.Lat, req.Lng, req.Radius, req.Type)
}

func (s *GeoService) FanOut(ctx context.Context, req model.FanOutRequest) ([]model.NearbyResult, error) {
	targets, err := s.location.FindNearby(ctx, req.Location.Lat, req.Location.Lng, req.Radius, "varkari")
	if err != nil {
		return nil, err
	}

	if len(targets) > 0 {
		err = s.pubsub.PublishAlert(ctx, req.AlertType, req.AlertData)
		if err != nil {
			return nil, err
		}
	}

	return targets, nil
}
