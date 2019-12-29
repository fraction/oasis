#!/usr/bin/sh

git push -f origin master:release-$(jq -r .version < package.json)

until git push origin master; do
  sleep 120;
done

npm publish

