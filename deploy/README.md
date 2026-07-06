# Schema hosting (S3 + CloudFront)

The JSON Schemas, examples and W3C VC contexts under [`../schema`](../schema) are
published to S3 (behind CloudFront) by the
[`Deploy schemas`](../.github/workflows/deploy-schema.yml) GitHub Actions workflow.

- Push to **`develop`** → **development** bucket/distribution (uses `DEV_*` creds)
- Push to **`master`** → **production** bucket/distribution (uses `AWS_*` creds)
- Manual **workflow_dispatch** deploys the environment matching the branch it runs on.

The workflow runs `scripts/publishSchema.sh` to build the `public/` tree, then
`aws s3 sync public/ …` and a CloudFront invalidation.

## One-time setup

### 1. GitHub secrets (already present)

| Secret | Used for |
| --- | --- |
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | production deploy |
| `DEV_AWS_ACCESS_KEY_ID` / `DEV_AWS_SECRET_ACCESS_KEY` | development deploy |
| `AWS_REGION` | region for both (add `DEV_AWS_REGION` + wire it in if dev differs) |

### 2. GitHub repository secrets (add these)

Settings → Secrets and variables → Actions → **Secrets**:

| Secret | Example |
| --- | --- |
| `SCHEMA_S3_BUCKET` | `prod-opencerts-schema` |
| `SCHEMA_CLOUDFRONT_DISTRIBUTION_ID` | `E1XXXXXXXXXXXX` |
| `DEV_SCHEMA_S3_BUCKET` | `dev-opencerts-schema` |
| `DEV_SCHEMA_CLOUDFRONT_DISTRIBUTION_ID` | `E2XXXXXXXXXXXX` |

(Bucket names / distribution IDs aren't sensitive, so GitHub *Variables* would
also work — but the workflow reads `secrets.*`, so keep them in **Secrets**.)

### 3. IAM permissions for each deploy user

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:ListBucket"],
      "Resource": "arn:aws:s3:::<bucket>"
    },
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::<bucket>/*"
    },
    {
      "Effect": "Allow",
      "Action": ["cloudfront:CreateInvalidation"],
      "Resource": "arn:aws:cloudfront::<account-id>:distribution/<distribution-id>"
    }
  ]
}
```

### 4. CloudFront Function (URL rewrite)

To serve the schema at its extension-less `$id` URL (e.g. `https://schema.opencerts.io/transcripts/3.0`),
create a CloudFront **Function** from [`cloudfront-rewrite.js`](./cloudfront-rewrite.js)
and attach it to the distribution's **default cache behavior** as a
**viewer-request** function (do this on both the dev and prod distributions).

Console: CloudFront → Functions → Create function → paste the file → Publish →
Add association (distribution, default behavior, Viewer request).

Or via CLI:

```sh
aws cloudfront create-function \
  --name opencerts-schema-rewrite \
  --function-config Comment="append index.json",Runtime=cloudfront-js-2.0 \
  --function-code fileb://deploy/cloudfront-rewrite.js
# then publish-function and associate it with the distribution behavior
```

`example.json` and `context.json` are real files, so they are served directly
and are unaffected by the rewrite.
