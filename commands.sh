apt-get update
apt-get install git-core build-essential libssl-dev
cd /usr/src
git clone http://github.com/ry/node.git
cd node
./configure
make
make install
curl http://npmjs.org/install.sh | sh
cd /usr/src
git clone git://github.com/Marak/hellonode.git
cd hellonode
nohup node server.js
