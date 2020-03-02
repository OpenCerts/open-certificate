#!/usr/bin/env sh

# Remove previously published schema
rm -rf ./public

copy() {
    version=$1
    from="schema/${version}/schema.json"
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
