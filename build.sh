#!/bin/sh
set -e
rm -rf docs
cd app
pnpm run build
cd ..
> docs/.nojekyll
cp docs/{index,studio}.html
cp docs/{index,about}.html
