if [ -z "$1" ] ; then
    echo 'Error: Argument HOST is required.'
    echo 'Usage: ./deploy.sh HOST VERSION'
    echo '  HOST    is the server to deploy to'
    echo "  VERSION can be any docker image tag or 'latest'"
    exit 1
fi

if [ -z "$2" ] ; then
    echo 'Error: Argument VERSION is required.'
    echo 'Usage: ./deploy.sh HOST VERSION'
    echo '  HOST    is the server to deploy to'
    echo "  VERSION can be any docker image tag or 'latest'"
    exit 1
fi

HOST=$1
VERSION=$2

echo
echo "Deploying version $VERSION to $HOST..."
echo

# Copy all infrastructure files to the server
rsync -rP docker-compose* infrastructure root@$HOST:/tmp/compose/

# Prepare docker-compose.staging.yml file - rotate secrets etc
ssh root@$HOST '/tmp/compose/infrastructure/rotate-secrets.sh /tmp/compose/docker-compose.staging.yml | tee -a /var/log/rotate-secrets.log'

# Setup configuration files and compose file for the deployment domain
ssh root@$HOST '/tmp/compose/infrastructure/setup-deploy-config.sh '$HOST' | tee -a /var/log/setup-deploy-config.log'

# Deploy the OpenCRVS stack onto the swarm
ssh root@$HOST 'cd /tmp/compose && VERSION='$VERSION' docker stack deploy -c docker-compose.deps.yml -c docker-compose.yml -c docker-compose.staging.yml --with-registry-auth opencrvs'
