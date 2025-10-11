#!/bin/sh
set -ex 

echo "==================================="
echo ">>> CI POST CLONE SCRIPT STARTED <<<"
echo "==================================="

export HOMEBREW_NO_INSTALL_CLEANUP=TRUE
export NODE_OPTIONS=--max_old_space_size=8192

echo ""
echo ">>> STEP 1: Checking Ruby version"
ruby -v
which ruby

echo ""
echo ">>> STEP 2: Installing Node 22"
brew install node@22 || true
brew link --overwrite node@22 || true

echo ""
echo ">>> STEP 3: Verifying Node/npm installation"
which node
which npm
node -v
npm -v

echo ""
echo ">>> STEP 4: Installing npm dependencies"
cd ..
pwd
ls -la package*.json
npm ci

echo ""
echo ">>> STEP 5: Installing Ruby gems (Bundler)"
which bundle || gem install bundler
bundle -v
bundle install

echo ""
echo ">>> STEP 6: Installing CocoaPods"
cd ios
pwd
bundle exec pod --version
bundle exec pod install --verbose

echo ""
echo "==================================="
echo ">>> CI POST CLONE SCRIPT COMPLETED <<<"
echo "==================================="
