#!/bin/sh
echo ">>> CI POST CLONE SCRIPT STARTED <<<"
export HOMEBREW_NO_INSTALL_CLEANUP=TRUE
export NODE_OPTIONS=--max_old_space_size=8192

brew install cocoapods
brew install rbenv ruby-build
brew install node@22
brew link node@22
brew install yarn

echo ">>> SETUP ENVIRONMENT"
echo 'export GEM_HOME=$HOME/gems' >>~/.bash_profile
echo 'export PATH=$HOME/gems/bin:$PATH' >>~/.bash_profile
export GEM_HOME=$HOME/gems
export PATH="$GEM_HOME/bin:$PATH"

echo ">>> INSTALL BUNDLER"
ruby -v
rbenv init
rbenv install 3.4.1
rbenv global 3.4.1
eval "$(rbenv init -)"
ruby -v
gem install bundler --install-dir $GEM_HOME

yarn
bundle update --bundler
yarn bundleinstall
yarn podinstall
