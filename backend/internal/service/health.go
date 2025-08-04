package service

type Health struct {
	Status string `json:"status"`
}

// HealthStatus はヘルスチェック用ステータスを返します
func HealthStatus() Health {
	return Health{Status: "ok"}
}
