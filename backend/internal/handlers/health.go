package handlers

import (
	"encoding/json"
	"net/http"
	"traubling-backend/internal/service"
)

func HealthHandler(w http.ResponseWriter, r *http.Request) {
	status := service.HealthStatus()
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(status)
}
