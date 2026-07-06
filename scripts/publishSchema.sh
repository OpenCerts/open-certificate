#!/usr/bin/env sh

copy() {
    folder=$1
    version=$2
    dir="public/${folder}/${version}"
    mkdir -p "${dir}"

    # schema.json is served as index.json (a CloudFront function rewrites
    # extension-less paths, e.g. /transcripts/3.0, to /transcripts/3.0/index.json)
    from="schema/${folder}/${version}/schema.json"
    to="${dir}/index.json"
    echo "Moving ${from} to ${to}"
    cp "${from}" "${to}"

    # example.json (all versions)
    from="schema/${folder}/${version}/example.json"
    if [ -f "${from}" ]; then
        cp "${from}" "${dir}/example.json"
    fi

    # context.json (W3C Verifiable Credential versions only) — must be hosted so
    # the credential's @context URL resolves for signing/verification.
    from="schema/${folder}/${version}/context.json"
    if [ -f "${from}" ]; then
        echo "Moving ${from} to ${dir}/context.json"
        cp "${from}" "${dir}/context.json"
    fi
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
copy "transcripts" "2.2"
copy "transcripts" "3.0"
# copy testimonials
copy "testimonials" "1.0"
copy "testimonials" "2.0"
# copy certificate of awards
copy "certificate-of-awards" "1.0"
copy "certificate-of-awards" "2.0"
