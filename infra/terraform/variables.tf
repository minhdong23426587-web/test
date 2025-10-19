variable "region" {
  description = "AWS region"
  type        = string
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.10.0.0/16"
}

variable "db_name" {
  description = "PostgreSQL database name"
  type        = string
  default     = "enterprise"
}

variable "db_master_username" {
  description = "Master username stored in Secrets Manager"
  type        = string
}

variable "db_master_secret_arn" {
  description = "ARN of Secrets Manager secret for RDS password"
  type        = string
}

variable "redis_node_type" {
  description = "ElastiCache/MemoryDB node type"
  type        = string
  default     = "cache.t4g.small"
}

variable "acm_certificate_arn" {
  description = "ACM certificate for ALB"
  type        = string
}
