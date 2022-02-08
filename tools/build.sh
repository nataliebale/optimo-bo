#!/bin/sh
aws s3 cp s3://${S3_BUCKET}/${LAST_BUILD} last_build --region eu-central-1
npm run $1 `cat ./last_build`
status=$?
if test $status -eq 0
then     
    if [ "$NG_ENV" = "PROD" ] && [ -d $LANDING_PATH ];
    then
        npx ng run landing:server:production
    fi
    echo ${BITBUCKET_COMMIT} > last_build 
    echo 'Uploading build commit SHA'
    aws s3 cp last_build s3://$S3_BUCKET/$LAST_BUILD --region eu-central-1
    echo 'Searching dashboard'
    [ -d ./dist/apps/dashboard ] && (cd ./dist/apps/dashboard && zip -r - .) > odin-dashboard.zip
    echo 'Searching landing'
    [ -d $LANDING_PATH ] && (cd $LANDING_PATH && zip -r - .) > odin-web.zip
    echo 'Searching admin-panel'
    [ -d ./dist/apps/admin-panel ] && (cd ./dist/apps/admin-panel && zip -r - .) > odin-admin-panel.zip
    [ -d ./dist/apps/suppliers ] && aws s3 cp ./dist/apps/suppliers/ s3://$SUPPLIERS_S3_BUCKET/ --recursive --acl public-read
    echo 'exit 0'
    exit 0
else
    echo 'exit 1'
    exit 1
fi