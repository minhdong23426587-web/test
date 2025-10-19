output "vpc_id" {
  value = module.network.vpc_id
}

output "alb_dns_name" {
  value = module.load_balancer.dns_name
}

output "database_endpoint" {
  value = module.database.endpoint
}

output "redis_endpoint" {
  value = module.cache.endpoint
}
