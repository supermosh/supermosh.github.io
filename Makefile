deploy:
	cd coming-soon
	git init
	git remote add origin https://github.com/supermosh/supermosh.github.io.git
	git add .
	git commit -m all
	git push -u
	rm -rf .git
	cd ..
