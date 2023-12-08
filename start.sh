#! /bin/sh
fallocate -l 256M /swapfile
chmod 0600 /swapfile
mkswap /swapfile
echo 10 > /proc/sys/vm/swappiness
swapon /swapfile

npx prisma migrate deploy

# Turn off swap
swapoff /swapfile
rm /swapfile

npm run start