curl -X PUT https://api.heroku.com/apps/9bb6fa78-618c-4390-a110-807683f513fd/buildpack-installations \
-H "Accept: application/vnd.heroku+json; version=3" \
-H "Authorization: Bearer ${WRI_HEROKU_API_KEY}" \
-H "Content-Type: application/json" \
-d '{
  "updates": [
    {
      "buildpack": "https://github.com/heroku/heroku-buildpack-nodejs"
    },
    {
      "buildpack": "https://github.com/heroku/heroku-buildpack-php"
    }
  ]
}'
