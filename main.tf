provider "aws" {
  region = "us-east-1"
}

# Second provider for us-east-1 (required for CloudFront)
provider "aws" {
  alias  = "us-east-1"
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

# ACM Certificate (must be in us-east-1 for CloudFront)
resource "aws_acm_certificate" "cert" {
  provider = aws.us-east-1
  domain_name = "crashsweeper.amirdnur.dev"
  validation_method = "DNS"
  
  lifecycle {
    create_before_destroy = true
  }
}

# CloudFront Distribution
resource "aws_cloudfront_distribution" "s3_distribution" {
  origin {
    domain_name = aws_s3_bucket.static_site.bucket_regional_domain_name
    origin_id   = "S3-${aws_s3_bucket.static_site.bucket}"
  }

  enabled             = true
  default_root_object = "index.html"
  is_ipv6_enabled     = true

  aliases = ["crashsweeper.amirdnur.dev"]

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-${aws_s3_bucket.static_site.bucket}"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 0
    max_ttl                = 0
  }

  # Handle SPA routing (redirect all 404s to index.html)
  custom_error_response {
    error_code         = 404
    response_code      = "200"
    response_page_path = "/index.html"
  }

  viewer_certificate {
    acm_certificate_arn = aws_acm_certificate.cert.arn
    ssl_support_method  = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }
}

# Security Group for Redis
resource "aws_security_group" "redis_sg" {
  name        = "crashsweeper-redis-sg"
  description = "Security group for Redis ElastiCache"

  ingress {
    from_port   = 6379
    to_port     = 6379
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Data source to get default VPC subnets
data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

# Redis Subnet Group
resource "aws_elasticache_subnet_group" "redis_subnet_group" {
  name       = "redis-subnet-group"
  subnet_ids = data.aws_subnets.default.ids
}

# Redis ElastiCache Cluster
resource "aws_elasticache_cluster" "redis" {
  cluster_id           = "crashsweeper-redis"
  engine               = "redis"
  node_type            = "cache.t3.micro"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis7"
  port                 = 6379
  security_group_ids   = [aws_security_group.redis_sg.id]
  subnet_group_name    = aws_elasticache_subnet_group.redis_subnet_group.name
}

# Lambda function for storing crash events (called when player clicks mine)
resource "aws_lambda_function" "crash_store" {
  filename         = "lambda-store.zip"
  function_name    = "crash-store"
  role            = aws_iam_role.lambda_role.arn
  handler         = "store.handler"
  runtime         = "nodejs18.x"
  timeout         = 30

  vpc_config {
    subnet_ids         = data.aws_subnets.default.ids
    security_group_ids = [aws_security_group.redis_sg.id]
  }

  environment {
    variables = {
      REDIS_ENDPOINT = aws_elasticache_cluster.redis.cache_nodes.0.address
      REDIS_PORT     = aws_elasticache_cluster.redis.cache_nodes.0.port
    }
  }
}

# Lambda function for monitoring (BetterStack will ping this)
resource "aws_lambda_function" "crash_monitor" {
  filename         = "lambda-monitor.zip"
  function_name    = "minesweeper-monitor"
  role            = aws_iam_role.lambda_role.arn
  handler         = "monitor.handler"
  runtime         = "nodejs18.x"
  timeout         = 30

  vpc_config {
    subnet_ids         = data.aws_subnets.default.ids
    security_group_ids = [aws_security_group.redis_sg.id]
  }

  environment {
    variables = {
      REDIS_ENDPOINT = aws_elasticache_cluster.redis.cache_nodes.0.address
      REDIS_PORT     = aws_elasticache_cluster.redis.cache_nodes.0.port
    }
  }
}

# IAM role for Lambda
resource "aws_iam_role" "lambda_role" {
  name = "crash_monitor_lambda_role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

# Basic Lambda execution policy
resource "aws_iam_role_policy_attachment" "lambda_basic" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# VPC access for Lambda to reach Redis
resource "aws_iam_role_policy_attachment" "lambda_vpc" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}

# Single API Gateway for both endpoints
resource "aws_api_gateway_rest_api" "crashsweeper_api" {
  name = "crashsweeper-api"
}

# Crash store resource
resource "aws_api_gateway_resource" "crash_store_resource" {
  rest_api_id = aws_api_gateway_rest_api.crashsweeper_api.id
  parent_id   = aws_api_gateway_rest_api.crashsweeper_api.root_resource_id
  path_part   = "crash"
}

resource "aws_api_gateway_method" "crash_store_method" {
  rest_api_id   = aws_api_gateway_rest_api.crashsweeper_api.id
  resource_id   = aws_api_gateway_resource.crash_store_resource.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "crash_store_integration" {
  rest_api_id = aws_api_gateway_rest_api.crashsweeper_api.id
  resource_id = aws_api_gateway_resource.crash_store_resource.id
  http_method = aws_api_gateway_method.crash_store_method.http_method

  integration_http_method = "POST"
  type                   = "AWS_PROXY"
  uri                    = aws_lambda_function.crash_store.invoke_arn
}

# Monitor resource
resource "aws_api_gateway_resource" "crash_monitor_resource" {
  rest_api_id = aws_api_gateway_rest_api.crashsweeper_api.id
  parent_id   = aws_api_gateway_rest_api.crashsweeper_api.root_resource_id
  path_part   = "minesweeper-monitor"
}

resource "aws_api_gateway_method" "crash_monitor_method" {
  rest_api_id   = aws_api_gateway_rest_api.crashsweeper_api.id
  resource_id   = aws_api_gateway_resource.crash_monitor_resource.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "crash_monitor_integration" {
  rest_api_id = aws_api_gateway_rest_api.crashsweeper_api.id
  resource_id = aws_api_gateway_resource.crash_monitor_resource.id
  http_method = aws_api_gateway_method.crash_monitor_method.http_method

  integration_http_method = "POST"
  type                   = "AWS_PROXY"
  uri                    = aws_lambda_function.crash_monitor.invoke_arn
}

# Lambda permissions for API Gateway
resource "aws_lambda_permission" "api_gateway_store" {
  statement_id  = "AllowExecutionFromAPIGatewayStore"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.crash_store.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.crashsweeper_api.execution_arn}/*/*"
}

resource "aws_lambda_permission" "api_gateway_monitor" {
  statement_id  = "AllowExecutionFromAPIGatewayMonitor"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.crash_monitor.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.crashsweeper_api.execution_arn}/*/*"
}

# API Gateway deployment
resource "aws_api_gateway_deployment" "crashsweeper_deployment" {
  depends_on = [
    aws_api_gateway_integration.crash_store_integration,
    aws_api_gateway_integration.crash_monitor_integration,
  ]

  rest_api_id = aws_api_gateway_rest_api.crashsweeper_api.id
}

resource "aws_api_gateway_stage" "crashsweeper_stage" {
  deployment_id = aws_api_gateway_deployment.crashsweeper_deployment.id
  rest_api_id   = aws_api_gateway_rest_api.crashsweeper_api.id
  stage_name    = "prod"
}

output "static_site_endpoint" {
  value = aws_s3_bucket_website_configuration.static_site.website_endpoint
}

output "cloudfront_domain" {
  value = aws_cloudfront_distribution.s3_distribution.domain_name
}

output "certificate_validation_dns" {
  value = aws_acm_certificate.cert.domain_validation_options
}

output "crash_store_endpoint" {
  value = "${aws_api_gateway_stage.crashsweeper_stage.invoke_url}/crash"
}

output "crash_monitor_endpoint" {
  value = "${aws_api_gateway_stage.crashsweeper_stage.invoke_url}/minesweeper-monitor"
}