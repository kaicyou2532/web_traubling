package main

import (
	"log"
	"net/http"
	"traubling-backend/internal/config"
	"traubling-backend/internal/handlers"

	"github.com/go-chi/chi/v5"
)

func main() {
	// 設定読み込み (.env)
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("config load error: %v", err)
	}

	// ルーター設定
	r := chi.NewRouter()

	// CORS/middleware などはここで追加可能
	// r.Use(middleware.Logger)

	// ヘルスチェック
	r.Get("/health", handlers.HealthHandler)
	r.Get("/healthz", handlers.HealthHandler)

	addr := cfg.Host + ":" + cfg.Port
	log.Printf("starting server on %s", addr)
	log.Fatal(http.ListenAndServe(addr, r))
}
