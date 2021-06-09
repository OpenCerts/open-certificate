#!/usr/bin/env sh

copy() {
    folder=$1
    version=$2
    from="schema/${folder}/${version}/schema.json"
    to="public/${folder}/${version}/index.json"
    echo "Moving ${from} to ${to}"
    mkdir -p "public/${folder}/${version}/"
    cp ${from} ${to}
    # copy example
    from="schema/${folder}/${version}/example.json"
    to="public/${folder}/${version}/example.json"
    cp ${from} ${to}
}

# Copy schemas to public folder
# copy transcripts
copy "transcripts" "1.0"
copy "transcripts" "1.1"
copy "transcripts" "1.2"
copy "transcripts" "1.3"
copy "transcripts" "1.4"
copy "transcripts" "1.5"
copy "transcripts" "2.0"
copy "transcripts" "2.1"
# copy testimonials
copy "testimonials" "1.0"
# copy certificate of awards
copy "certificate-of-awards" "1.0"