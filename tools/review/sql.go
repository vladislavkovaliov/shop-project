package main

import "github.com/vladislavkovaliov/shop-project/tools/review/internal/sql"

func runSQL(repoRoot string, cfg Config) {
	extractor := sql.NewExtractor(repoRoot, cfg.OllamaURL, cfg.Model)
	extractor.Run()
}
