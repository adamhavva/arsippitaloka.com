#!/usr/bin/env bash
# Jalankan simulasi pembayaran lewat browser (Playwright).
#
# Playwright tidak jadi dependency proyek — hanya ada di cache npx, jadi
# skrip disalin ke direktori cache itu agar Node bisa me-resolve modulnya.
#
#   MODE=mock|real  mock (default) = mock gateway lokal; real = Midtrans sandbox
#   APP_URL         alamat aplikasi (default http://localhost:3100)
#
# Contoh:
#   scripts/pw-payment-sim.sh                 # alur penuh dgn mock gateway
#   MODE=real APP_URL=http://localhost:3000 scripts/pw-payment-sim.sh
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PW="$(find "$HOME/.npm/_npx" -maxdepth 4 -type d -name playwright 2>/dev/null | head -1)/../.."

if [ ! -d "$PW/node_modules/playwright" ]; then
  echo "Playwright tidak ditemukan di cache npx. Jalankan: npx playwright install chromium" >&2
  exit 1
fi

cp "$ROOT/scripts/pw-payment-sim.mjs" "$PW/pw-payment-sim.mjs"

# Browser chromium-headless-shell harus terpasang untuk versi Playwright ini.
if ! ls "$HOME/Library/Caches/ms-playwright" 2>/dev/null | grep -q chromium_headless_shell; then
  (cd "$PW" && node node_modules/playwright-core/cli.js install chromium-headless-shell)
fi

cd "$PW"
exec node pw-payment-sim.mjs "$@"
