variable "subnet_ids" {
  type = list(string)
}

variable "security_group_id" {
  type = string
}

variable "db_name" {
  type = string
}

variable "master_user" {
  type = string
}

variable "master_secret" {
  type = string
}
