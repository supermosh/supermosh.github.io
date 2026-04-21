Remove-Item -Recurse -Force docs
pnpm run build
New-Item -Path "docs/.nojekyll" -Type File
Copy-Item docs/index.html docs/studio.html
Remove-Item -Recurse -Force docs/samples
git add .
git commit -m "BUILD"
git push