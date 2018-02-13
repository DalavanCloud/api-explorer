rm -rf example/dist
mkdir example/dist

webpack --config webpack.prod.js

# webpack-dev-server requires you to give an exact path match to it's
# bundle otherwise you'll actually be loading the regular built webpack
# file and wont get any auto-reloading, and you have to run webpack -w
sed 's/example\/bundle.js/bundle.js/g' example/index.html > example/dist/index.html

cp example/*.css example/dist
cp -R example/fonts example/dist
cp -R example/img example/dist
cp -R example/swagger-files example/dist

# Need to copy over the circleci config so that
# it picks up we want to ignore the gh-pages branch
cp -R .circleci example/dist
