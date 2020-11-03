#!/bin/bash

while read line
do
    file=`echo $line | sed -re 's/.+id=//g' | sed -re 's/&.+//g'`
    filename="${file%%&*}.png"
    wget --no-check-certificate $line -O $filename
    sleep 3
done < url_list.txt