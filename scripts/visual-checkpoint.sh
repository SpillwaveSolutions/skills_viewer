#!/bin/bash
###############################################################################
# Visual Regression Testing Checkpoint Script
#
# Purpose: Automated visual regression testing checkpoint for SDD workflow
# Usage: ./scripts/visual-checkpoint.sh
#
# Requirements:
# - App must be running on localhost:1420
# - Playwright installed and configured
# - Claude Code CLI available
#
# Exit Codes:
# - 0: All visual tests passed
# - 1: Visual tests failed or app not running
###############################################################################

set -e  # Exit on error

echo "════════════════════════════════════════════════════════════════════════════════"
echo "VISUAL REGRESSION CHECKPOINT"
echo "════════════════════════════════════════════════════════════════════════════════"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

###############################################################################
# Step 1: Check if app is running (T058)
###############################################################################

echo -e "${BLUE}[1/5]${NC} Checking if app is running on localhost:1420..."

if curl -s --fail http://localhost:1420 > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} App is running"
else
    echo -e "${RED}✗ FAILED${NC}: App is not running on localhost:1420"
    echo ""
    echo "Please start the app first:"
    echo "  npm run dev"
    echo ""
    exit 1
fi

echo ""

###############################################################################
# Step 2: Archive old screenshots (T059)
###############################################################################

echo -e "${BLUE}[2/5]${NC} Archiving previous screenshots..."

if [ -d "test-results/visual" ]; then
    file_count=$(find test-results/visual -maxdepth 1 -type f | wc -l | tr -d ' ')

    if [ "$file_count" -gt 0 ]; then
        timestamp=$(date +"%Y-%m-%d_%H-%M-%S")
        archive_dir="test-results/visual-archive/${timestamp}"

        mkdir -p "$archive_dir"
        mv test-results/visual/* "$archive_dir/" 2>/dev/null || true

        echo -e "${GREEN}✓${NC} Archived $file_count files to: $archive_dir"
    else
        echo -e "${YELLOW}⊘${NC} No previous screenshots to archive"
    fi
else
    echo -e "${YELLOW}⊘${NC} No previous screenshots directory found"
fi

echo ""

###############################################################################
# Step 3: Run visual regression tests (T060)
###############################################################################

echo -e "${BLUE}[3/5]${NC} Running visual regression tests..."
echo ""

# Run tests and capture exit code
set +e  # Temporarily disable exit on error
npm run test:visual
test_exit_code=$?
set -e

echo ""

if [ $test_exit_code -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Visual tests completed successfully"
else
    echo -e "${YELLOW}⚠${NC} Visual tests completed with failures (expected if screenshots don't exist yet)"
fi

echo ""

###############################################################################
# Step 4: Display captured screenshots (T061)
###############################################################################

echo -e "${BLUE}[4/5]${NC} Screenshot capture results..."
echo ""

if [ -d "test-results/visual" ]; then
    png_count=$(find test-results/visual -maxdepth 1 -name "*.png" -type f | wc -l | tr -d ' ')
    json_count=$(find test-results/visual -maxdepth 1 -name "*.json" -type f | wc -l | tr -d ' ')

    echo "📸 Screenshots captured: $png_count"
    echo "📝 JSON metadata files: $json_count"
    echo ""

    if [ "$png_count" -gt 0 ]; then
        echo "Screenshot files:"
        find test-results/visual -maxdepth 1 -name "*.png" -type f -exec basename {} \; | sed 's/^/  - /'
        echo ""
    fi

    if [ "$json_count" -gt 0 ]; then
        echo "Metadata files:"
        find test-results/visual -maxdepth 1 -name "*.json" -type f -exec basename {} \; | sed 's/^/  - /'
        echo ""
    fi
else
    echo -e "${RED}✗${NC} No test-results/visual directory found"
    echo ""
    exit 1
fi

###############################################################################
# Step 5: Run Claude Code analysis (T062)
###############################################################################

echo -e "${BLUE}[5/5]${NC} Running Claude Code visual analysis..."
echo ""

if [ "$png_count" -gt 0 ] && [ "$json_count" -gt 0 ]; then
    # Run automated Claude Code analysis
    set +e  # Temporarily disable exit on error
    npm run test:visual:analyze
    analysis_exit_code=$?
    set -e

    echo ""

    if [ $analysis_exit_code -eq 0 ]; then
        echo -e "${GREEN}✓${NC} All visual regression tests PASSED"
        echo ""
        echo "════════════════════════════════════════════════════════════════════════════════"
        echo -e "${GREEN}CHECKPOINT PASSED ✓${NC}"
        echo "════════════════════════════════════════════════════════════════════════════════"
        echo ""
        exit 0
    else
        echo -e "${RED}✗${NC} Visual regression tests FAILED"
        echo ""
        echo "Review the analysis report:"
        echo "  test-results/visual/analysis-report.md"
        echo ""
        echo "════════════════════════════════════════════════════════════════════════════════"
        echo -e "${RED}CHECKPOINT FAILED ✗${NC}"
        echo "════════════════════════════════════════════════════════════════════════════════"
        echo ""
        echo "Fix the visual regressions before proceeding to the next phase."
        echo ""
        exit 1
    fi
else
    echo -e "${YELLOW}⚠${NC} Skipping analysis - no screenshots captured"
    echo ""
    echo "This may indicate:"
    echo "  - Playwright tests failed to capture screenshots"
    echo "  - Tauri runtime issues (see GitHub issue #15)"
    echo ""
    echo "════════════════════════════════════════════════════════════════════════════════"
    echo -e "${YELLOW}CHECKPOINT INCOMPLETE ⚠${NC}"
    echo "════════════════════════════════════════════════════════════════════════════════"
    echo ""
    exit 1
fi
