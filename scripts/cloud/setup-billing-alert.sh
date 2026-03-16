#!/bin/bash
set -euo pipefail

# AWS Billing Alert Setup
# Creates CloudWatch alarm for monthly billing threshold
#
# Prerequisites:
#   - AWS CLI configured
#   - .env with BILLING_ALERT_EMAIL and BILLING_THRESHOLD
#
# Note: Billing metrics are only available in us-east-1

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Load .env
if [ -f "$SCRIPT_DIR/.env" ]; then
  set -a
  source "$SCRIPT_DIR/.env"
  set +a
fi

EMAIL="${BILLING_ALERT_EMAIL:?BILLING_ALERT_EMAIL is required in .env}"
THRESHOLD="${BILLING_THRESHOLD:-100}"
PROFILE="${AWS_PROFILE:-}"
REGION="us-east-1"  # Billing metrics only available in us-east-1

aws_cmd() {
  if [ -n "$PROFILE" ]; then
    aws --profile "$PROFILE" --region "$REGION" "$@"
  else
    aws --region "$REGION" "$@"
  fi
}

TOPIC_NAME="billing-alert"
ALARM_NAME="monthly-billing-${THRESHOLD}usd"

echo "=== AWS Billing Alert Setup ==="
echo "  Email: $EMAIL"
echo "  Threshold: \$${THRESHOLD}/month"
echo "  Region: $REGION (billing metrics)"
echo ""

# 1. Create SNS Topic
echo "[1/3] Creating SNS topic..."
TOPIC_ARN=$(aws_cmd sns create-topic --name "$TOPIC_NAME" --query 'TopicArn' --output text)
echo "  Topic ARN: $TOPIC_ARN"

# 2. Subscribe email
echo "[2/3] Subscribing email..."
aws_cmd sns subscribe \
  --topic-arn "$TOPIC_ARN" \
  --protocol email \
  --notification-endpoint "$EMAIL" \
  > /dev/null
echo "  Subscription request sent. Check $EMAIL to confirm."

# 3. Create CloudWatch alarm
echo "[3/3] Creating CloudWatch alarm..."
aws_cmd cloudwatch put-metric-alarm \
  --alarm-name "$ALARM_NAME" \
  --alarm-description "Monthly AWS billing exceeds \$${THRESHOLD}" \
  --metric-name EstimatedCharges \
  --namespace AWS/Billing \
  --statistic Maximum \
  --period 21600 \
  --threshold "$THRESHOLD" \
  --comparison-operator GreaterThanOrEqualToThreshold \
  --evaluation-periods 1 \
  --alarm-actions "$TOPIC_ARN" \
  --dimensions "Name=Currency,Value=USD"
echo "  Alarm created: $ALARM_NAME"

echo ""
echo "=== Setup complete ==="
echo "  1. Confirm the email subscription (check $EMAIL)"
echo "  2. Alarm will trigger when monthly charges >= \$${THRESHOLD}"
