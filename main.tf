provider "aws" {
  region = "us-east-1"
}

resource "aws_s3_bucket" "static_site" {
  bucket = "crashsweeper.amirdnur.dev"
}

resource "aws_s3_bucket_website_configuration" "static_site" {
  bucket = aws_s3_bucket.static_site.bucket

  index_document {
    suffix = "index.html"
  }
  error_document {
    key = "index.html"
  }
}

resource "aws_s3_bucket_public_access_block" "static_site" {
  bucket = aws_s3_bucket.static_site.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_policy" "static_site_policy" {
  bucket = aws_s3_bucket.static_site.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = "*"
      Action = ["s3:GetObject"]
      Resource = "${aws_s3_bucket.static_site.arn}/*"
    }]
  })
}

output "static_site_endpoint" {
  value = aws_s3_bucket_website_configuration.static_site.website_endpoint
}