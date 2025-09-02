package config

import (
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Host string
	Port string
}

func Load() (*Config, error) {
	// .env ファイル読み込み（無ければスキップ）
	_ = godotenv.Load()

	host := os.Getenv("HOST")
	if host == "" {
		host = "0.0.0.0"
	}
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	return &Config{
		Host: host,
		Port: port,
	}, nil
}
