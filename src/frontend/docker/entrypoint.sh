#!/bin/bash

date
SED=""
for var in PUBLIC_URL $(compgen -v | grep ^REACT);
do
    SED=$SED'; s/@'"$var"'@/'"$(echo "${!var}" | sed -e 's/\\/\\\\/g; s/\//\\\//g; s/&/\\\&/g')"'/g'
done
echo $SED

echo "files"
for file in $(find /frontend/build -type f -print | xargs file | grep ASCII | cut -d: -f1)
do
    sed -i "$SED" "$file"
    #echo 'sed -i '"$SED"' '"$file"
done
date
#bash
nginx -g "daemon off;"
