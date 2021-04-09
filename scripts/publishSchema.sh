#!/usr/bin/env sh

copy() {
    version=$1
    from="schema/transcripts/${version}/schema.json"
    to="public/transcripts/${version}/index.json"
    echo "Moving ${from} to ${to}"
    mkdir -p "public/transcripts/${version}/"
    cp ${from} ${to}
}

# Copy schemas to public folder
copy "1.0"
copy "1.1"
copy "1.2"
copy "1.3"
copy "1.4"
copy "1.5"
copy "2.0"
copy "2.1"
