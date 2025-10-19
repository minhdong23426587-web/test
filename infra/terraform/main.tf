terraform {
  required_version = ">= 1.6.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  backend "s3" {}
}

provider "aws" {
  region = var.region
}

module "network" {
  source = "./modules/network"
  vpc_cidr = var.vpc_cidr
}

module "database" {
  source        = "./modules/database"
  vpc_id        = module.network.vpc_id
  db_name       = var.db_name
  master_user   = var.db_master_username
  master_secret = var.db_master_secret_arn
}

module "cache" {
  source   = "./modules/cache"
  vpc_id   = module.network.vpc_id
  node_type = var.redis_node_type
}

module "load_balancer" {
  source   = "./modules/lb"
  vpc_id   = module.network.vpc_id
  subnets  = module.network.public_subnet_ids
  cert_arn = var.acm_certificate_arn
}
