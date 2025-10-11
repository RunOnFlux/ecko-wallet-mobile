#!/bin/sh
set -e

echo ">>> CI POST CLONE SCRIPT STARTED <<<"
export HOMEBREW_NO_INSTALL_CLEANUP=TRUE
export NODE_OPTIONS=--max_old_space_size=8192

echo ">>> Checking Ruby version"
ruby -v

echo ">>> Installing Node and Yarn"
brew install node@20 || true
brew link --overwrite node@20 || true
brew install yarn || true

echo ">>> Node version"
node -v
yarn -v

echo ">>> Installing npm dependencies"
cd ..
yarn install --frozen-lockfile

echo ">>> Installing Ruby gems (Bundler)"
gem install bundler
bundle install

echo ">>> Installing CocoaPods"
cd ios
bundle exec pod install

echo ">>> CI POST CLONE SCRIPT COMPLETED <<<"
