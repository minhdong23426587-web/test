module "enterprise" {
  source = "../../"

  region                = var.region
  vpc_cidr              = var.vpc_cidr
  db_name               = var.db_name
  db_master_username    = var.db_master_username
  db_master_secret_arn  = var.db_master_secret_arn
  redis_node_type       = var.redis_node_type
  acm_certificate_arn   = var.acm_certificate_arn
}
