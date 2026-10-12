#!/bin/sh
set -e

echo ">>> CI POST CLONE SCRIPT STARTED <<<"

# Build-time secrets guard.
# There is no .env on Xcode Cloud: react-native-dotenv (babel.config.js) inlines
# ENCRYPTION_KEY from the workflow's environment variables into the JS bundle.
# It is the MMKV encryption key of 'user-storage' and 'auth-storage'
# (src/store/store.ts, src/utils/storageHelplers.ts). A missing or different
# value makes every existing wallet unreadable after the update, so never
# invent a new one: it must equal the value used by the builds users have.
echo ">>> CHECKING BUILD-TIME SECRETS"
if [ -z "${ENCRYPTION_KEY:-}" ]; then
  echo "ERROR: ENCRYPTION_KEY is not set in this Xcode Cloud workflow's environment."
  echo "ERROR: It must be the exact value used by the builds already on users' devices."
  exit 1
fi
echo ">>> ENCRYPTION_KEY fingerprint (sha256, first 12 hex): $(printf '%s' "$ENCRYPTION_KEY" | shasum -a 256 | cut -c1-12)"
for var in WALLETCONNECT_PROJECT_ID WALLETCONNECT_PROJECT_RELAY; do
  eval "val=\${$var:-}"
  if [ -z "$val" ]; then
    echo "WARNING: $var is not set in this Xcode Cloud workflow's environment."
  fi
done

if [ -z "$CI_WORKSPACE" ]; then
  SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
  export CI_WORKSPACE="$(cd "$SCRIPT_DIR/../.." && pwd)"
  echo ">>> CI_WORKSPACE not set, derived from script location: $CI_WORKSPACE"
else
  echo ">>> CI_WORKSPACE already set: $CI_WORKSPACE"
fi

export HOMEBREW_NO_INSTALL_CLEANUP=TRUE
export NODE_OPTIONS=--max_old_space_size=8192

echo ">>> INSTALLING HOMEBREW DEPENDENCIES"
brew install rbenv ruby-build || true
brew install node@22 || true

echo ">>> SETUP NODE.JS"
brew unlink node@22 2>/dev/null || true
brew link --overwrite node@22 2>/dev/null || true

NODE_PATHS="/opt/homebrew/opt/node@22/bin:/usr/local/opt/node@22/bin"
NODE_BINARY=""
for path in $(echo $NODE_PATHS | tr ':' ' '); do
  if [ -d "$path" ] && [ -f "$path/node" ]; then
    export PATH="$path:$PATH"
    NODE_BINARY="$path/node"
    break
  fi
done

if [ -z "$NODE_BINARY" ] || ! command -v node &> /dev/null; then
  echo "ERROR: Node.js not found in PATH"
  exit 1
fi

export NODE_BINARY
export PATH="$(dirname "$NODE_BINARY"):$PATH"

node -v
npm -v

echo ">>> NODE_BINARY set to: $NODE_BINARY"

echo ">>> SETUP RUBY ENVIRONMENT"
export GEM_HOME="$HOME/gems"
export PATH="$GEM_HOME/bin:$PATH"

if [ -d "$HOME/.rbenv/bin" ]; then
  export PATH="$HOME/.rbenv/bin:$PATH"
fi

if command -v rbenv &> /dev/null; then
  eval "$(rbenv init -)" || true
  
  if ! rbenv versions | grep -q "3.4.1"; then
    echo ">>> INSTALLING RUBY 3.4.1"
    rbenv install 3.4.1
  fi
  
  rbenv global 3.4.1
  eval "$(rbenv init -)"
fi

ruby -v

echo ">>> INSTALLING BUNDLER"
gem install bundler --install-dir "$GEM_HOME" --no-document || true

if ! command -v bundle &> /dev/null; then
  export PATH="$GEM_HOME/bin:$PATH"
fi

bundle -v

echo ">>> INSTALLING NODE DEPENDENCIES"
cd "$CI_WORKSPACE"
npm ci --ignore-scripts

echo ">>> INSTALLING RUBY DEPENDENCIES"
cd "$CI_WORKSPACE"
bundle config set --local path "$GEM_HOME" || bundle config path "$GEM_HOME"
bundle update --bundler
bundle install

echo ">>> INSTALLING COCOAPODS DEPENDENCIES"
cd "$CI_WORKSPACE/ios"

if [ -z "$NODE_BINARY" ]; then
  NODE_BINARY=$(command -v node)
  export NODE_BINARY
fi

export PATH="$(dirname "$NODE_BINARY"):$PATH"

echo ">>> Verifying node_modules exists"
if [ ! -d "$CI_WORKSPACE/node_modules/react-native" ]; then
  echo "ERROR: react-native not found in node_modules"
  exit 1
fi

echo ">>> Using node: $(which node)"
echo ">>> Node version: $(node -v)"

bundle exec pod install --repo-update

echo ">>> CI POST CLONE SCRIPT COMPLETED <<<"
