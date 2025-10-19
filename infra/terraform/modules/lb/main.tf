resource "aws_lb" "this" {
  name               = "enterprise-next"
  internal           = false
  load_balancer_type = "application"
  subnets            = var.subnets
  security_groups    = [var.security_group_id]
}

resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.this.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"
  certificate_arn   = var.cert_arn

  default_action {
    type = "fixed-response"
    fixed_response {
      content_type = "text/plain"
      message_body = "Service unavailable"
      status_code  = "503"
    }
  }
}

output "dns_name" {
  value = aws_lb.this.dns_name
}
