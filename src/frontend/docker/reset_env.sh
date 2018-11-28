#!/bin/bash

source .env
for line in $(compgen -v | grep ^REACT);
    do
        echo "export $line='@$line@'"
    done  
echo "export PUBLIC_URL='@PUBLIC_URL@'"
