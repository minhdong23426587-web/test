resource "aws_elasticache_subnet_group" "this" {
  name       = "enterprise-cache"
  subnet_ids = var.subnet_ids
}

resource "aws_elasticache_replication_group" "this" {
  replication_group_id          = "enterprise-cache"
  replication_group_description = "Redis for Enterprise Next"
  engine                        = "redis"
  node_type                     = var.node_type
  number_cache_clusters         = 2
  subnet_group_name             = aws_elasticache_subnet_group.this.name
  security_group_ids            = [var.security_group_id]
  transit_encryption_enabled    = true
  at_rest_encryption_enabled    = true
}

output "endpoint" {
  value = aws_elasticache_replication_group.this.primary_endpoint_address
}
