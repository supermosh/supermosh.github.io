#!/bin/sh
set -e
rm -rf docs
cd www
npx snowpack build
cd ..
> docs/.nojekyll
cp docs/{index,studio}.html
cp docs/{index,about}.html
