resource "aws_db_subnet_group" "this" {
  name       = "enterprise-db"
  subnet_ids = var.subnet_ids
}

resource "aws_db_instance" "this" {
  identifier              = "enterprise-next"
  engine                  = "postgres"
  engine_version          = "15"
  instance_class          = "db.t4g.medium"
  db_subnet_group_name    = aws_db_subnet_group.this.name
  vpc_security_group_ids  = [var.security_group_id]
  db_name                 = var.db_name
  username                = var.master_user
  password                = data.aws_secretsmanager_secret_version.master.secret_string
  storage_encrypted       = true
  skip_final_snapshot     = false
  backup_retention_period = 7
  apply_immediately       = false
}

data "aws_secretsmanager_secret_version" "master" {
  secret_id = var.master_secret
}

output "endpoint" {
  value = aws_db_instance.this.endpoint
}
