package model

type Location struct {
	Lat       float64 `json:"lat"`
	Lng       float64 `json:"lng"`
	MemberID  string  `json:"memberId"`
	Type      string  `json:"type"`
	WariID    string  `json:"wariId,omitempty"`
	Timestamp int64   `json:"timestamp"`
}

type RadiusQueryRequest struct {
	Lat    float64 `json:"lat"`
	Lng    float64 `json:"lng"`
	Radius float64 `json:"radius"`
	Type   string  `json:"type"`
}

type NearbyResult struct {
	ID       string                 `json:"id"`
	Lat      float64                `json:"lat"`
	Lng      float64                `json:"lng"`
	Distance float64                `json:"distance"`
	Type     string                 `json:"type"`
	Metadata map[string]interface{} `json:"metadata"`
}

type RadiusQueryResponse struct {
	Results []NearbyResult `json:"results"`
}

type FanOutRequest struct {
	Location  Location               `json:"location"`
	Radius    float64                `json:"radius"`
	AlertType string                 `json:"alertType"`
	AlertData map[string]interface{} `json:"alertData"`
}

type FanOutResponse struct {
	TargetCount int            `json:"targetCount"`
	Targets     []NearbyResult `json:"targets"`
}

type WariLocationResponse struct {
	Lat         float64 `json:"lat"`
	Lng         float64 `json:"lng"`
	LastUpdated string  `json:"lastUpdated"`
}

type HealthResponse struct {
	Status            string  `json:"status"`
	Redis             string  `json:"redis"`
	Uptime            float64 `json:"uptime"`
	ActiveConnections int     `json:"activeConnections"`
}

type WSMessage struct {
	Type      string   `json:"type"`
	WariID    string   `json:"wariId,omitempty"`
	Lat       float64  `json:"lat,omitempty"`
	Lng       float64  `json:"lng,omitempty"`
	Timestamp int64    `json:"timestamp,omitempty"`
	Ack       *WSAck   `json:"ack,omitempty"`
	Nearby    []NearbyResult `json:"nearby,omitempty"`
}

type WSAck struct {
	Timestamp int64 `json:"timestamp"`
}
