echo "Switching to branch master"
git checkout master

echo "Building app..."
npm run Building

echo "Deploying files to server ..."
scp -r build/* root@172.233.212.241/var/wwww/women.diamonddao.art/

echo "Done!"