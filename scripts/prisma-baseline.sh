#!/bin/bash
npx prisma migrate resolve --applied 0001_baseline
echo "Baseline resolved. Future migrations will use prisma migrate deploy"
