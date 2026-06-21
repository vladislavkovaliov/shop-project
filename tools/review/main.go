package main

import (
	"flag"
	"fmt"
	"log"
	"os"
	"os/exec"
	"strings"
	"time"

	"github.com/vladislavkovaliov/shop-project/tools/review/internal/git"
	"github.com/vladislavkovaliov/shop-project/tools/review/internal/llm"
	"github.com/vladislavkovaliov/shop-project/tools/review/internal/report"
)

func main() {
	URL := "http://192.168.1.85:11434"

	model := flag.String("model", "deepseek-coder:6.7b", "Ollama model name")
	ollamaURL := flag.String("ollama-url", URL, "Ollama server URL")
	flag.Parse()

	log.SetPrefix("")
	log.SetFlags(log.Ltime | log.Lmicroseconds)

	log.Printf("🚀 review tool started")

	repoRoot := findRepoRoot()
	log.Printf("  repo root: %s", repoRoot)

	if git.IsClean(repoRoot) {
		report.PrintNoChanges()
		return
	}

	startTotal := time.Now()

	result, err := git.GetStagedDiff(repoRoot)
	if err != nil {
		report.PrintError(fmt.Sprintf("git diff failed: %v", err))
		os.Exit(1)
	}

	if len(result.Files) == 0 {
		report.PrintNoChanges()
		return
	}

	report.PrintHeader(result.Files)

	client := llm.NewClient(*ollamaURL, *model)

	log.Printf("  sending to ollama...")
	review, err := client.Review(result.Diff, "", "")
	if err != nil {
		report.PrintError(fmt.Sprintf("LLM review failed: %v", err))
		os.Exit(1)
	}

	totalElapsed := time.Since(startTotal).Round(time.Millisecond)
	log.Printf("  total time: %v", totalElapsed)

	report.PrintReview(*model, review)
}

func findRepoRoot() string {
	out, err := exec.Command("git", "rev-parse", "--show-toplevel").Output()
	if err != nil {
		return "."
	}
	return strings.TrimSpace(string(out))
}
