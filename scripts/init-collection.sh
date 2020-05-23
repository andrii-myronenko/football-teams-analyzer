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
db.cwdb.createIndex({ publication_date:"hashed"})
sh.enableSharding('$DB')
sh.shardCollection( "$DB.cwdb", { publication_date:"hashed" })
EOF
