#!/usr/bin/env bash
set -e

mongo <<EOF
use $DB
db.createUser({
  user:  '$USER',
  pwd: '$PSW',
  roles: [{
    role: 'readWrite',
    db: '$DB'
  }]
})
db.football_game.createIndex({ expectedPts:"hashed"})
sh.enableSharding('$DB')
sh.shardCollection( "$DB.football_game", { expectedPts:"hashed" })
EOF
