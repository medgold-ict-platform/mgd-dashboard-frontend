#!/bin/bash

# $1 stage
# $2 service
# Pass --create-cloudfront argument if you need to create cloudfront distribution
# Pass --apply-cert argument for apply certificate
# Pass --apply-cnames argument if you need to create alias and associate it to cloufront distribution
# bash runbuild.sh --stage prod --service mgd-dashboard-frontend --create-cloudfront --apply-cert --apply-cnames
# PREREQUISITES:
    # Save certificate arn on parameter store with name /{stage}/{service}/cert
    # Save cloudfront alias on parameter store with name /{stage}/{service}/alias

CONFIG=`aws ssm get-parameters --name "/$2/$4/config" | jq -r '.Parameters | .[] | .Value'` 
npm install
sudo npm run build
git clone git@bitbucket.org:beetobit/b2b-static-web-hosting-sls.git

cp -R ../build/. ./b2b-static-web-hosting-sls/src/

cd b2b-static-web-hosting-sls
echo $CONFIG | tr , \\n > config.yml

npm install

sls deploy --stage $2 --service $4 $5 $6 $7

# rm -rf b2b-static-web-hosting-sls
